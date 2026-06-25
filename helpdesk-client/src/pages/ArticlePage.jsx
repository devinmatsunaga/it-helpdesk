import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getArticle, deleteArticle, addArticleComment, deleteArticleComment } from "../api";
import { useAuth } from "../auth/AuthContext";
import { ArrowLeft, Pencil, Trash2, Eye } from "lucide-react";


export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === "Agent" || user?.role === "Admin";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    getArticle(id)
      .then(setArticle)
      .catch((e) => setError(e.response?.status === 404 ? "Article not found." : e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    try {
      await deleteArticle(id);
      navigate("/knowledge");
    } catch (e) {
      alert("Failed to delete: " + e.message);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const created = await addArticleComment(id, newComment.trim());
      setComments((c) => [...c, created]);
      setNewComment("");
    } catch (e) {
      alert ("Failed: " + e.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteArticleComment(id, commentId);
      setComments((c) => c.filter((x) => x.id !== commentId));
    } catch (e) {
      alert("Failed: " + e.message);
    }
  }

  if (loading) return <div className="text-slate-400">Loading…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate("/knowledge")} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to Knowledge Base
        </button>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => navigate(`/knowledge/${id}/edit`)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium text-blue-600">{article.categoryName}</span>
          {!article.isPublished && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Draft</span>
          )}
        </div>
        <h1 className="text-3xl font-semibold text-slate-800">{article.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          {article.authorName && <span>By {article.authorName}</span>}
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.viewCount} views</span>
        </div>

        {/* Markdown rendered here */}
        <div className="prose prose-slate mt-6 max-w-none prose-headings:font-semibold prose-a:text-blue-600">
          <ReactMarkdown>{article.body}</ReactMarkdown>
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
    Comments ({comments.length})
  </h2>

  <div className="mt-4 space-y-4">
    {comments.length === 0 && <p className="text-sm text-slate-400">No comments yet.</p>}
    {comments.map((c) => {
      const canDelete = canManage || c.authorId === user?.userId;
      return (
        <div key={c.id} className="flex gap-3">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
            {initials(c.authorName)}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-800">{c.authorName}</span>
              <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
              {canDelete && (
                <button onClick={() => handleDeleteComment(c.id)} className="ml-auto text-xs text-red-500 hover:underline">
                  Delete
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-700">{c.body}</p>
          </div>
        </div>
      );
    })}
  </div>

  <div className="mt-5 border-t border-slate-100 pt-4">
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Add a comment…"
      rows={3}
      className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-400"
    />
    <div className="mt-2 flex justify-end">
      <button onClick={handleAddComment} disabled={posting || !newComment.trim()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        {posting ? "Posting…" : "Post Comment"}
      </button>
    </div>
  </div>
</div>
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase() || "?";
}