import { Router } from "express";
import multer from "multer";

/**
 * File Upload Router
 *
 * Express router for handling multipart FormData file uploads.
 * tRPC v11's FormData support is designed for fetch-based adapters (Next.js, etc.),
 * not the Express adapter. This dedicated Express route is the recommended pattern
 * for handling file uploads in Express + tRPC stacks.
 *
 * Uses TaylorDB's uploadAttachments pattern to store files.
 * See docs/TAYLORDB_ATTACHMENTS.md for details.
 */

// Configure multer with memory storage (files available as Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10, // max 10 files
  },
});

const fileUploadRouter = Router();

/**
 * POST /api/upload
 *
 * Accepts multipart/form-data with:
 * - files (File[], multiple files of any type)
 *
 * Returns metadata about each uploaded file.
 */
fileUploadRouter.post("/", upload.array("files", 10), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];

  if (files.length === 0) {
    res.status(400).json({
      success: false,
      error: "At least one file is required.",
    });
    return;
  }

  const fileMetadata = files.map((file) => ({
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
  }));

  // ────────────────────────────────────────────────────────────────────────
  // TaylorDB Attachment Example (see docs/TAYLORDB_ATTACHMENTS.md)
  //
  // To store uploaded files in a TaylorDB record, convert multer buffers
  // to Blobs and use qb.uploadAttachments():
  //
  //   const attachments = await qb.uploadAttachments(
  //     files.map((file) => ({
  //       file: new Blob([file.buffer], { type: file.mimetype }),
  //       name: file.originalname,
  //     }))
  //   );
  //
  //   // Then use the attachments when inserting/updating a record:
  //   await qb.insertInto("tableName").values({
  //     name: "Some record",
  //     documents: attachments,  // attachment column
  //   }).execute();
  //
  //   // Or when updating an existing record:
  //   await qb.update("tableName").set({
  //     documents: attachments,
  //   }).where("id", "=", recordId).execute();
  // ────────────────────────────────────────────────────────────────────────

  res.json({
    success: true,
    data: {
      filesCount: files.length,
      files: fileMetadata,
      totalSize: formatFileSize(files.reduce((sum, f) => sum + f.size, 0)),
      uploadedAt: new Date().toISOString(),
    },
  });
});

/** Format bytes to human-readable string */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export { fileUploadRouter };
