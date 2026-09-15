import type {
  Agent,
  Client,
  ConnectedApp,
  Expense,
  InboxItem,
  Invoice,
  Notification,
  Project,
  Stat,
  TimeEntry,
  TimeLog,
  TimesheetPerson,
  TimesheetTask,
  InvoiceDraft,
} from "@/lib/types";

export const USER = {
  name: "Brian Altman",
  initials: "BA",
  firstName: "Brian",
};

export const SKILLS = [
  { id: "billing-prep", label: "billing-prep" },
  { id: "wip-aging", label: "wip-aging" },
  { id: "collections-chase", label: "collections-chase" },
  { id: "po-chase", label: "po-chase" },
  { id: "time-review", label: "time-review" },
  { id: "staffing-gaps", label: "staffing-gaps" },
  { id: "onboarding-flags", label: "onboarding-flags" },
  { id: "margin-watch", label: "margin-watch" },
] as const;

export type SkillId = (typeof SKILLS)[number]["id"];

export const SKILL_WORK: Record<
  SkillId,
  { label: string; value: string; note?: string; detail: string[] }
> = {
  "billing-prep": {
    label: "Billing Prep",
    value: "$147,220",
    detail: [
      "Northwind ERP — $62,400 ready",
      "Contoso Audit — $41,180 ready",
      "Apex Advisory — $43,640 waiting on PO",
    ],
  },
  "wip-aging": {
    label: "Unbilled WIP",
    value: "$412,000",
    note: "All up to date",
    detail: ["Time: $286,400", "Expenses: $41,200", "Milestones not yet billed: $84,400"],
  },
  "collections-chase": {
    label: "Collections",
    value: "$48,200",
    note: "11 days overdue",
    detail: [
      "INV-1021 Apex Advisory — $48,200, 11 days overdue",
      "Harbor Legal is on hold until April kickoff",
    ],
  },
  "po-chase": {
    label: "PO chase",
    value: "1",
    note: "Apex PO 4419",
    detail: [
      "Apex Advisory PO 4419 is still missing",
      "Billing Prep is blocked until it is attached",
    ],
  },
  "time-review": {
    label: "Utilization",
    value: "74%",
    note: "vs 78% plan",
    detail: ["Billable: 74%", "Target: 78%", "4 people under 60% this week"],
  },
  "staffing-gaps": {
    label: "Staffing gaps",
    value: "2",
    note: "projects at risk",
    detail: [
      "Northwind cutover weekend is short two people",
      "Contoso design review collides with Apex onsite",
    ],
  },
  "onboarding-flags": {
    label: "Onboarding",
    value: "1",
    note: "Apex blocked",
    detail: ["Apex Advisory still onboarding", "PO 4419 blocking $43,640"],
  },
  "margin-watch": {
    label: "Margin Watch",
    value: "11%",
    note: "vs 34% plan",
    detail: [
      "Contoso Audit is 19 pts below plan",
      "Staff mix on Apex is heavier than sold",
      "Two write-downs pending partner review",
    ],
  },
};

export const AGENTS: Agent[] = [
  {
    id: "project-manager",
    name: "Project Manager",
    role: "Keeps staffing, dates, and delivery risk in one thread.",
    instructions:
      "Keep staffing, dates, and delivery risk in one thread.\n\nSurface projects that will miss the plan if mix or hours stay as they are.",
    status: "Running",
    avatar: "project-manager",
    color: "#4AC6B7",
    department: "Delivery",
    model: "BigTime default",
    skills: ["staffing-gaps", "time-review"],
    appIds: ["slack"],
    runMode: "events",
    watches: ["Projects", "Time"],
    lastAction: "Flagged two projects with March staffing gaps",
    decisions: [
      "Approve overtime for Northwind cutover weekend",
      "Move Contoso design review to Thursday",
    ],
    routines: [
      {
        id: "rt-pm-1",
        title: "Staffing scan",
        instructions: "Flag projects that will miss the plan if mix or hours stay as they are.",
        guardrail: "Only surface gaps over 16 hours.",
        everyCount: 1,
        everyUnit: "day",
        time: "09:00",
        enabled: true,
      },
    ],
  },
  {
    id: "revops",
    name: "RevOps",
    role: "Watches billing, WIP, and close so nothing slips a period.",
    instructions:
      "Watch close, WIP, and the exceptions that would slip a period.\n\nFlag what needs a person before the next billing cycle.",
    status: "Running",
    avatar: "revops",
    color: "#3385ff",
    department: "Operations",
    model: "BigTime default",
    skills: ["billing-prep", "wip-aging", "margin-watch"],
    appIds: ["xero", "qbo", "slack"],
    runMode: "events",
    watches: ["WIP", "Invoices"],
    lastAction: "Prepared $147,220 of billing-ready WIP",
    decisions: [
      "Release Billing Prep draft for review",
      "Hold Apex invoice until PO 4419 is attached",
    ],
    routines: [
      {
        id: "rt-rev-1",
        title: "Billing prep pack",
        instructions: "Draft the pack a reviewer can send or hold.",
        guardrail: "Ask before sending anything to a client.",
        everyCount: 1,
        everyUnit: "day",
        time: "06:00",
        enabled: true,
      },
    ],
  },
];

