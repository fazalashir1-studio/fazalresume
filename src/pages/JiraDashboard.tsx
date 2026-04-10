import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IssueDetail {
  key: string;
  summary: string;
  status: string;
  statusCategory: string;
  priority: string;
  type: string;
  updated: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  inProgress: number;
  done: number;
  todo: number;
  total: number;
  issues: IssueDetail[];
}

interface Summary {
  total: number;
  inProgress: number;
  done: number;
  todo: number;
  agentCount: number;
}

interface DashboardData {
  agents: Agent[];
  summary: Summary;
  project: string;
  lastUpdated: string;
}

// ─── Colour palette (Looker-inspired) ─────────────────────────────────────────

const COLOR_IN_PROGRESS = "#2196F3"; // blue
const COLOR_DONE = "#4CAF50";        // green
const COLOR_TODO = "#FF9800";        // amber

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusCategoryColor(cat: string) {
  if (cat === "done") return "bg-green-100 text-green-800 border-green-200";
  if (cat === "indeterminate") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function priorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "highest":
    case "critical":
      return "text-red-600";
    case "high":
      return "text-orange-500";
    case "medium":
      return "text-yellow-600";
    case "low":
      return "text-blue-400";
    default:
      return "text-gray-400";
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: string;
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentAvatar({ name, avatar }: { name: string; avatar: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-8 w-8 rounded-full border border-gray-200 object-cover"
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-400 text-xs font-bold text-white">
      {initials}
    </div>
  );
}

function ProgressBar({
  inProgress,
  done,
  todo,
  total,
}: {
  inProgress: number;
  done: number;
  todo: number;
  total: number;
}) {
  if (total === 0) return null;
  const doneW = (done / total) * 100;
  const inProgW = (inProgress / total) * 100;
  const todoW = (todo / total) * 100;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div style={{ width: `${doneW}%`, backgroundColor: COLOR_DONE }} />
      <div style={{ width: `${inProgW}%`, backgroundColor: COLOR_IN_PROGRESS }} />
      <div style={{ width: `${todoW}%`, backgroundColor: COLOR_TODO }} />
    </div>
  );
}

// ─── Custom Tooltip for BarChart ─────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.fill }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Expandable Agent Row ────────────────────────────────────────────────────

