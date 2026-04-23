import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface IssueDetail {
  key: string;
  summary: string;
  status: string;
  priority: string;
  type: string;
  updated: string;
  resolutiondate: string | null;
}

interface AgentStats {
  id: string;
  name: string;
  email: string;
  avatar: string;
  byStatus: Record<string, number>;
  activeTotal: number;
  doneThisMonth: number;
  doneLastMonth: number;
  issues: IssueDetail[];
  doneIssuesThisMonth: IssueDetail[];
  doneIssuesLastMonth: IssueDetail[];
}

interface Summary {
  activeTotal: number;
  doneThisMonth: number;
  doneLastMonth: number;
  agentCount: number;
  byStatus: Record<string, number>;
}

interface DashboardData {
  agents: AgentStats[];
  summary: Summary;
  project: string;
  thisMonthLabel: string;
  lastMonthLabel: string;
  lastUpdated: string;
}

// ─── Board-accurate status colour map ────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  "Triage": "#9E9E9E",
  "Ready-to-Pull": "#78909C",
  "In Progress": "#2196F3",
  "Blocker": "#F44336",
  "In Review": "#9C27B0",
  "Send to NBLY": "#FF9800",
  "Done": "#4CAF50",
};

function statusColor(name: string) {
  for (const [key, val] of Object.entries(STATUS_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "#607D8B";
}

function statusBadgeClass(name: string) {
  const n = name.toLowerCase();
  if (n.includes("blocker")) return "bg-red-100 text-red-800 border-red-200";
  if (n.includes("in progress")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (n.includes("in review")) return "bg-purple-100 text-purple-800 border-purple-200";
  if (n.includes("send to nbly")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (n.includes("done")) return "bg-green-100 text-green-800 border-green-200";
  if (n.includes("triage")) return "bg-gray-100 text-gray-600 border-gray-200";
  if (n.includes("ready")) return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function priorityColor(p: string) {
  switch (p.toLowerCase()) {
    case "highest": case "critical": return "text-red-600 font-semibold";
    case "high": return "text-orange-500 font-medium";
    case "medium": return "text-yellow-600";
    case "low": return "text-blue-400";
    default: return "text-gray-400";
  }
}

function delta(current: number, prev: number) {
  if (prev === 0) return current > 0 ? "+100%" : "—";
  const pct = Math.round(((current - prev) / prev) * 100);
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({
  label, value, sub, color, icon,
}: {
  label: string; value: number | string; sub?: string; color: string; icon: string;
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              {label}
            </p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentAvatar({ name, avatar }: { name: string; avatar: string }) {
  if (avatar) {
    return (
      <img src={avatar} alt={name}
        className="h-8 w-8 rounded-full border border-gray-200 object-cover flex-shrink-0" />
    );
  }
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full
      bg-gradient-to-br from-indigo-500 to-teal-400 text-xs font-bold text-white">
      {initials}
    </div>
  );
}

function StatusPill({ name, count }: { name: string; count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: statusColor(name) }}
    >
      {name} · {count}
    </span>
  );
}

function IssueSubTable({ issues, title }: { issues: IssueDetail[]; title: string }) {
  if (issues.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 pt-3 pb-1">
        {title} ({issues.length})
      </p>
      <table className="w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-1.5 px-3 text-left font-semibold text-gray-500">Key</th>
            <th className="py-1.5 px-3 text-left font-semibold text-gray-500">Summary</th>
            <th className="py-1.5 px-3 text-left font-semibold text-gray-500">Status</th>
            <th className="py-1.5 px-3 text-left font-semibold text-gray-500">Priority</th>
            <th className="py-1.5 px-3 text-left font-semibold text-gray-500">Updated</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.key} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="py-1.5 px-3 font-mono font-medium text-blue-600 whitespace-nowrap">
                {issue.key}
              </td>
              <td className="py-1.5 px-3 text-gray-700 max-w-xs truncate">{issue.summary}</td>
              <td className="py-1.5 px-3">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(issue.status)}`}>
                  {issue.status}
                </span>
              </td>
              <td className={`py-1.5 px-3 ${priorityColor(issue.priority)}`}>{issue.priority}</td>
              <td className="py-1.5 px-3 text-gray-400 whitespace-nowrap">
                {formatDate(issue.resolutiondate ?? issue.updated)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AgentRow({
  agent, thisMonthLabel, lastMonthLabel,
}: {
  agent: AgentStats; thisMonthLabel: string; lastMonthLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const trend = agent.doneLastMonth === 0
    ? agent.doneThisMonth > 0 ? "text-green-600" : "text-gray-400"
    : agent.doneThisMonth > agent.doneLastMonth ? "text-green-600"
    : agent.doneThisMonth < agent.doneLastMonth ? "text-red-500"
    : "text-gray-500";

  return (
    <>
      <tr
        className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Agent */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <AgentAvatar name={agent.name} avatar={agent.avatar} />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{agent.name}</p>
              {agent.email && (
                <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
              )}
            </div>
          </div>
        </td>
        {/* Active */}
        <td className="py-3 px-4">
          <div className="flex flex-wrap gap-1">
            {Object.entries(agent.byStatus).length === 0 ? (
              <span className="text-xs text-gray-400">—</span>
            ) : (
              Object.entries(agent.byStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <StatusPill key={status} name={status} count={count} />
                ))
            )}
          </div>
        </td>
        {/* Active total */}
        <td className="py-3 px-4 text-center">
          <span className="text-sm font-semibold text-gray-700">{agent.activeTotal}</span>
        </td>
        {/* Done this month */}
        <td className="py-3 px-4 text-center">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
            {agent.doneThisMonth}
          </span>
        </td>
        {/* Done last month */}
        <td className="py-3 px-4 text-center">
          <span className="text-sm text-gray-500">{agent.doneLastMonth}</span>
        </td>
        {/* Trend */}
        <td className={`py-3 px-4 text-center text-sm font-semibold ${trend}`}>
          {delta(agent.doneThisMonth, agent.doneLastMonth)}
        </td>
        {/* Expand */}
        <td className="py-3 px-4 text-center text-gray-400 text-xs select-none">
          {expanded ? "▲" : "▼"}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="bg-gray-50 px-6 pb-4 pt-1">
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <IssueSubTable
                issues={agent.issues}
                title="Active tickets"
              />
              <IssueSubTable
                issues={agent.doneIssuesThisMonth}
                title={`Done — ${thisMonthLabel}`}
              />
              <IssueSubTable
                issues={agent.doneIssuesLastMonth}
                title={`Done — ${lastMonthLabel}`}
              />
              {agent.issues.length === 0 &&
                agent.doneIssuesThisMonth.length === 0 &&
                agent.doneIssuesLastMonth.length === 0 && (
                  <p className="text-xs text-gray-400 px-3 py-4 text-center">
                    No issues found for this agent in the selected period.
                  </p>
                )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm min-w-[160px]">
      <p className="font-semibold text-gray-800 mb-1.5 border-b border-gray-100 pb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.fill }} />
            {entry.name}
          </span>
          <span className="font-bold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function ConfigNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
      <p className="font-bold text-lg mb-2">Jira credentials not configured</p>
      <p className="text-sm mb-3">
        Add these secrets in{" "}
        <span className="font-mono bg-amber-100 px-1 rounded">
          Supabase → Project Settings → Edge Functions → Secrets
        </span>
        :
      </p>
      <ul className="text-sm space-y-1 list-disc list-inside font-mono">
        <li>JIRA_BASE_URL — <span className="italic font-sans">e.g. https://yourorg.atlassian.net</span></li>
        <li>JIRA_EMAIL — <span className="italic font-sans">your Atlassian account email</span></li>
        <li>JIRA_API_TOKEN — <span className="italic font-sans">from id.atlassian.com → Security → API tokens</span></li>
      </ul>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function JiraDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingCreds, setMissingCreds] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "agents">("overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMissingCreds(false);

    const { data: resp, error: fnErr } = await supabase.functions.invoke("jira-proxy");

    if (fnErr) {
      setError(fnErr.message ?? "Unknown error calling jira-proxy");
      setLoading(false);
      return;
    }
    if (resp?.error) {
      if (typeof resp.error === "string" && resp.error.includes("credentials not configured")) {
        setMissingCreds(true);
      } else {
        setError(typeof resp.error === "string" ? resp.error : JSON.stringify(resp.error));
      }
      setLoading(false);
      return;
    }
    setData(resp as DashboardData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Chart: monthly completions per agent ──
  const monthlyChartData = data?.agents
    .filter((a) => a.id !== "unassigned")
    .filter((a) => a.doneThisMonth > 0 || a.doneLastMonth > 0)
    .slice(0, 12)
    .map((a) => ({
      name: a.name.split(" ")[0],
      fullName: a.name,
      [data.thisMonthLabel]: a.doneThisMonth,
      [data.lastMonthLabel]: a.doneLastMonth,
    })) ?? [];

  // ── Chart: active workload per agent ──
  const activeChartData = data?.agents
    .filter((a) => a.id !== "unassigned" && a.activeTotal > 0)
    .slice(0, 12)
    .map((a) => {
      const entry: Record<string, string | number> = {
        name: a.name.split(" ")[0],
        fullName: a.name,
      };
      for (const [status, count] of Object.entries(a.byStatus)) {
        entry[status] = count;
      }
      return entry;
    }) ?? [];

  // Collect unique active statuses for chart bars
  const activeStatuses = data
    ? [...new Set(data.agents.flatMap((a) => Object.keys(a.byStatus)))]
    : [];

  // ── Blocker count for KPI ──
  const blockerCount = data?.summary.byStatus["Blocker"] ?? 0;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* ── Header ── */}
      <header
        className="px-8 py-4 shadow-lg"
        style={{ background: "linear-gradient(135deg, hsl(224 71% 18%), hsl(224 71% 28%))" }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <span className="text-lg font-black text-white">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                NBLYAMPS · Team Workload Dashboard
              </h1>
              <p className="text-xs text-white/60">
                Neighborly Requests — Vendasta Jira &nbsp;·&nbsp;{" "}
                {data ? `Updated ${new Date(data.lastUpdated).toLocaleTimeString()}` : "Loading…"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data && (
              <Badge className="bg-white/15 text-white border-0 text-xs px-3 py-1 rounded-full">
                {data.thisMonthLabel}
              </Badge>
            )}
            <Button
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-0 text-xs h-8"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "⟳ Refresh"}
            </Button>
            <a href="/" className="text-xs text-white/50 hover:text-white/80 transition-colors">
              ← Portfolio
            </a>
          </div>
        </div>
      </header>

      {/* ── Tab nav ── */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex gap-6">
            {(["overview", "agents"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "overview" ? "📊 Overview" : "👥 Agent Breakdown"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-200" />
              ))}
            </div>
            <div className="h-80 rounded-xl bg-gray-200" />
            <div className="h-64 rounded-xl bg-gray-200" />
          </div>
        )}

        {!loading && missingCreds && <ConfigNotice />}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-bold text-base mb-1">Error fetching Jira data</p>
            <p className="font-mono text-sm">{error}</p>
            <Button size="sm" className="mt-4 bg-red-600 hover:bg-red-700 text-white" onClick={fetchData}>
              Retry
            </Button>
          </div>
        )}

        {!loading && data && activeTab === "overview" && (
          <>
            {/* ── KPI Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KPICard
                label="Active Tickets"
                value={data.summary.activeTotal}
                sub="Across all agents"
                color="#475569"
                icon="📋"
              />
              <KPICard
                label="In Progress"
                value={data.summary.byStatus["In Progress"] ?? 0}
                sub="Currently active"
                color="#2196F3"
                icon="⚡"
              />
              <KPICard
                label="Blockers"
                value={blockerCount}
                sub={blockerCount > 0 ? "Needs attention" : "None — all clear"}
                color={blockerCount > 0 ? "#F44336" : "#4CAF50"}
                icon="🚨"
              />
              <KPICard
                label={`Done — ${data.thisMonthLabel.split(" ")[0]}`}
                value={data.summary.doneThisMonth}
                sub={`vs ${data.summary.doneLastMonth} last month · ${delta(data.summary.doneThisMonth, data.summary.doneLastMonth)}`}
                color="#4CAF50"
                icon="✅"
              />
              <KPICard
                label="Active Agents"
                value={data.summary.agentCount}
                sub="Assigned to tickets"
                color="#9C27B0"
                icon="👥"
              />
            </div>

            {/* ── Monthly Completions Chart ── */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-bold text-gray-700">
                  Monthly Completions per Agent
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {data.thisMonthLabel} vs {data.lastMonthLabel} — how many tickets each team member completed
                </p>
              </CardHeader>
              <CardContent>
                {monthlyChartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">
                    No completed tickets found for this or last month.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyChartData} barGap={4} barCategoryGap="30%"
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Bar dataKey={data.thisMonthLabel} fill="#4CAF50" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={data.lastMonthLabel} fill="#B0BEC5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* ── Active Workload Chart ── */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-bold text-gray-700">
                  Active Workload by Agent
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Current in-flight tickets per agent, broken down by board column
                </p>
              </CardHeader>
              <CardContent>
                {activeChartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">
                    No active tickets found.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activeChartData} barGap={2} barCategoryGap="25%"
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      {activeStatuses.map((status) => (
                        <Bar
                          key={status}
                          dataKey={status}
                          fill={statusColor(status)}
                          stackId="stack"
                          radius={
                            activeStatuses.indexOf(status) === activeStatuses.length - 1
                              ? [4, 4, 0, 0]
                              : [0, 0, 0, 0]
                          }
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* ── Board Status Summary ── */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-bold text-gray-700">
                  Board Column Distribution
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  How many active tickets are in each column right now
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(data.summary.byStatus)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center gap-2 rounded-xl px-4 py-3 text-white min-w-[130px]"
                        style={{ backgroundColor: statusColor(status) }}
                      >
                        <div>
                          <p className="text-xl font-black">{count}</p>
                          <p className="text-xs opacity-80 leading-tight">{status}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!loading && data && activeTab === "agents" && (
          <>
            {/* ── Agent Breakdown Table ── */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-700">
                  Agent Workload & Throughput
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Click a row to expand individual Jira issues. Automations column (Alistair) excluded.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-xs">
                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Agent</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-600">Active Tickets</th>
                        <th className="py-3 px-4 text-center font-semibold text-gray-600">Active #</th>
                        <th className="py-3 px-4 text-center font-semibold text-green-700">
                          Done ({data.thisMonthLabel.split(" ")[0]})
                        </th>
                        <th className="py-3 px-4 text-center font-semibold text-gray-500">
                          Done ({data.lastMonthLabel.split(" ")[0]})
                        </th>
                        <th className="py-3 px-4 text-center font-semibold text-gray-600">MoM</th>
                        <th className="py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.agents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                            No issues found in project NBLYAMPS.
                          </td>
                        </tr>
                      ) : (
                        data.agents.map((agent) => (
                          <AgentRow
                            key={agent.id}
                            agent={agent}
                            thisMonthLabel={data.thisMonthLabel}
                            lastMonthLabel={data.lastMonthLabel}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Footer totals ── */}
                {data.agents.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-6 text-xs font-semibold text-gray-600">
                    <span>Team total:</span>
                    <span className="text-blue-700">{data.summary.activeTotal} active</span>
                    <span className="text-green-700">{data.summary.doneThisMonth} done this month</span>
                    <span className="text-gray-500">{data.summary.doneLastMonth} done last month</span>
                    <span className={
                      data.summary.doneThisMonth > data.summary.doneLastMonth
                        ? "text-green-600"
                        : data.summary.doneThisMonth < data.summary.doneLastMonth
                        ? "text-red-500"
                        : "text-gray-400"
                    }>
                      {delta(data.summary.doneThisMonth, data.summary.doneLastMonth)} MoM
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