export function workForAgent(agent: Agent): Stat[] {
  return (agent.skills ?? []).flatMap((skill) => {
    const work = SKILL_WORK[skill as SkillId];
    if (!work) return [];
    return [
      {
        id: skill,
        label: work.label,
        value: work.value,
        note: work.note,
        meta: agent.name,
        agentId: agent.id,
        detail: work.detail,
      },
    ];
  });
}

export function workFromAgents(agents: Agent[]): Stat[] {
  const claimed = new Set<string>();
  const tiles: Stat[] = [];
  for (const agent of agents) {
    for (const tile of workForAgent(agent)) {
      if (claimed.has(tile.id)) continue;
      claimed.add(tile.id);
      tiles.push(tile);
    }
  }
  const running = agents.filter((agent) => agent.status === "Running").length;
  tiles.push({
    id: "agents",
    label: "Agents",
    value: String(agents.length),
    note: running === agents.length ? "Running" : `${running} running`,
    detail: agents.map((agent) => `${agent.name} — ${agent.status.toLowerCase()}`),
  });
  return tiles;
}

export const CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Northwind ERP",
    code: "100441",
    legalName: "Northwind ERP LLC",
    clientType: "Global",
    phone: "(312) 555-0144",
    currency: "USD",
    address: "1200 Merchandise Mart",
    contact: "Priya Shah",
    email: "billing@northwinderp.com",
    owner: "Priya Shah",
    status: "Active",
    unbilled: "$62,400",
    lastActivity: "Time submitted 2h ago",
  },
  {
    id: "c2",
    name: "Contoso Audit",
    code: "100882",
    legalName: "Contoso Audit LLP",
    clientType: "Global",
    phone: "(206) 555-0171",
    currency: "USD",
    address: "500 108th Avenue NE",
    contact: "Marcus Lee",
    email: "ap@contosoaudit.com",
    owner: "Marcus Lee",
    status: "Active",
    unbilled: "$41,180",
    lastActivity: "Invoice draft waiting",
  },
  {
    id: "c3",
    name: "Apex Advisory",
    code: "101903",
    legalName: "Apex Advisory Group",
    clientType: "Startup/Venture",
    phone: "(415) 555-0190",
    currency: "USD",
    address: "88 Kearny Street",
    contact: "Elena Ruiz",
    email: "finance@apexadvisory.com",
    owner: "Elena Ruiz",
    status: "Onboarding",
    unbilled: "$43,640",
    lastActivity: "PO requested yesterday",
  },
  {
    id: "c4",
    name: "Harbor Legal",
    code: "102114",
    legalName: "Harbor Legal Partners",
    clientType: "Other",
    phone: "(617) 555-0133",
    currency: "USD",
    address: "1 International Place",
    contact: "James Okonkwo",
    email: "matters@harborlegal.com",
    owner: "James Okonkwo",
    status: "Paused",
    unbilled: "$8,220",
    lastActivity: "Hold until April kickoff",
  },
  {
    id: "c5",
    name: "Boulder Design Group",
    code: "232445",
    legalName: "Boulder Design Group",
    clientType: "Startup/Venture",
    phone: "(212) 555-0198",
    currency: "USD",
    address: "1640 Riverside Drive",
    contact: "Ethan Carter",
    email: "client@boulderdesign.com",
    owner: "Ethan Carter",
    status: "Active",
    unbilled: "$12,400",
    lastActivity: "Retainer received Monday",
  },
  {
    id: "c6",
    name: "BT Software",
    code: "345666",
    legalName: "BT Software",
    clientType: "Startup/Venture",
    phone: "(305) 555-2746",
    currency: "USD",
    address: "1640 Riverside Drive",
    contact: "Madison Blake",
    email: "client@btsoftware.com",
    owner: "Madison Blake",
    status: "Active",
    unbilled: "$9,180",
    lastActivity: "SOW signed last week",
  },
  {
    id: "c7",
    name: "Chicago Corp",
    code: "986561",
    legalName: "Chicago Corp",
    clientType: "Global",
    phone: "(415) 555-8723",
    currency: "USD",
    address: "5N822 Empire Road",
    contact: "Lucas Harper",
    email: "client@chicagocorp.com",
    owner: "Lucas Harper",
    status: "Active",
    unbilled: "$28,640",
    lastActivity: "Monthly close in review",
  },
  {
    id: "c8",
    name: "Diebert & Associates",
    code: "114466",
    legalName: "Diebert & Associates",
    clientType: "Global",
    phone: "(718) 555-6482",
    currency: "USD",
    address: "1030 Kimball Ave",
    contact: "Sophie Mitchell",
    email: "client@diebert.com",
    owner: "Sophie Mitchell",
    status: "Active",
    unbilled: "$16,220",
    lastActivity: "Time approved yesterday",
  },
  {
    id: "c9",
    name: "DigiCraft Labs",
    code: "890675",
    legalName: "DigiCraft Labs",
    clientType: "Startup/Venture",
    phone: "(602) 555-9814",
    currency: "USD",
    address: "6540 Data Avenue",
    contact: "Aiden Parker",
    email: "client@digicraft.com",
    owner: "Aiden Parker",
    status: "Active",
    unbilled: "$7,940",
    lastActivity: "Kickoff scheduled Friday",
  },
  {
    id: "c10",
    name: "Enrich LLS",
    code: "456567",
    legalName: "Enrich LLS",
    clientType: "Global",
    phone: "(818) 555-4567",
    currency: "USD",
    address: "1350 Byte Boulevard",
    contact: "Chloe Thompson",
    email: "client@enrichlls.com",
    owner: "Chloe Thompson",
    status: "Active",
    unbilled: "$21,100",
    lastActivity: "Invoice sent this morning",
  },
  {
    id: "c11",
    name: "FusionByte Systems",
    code: "344345",
    legalName: "FusionByte Systems",
    clientType: "Global",
    phone: "(404) 555-0134",
    currency: "USD",
    address: "2406 Cyber Circle",
    contact: "Jackson Reed",
    email: "client@fusionbyte.com",
    owner: "Jackson Reed",
    status: "Active",
    unbilled: "$18,760",
    lastActivity: "Change order pending",
  },
  {
    id: "c12",
    name: "Infinite Loop Innovations",
    code: "766767",
    legalName: "Infinite Loop Innovations",
    clientType: "Startup/Venture",
    phone: "(214) 555-6208",
    currency: "USD",
    address: "8N52 Network Drive",
    contact: "Olivia Grant",
    email: "client@infiniteloop.com",
    owner: "Olivia Grant",
    status: "Onboarding",
    unbilled: "$4,320",
    lastActivity: "MSA in legal review",
  },
  {
    id: "c13",
    name: "InfoGuard Innovations",
    code: "565767",
    legalName: "InfoGuard Innovations",
    clientType: "Other",
    phone: "(617) 555-7845",
    currency: "USD",
    address: "1023 Innovation Drive",
    contact: "Noah Hayes",
    email: "client@infoguard.com",
    owner: "Noah Hayes",
    status: "Active",
    unbilled: "$11,540",
    lastActivity: "Security review complete",
  },
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    name: "ERP Cutover",
    client: "Northwind ERP",
    phase: "Build",
    budget: "$420,000",
    used: "68%",
  },
  {
    id: "p2",
    name: "FY25 Audit",
    client: "Contoso Audit",
    phase: "Fieldwork",
    budget: "$180,000",
    used: "81%",
  },
  {
    id: "p3",
    name: "Operating Model",
    client: "Apex Advisory",
    phase: "Discovery",
    budget: "$96,000",
    used: "22%",
  },
  {
    id: "p4",
    name: "Matter 4419",
    client: "Harbor Legal",
    phase: "Hold",
    budget: "$48,000",
    used: "17%",
  },
  {
    id: "p5",
    name: "Brand System",
    client: "Boulder Design Group",
    phase: "Design",
    budget: "$64,000",
    used: "41%",
  },
  {
    id: "p6",
    name: "Platform Rebuild",
    client: "BT Software",
    phase: "Build",
    budget: "$210,000",
    used: "54%",
  },
  {
    id: "p7",
    name: "HQ Expansion",
    client: "Chicago Corp",
    phase: "Delivery",
    budget: "$380,000",
    used: "63%",
  },
  {
    id: "p8",
    name: "Partner Review",
    client: "Diebert & Associates",
    phase: "Fieldwork",
    budget: "$92,000",
    used: "37%",
  },
  {
    id: "p9",
    name: "Product Launch",
    client: "DigiCraft Labs",
    phase: "Sprint 4",
    budget: "$48,000",
    used: "29%",
  },
  {
    id: "p10",
    name: "Finance Ops",
    client: "Enrich LLS",
    phase: "Stabilization",
    budget: "$126,000",
    used: "72%",
  },
  {
    id: "p11",
    name: "Cloud Migration",
    client: "FusionByte Systems",
    phase: "Build",
    budget: "$175,000",
    used: "48%",
  },
  {
    id: "p12",
    name: "Seed Readiness",
    client: "Infinite Loop Innovations",
    phase: "Discovery",
    budget: "$36,000",
    used: "12%",
  },
  {
    id: "p13",
    name: "SOC 2 Program",
    client: "InfoGuard Innovations",
    phase: "Control testing",
    budget: "$88,000",
    used: "33%",
  },
];

