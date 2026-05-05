import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROJECT = "NBLYAMPS";

// Board columns to track for team members (Automations handled separately by Alistair)
const TEAM_STATUSES = ["Triage", "Ready-to-Pull", "In Progress", "Blocker", "In Review", "Send to NBLY"];
const DONE_STATUS = "Done";
const AUTOMATION_STATUS = "Automations";

// 80/20 rule: MLY (Molly Maid) tickets take ~2x longer than other brands
const MLY_WEIGHT = 2.0;

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    assignee: {
      accountId: string;
      displayName: string;
      emailAddress: string;
      avatarUrls: { "48x48": string };
    } | null;
    status: { name: string; statusCategory: { key: string } };
    priority: { name: string } | null;
    issuetype: { name: string } | null;
    updated: string;
    resolutiondate: string | null;
    labels: string[];
    components: { name: string }[];
  };
}

interface IssueDetail {
  key: string;
  summary: string;
  status: string;
  priority: string;
  type: string;
  updated: string;
  resolutiondate: string | null;
  brand: string; // "MLY" if Molly Maid ticket, "" otherwise
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
  // MLY brand counts (80/20 rule: MLY tickets are weighted at MLY_WEIGHT)
  mlyActive: number;
  mlyDoneThisMonth: number;
  mlyDoneLastMonth: number;
  // Weighted totals: regular tickets × 1 + MLY tickets × MLY_WEIGHT
  weightedActiveTotal: number;
  weightedDoneThisMonth: number;
  weightedDoneLastMonth: number;
}

function isMlyIssue(issue: JiraIssue): boolean {
  const labels = issue.fields.labels ?? [];
  const components = issue.fields.components ?? [];
  const summary = (issue.fields.summary ?? "").toUpperCase().trimStart();
  return (
    labels.some((l) => l.toUpperCase() === "MLY") ||
    components.some((c) => c.name.toUpperCase() === "MLY") ||
    summary.startsWith("[MLY]") ||
    summary.startsWith("MLY -") ||
    summary.startsWith("MLY:")
  );
}

