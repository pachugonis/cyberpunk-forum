import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  UPLOADS_DIR,
  getExtension,
  matchesSignature,
  uploadPath,
} from "@/lib/uploads";


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
    const extension = getExtension(file.name);
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
    await mkdir(UPLOADS_DIR, { recursive: true });

    // Write file to disk
    await writeFile(uploadPath(filename)!, buffer);

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

    // Delete file from disk (it may already be gone)
    const filepath = uploadPath(attachment.filename);
    if (filepath) {
      await unlink(filepath).catch(() => {});
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
