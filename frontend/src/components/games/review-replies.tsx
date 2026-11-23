"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { MessageCircle, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import "./review-replies.css";

type Reply = {
  id: string;
  reviewId: string;
  content: string;
  createdAt: string;
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
};

export default function ReviewReplies({
  reviewId, currentUserId,
}: {
  reviewId: string;
  currentUserId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await apiRequest<{ replies: Reply[] }>(`/api/reviews/${reviewId}/replies`);
      setReplies(response.data.replies);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load replies");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (open) void load();
    // Only load when opened or when the review changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reviewId]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentUserId || !text.trim() || submitting) return;
    setSubmitting(true); setError("");
    try {
      await apiRequest(`/api/reviews/${reviewId}/replies`, {
        method: "POST", body: { content: text.trim() },
      });
      setText("");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not post reply"); }
    finally { setSubmitting(false); }
  }

  async function remove(replyId: string) {
    setError("");
    try {
      await apiRequest(`/api/reviews/${reviewId}/replies/${replyId}`, { method: "DELETE" });
      setReplies(prev => prev.filter(r => r.id !== replyId));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete reply"); }
  }

  return <div className="gbd-replies">
    <button type="button" className="gbd-replies-toggle" onClick={() => setOpen(p => !p)} aria-expanded={open}>
      <MessageCircle size={16} /> {open ? "Hide replies" : "Reply / View replies"}
    </button>
    {open && <div className="gbd-replies-panel">
      {loading && <p className="gbd-replies-muted">Loading replies…</p>}
      {!loading && replies.length === 0 && !error && <p className="gbd-replies-muted">No replies yet. Start the conversation.</p>}
      {replies.map(r => <div className="gbd-reply" key={r.id}>
        <div className="gbd-reply-top">
          <Link href={`/users/${encodeURIComponent(r.user.username)}`}>{r.user.displayName || r.user.username} <span>@{r.user.username}</span></Link>
          {r.user.id === currentUserId && <button title="Delete your reply" aria-label="Delete your reply" type="button" onClick={() => void remove(r.id)}><Trash2 size={14}/></button>}
        </div>
        <p>{r.content}</p>
      </div>)}
      {currentUserId ? <form onSubmit={submit} className="gbd-reply-form">
        <label htmlFor={`gbd-reply-${reviewId}`}>Write a reply</label>
        <textarea id={`gbd-reply-${reviewId}`} maxLength={1000} minLength={1} value={text} onChange={e => setText(e.target.value)} placeholder="Add to this conversation…" required />
        <button type="submit" disabled={submitting || !text.trim()}>{submitting ? "Posting…" : "Post reply"}</button>
      </form> : <p className="gbd-replies-muted"><Link href="/login">Log in</Link> to reply.</p>}
      {error && <p className="gbd-replies-error" role="alert">{error}</p>}
    </div>}
  </div>;
}
