import { Router, type NextFunction, type Request, type Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, reviews, users } from "../../db";
import { reviewReplies } from "../../db/schema/review-replies";
import { authenticate, type AuthRequest } from "../auth/auth.middleware";

const router = Router();
const uuidSchema = z.string().uuid();
const createSchema = z.object({ content: z.string().trim().min(1).max(1000) }).strict();

const wrap = (handler: (req: any, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };

// Public: show replies to a specific review, oldest first.
router.get("/:reviewId/replies", wrap(async (req, res) => {
  const parsed = uuidSchema.safeParse(req.params.reviewId);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid review ID" });
  const [review] = await db.select({ id: reviews.id }).from(reviews)
    .where(eq(reviews.id, parsed.data)).limit(1);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  const rows = await db.select({
    id: reviewReplies.id, reviewId: reviewReplies.reviewId,
    content: reviewReplies.content, createdAt: reviewReplies.createdAt,
    user: { id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl },
  }).from(reviewReplies)
    .innerJoin(users, eq(reviewReplies.userId, users.id))
    .where(eq(reviewReplies.reviewId, parsed.data))
    .orderBy(asc(reviewReplies.createdAt), asc(reviewReplies.id))
    .limit(100);
  return res.json({ success: true, data: { replies: rows } });
}));

// Authenticated: post a reply to a game review.
router.post("/:reviewId/replies", authenticate, wrap(async (req: AuthRequest, res) => {
  const id = uuidSchema.safeParse(req.params.reviewId);
  const body = createSchema.safeParse(req.body);
  if (!req.userId) return res.status(401).json({ success: false, message: "Authentication required" });
  if (!id.success || !body.success) return res.status(400).json({ success: false, message: "Invalid review or reply text" });
  const [review] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.id, id.data)).limit(1);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });
  const [reply] = await db.insert(reviewReplies)
    .values({ reviewId: id.data, userId: req.userId, content: body.data.content })
    .returning();
  return res.status(201).json({ success: true, data: reply });
}));

// Only the reply author may delete it.
router.delete("/:reviewId/replies/:replyId", authenticate, wrap(async (req: AuthRequest, res) => {
  const reviewId = uuidSchema.safeParse(req.params.reviewId);
  const replyId = uuidSchema.safeParse(req.params.replyId);
  if (!req.userId) return res.status(401).json({ success: false, message: "Authentication required" });
  if (!reviewId.success || !replyId.success) return res.status(400).json({ success: false, message: "Invalid ID" });
  const [removed] = await db.delete(reviewReplies).where(and(
    eq(reviewReplies.reviewId, reviewId.data),
    eq(reviewReplies.id, replyId.data),
    eq(reviewReplies.userId, req.userId),
  )).returning({ id: reviewReplies.id });
  if (!removed) return res.status(404).json({ success: false, message: "Reply not found or not yours" });
  return res.json({ success: true, message: "Reply deleted" });
}));

export default router;