function AgentRow({ agent }: { agent: Agent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <AgentAvatar name={agent.name} avatar={agent.avatar} />
            <div>
              <p className="font-medium text-gray-900">{agent.name}</p>
              {agent.email && (
                <p className="text-xs text-muted-foreground">{agent.email}</p>
              )}
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-center">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {agent.inProgress}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            {agent.done}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
            {agent.todo}
          </span>
        </td>
        <td className="py-3 px-4 text-center font-semibold text-gray-700">
          {agent.total}
        </td>
        <td className="py-3 px-4 min-w-[120px]">
          <ProgressBar
            inProgress={agent.inProgress}
            done={agent.done}
            todo={agent.todo}
            total={agent.total}
          />
        </td>
        <td className="py-3 px-4 text-center text-gray-400 text-sm select-none">
          {expanded ? "▲" : "▼"}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="bg-gray-50 px-4 pb-4 pt-2">
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Key</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Summary</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Status</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Type</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Priority</th>
                    <th className="py-2 px-3 text-left font-semibold text-gray-600">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {agent.issues.map((issue) => (
                    <tr
                      key={issue.key}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 font-mono font-medium text-blue-600 whitespace-nowrap">
                        {issue.key}
                      </td>
                      <td className="py-2 px-3 text-gray-700 max-w-xs truncate">
                        {issue.summary}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusCategoryColor(
                            issue.statusCategory
                          )}`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">{issue.type}</td>
                      <td
                        className={`py-2 px-3 font-medium ${priorityColor(issue.priority)}`}
                      >
                        {issue.priority}
                      </td>
                      <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                        {formatDate(issue.updated)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Error / Empty states ─────────────────────────────────────────────────────

function ConfigNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
      <p className="font-semibold text-base mb-2">Jira credentials not configured</p>
      <p className="mb-3">
        Set the following secrets in your Supabase project (
        <span className="font-mono">Project Settings → Edge Functions → Secrets</span>):
      </p>
      <ul className="list-disc list-inside space-y-1 font-mono">
        <li>JIRA_BASE_URL — e.g. <span className="italic">https://yourorg.atlassian.net</span></li>
        <li>JIRA_EMAIL — your Atlassian account email</li>
        <li>JIRA_API_TOKEN — API token from id.atlassian.com</li>
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMissingCreds(false);

    const { data: resp, error: fnError } = await supabase.functions.invoke(
      "jira-proxy"
    );

    if (fnError) {
      setError(fnError.message ?? "Unknown error calling jira-proxy");
      setLoading(false);
      return;
    }

    if (resp?.error) {
      if (
        typeof resp.error === "string" &&
        resp.error.includes("credentials not configured")
      ) {
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Chart data ──
  const chartData =
    data?.agents
      .filter((a) => a.id !== "unassigned")
      .slice(0, 15)
      .map((a) => ({
        name: a.name.split(" ")[0], // first name only to keep chart readable
        fullName: a.name,
        "In Progress": a.inProgress,
        Done: a.done,
        "To Do": a.todo,
      })) ?? [];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* ── Top bar ── */}
      <header
        className="flex items-center justify-between px-8 py-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg, hsl(224 71% 20%), hsl(189 94% 43%))",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Looker-style logo mark */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <span className="text-lg font-black text-white">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">
              NBLY · Jira Workload Dashboard
            </h1>
            <p className="text-xs text-white/70">
              {data
                ? `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`
                : "Loading…"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="border-white/30 bg-white/10 text-white text-xs px-3 py-1"
          >
            Project: NBLY
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 text-xs"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <a
            href="/"
            className="text-xs text-white/70 underline underline-offset-2 hover:text-white"
          >
            ← Portfolio
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">

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

        {/* ── Missing credentials notice ── */}
        {!loading && missingCreds && <ConfigNotice />}

        {/* ── Generic error ── */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
            <p className="font-semibold text-base mb-1">Error fetching Jira data</p>
            <p className="font-mono">{error}</p>
            <Button size="sm" className="mt-4" onClick={fetchData}>
              Retry
            </Button>
          </div>
        )}

        {/* ── Main dashboard content ── */}
        {!loading && data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KPICard
                label="Total Issues"
                value={data.summary.total}
                color="#475569"
                icon="📋"
              />
              <KPICard
                label="Active Agents"
                value={data.summary.agentCount}
                color="#7C3AED"
                icon="👥"
              />
              <KPICard
                label="In Progress"
                value={data.summary.inProgress}
                color={COLOR_IN_PROGRESS}
                icon="⚡"
              />
              <KPICard
                label="Done"
                value={data.summary.done}
                color={COLOR_DONE}
                icon="✅"
              />
              <KPICard
                label="To Do"
                value={data.summary.todo}
                color={COLOR_TODO}
                icon="📌"
              />
            </div>

            {/* Bar Chart */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-700">
                  Issue Breakdown by Agent
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Grouped bar chart — In Progress, Done, and To Do per assignee
                </p>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No assigned issues found in NBLY
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                      barGap={2}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                        formatter={(value) => (
                          <span style={{ color: "#374151" }}>{value}</span>
                        )}
                      />
                      <Bar dataKey="In Progress" fill={COLOR_IN_PROGRESS} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Done" fill={COLOR_DONE} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="To Do" fill={COLOR_TODO} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Completion Rate Tile */}
            {data.summary.total > 0 && (
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-700">
                    Overall Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
                        <div
                          style={{
                            width: `${(data.summary.done / data.summary.total) * 100}%`,
                            backgroundColor: COLOR_DONE,
                          }}
                          className="transition-all duration-500"
                        />
                        <div
                          style={{
                            width: `${(data.summary.inProgress / data.summary.total) * 100}%`,
                            backgroundColor: COLOR_IN_PROGRESS,
                          }}
                          className="transition-all duration-500"
                        />
                        <div
                          style={{
                            width: `${(data.summary.todo / data.summary.total) * 100}%`,
                            backgroundColor: COLOR_TODO,
                          }}
                          className="transition-all duration-500"
                        />
                      </div>
                      <div className="mt-2 flex gap-6 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-sm bg-green-500" />
                          Done ({Math.round((data.summary.done / data.summary.total) * 100)}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-sm bg-blue-500" />
                          In Progress ({Math.round((data.summary.inProgress / data.summary.total) * 100)}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" />
                          To Do ({Math.round((data.summary.todo / data.summary.total) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        {Math.round((data.summary.done / data.summary.total) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agent Table */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-700">
                  Agent Workload Breakdown
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Click a row to expand individual Jira issues
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="py-3 px-4 text-left font-semibold text-gray-600">
                          Agent
                        </th>
                        <th className="py-3 px-4 text-center font-semibold text-blue-600">
                          In Progress
                        </th>
                        <th className="py-3 px-4 text-center font-semibold text-green-600">
                          Done
                        </th>
                        <th className="py-3 px-4 text-center font-semibold text-amber-600">
                          To Do
                        </th>
                        <th className="py-3 px-4 text-center font-semibold text-gray-600">
                          Total
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-600">
                          Progress
                        </th>
                        <th className="py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.agents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-sm text-muted-foreground"
                          >
                            No issues found in project NBLY
                          </td>
                        </tr>
                      ) : (
                        data.agents.map((agent) => (
                          <AgentRow key={agent.id} agent={agent} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
