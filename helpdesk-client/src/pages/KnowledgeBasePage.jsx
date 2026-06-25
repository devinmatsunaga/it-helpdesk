import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getArticles, getArticleCategories } from "../api";
import { useAuth } from "../auth/AuthContext";
import { BookOpen, Search, Plus, Eye } from "lucide-react";

export default function KnowledgeBasePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === "Agent" || user?.role === "Admin";

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticleCategories().then(setCategories).catch(() => {});
  }, []);

  // Re-fetch when search or category changes (debounced lightly for search).
  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      getArticles(search, categoryId || null)
        .then(setArticles)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [search, categoryId]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Knowledge Base</h1>
          <p className="text-sm text-slate-500">Help articles and guides</p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate("/knowledge/new")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Article
          </button>
        )}
      </div>

      {/* Search + category filter */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading…</div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
          No articles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {articles.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/knowledge/${a.id}`)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300"
            >
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-800">{a.title}</h3>
                    {!a.isPublished && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Draft</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span>{a.categoryName}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {a.viewCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}