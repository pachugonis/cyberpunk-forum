import { join, resolve, sep } from "path";

/**
 * Directory where uploaded files are stored. Defaults to public/uploads so a
 * reverse proxy (nginx) can serve them directly; /uploads/[filename] serves
 * them through Next.js when no proxy does (e.g. Railway).
 */
export const UPLOADS_DIR = resolve(
  /* turbopackIgnore: true */
  process.env.UPLOAD_DIR || join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads")
);

export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

// Extension -> MIME type. The stored extension and served MIME type always come
// from this table, never from the client, so nothing can be served as HTML/SVG.
export const ALLOWED_TYPES: Record<string, string> = {
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

export function matchesSignature(buffer: Buffer, extension: string): boolean {
  if (extension === "txt") {
    // Plain text: reject anything that looks like markup
    const head = buffer.subarray(0, 1024).toString("utf8").trimStart().toLowerCase();
    return !buffer.includes(0) && !head.startsWith("<");
  }
  const signatures = SIGNATURES[extension];
  return !!signatures && signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

export function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Absolute path of a stored upload, or null if the name could escape the
 * uploads directory.
 */
export function uploadPath(filename: string): string | null {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(filename) || filename.includes("..")) {
    return null;
  }
  const path = resolve(UPLOADS_DIR, filename);
  return path.startsWith(UPLOADS_DIR + sep) ? path : null;
}