export const TIME_ENTRIES: TimeEntry[] = [
  {
    id: "t1",
    person: "Priya Shah",
    project: "ERP Cutover",
    hours: 6.5,
    date: "Mar 12",
    status: "Submitted",
  },
  {
    id: "t2",
    person: "Marcus Lee",
    project: "FY25 Audit",
    hours: 8,
    date: "Mar 12",
    status: "Approved",
  },
  {
    id: "t3",
    person: "Elena Ruiz",
    project: "Operating Model",
    hours: 3.25,
    date: "Mar 11",
    status: "Draft",
  },
  {
    id: "t4",
    person: "James Okonkwo",
    project: "Matter 4419",
    hours: 1.5,
    date: "Mar 10",
    status: "Submitted",
  },
];

/** Tracker log. Ordered newest first; the view groups by ISO week, then day. */
export const TIME_LOGS: TimeLog[] = [
  {
    id: "l1",
    description: "Cutover dry run",
    project: "ERP Cutover",
    client: "Northwind ERP",
    date: "2026-03-12",
    start: "16:00",
    end: "20:29",
    seconds: 16179,
    tag: "Billable",
  },
  {
    id: "l2",
    description: "Data migration checks",
    project: "ERP Cutover",
    client: "Northwind ERP",
    date: "2026-03-12",
    start: "09:15",
    end: "12:45",
    seconds: 12600,
    tag: "Billable",
  },
  {
    id: "l3",
    description: "Close prep with Marcus",
    project: "FY25 Audit",
    client: "Contoso Audit",
    date: "2026-03-11",
    start: "13:00",
    end: "17:27",
    seconds: 16063,
  },
  {
    id: "l4",
    description: "Overnight batch watch",
    project: "Platform Rebuild",
    client: "BT Software",
    date: "2026-03-09",
    start: "18:00",
    end: "01:18",
    seconds: 26311,
    overnight: true,
    tag: "On call",
  },
  {
    id: "l5",
    description: "Discovery workshop",
    project: "Operating Model",
    client: "Apex Advisory",
    date: "2026-03-06",
    start: "10:00",
    end: "11:46",
    seconds: 6360,
    tag: "Billable",
  },
  {
    id: "l6",
    description: "Fieldwork sampling",
    project: "Partner Review",
    client: "Diebert & Associates",
    date: "2026-03-05",
    start: "18:41",
    end: "07:41",
    seconds: 46810,
    overnight: true,
  },
  {
    id: "l7",
    description: "Brand system audit",
    project: "Brand System",
    client: "Boulder Design Group",
    date: "2026-03-03",
    start: "13:30",
    end: "16:12",
    seconds: 9720,
    tag: "Billable",
  },
  {
    id: "l8",
    description: "Sprint 4 planning",
    project: "Product Launch",
    client: "DigiCraft Labs",
    date: "2026-02-26",
    start: "09:00",
    end: "12:30",
    seconds: 12600,
  },
  {
    id: "l9",
    description: "HQ expansion walkthrough",
    project: "HQ Expansion",
    client: "Chicago Corp",
    date: "2026-02-24",
    start: "14:00",
    end: "18:37",
    seconds: 16620,
    tag: "Billable",
  },
];

