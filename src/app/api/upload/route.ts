import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

// Extension -> MIME type. The stored extension and MIME type always come
// from this table, never from the client, so nothing can be served as HTML/SVG.
const ALLOWED_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
};

const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];

// Magic bytes each extension must start with
const SIGNATURES: Record<string, number[][]> = {
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  gif: [[0x47, 0x49, 0x46, 0x38]],
  webp: [[0x52, 0x49, 0x46, 0x46]],
  pdf: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  doc: [OLE_SIGNATURE],
  xls: [OLE_SIGNATURE],
  docx: [ZIP_SIGNATURE],
  xlsx: [ZIP_SIGNATURE],
  zip: [ZIP_SIGNATURE, [0x50, 0x4b, 0x05, 0x06]],
  rar: [[0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]],
};

function matchesSignature(buffer: Buffer, extension: string): boolean {
  if (extension === "txt") {
    // Plain text: reject anything that looks like markup
    const head = buffer.subarray(0, 1024).toString("utf8").trimStart().toLowerCase();
    return !buffer.includes(0) && !head.startsWith("<");
  }
  const signatures = SIGNATURES[extension];
  return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 1MB limit" },
        { status: 400 }
      );
    }

    // Validate file type by extension and file contents
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = ALLOWED_TYPES[extension];
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!mimeType || !matchesSignature(buffer, extension)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = `${Date.now()}-${randomUUID()}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Write file to disk
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Create attachment record in database (without topicId/commentId initially)
    const attachment = await prisma.attachment.create({
      data: {
        filename,
        originalName: file.name,
        mimeType,
        uploaderId: session.user.id,
        size: file.size,
        url: `/uploads/${filename}`,
      },
    });

    return NextResponse.json({
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: attachment.url,
    }, { status: 201 });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("id");

    if (!attachmentId) {
      return NextResponse.json(
        { error: "Attachment ID required" },
        { status: 400 }
      );
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        topic: {
          select: { authorId: true },
        },
        comment: {
          select: { authorId: true },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete
    // Uploaders may delete their own attachments that aren't connected to a topic/comment yet
    const isOwnOrphan =
      !attachment.topicId &&
      !attachment.commentId &&
      attachment.uploaderId === session.user.id;
    const isAuthor = 
      attachment.topic?.authorId === session.user.id ||
      attachment.comment?.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "MODERATOR";

    if (!isOwnOrphan && !isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized to delete this attachment" },
        { status: 403 }
      );
    }

    // Delete file from disk
    const filepath = join(process.cwd(), "public", "uploads", attachment.filename);
    if (existsSync(filepath)) {
      const { unlink } = await import("fs/promises");
      await unlink(filepath);
    }

    // Delete database record
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
