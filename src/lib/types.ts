export type ViewId =
  | "overview"
  | "chat"
  | "agents"
  | "project-manager"
  | "revops"
  | "clients"
  | "projects"
  | "time"
  | "time-tracker"
  | "expense"
  | "invoices"
  | "invoice-new"
  | "reports";

export type PanelId =
  | "inbox"
  | "notifications"
  | "settings"
  | "help"
  | "apps"
  | "workspace"
  | null;

export type DialogId =
  | "add-customer"
  | "track-time"
  | "upload-receipt"
  | "create-invoice"
  | "add-transaction"
  | "add-agent"
  | "add-project"
  | null;

export type IconName =
  | "grid"
  | "people"
  | "person"
  | "folder"
  | "timer"
  | "receipt"
  | "doc"
  | "chart"
  | "plus"
  | "chevron-right"
  | "chevron-up"
  | "inbox"
  | "bell"
  | "gear"
  | "help"
  | "bolt"
  | "at"
  | "link"
  | "arrow-up"
  | "user-plus"
  | "plus-square"
  | "search"
  | "x"
  | "chevron-left"
  | "chevron-down"
  | "check"
  | "grip"
  | "filter"
  | "tag"
  | "play"
  | "stop"
  | "calendar"
  | "dots"
  | "arrow-right"
  | "minus"
  | "trash"
  | "external";

export type Agent = {
  id: string;
  name: string;
  role: string;
  status: "Running" | "Idle" | "Paused";
  avatar: "project-manager" | "revops" | "custom";
  color?: string;
  lastAction: string;
  decisions: string[];
  instructions?: string;
  watches?: string[];
  department?: string;
  model?: string;
  skills?: string[];
  appIds?: string[];
  runMode?: "manual" | "events";
  routines?: AgentRoutine[];
};

export type AgentRoutine = {
  id: string;
  title: string;
  instructions: string;
  guardrail: string;
  everyCount: number;
  everyUnit: "hour" | "day" | "week";
  time: string;
  enabled: boolean;
};

export type Client = {
  id: string;
  name: string;
  code: string;
  legalName: string;
  clientType: string;
  phone: string;
  currency: string;
  address: string;
  contact: string;
  email: string;
  owner: string;
  status: "Active" | "Onboarding" | "Paused";
  unbilled: string;
  lastActivity: string;
};

export type Project = {
  id: string;
  name: string;
  client: string;
  phase: string;
  budget: string;
  used: string;
};

export type TimeEntry = {
  id: string;
  person: string;
  project: string;
  hours: number;
  date: string;
  status: "Draft" | "Submitted" | "Approved";
};

export type TimeLog = {
  id: string;
  description: string;
  project: string;
  client: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** 24h clock, HH:MM */
  start: string;
  end: string;
  seconds: number;
  /** end clock rolls past midnight — renders the +1 marker */
  overnight?: boolean;
  tag?: string;
};

/** One cell of a week grid — hours plus how full that day is against capacity. */
export type DayHours = {
  hours: number;
  /** weekend work reads as an exception, matching the red bars in the design */
  weekend?: boolean;
  running?: boolean;
};

export type TimesheetTask = {
  id: string;
  name: string;
  status: "Open" | "Closed" | "In review";
  team: string;
  project: string;
  days: DayHours[];
};

export type TimesheetPerson = {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  color?: string;
  capacity: number;
  days: DayHours[];
};

export type Expense = {
  id: string;
  vendor: string;
  project: string;
  amount: string;
  date: string;
  status: "Needs review" | "Coded" | "Posted";
};

export type BillingModel = "Fixed Fee" | "Time & Material" | "Retainer" | "Item-based Billing";

export type Invoice = {
  id: string;
  number: string;
  client: string;
  /** Single project name, or undefined when the invoice spans several. */
  project?: string;
  projectId?: string;
  /** Set instead of project/projectId for a multi-project invoice. */
  projectCount?: number;
  billingModel: BillingModel;
  period: string;
  invoiced: string;
  amount: string;
  due: string;
  status: "Draft" | "Sent" | "Overdue" | "Paid";
};

export type InvoiceLineItem = {
  id: string;
  item: string;
  project: string;
  qty: number;
  rate: number;
};

export type InvoiceAttachment = {
  id: string;
  name: string;
  size: string;
};

export type InvoiceDraft = {
  client: string;
  projects: string[];
  contact: string;
  /** Person the invoice is addressed to, shown as the TO party. */
  recipient: string;
  address: string;
  taxId: string;
  logo: boolean;
  number: string;
  po: string;
  invoiced: string;
  terms: string;
  due: string;
  note: string;
  items: InvoiceLineItem[];
  attachments: InvoiceAttachment[];
};

export type Stat = {
  id: string;
  label: string;
  value: string;
  note?: string;
  meta?: string;
  agentId?: string;
  detail: string[];
};

export type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  status?: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export type InboxItem = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
};

export type ConnectedApp = {
  id: string;
  name: string;
  color: string;
  connected: boolean;
  description: string;
};