/** The week both timesheet grids render. Sunday-first, matching the design. */
export const TIMESHEET_WEEK = [
  { key: "sun", label: "Sun, Mar 8", weekend: true },
  { key: "mon", label: "Mon, Mar 9" },
  { key: "tue", label: "Tue, Mar 10" },
  { key: "wed", label: "Wed, Mar 11" },
  { key: "thu", label: "Thu, Mar 12", today: true },
  { key: "fri", label: "Fri, Mar 13" },
  { key: "sat", label: "Sat, Mar 14", weekend: true },
];

export const TIMESHEET_TASKS: TimesheetTask[] = [
  {
    id: "ts1",
    name: "Cutover rehearsal",
    status: "Open",
    team: "Delivery",
    project: "ERP Cutover",
    days: [
      { hours: 3, weekend: true },
      { hours: 8 },
      { hours: 2 },
      { hours: 4 },
      { hours: 8.5, running: true },
      { hours: 4 },
      { hours: 6, weekend: true },
    ],
  },
  {
    id: "ts2",
    name: "Close pack review",
    status: "In review",
    team: "Finance",
    project: "FY25 Audit",
    days: [
      { hours: 0, weekend: true },
      { hours: 6 },
      { hours: 7.5 },
      { hours: 3 },
      { hours: 0 },
      { hours: 2 },
      { hours: 0, weekend: true },
    ],
  },
  {
    id: "ts3",
    name: "Design widget components",
    status: "Closed",
    team: "Design Team",
    project: "Dashboard Revamp v2",
    days: [
      { hours: 0, weekend: true },
      { hours: 4 },
      { hours: 4 },
      { hours: 0 },
      { hours: 2.5 },
      { hours: 0 },
      { hours: 0, weekend: true },
    ],
  },
];