async function fetchAllIssues(
  baseUrl: string,
  auth: string,
  jql: string
): Promise<JiraIssue[]> {
  const allIssues: JiraIssue[] = [];
  let startAt = 0;
  const maxResults = 100;

  while (true) {
    const url =
      `${baseUrl}/rest/api/3/search` +
      `?jql=${encodeURIComponent(jql)}` +
      `&fields=assignee,status,summary,priority,issuetype,updated,resolutiondate,labels,components` +
      `&maxResults=${maxResults}&startAt=${startAt}`;

    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Jira API ${res.status}: ${txt}`);
    }

    const data = await res.json();
    allIssues.push(...data.issues);
    if (allIssues.length >= data.total || data.issues.length === 0) break;
    startAt += maxResults;
  }

  return allIssues;
}

function monthBounds(offset = 0): { start: string; end: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + offset; // supports negative (last month)
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
    label: start.toLocaleString("en-CA", { month: "long", year: "numeric" }),
  };
}

function toDetail(issue: JiraIssue): IssueDetail {
  return {
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name ?? "None",
    type: issue.fields.issuetype?.name ?? "Issue",
    updated: issue.fields.updated,
    resolutiondate: issue.fields.resolutiondate ?? null,
    brand: isMlyIssue(issue) ? "MLY" : "",
  };
}

function buildAgentMap(
  activeIssues: JiraIssue[],
  doneThisMonthIssues: JiraIssue[],
  doneLastMonthIssues: JiraIssue[]
): AgentStats[] {
  const map = new Map<string, AgentStats>();

  const ensureAgent = (issue: JiraIssue) => {
    const a = issue.fields.assignee;
    const key = a ? a.accountId : "unassigned";
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: a ? a.displayName : "Unassigned",
        email: a?.emailAddress ?? "",
        avatar: a?.avatarUrls?.["48x48"] ?? "",
        byStatus: {},
        activeTotal: 0,
        doneThisMonth: 0,
        doneLastMonth: 0,
        issues: [],
        doneIssuesThisMonth: [],
        doneIssuesLastMonth: [],
        mlyActive: 0,
        mlyDoneThisMonth: 0,
        mlyDoneLastMonth: 0,
        weightedActiveTotal: 0,
        weightedDoneThisMonth: 0,
        weightedDoneLastMonth: 0,
      });
    }
    return map.get(key)!;
  };

  for (const issue of activeIssues) {
    const agent = ensureAgent(issue);
    const statusName = issue.fields.status.name;
    agent.byStatus[statusName] = (agent.byStatus[statusName] ?? 0) + 1;
    agent.activeTotal++;
    if (isMlyIssue(issue)) agent.mlyActive++;
    agent.issues.push(toDetail(issue));
  }

  for (const issue of doneThisMonthIssues) {
    const agent = ensureAgent(issue);
    agent.doneThisMonth++;
    if (isMlyIssue(issue)) agent.mlyDoneThisMonth++;
    agent.doneIssuesThisMonth.push(toDetail(issue));
  }

  for (const issue of doneLastMonthIssues) {
    const agent = ensureAgent(issue);
    agent.doneLastMonth++;
    if (isMlyIssue(issue)) agent.mlyDoneLastMonth++;
    agent.doneIssuesLastMonth.push(toDetail(issue));
  }

  // Compute weighted totals using 80/20 MLY rule
  for (const agent of map.values()) {
    const regularActive = agent.activeTotal - agent.mlyActive;
    const regularDoneThis = agent.doneThisMonth - agent.mlyDoneThisMonth;
    const regularDoneLast = agent.doneLastMonth - agent.mlyDoneLastMonth;
    agent.weightedActiveTotal = regularActive + agent.mlyActive * MLY_WEIGHT;
    agent.weightedDoneThisMonth = regularDoneThis + agent.mlyDoneThisMonth * MLY_WEIGHT;
    agent.weightedDoneLastMonth = regularDoneLast + agent.mlyDoneLastMonth * MLY_WEIGHT;
  }

  return Array.from(map.values())
    .filter((a) => a.id !== "unassigned" || a.activeTotal + a.doneThisMonth + a.doneLastMonth > 0)
    .sort((a, b) => b.doneThisMonth + b.activeTotal - (a.doneThisMonth + a.activeTotal));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const jiraBaseUrl = Deno.env.get("JIRA_BASE_URL");
    const jiraEmail = Deno.env.get("JIRA_EMAIL");
    const jiraApiToken = Deno.env.get("JIRA_API_TOKEN");

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      return new Response(
        JSON.stringify({ error: "Jira credentials not configured. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const auth = btoa(`${jiraEmail}:${jiraApiToken}`);
    const thisMonth = monthBounds(0);
    const lastMonth = monthBounds(-1);

    // Run all 3 queries in parallel for speed
    const [activeIssues, doneThisMonth, doneLastMonth] = await Promise.all([
      // Active team workload — exclude Done and Automations
      fetchAllIssues(
        jiraBaseUrl,
        auth,
        `project = ${PROJECT} AND status not in ("${DONE_STATUS}", "${AUTOMATION_STATUS}") ORDER BY updated DESC`
      ),
      // Completed this month
      fetchAllIssues(
        jiraBaseUrl,
        auth,
        `project = ${PROJECT} AND status = "${DONE_STATUS}" AND resolutiondate >= "${thisMonth.start}" AND resolutiondate < "${thisMonth.end}" ORDER BY resolutiondate DESC`
      ),
      // Completed last month (for comparison)
      fetchAllIssues(
        jiraBaseUrl,
        auth,
        `project = ${PROJECT} AND status = "${DONE_STATUS}" AND resolutiondate >= "${lastMonth.start}" AND resolutiondate < "${lastMonth.end}" ORDER BY resolutiondate DESC`
      ),
    ]);

    const agents = buildAgentMap(activeIssues, doneThisMonth, doneLastMonth);

    // Aggregate status counts across all agents
    const statusSummary: Record<string, number> = {};
    for (const issue of activeIssues) {
      const s = issue.fields.status.name;
      statusSummary[s] = (statusSummary[s] ?? 0) + 1;
    }

    const summary = {
      activeTotal: activeIssues.length,
      doneThisMonth: doneThisMonth.length,
      doneLastMonth: doneLastMonth.length,
      agentCount: agents.filter((a) => a.id !== "unassigned").length,
      byStatus: statusSummary,
    };

    return new Response(
      JSON.stringify({
        agents,
        summary,
        project: PROJECT,
        thisMonthLabel: thisMonth.label,
        lastMonthLabel: lastMonth.label,
        lastUpdated: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
