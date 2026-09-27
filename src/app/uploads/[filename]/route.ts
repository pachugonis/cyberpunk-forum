import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { ALLOWED_TYPES, getExtension, uploadPath } from "@/lib/uploads";

// Serves uploaded files when no reverse proxy does (e.g. on Railway, where
// `next start` doesn't serve files added to public/ after the build).
// Security headers for /uploads are set in next.config.ts.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const filepath = uploadPath(filename);
  if (!filepath) {
    return new Response("Not found", { status: 404 });
  }

  // Only serve files that belong to an attachment record
  const attachment = await prisma.attachment.findFirst({
    where: { filename },
    select: { originalName: true },
  });
  if (!attachment) {
    return new Response("Not found", { status: 404 });
  }

  let data: Buffer;
  try {
    data = await readFile(filepath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  // Type comes from the extension allowlist, never from stored client input
  const contentType = ALLOWED_TYPES[getExtension(filename)] ?? "application/octet-stream";
  const disposition = contentType.startsWith("image/") ? "inline" : "attachment";

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(data.length),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