export const TIMESHEET_PEOPLE: TimesheetPerson[] = [
  {
    id: "tp1",
    name: "Brian Altman",
    initials: "BA",
    capacity: 40,
    days: [
      { hours: 3, weekend: true },
      { hours: 8 },
      { hours: 2 },
      { hours: 4 },
      { hours: 8.5 },
      { hours: 4 },
      { hours: 6, weekend: true },
    ],
  },
  {
    id: "tp2",
    name: "Priya Shah",
    initials: "PS",
    avatar: "/avatars/project-manager.png",
    capacity: 40,
    days: [
      { hours: 0, weekend: true },
      { hours: 8 },
      { hours: 8 },
      { hours: 6.5 },
      { hours: 7 },
      { hours: 4 },
      { hours: 0, weekend: true },
    ],
  },
  {
    id: "tp3",
    name: "Marcus Lee",
    initials: "ML",
    color: "#3385ff",
    capacity: 40,
    days: [
      { hours: 0, weekend: true },
      { hours: 8 },
      { hours: 8 },
      { hours: 8 },
      { hours: 8 },
      { hours: 8 },
      { hours: 0, weekend: true },
    ],
  },
  {
    id: "tp4",
    name: "Elena Ruiz",
    initials: "ER",
    color: "#5b4ddb",
    capacity: 40,
    days: [
      { hours: 0, weekend: true },
      { hours: 3.25 },
      { hours: 0 },
      { hours: 5 },
      { hours: 0 },
      { hours: 0 },
      { hours: 0, weekend: true },
    ],
  },
  {
    id: "tp5",
    name: "James Okonkwo",
    initials: "JO",
    color: "#087443",
    capacity: 40,
    days: [
      { hours: 0, weekend: true },
      { hours: 0 },
      { hours: 0 },
      { hours: 1.5 },
      { hours: 0 },
      { hours: 0 },
      { hours: 0, weekend: true },
    ],
  },
];

export const EXPENSES: Expense[] = [
  {
    id: "e1",
    vendor: "United Airlines",
    project: "ERP Cutover",
    amount: "$642.18",
    date: "Mar 9",
    status: "Needs review",
  },
  {
    id: "e2",
    vendor: "WeWork",
    project: "FY25 Audit",
    amount: "$210.00",
    date: "Mar 8",
    status: "Coded",
  },
  {
    id: "e3",
    vendor: "AWS",
    project: "Operating Model",
    amount: "$1,184.40",
    date: "Mar 1",
    status: "Posted",
  },
];

