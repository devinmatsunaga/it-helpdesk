import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicket, getComments, addComment, UpdateTicket, getAgents, assignTicket, assignToMe } from "../api";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import {
  ArrowLeft, Wifi, User as UserIcon, Calendar, Monitor, AlertCircle, Send, UserPlus, BookOpen, Search,
} from "lucide-react";
import { STATUS } from "../lib/enums";
import {useAuth} from "../auth/AuthContext";
import { getArticles } from "../api";


export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyBody, setReplyBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [posting, setPosting] = useState(false);
  const {user} = useAuth();
  const canAssign = user?.role === "Agent" || user?.role === "Admin";
  const [agents, setAgents] = useState([]);
  const canManage = user?.role == "Agent" || user?.role == "Admin";
  const [articleResults, setArticleResults] = useState([]);
  const [articleSearch, setArticleSearch] = useState("");


  useEffect(() => {
    getTicket(id)
      .then(setTicket)
      .catch((e) => setError(e.response?.status === 404 ? "Ticket not found." : e.message))
      .finally(() => setLoading(false));

      getComments(id).then(setComments).catch(() => {});

      if (canAssign) getAgents().then(setAgents).catch(() => {});

      if (canManage && ticket?.title) {
        getArticles(ticket.title).then(setArticleResults).catch(() => {});
      }

  }, [id, canAssign, canManage, ticket?.title]);

    const handleReply = async () => {
      if (!replyBody.trim()) return;
      setPosting(true);
      try {
        const created = await addComment (id, {
          authorId: user.userId,
          body: replyBody.trim(),
          isInternal,
        });
      setComments((c) => [...c, created]); // APPENDS NEW COMMENT
      setReplyBody("");
      setIsInternal(false);
    } catch (e) {
      alert("Failed to post: " + e.message)
    } finally {
      setPosting(false);
    }
  };

    const handleStatusChange = async (newStatus) => {
      try {
        const updated = await UpdateTicket(id, {
          assignedAgentId: ticket.assignedAgentId ?? null,
          status: Number(newStatus),
          priority: ticket.priority,
        });
        setTicket(updated);
      } catch (e) {
        alert("Failed to update: " + e.message);
      }
    };

    const handleAssign = async (agentId) => {
      try {
        const updated = await assignTicket(id, agentId ? Number(agentId) : null);
        setTicket(updated);
      } catch (e) {
        alert(e.response?.status === 403 ? "Only agents can assign tickets." : "Failed: ")
      }
    };

    const handleAssignToMe = async () => {
      try {
        const updated = await assignToMe(id);
        setTicket(updated);
      }catch (e) {
        alert(e.response?.status === 403 ? "Only agents can assign tickets." : "Failed: ")
      }
    }

    const handleArticleSearch = (value) => {
      setArticleSearch(value);
      getArticles(value).then(setArticleResults).catch(() => {})
    };

    const insertArticleLink = (article) => {
      const link = `See this article: ${window.location.origin}/knowledge/${article.id} (${article.title})`;
      setReplyBody((b) => (b ? b + "\n" + link : link))
    }

  if (loading) return <div className="text-slate-400">Loading…</div>;
  if (error) return <div className="text-red-500">{error}</div>;


  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/tickets")}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </button>

        <select
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
        >
          {Object.entries(STATUS).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="font-mono text-xs text-blue-600">
              INC-{String(ticket.id).padStart(6, "0")}
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-800">{ticket.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PriorityBadge value={ticket.priority} />
              <StatusBadge value={ticket.status} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                {initials(ticket.requesterName)}
              </span>
              Created by {ticket.requesterName}
            </div>
          </div>

          {/* Description + details grid */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {ticket.description || "No description provided."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-5 sm:grid-cols-2">
              <DetailRow icon={Wifi} label="Category" value={ticket.categoryName} />
              <DetailRow icon={UserIcon} label="Assigned To" value={ticket.assignedAgentName || "Unassigned"} />
              <DetailRow icon={AlertCircle} label="Priority" value={<PriorityBadge value={ticket.priority} />} />
              <DetailRow icon={Monitor} label="Status" value={<StatusBadge value={ticket.status} />} />
              <DetailRow icon={Monitor} label="Related Asset" value={ticket.assetTag || "None"} />
              <DetailRow icon={Calendar} label="Created" value={formatDate(ticket.createdAt)} />
            </div>
          </div>

        {/* Activity thread */}
<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Activity</h2>

  <div className="mt-4 space-y-4">
    {comments.length === 0 && (
      <p className="text-sm text-slate-400">No activity yet.</p>
    )}
    {comments.map((c) => (
      <div key={c.id} className="flex gap-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
          {initials(c.authorName)}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800">{c.authorName}</span>
            <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
            {c.isInternal && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                Internal
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-700">{c.body}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Reply box */}
  <div className="mt-6 border-t border-slate-100 pt-4">
    <div className="mb-2 flex gap-4 text-sm">
      <button
        onClick={() => setIsInternal(false)}
        className={`font-medium ${!isInternal ? "text-blue-600" : "text-slate-400"}`}
      >
        Public Reply
      </button>
      <button
        onClick={() => setIsInternal(true)}
        className={`font-medium ${isInternal ? "text-blue-600" : "text-slate-400"}`}
      >
        Internal Note
      </button>
    </div>
    <textarea
      value={replyBody}
      onChange={(e) => setReplyBody(e.target.value)}
      placeholder={isInternal ? "Add an internal note…" : "Type your message…"}
      className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      rows={3}
    />
    <div className="mt-2 flex justify-end">
      <button
        onClick={handleReply}
        disabled={posting || !replyBody.trim()}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {posting ? "Sending…" : "Send"}
      </button>
    </div>
  </div>
</div>
      </div>
{/* Right info rail */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <RailCard title="Ticket Details">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {initials(ticket.requesterName)}
              </span>
              <div className="text-sm">
                <div className="font-medium text-slate-800">{ticket.requesterName}</div>
                <div className="text-slate-400">Requester</div>
              </div>
            </div>
            <RailRow label="Ticket ID" value={`INC-${String(ticket.id).padStart(6, "0")}`} />
            <RailRow label="Created" value={formatDate(ticket.createdAt)} />
            <RailRow label="Category" value={ticket.categoryName} />
          </RailCard>

          <RailCard title="Related Asset">
            {ticket.assetTag ? (
              <div className="text-sm">
                <div className="font-medium text-blue-600">{ticket.assetTag}</div>
                <div className="text-slate-500">Linked asset</div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">No asset linked.</div>
            )}
          </RailCard>

          {/* Assignment card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Assignment</h3>

            <div className="mb-3 text-sm">
              <span className="text-slate-500">Currently: </span>
              <span className="font-medium text-slate-800">
                {ticket.assignedAgentName || "Unassigned"}
              </span>
            </div>

            {canAssign ? (
              <div className="space-y-2">
                <select
                  value={ticket.assignedAgentId != null ? String(ticket.assignedAgentId) : ""}
                  onChange={(e) => handleAssign(e.target.value || null)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.displayName}</option>
                  ))}
                </select>

                {ticket.assignedAgentId !== user?.userId && (
                  <button
                    onClick={handleAssignToMe}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign to me
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Only agents can change assignment.</p>
            )}
          </div>

          {/* Helpful Articles card */}
          {canAssign && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <BookOpen className="h-4 w-4 text-blue-500" /> Helpful Articles
              </h3>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={articleSearch}
                  onChange={(e) => handleArticleSearch(e.target.value)}
                  placeholder="Search knowledge base…"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                {articleResults.length === 0 && (
                  <p className="text-xs text-slate-400">No matching articles.</p>
                )}
                {articleResults.slice(0, 5).map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-100 p-2 text-sm">
                    <div
                      onClick={() => navigate(`/knowledge/${a.id}`)}
                      className="cursor-pointer font-medium text-blue-600 hover:underline"
                    >
                      {a.title}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{a.categoryName}</span>
                      <button
                        onClick={() => insertArticleLink(a)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        + Add to reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- small helpers, kept in-file for now ---- */

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}

function RailCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function RailRow({ label, value }) {
  return (
    <div className="mb-3 flex justify-between text-sm last:mb-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}