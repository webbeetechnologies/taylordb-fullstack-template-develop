import { z } from "zod";
import { router, publicProcedure } from "../trpc";

/**
 * Submit User Data Router
 *
 * tRPC router for submitting user data (name, email) with file attachment references.
 * Files should first be uploaded via /api/upload, then referenced here.
 *
 * In a real app, you'd use qb.uploadAttachments() to store files in TaylorDB
 * and insert the record with the attachment column. This demo uses in-memory storage.
 *
 * TaylorDB attachment pattern (see docs/TAYLORDB_ATTACHMENTS.md):
 *   await qb.insertInto("users").values({
 *     name: "Jane",
 *     avatar: await qb.uploadAttachments([
 *       { file: new Blob([buffer]), name: "photo.png" },
 *     ]),
 *   }).execute();
 */

// In-memory store for demonstration
interface Submission {
  id: number;
  name: string;
  email: string;
  files: { originalName: string; mimeType: string; size: number }[];
  submittedAt: string;
}

const submissions: Submission[] = [];
let nextId = 1;

export const submitUserDataRouter = router({
  /** Submit user data with file metadata */
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        files: z.array(
          z.object({
            originalName: z.string(),
            mimeType: z.string(),
            size: z.number(),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      const submission: Submission = {
        id: nextId++,
        name: input.name,
        email: input.email,
        files: input.files,
        submittedAt: new Date().toISOString(),
      };
      submissions.push(submission);
      return submission;
    }),

  /** Get all submissions */
  getAll: publicProcedure.query(() => {
    return submissions;
  }),
});