export const INVOICES: Invoice[] = [
  {
    id: "i1",
    number: "INV-2026-0096",
    client: "Northwind ERP",
    project: "ERP Cutover",
    projectId: "PRJ-4201",
    billingModel: "Fixed Fee",
    period: "Apr 1 – Apr 30, 2026",
    invoiced: "04/28/2026",
    amount: "$48,200",
    due: "Mar 30",
    status: "Draft",
  },
  {
    id: "i2",
    number: "INV-2026-0101",
    client: "BT Software",
    projectCount: 2,
    billingModel: "Time & Material",
    period: "Apr 1 – Apr 25, 2026",
    invoiced: "04/26/2026",
    amount: "$15,900",
    due: "Apr 4",
    status: "Draft",
  },
  {
    id: "i3",
    number: "INV-2026-0098",
    client: "Contoso Audit",
    project: "FY25 Audit",
    projectId: "PRJ-1742",
    billingModel: "Fixed Fee",
    period: "Apr 2026",
    invoiced: "04/25/2026",
    amount: "$22,750",
    due: "Mar 18",
    status: "Sent",
  },
  {
    id: "i4",
    number: "INV-2026-0123",
    client: "Boulder Design Group",
    project: "Brand System",
    projectId: "PRJ-3180",
    billingModel: "Fixed Fee",
    period: "Apr 1 – Apr 30, 2026",
    invoiced: "04/23/2026",
    amount: "$8,400",
    due: "Apr 12",
    status: "Sent",
  },
  {
    id: "i5",
    number: "INV-2026-0018",
    client: "Diebert & Associates",
    project: "Partner Review",
    projectId: "PRJ-5823",
    billingModel: "Time & Material",
    period: "Apr 1 – Apr 15, 2026",
    invoiced: "04/18/2026",
    amount: "$11,050",
    due: "Mar 22",
    status: "Paid",
  },
  {
    id: "i6",
    number: "INV-2026-0089",
    client: "Chicago Corp",
    project: "HQ Expansion",
    projectId: "PRJ-7310",
    billingModel: "Time & Material",
    period: "Mar 1 – Mar 31, 2026",
    invoiced: "04/10/2026",
    amount: "$31,200",
    due: "Mar 28",
    status: "Sent",
  },
  {
    id: "i7",
    number: "INV-2026-0134",
    client: "Apex Advisory",
    project: "Operating Model",
    projectId: "PRJ-8640",
    billingModel: "Retainer",
    period: "Apr 2026",
    invoiced: "04/05/2026",
    amount: "$12,400",
    due: "Mar 4",
    status: "Overdue",
  },
  {
    id: "i8",
    number: "INV-2026-0135",
    client: "DigiCraft Labs",
    project: "Product Launch",
    projectId: "PRJ-1100",
    billingModel: "Time & Material",
    period: "Mar 1 – Mar 21, 2026",
    invoiced: "03/22/2026",
    amount: "$6,200",
    due: "Apr 18",
    status: "Draft",
  },
  {
    id: "i9",
    number: "INV-2026-0136",
    client: "Northwind ERP",
    projectCount: 3,
    billingModel: "Item-based Billing",
    period: "Mar 2026",
    invoiced: "03/20/2026",
    amount: "$19,400",
    due: "Mar 31",
    status: "Sent",
  },
  {
    id: "i10",
    number: "INV-2026-0137",
    client: "Harbor Legal",
    project: "Matter 4419",
    projectId: "PRJ-2487",
    billingModel: "Item-based Billing",
    period: "Mar 1 – Mar 15, 2026",
    invoiced: "03/20/2026",
    amount: "$9,800",
    due: "Feb 28",
    status: "Paid",
  },
  {
    id: "i11",
    number: "INV-2026-0089-B",
    client: "FusionByte Systems",
    project: "Compliance Audit",
    projectId: "PRJ-6735",
    billingModel: "Fixed Fee",
    period: "Mar 2026",
    invoiced: "03/19/2026",
    amount: "$14,880",
    due: "Apr 2",
    status: "Sent",
  },
  {
    id: "i12",
    number: "INV-2026-0099",
    client: "Enrich LLS",
    project: "Module Development",
    projectId: "PRJ-3920",
    billingModel: "Retainer",
    period: "Mar 2026",
    invoiced: "03/14/2026",
    amount: "$4,320",
    due: "Apr 20",
    status: "Draft",
  },
  {
    id: "i13",
    number: "INV-2026-0100",
    client: "InfoGuard Innovations",
    project: "eCommerce Build",
    projectId: "PRJ-5461",
    billingModel: "Fixed Fee",
    period: "Mar 2026",
    invoiced: "03/11/2026",
    amount: "$9,760",
    due: "Mar 26",
    status: "Overdue",
  },
];

