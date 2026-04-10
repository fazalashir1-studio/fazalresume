import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    status: {
      name: string;
      statusCategory: { key: string; name: string };
    };
    priority: { name: string } | null;
    issuetype: { name: string } | null;
    updated: string;
  };
}

interface AgentStats {
  id: string;
  name: string;
  email: string;
  avatar: string;
  inProgress: number;
  done: number;
  todo: number;
  total: number;
  issues: {
    key: string;
    summary: string;
    status: string;
    statusCategory: string;
    priority: string;
    type: string;
    updated: string;
  }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const jiraBaseUrl = Deno.env.get("JIRA_BASE_URL");
    const jiraEmail = Deno.env.get("JIRA_EMAIL");
    const jiraApiToken = Deno.env.get("JIRA_API_TOKEN");
    const project = "NBLY";

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      return new Response(
        JSON.stringify({ error: "Jira credentials not configured. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const auth = btoa(`${jiraEmail}:${jiraApiToken}`);
    const allIssues: JiraIssue[] = [];
    let startAt = 0;
    const maxResults = 100;

    // Paginate through all issues for NBLY project
    while (true) {
      const jql = `project=${project} ORDER BY updated DESC`;
      const url = `${jiraBaseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=assignee,status,summary,priority,issuetype,updated&maxResults=${maxResults}&startAt=${startAt}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({ error: `Jira API error: ${response.status}`, details: errorText }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      allIssues.push(...data.issues);

      if (allIssues.length >= data.total || data.issues.length === 0) {
        break;
      }
      startAt += maxResults;
    }

    // Aggregate stats per assignee
    const agentMap = new Map<string, AgentStats>();

    for (const issue of allIssues) {
      const assignee = issue.fields.assignee;
      const statusCategory = issue.fields.status.statusCategory.key; // "new" | "indeterminate" | "done"
      const agentKey = assignee ? assignee.accountId : "unassigned";
      const agentName = assignee ? assignee.displayName : "Unassigned";
      const agentEmail = assignee?.emailAddress ?? "";
      const agentAvatar = assignee?.avatarUrls?.["48x48"] ?? "";

      if (!agentMap.has(agentKey)) {
        agentMap.set(agentKey, {
          id: agentKey,
          name: agentName,
          email: agentEmail,
          avatar: agentAvatar,
          inProgress: 0,
          done: 0,
          todo: 0,
          total: 0,
          issues: [],
        });
      }

      const agent = agentMap.get(agentKey)!;
      agent.total++;

      if (statusCategory === "done") {
        agent.done++;
      } else if (statusCategory === "indeterminate") {
        agent.inProgress++;
      } else {
        agent.todo++;
      }

      agent.issues.push({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        statusCategory,
        priority: issue.fields.priority?.name ?? "None",
        type: issue.fields.issuetype?.name ?? "Issue",
        updated: issue.fields.updated,
      });
    }

    const agents = Array.from(agentMap.values()).sort((a, b) => b.total - a.total);

    const summary = {
      total: allIssues.length,
      inProgress: agents.reduce((sum, a) => sum + a.inProgress, 0),
      done: agents.reduce((sum, a) => sum + a.done, 0),
      todo: agents.reduce((sum, a) => sum + a.todo, 0),
      agentCount: agents.filter((a) => a.id !== "unassigned").length,
    };

    return new Response(
      JSON.stringify({ agents, summary, project, lastUpdated: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
