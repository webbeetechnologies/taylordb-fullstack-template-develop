import { z } from "zod";
import { router, publicProcedure } from "../trpc";

/**
 * Posts Router
 *
 * Another example sub-router showing a different domain.
 * Demonstrates relationships (author references users).
 * 
 * Example using TaylorDB queryBuilder (available via ctx.queryBuilder):
 * 
 * // Query all posts
 * const posts = await ctx.queryBuilder.from("posts").select("*");
 * 
 * // Query with filters
 * const publishedPosts = await ctx.queryBuilder
 *   .from("posts")
 *   .where({ published: true })
 *   .select("*");
 * 
 * // Create a new post
 * const newPost = await ctx.queryBuilder
 *   .from("posts")
 *   .insert({
 *     title: "My Title",
 *     content: "My Content",
 *     authorId: 1,
 *     published: false
 *   });
 * 
 * // Update a post
 * const updatedPost = await ctx.queryBuilder
 *   .from("posts")
 *   .where({ id: 1 })
 *   .update({ published: true });
 * 
 * // Delete a post
 * await ctx.queryBuilder
 *   .from("posts")
 *   .where({ id: 1 })
 *   .delete();
 */

// In-memory store for demonstration
const posts: {
  id: number;
  title: string;
  content: string;
  authorId: number;
  published: boolean;
  createdAt: Date;
}[] = [
  {
    id: 1,
    title: "Hello World",
    content: "This is my first post!",
    authorId: 1,
    published: true,
    createdAt: new Date(),
  },
];
let nextId = 2;

export const postsRouter = router({
  getAll: publicProcedure
    .input(
      z
        .object({
          published: z.boolean().optional(),
          authorId: z.number().optional(),
        })
        .optional(),
    )
    .query(({ input, ctx }) => {
      let result = posts;

      if (input?.published !== undefined) {
        result = result.filter((p) => p.published === input.published);
      }
      if (input?.authorId !== undefined) {
        result = result.filter((p) => p.authorId === input.authorId);
      }

      return result;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const post = posts.find((p) => p.id === input.id);
      if (!post) throw new Error("Post not found");
      return post;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1),
        authorId: z.number(),
        published: z.boolean().default(false),
      })
    )
    .mutation(({ input }) => {
      const newPost = {
        id: nextId++,
        title: input.title,
        content: input.content,
        authorId: input.authorId,
        published: input.published,
        createdAt: new Date(),
      };
      posts.push(newPost);
      return newPost;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(({ input }) => {
      const post = posts.find((p) => p.id === input.id);
      if (!post) throw new Error("Post not found");

      if (input.title) post.title = input.title;
      if (input.content) post.content = input.content;
      if (input.published !== undefined) post.published = input.published;
      return post;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      const index = posts.findIndex((p) => p.id === input.id);
      if (index === -1) throw new Error("Post not found");

      const [deleted] = posts.splice(index, 1);
      return deleted;
    }),

  // Example of a more specific procedure
  publish: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      const post = posts.find((p) => p.id === input.id);
      if (!post) throw new Error("Post not found");

      post.published = true;
      return post;
    }),
});