/** "$48,200" + "$22,750" -> "$70,950". Amounts are display strings in this prototype. */
export function invoiceTotal(invoices: Invoice[]) {
  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.amount.replace(/[^0-9.]/g, "")), 0);
  return `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const PAYMENT_TERMS = ["Due on receipt", "Net 15", "Net 30", "Net 45", "Net 60"];

export const INVOICE_CONTACTS = [
  "billing@northwinderp.test (Jakub Nowak)",
  "ap@northwinderp.test (Accounts Payable)",
  "priya@northwinderp.test (Priya Shah)",
];

export function newInvoiceDraft(): InvoiceDraft {
  return {
    client: "Northwind ERP",
    projects: ["ERP Cutover"],
    contact: INVOICE_CONTACTS[0],
    recipient: "Jakub Nowak",
    address: "456 Client Blvd, New York, NY 10001, USA",
    taxId: "",
    logo: true,
    number: "INV-2026-0140",
    po: "",
    invoiced: "04/03/2026",
    terms: "Net 30",
    due: "05/03/2026",
    note: "Thank you for your business. Please remit payment within the specified terms.",
    items: [
      { id: "li1", item: "Consulting", project: "ERP Cutover", qty: 1, rate: 2000 },
    ],
    attachments: [{ id: "at1", name: "Timesheet Mar 2026.pdf", size: "234KB" }],
  };
}

export const INBOX: InboxItem[] = [
  {
    id: "m1",
    from: "RevOps",
    subject: "Billing Prep is ready",
    preview: "$147,220 can go out if Apex PO 4419 is attached.",
    time: "12m",
    unread: true,
  },
  {
    id: "m2",
    from: "Project Manager",
    subject: "Two staffing decisions",
    preview: "Northwind weekend coverage and Contoso review date.",
    time: "1h",
    unread: true,
  },
  {
    id: "m3",
    from: "Collections",
    subject: "INV-1021 is 11 days overdue",
    preview: "Apex has not confirmed the PO. Draft chase is ready.",
    time: "3h",
    unread: false,
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "March close in 6 days",
    body: "Three decisions are still open on Overview.",
    time: "Just now",
    unread: true,
  },
  {
    id: "n2",
    title: "Receipt needs a project",
    body: "United Airlines $642.18 is sitting in Expense.",
    time: "40m",
    unread: true,
  },
  {
    id: "n3",
    title: "Timesheet reminder",
    body: "Elena Ruiz has 3.25 draft hours from yesterday.",
    time: "2h",
    unread: false,
  },
];

export const APPS: ConnectedApp[] = [
  {
    id: "xero",
    name: "Xero",
    color: "#2AB7EA",
    connected: true,
    description: "Books and invoice posting",
  },
  {
    id: "qbo",
    name: "QuickBooks",
    color: "#4AC6B7",
    connected: true,
    description: "Expenses and payments",
  },
  {
    id: "slack",
    name: "Slack",
    color: "#0866FF",
    connected: true,
    description: "Agent alerts and approvals",
  },
  {
    id: "drive",
    name: "Google Drive",
    color: "#F4B400",
    connected: false,
    description: "Receipts and workpapers",
  },
];

export const REPORTS = [
  { id: "r1", name: "WIP Aging", updated: "Today", owner: "RevOps" },
  { id: "r2", name: "Utilization vs plan", updated: "Today", owner: "Project Manager" },
  { id: "r3", name: "Billing Prep pack", updated: "Yesterday", owner: "RevOps" },
  { id: "r4", name: "Margin Watch", updated: "Yesterday", owner: "RevOps" },
];

export type ReportRange = "3m" | "6m" | "12m";

export const REPORT_RANGE_LABEL: Record<ReportRange, string> = {
  "3m": "3 months",
  "6m": "6 months",
  "12m": "12 months",
};

export const REPORT_CHARTS: Record<
  ReportRange,
  {
    months: string[];
    burn: number[];
    burnAvg: number;
    burnValue: string;
    revenueCurrent: number[];
    revenuePrevious: number[];
    revenueAvg: number;
    revenueValue: string;
    expensesTotal: number[];
    expensesRecurring: number[];
    expensesValue: string;
    pnl: number[];
    pnlValue: string;
    pnlRange: string;
  }
> = {
  "3m": {
    months: ["Feb", "Mar", "Apr", "May"],
    burn: [0, 0, 2, 90],
    burnAvg: 22,
    burnValue: "$22",
    revenueCurrent: [0, 0, 0, 234],
    revenuePrevious: [0, 0, 0, 48],
    revenueAvg: 60,
    revenueValue: "$234",
    expensesTotal: [16, 18, 17, 22],
    expensesRecurring: [12, 12, 13, 14],
    expensesValue: "$22",
    pnl: [0, 0, 18, 145],
    pnlValue: "$145",
    pnlRange: "Feb 17 – May 17, 2026",
  },
  "6m": {
    months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    burn: [8, 6, 0, 0, 2, 90],
    burnAvg: 18,
    burnValue: "$18",
    revenueCurrent: [40, 28, 0, 0, 0, 234],
    revenuePrevious: [36, 22, 0, 0, 0, 48],
    revenueAvg: 50,
    revenueValue: "$234",
    expensesTotal: [20, 19, 16, 18, 17, 22],
    expensesRecurring: [14, 14, 12, 12, 13, 14],
    expensesValue: "$19",
    pnl: [12, 8, 0, 0, 18, 145],
    pnlValue: "$145",
    pnlRange: "Dec 17 – May 17, 2026",
  },
  "12m": {
    months: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    burn: [14, 16, 12, 10, 9, 8, 8, 6, 0, 0, 2, 90],
    burnAvg: 16,
    burnValue: "$16",
    revenueCurrent: [80, 72, 64, 58, 50, 44, 40, 28, 0, 0, 0, 234],
    revenuePrevious: [70, 68, 60, 52, 48, 40, 36, 22, 0, 0, 0, 48],
    revenueAvg: 54,
    revenueValue: "$234",
    expensesTotal: [24, 23, 22, 21, 20, 20, 20, 19, 16, 18, 17, 22],
    expensesRecurring: [16, 16, 15, 15, 14, 14, 14, 14, 12, 12, 13, 14],
    expensesValue: "$20",
    pnl: [40, 36, 30, 24, 18, 14, 12, 8, 0, 0, 18, 145],
    pnlValue: "$145",
    pnlRange: "May 17, 2025 – May 17, 2026",
  },
};

export function titleForPrompt(prompt: string) {
  const text = prompt.toLowerCase();
  if (text.includes("revenue") || (text.includes("compare") && text.includes("month"))) {
    return "Monthly Revenue Comparison";
  }
  if (text.includes("invoice") || text.includes("bill")) return "Invoice draft";
  if (text.includes("time") || text.includes("timesheet")) return "Timesheet review";
  if (text.includes("margin") || text.includes("wip")) return "Margin Watch";
  if (text.includes("client") || text.includes("customer")) return "Client follow-up";

  const clean = prompt.trim().replace(/\s+/g, " ");
  const slice = clean.length > 48 ? `${clean.slice(0, 45).trim()}…` : clean;
  return slice ? slice[0].toUpperCase() + slice.slice(1) : "New chat";
}

export function replyForPrompt(prompt: string) {
  const text = prompt.toLowerCase();
  if (text.includes("revenue") || (text.includes("compare") && text.includes("month"))) {
    return {
      text: "Your net revenue for this month so far is $234.31, compared to $0 for the same period last month. This indicates a positive growth as you had no recorded revenue last month.",
      status: "Calculating revenue",
    };
  }
  if (text.includes("invoice") || text.includes("bill")) {
    return {
      text: "I queued Create Invoice around Northwind ERP for $48,200. Draft INV-1044 is open in Invoices if you want to send it.",
      status: "Drafting invoice",
    };
  }
  if (text.includes("time") || text.includes("timesheet")) {
    return {
      text: "Priya has 6.5 submitted hours on ERP Cutover today. Elena still has 3.25 draft hours from yesterday — I can nudge her.",
      status: "Checking timesheets",
    };
  }
  if (text.includes("margin") || text.includes("wip")) {
    return {
      text: "Margin Watch is 11% against a 34% plan. Contoso Audit is the main drag. Unbilled WIP is $412,000 and current.",
      status: "Reading WIP",
    };
  }
  if (text.includes("client") || text.includes("customer")) {
    return {
      text: "Four clients are in the book. Apex Advisory is still onboarding and blocking $43,640 until PO 4419 lands.",
      status: "Reviewing clients",
    };
  }
  return {
    text: "Three decisions are waiting: overtime for Northwind, the Contoso review date, and whether to hold the Apex invoice. I can take any of those.",
    status: "Reading workspace",
  };
}
