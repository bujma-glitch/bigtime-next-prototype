"use client";

import { FormEvent, MouseEvent, useRef, useState } from "react";
import { Header } from "@/components/shell/Header";
import { Sidebar } from "@/components/shell/Sidebar";
import { Dialog } from "@/components/ui/Dialog";
import dialogStyles from "@/components/ui/Dialog.module.css";
import { ActionButton } from "@/components/ui/ActionButton";
import { Chip, toneForStatus } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";
import { AppLogo } from "@/components/ui/AppLogo";
import { Panel } from "@/components/ui/Panel";
import panelStyles from "@/components/ui/Panel.module.css";
import { AddAgentForm } from "@/components/views/AddAgentForm";
import { AgentView } from "@/components/views/AgentView";
import { ChatView } from "@/components/views/ChatView";
import { OverviewView } from "@/components/views/OverviewView";
import { ReportsView } from "@/components/views/ReportsView";
import { InvoiceCreateView } from "@/components/views/InvoiceCreateView";
import { TimesheetView } from "@/components/views/TimesheetView";
import { TimeTrackerView, formatDuration } from "@/components/views/TimeTrackerView";
import { WorkView } from "@/components/views/WorkView";
import workStyles from "@/components/views/WorkView.module.css";
import {
  AGENTS,
  APPS,
  CLIENTS,
  EXPENSES,
  INBOX,
  INVOICES,
  invoiceTotal,
  newInvoiceDraft,
  NOTIFICATIONS,
  PROJECTS,
  TIME_LOGS,
  TIMESHEET_PEOPLE,
  TIMESHEET_WEEK,
  TIMESHEET_TASKS,
  USER,
  replyForPrompt,
  titleForPrompt,
  workFromAgents,
} from "@/data/mock";
import type { Agent, Client, DialogId, Message, PanelId, Stat, ViewId } from "@/lib/types";
import styles from "./App.module.css";

const dialogCopy: Record<
  Exclude<DialogId, null | "add-agent">,
  { title: string; action: string; fields: { name: string; label: string; placeholder: string }[] }
> = {
  "add-customer": {
    title: "Add Customer",
    action: "Save customer",
    fields: [
      { name: "name", label: "Client name", placeholder: "Northwind ERP" },
      { name: "owner", label: "Owner", placeholder: "Priya Shah" },
    ],
  },
  "track-time": {
    title: "Track Time",
    action: "Add time",
    fields: [
      { name: "task", label: "Task", placeholder: "Cutover rehearsal" },
      { name: "project", label: "Project", placeholder: "ERP Cutover" },
      { name: "hours", label: "Hours", placeholder: "1.5" },
    ],
  },
  "upload-receipt": {
    title: "Upload Receipt",
    action: "Code receipt",
    fields: [
      { name: "vendor", label: "Vendor", placeholder: "United Airlines" },
      { name: "amount", label: "Amount", placeholder: "$642.18" },
    ],
  },
  "create-invoice": {
    title: "Create Invoice",
    action: "Create draft",
    fields: [
      { name: "client", label: "Client", placeholder: "Northwind ERP" },
      { name: "project", label: "Project", placeholder: "ERP Cutover" },
      { name: "amount", label: "Amount", placeholder: "$48,200" },
    ],
  },
  "add-transaction": {
    title: "Add Transaction",
    action: "Post",
    fields: [
      { name: "memo", label: "Memo", placeholder: "Retainer payment" },
      { name: "amount", label: "Amount", placeholder: "$12,000" },
    ],
  },
  "add-project": {
    title: "Add Project",
    action: "Create project",
    fields: [
      { name: "name", label: "Project name", placeholder: "ERP Cutover" },
      { name: "client", label: "Client", placeholder: "Northwind ERP" },
      { name: "budget", label: "Budget", placeholder: "$420,000" },
    ],
  },
};

export function App() {
  const [view, setView] = useState<ViewId>("overview");
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [timeOpen, setTimeOpen] = useState(false);
  const [panel, setPanel] = useState<PanelId>(null);
  const [dialog, setDialog] = useState<DialogId>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const toastTimer = useRef(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTitle, setChatTitle] = useState("New chat");
  const [stat, setStat] = useState<Stat | null>(null);
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [apps, setApps] = useState(APPS);
  const [clients, setClients] = useState(CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState(PROJECTS);
  const [timesheetTasks, setTimesheetTasks] = useState(TIMESHEET_TASKS);
  const [timeLogs, setTimeLogs] = useState(TIME_LOGS);
  const [expenses, setExpenses] = useState(EXPENSES);
  const [invoices, setInvoices] = useState(INVOICES);
  const [invoiceDraft, setInvoiceDraft] = useState(newInvoiceDraft);

  function flash(next: string) {
    window.clearTimeout(toastTimer.current);
    setToast(next);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setToastOpen(true));
    });
    toastTimer.current = window.setTimeout(() => setToastOpen(false), 2400);
  }

  function openPanel(next: Exclude<PanelId, null>) {
    setPanel((current) => (current === next ? null : next));
    setStat(null);
    setSelectedClient(null);
  }

  function handlePrompt(value: string) {
    const reply = replyForPrompt(value);
    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", text: value };
    const agentMessage: Message = {
      id: `a-${Date.now()}`,
      role: "agent",
      text: reply.text,
      status: reply.status,
    };
    if (messages.length === 0) setChatTitle(titleForPrompt(value));
    setMessages((current) => [...current, userMessage, agentMessage]);
    setPanel(null);
    setStat(null);
    setSelectedClient(null);
    setView("chat");
  }

  function handleNewChat() {
    setMessages([]);
    setChatTitle("New chat");
    setView("chat");
  }

  function handleTool(tool: "plus" | "bolt" | "at" | "link") {
    if (tool === "plus") setDialog("upload-receipt");
    if (tool === "bolt") setDialog("create-invoice");
    if (tool === "at") setView("clients");
    if (tool === "link") openPanel("apps");
  }

  function handleDialogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (dialog === "add-customer") {
      const name = String(data.get("name") || "New client");
      setClients((current) => [
        {
          id: `c-${Date.now()}`,
          name,
          code: String(Date.now()).slice(-6),
          legalName: name,
          clientType: "Startup/Venture",
          phone: "—",
          currency: "USD",
          address: "—",
          contact: String(data.get("owner") || USER.name),
          email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}@client.test`,
          owner: String(data.get("owner") || USER.name),
          status: "Onboarding",
          unbilled: "$0",
          lastActivity: "Just added",
        },
        ...current,
      ]);
      setView("clients");
      flash(`${name} added to Clients`);
    }
    if (dialog === "add-project") {
      const name = String(data.get("name") || "New project");
      setProjects((current) => [
        {
          id: `p-${Date.now()}`,
          name,
          client: String(data.get("client") || "Northwind ERP"),
          phase: "Kickoff",
          budget: String(data.get("budget") || "$0"),
          used: "0%",
        },
        ...current,
      ]);
      setView("projects");
      flash(`${name} added to Projects`);
    }
    if (dialog === "track-time") {
      const hours = Number(data.get("hours") || 1);
      const todayIndex = TIMESHEET_WEEK.findIndex((day) => day.today);
      setTimesheetTasks((current) => [
        {
          id: `ts-${Date.now()}`,
          name: String(data.get("task") || "New task"),
          status: "Open",
          team: USER.name,
          project: String(data.get("project") || "ERP Cutover"),
          days: TIMESHEET_WEEK.map((day, index) => ({
            hours: index === todayIndex ? hours : 0,
            weekend: day.weekend,
          })),
        },
        ...current,
      ]);
      setView("time");
      flash(`${hours}h added to your timesheet`);
    }
    if (dialog === "upload-receipt") {
      setExpenses((current) => [
        {
          id: `e-${Date.now()}`,
          vendor: String(data.get("vendor") || "New vendor"),
          project: "Unassigned",
          amount: String(data.get("amount") || "$0.00"),
          date: "Mar 12",
          status: "Needs review",
        },
        ...current,
      ]);
      setView("expense");
      flash("Receipt captured");
    }
    if (dialog === "create-invoice") {
      setInvoices((current) => [
        {
          id: `i-${Date.now()}`,
          number: `INV-2026-${String(140 + current.length).padStart(4, "0")}`,
          client: String(data.get("client") || "Northwind ERP"),
          project: String(data.get("project") || "Unassigned"),
          projectId: `PRJ-${String(Date.now()).slice(-4)}`,
          billingModel: "Fixed Fee",
          period: "Apr 2026",
          invoiced: "04/30/2026",
          amount: String(data.get("amount") || "$0"),
          due: "Apr 12",
          status: "Draft",
        },
        ...current,
      ]);
      setView("invoices");
      flash("Invoice draft created");
    }
    if (dialog === "add-transaction") {
      flash(`Transaction posted: ${String(data.get("memo") || "Payment")}`);
    }
    setDialog(null);
  }

  function closeAgentDialog() {
    setDialog(null);
    setEditingAgent(null);
  }

  function handleCreateAgent(agent: Agent) {
    setAgents((current) => [...current, agent]);
    setAgentsOpen(true);
    setView("agents");
    setSelectedAgentId(agent.id);
    flash(`${agent.name} is ${agent.status.toLowerCase()}`);
    closeAgentDialog();
  }

  function handleSaveAgent(agent: Agent) {
    setAgents((current) => current.map((item) => (item.id === agent.id ? agent : item)));
    setSelectedAgentId(agent.id);
    flash(`${agent.name} updated`);
    closeAgentDialog();
  }

  function handleAddAgent() {
    setEditingAgent(null);
    setDialog("add-agent");
  }

  function handleEditAgent() {
    const target = agents.find((agent) => agent.id === selectedAgentId);
    if (!target) return;
    setEditingAgent(target);
    setDialog("add-agent");
  }

  function handleTime() {
    if (view === "time" || view === "time-tracker") {
      setTimeOpen((open) => !open);
      return;
    }
    setTimeOpen(true);
    setView("time");
  }

  function handleSelectAgent(id: string | null) {
    if (id === null) {
      if (view === "agents" && selectedAgentId === null) {
        setAgentsOpen((open) => !open);
        return;
      }
      setAgentsOpen(true);
      setView("agents");
      setSelectedAgentId(null);
      return;
    }
    setAgentsOpen(true);
    setView("agents");
    setSelectedAgentId(id);
  }

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? null;
  const agentWork = workFromAgents(agents);
  const waiting = agents.reduce((count, agent) => count + agent.decisions.length, 0);
  const panelOpen = panel !== null || stat !== null || selectedClient !== null;

  return (
    <div className={styles.app}>
      <Sidebar
        view={view}
        selectedAgentId={selectedAgentId}
        agentsOpen={agentsOpen}
        timeOpen={timeOpen}
        agents={agents}
        onView={setView}
        onSelectAgent={handleSelectAgent}
        onTime={handleTime}
        onAddAgent={handleAddAgent}
        onWorkspace={() => openPanel("workspace")}
      />
      <div className={styles.main}>
        {view !== "chat" ? <Header panel={panel} onPanel={openPanel} /> : null}
        <div className={styles.body}>
          {view === "overview" ? (
            <OverviewView
              apps={apps}
              subtitle={`${waiting} ${waiting === 1 ? "decision" : "decisions"} waiting. March close is in 6 days.`}
              work={agentWork}
              onPrompt={handlePrompt}
              onTool={handleTool}
              onAction={setDialog}
              onConnectApps={() => openPanel("apps")}
              onWork={(next) => {
                if (next.id === "agents") {
                  handleSelectAgent(null);
                  return;
                }
                setStat(next);
                setPanel(null);
                setSelectedClient(null);
              }}
            />
          ) : null}

          {view === "chat" ? (
            <ChatView
              title={chatTitle}
              messages={messages}
              onBack={() => setView("overview")}
              onNew={handleNewChat}
              onPrompt={handlePrompt}
              onTool={handleTool}
            />
          ) : null}

          {view === "agents" ? (
            <AgentView
              agents={agents}
              selected={selectedAgent}
              onSelect={handleSelectAgent}
              onAdd={handleAddAgent}
              onEdit={handleEditAgent}
              onWork={(next) => {
                setStat(next);
                setPanel(null);
                setSelectedClient(null);
              }}
              onTake={(decision) => flash(`Delegated: ${decision}`)}
            />
          ) : null}

          {view === "clients" ? (
            <WorkView
              title="Clients"
              subtitle="Unbilled work and the people accountable for each account."
              searchPlaceholder="Search"
              rows={clients}
              actions={
                <>
                  <ActionButton icon="filter" label="Filter" onClick={() => flash("Client filters")} />
                  <ActionButton icon="doc" label="Export" onClick={() => flash("Exporting clients")} />
                </>
              }
              primaryAction={
                <ActionButton
                  icon="user-plus"
                  label="Add client"
                  tone="primary"
                  onClick={() => setDialog("add-customer")}
                />
              }
              columns={[
                {
                  key: "name",
                  label: "Name",
                  render: (row) => <span className={workStyles.name}>{row.name}</span>,
                },
                { key: "status", label: "Status", render: (row) => <Chip label={row.status} tone={toneForStatus(row.status)} /> },
                { key: "unbilled", label: "Unbilled", render: (row) => row.unbilled },
                { key: "code", label: "Code", render: (row) => row.code },
                { key: "legalName", label: "Legal Name", render: (row) => row.legalName },
                { key: "clientType", label: "Client Type", render: (row) => <Chip label={row.clientType} /> },
                { key: "phone", label: "Main Phone", render: (row) => row.phone },
                { key: "currency", label: "Currency", render: (row) => <Chip label={row.currency} /> },
                { key: "address", label: "Main Address", render: (row) => row.address },
                { key: "contact", label: "Main Contact", render: (row) => row.contact },
                { key: "email", label: "Email", render: (row) => row.email },
              ]}
              onRow={(row) => {
                setSelectedClient(row);
                setStat(null);
                setPanel(null);
              }}
            />
          ) : null}

          {view === "projects" ? (
            <WorkView
              title="Projects"
              subtitle="Budget burn and phase for the active book."
              searchPlaceholder="Search projects"
              rows={projects}
              actions={
                <>
                  <ActionButton icon="filter" label="Filter" onClick={() => flash("Project filters")} />
                  <ActionButton icon="doc" label="Export" onClick={() => flash("Exporting projects")} />
                </>
              }
              primaryAction={
                <ActionButton
                  icon="folder"
                  label="Add project"
                  tone="primary"
                  onClick={() => setDialog("add-project")}
                />
              }
              columns={[
                { key: "name", label: "Project", render: (row) => row.name },
                { key: "client", label: "Client", render: (row) => row.client },
                { key: "phase", label: "Phase", render: (row) => row.phase },
                { key: "used", label: "Used", render: (row) => row.used },
              ]}
              onRow={(row) => flash(`${row.name} is at ${row.used} of ${row.budget}`)}
            />
          ) : null}

          {view === "time" ? (
            <TimesheetView
              tasks={timesheetTasks}
              people={TIMESHEET_PEOPLE}
              onAddTask={() => setDialog("track-time")}
              onOpenPerson={(person) => flash(`Opened ${person.name}'s timesheet`)}
              onTask={(task) => flash(`${task.name} · ${task.team} / ${task.project}`)}
              onAction={flash}
            />
          ) : null}

          {view === "time-tracker" ? (
            <TimeTrackerView
              logs={timeLogs}
              onLog={(log) => {
                setTimeLogs((current) => [log, ...current]);
                flash(`${formatDuration(log.seconds)} tracked on ${log.project}`);
              }}
              onEntry={(log) => flash(`${log.description} · ${formatDuration(log.seconds)}`)}
              onAction={flash}
            />
          ) : null}

          {view === "expense" ? (
            <WorkView
              title="Expense"
              subtitle="Receipts waiting to be coded or posted."
              searchPlaceholder="Search expenses"
              rows={expenses}
              columns={[
                { key: "vendor", label: "Vendor", render: (row) => row.vendor },
                { key: "project", label: "Project", render: (row) => row.project },
                { key: "amount", label: "Amount", render: (row) => row.amount },
                { key: "status", label: "Status", render: (row) => <Chip label={row.status} tone={toneForStatus(row.status)} /> },
              ]}
              onRow={(row) => flash(`${row.vendor} ${row.amount}`)}
            />
          ) : null}

          {view === "invoices" ? (
            <WorkView
              title="Invoices"
              subtitle="Drafts, sent invoices, and anything past due."
              searchPlaceholder="Search invoices"
              rows={invoices}
              summary={invoiceTotal(invoices)}
              actions={<ActionButton icon="doc" label="Export" onClick={() => flash("Exporting invoices")} />}
              primaryAction={
                <ActionButton
                  icon="plus-square"
                  label="Create invoice"
                  tone="primary"
                  onClick={() => {
                    setInvoiceDraft(newInvoiceDraft());
                    setView("invoice-new");
                  }}
                />
              }
              columns={[
                {
                  key: "number",
                  label: "Invoice #",
                  render: (row) => <span className={workStyles.link}>{row.number}</span>,
                },
                { key: "client", label: "Client", render: (row) => row.client },
                {
                  key: "project",
                  label: "Project",
                  render: (row) =>
                    row.projectCount ? (
                      <span className={workStyles.name}>{row.projectCount} Projects</span>
                    ) : (
                      row.project
                    ),
                },
                {
                  key: "projectId",
                  label: "Project Id",
                  render: (row) =>
                    row.projectCount ? (
                      <span className={workStyles.name}>{row.projectCount} Projects</span>
                    ) : (
                      row.projectId
                    ),
                },
                { key: "billingModel", label: "Billing Model", render: (row) => row.billingModel },
                { key: "period", label: "Invoice Period", render: (row) => row.period },
                { key: "invoiced", label: "Invoiced", render: (row) => row.invoiced },
                { key: "amount", label: "Amount", render: (row) => row.amount },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => <Chip label={row.status} tone={toneForStatus(row.status)} />,
                },
                {
                  key: "menu",
                  label: "",
                  render: (row) => (
                    <IconButton
                      icon="dots"
                      label={`More for ${row.number}`}
                      onClick={(event: MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        flash(`${row.number} options`);
                      }}
                    />
                  ),
                },
              ]}
              onRow={(row) => flash(`${row.number} is ${row.status.toLowerCase()}`)}
            />
          ) : null}

          {view === "invoice-new" ? (
            <InvoiceCreateView
              draft={invoiceDraft}
              onChange={setInvoiceDraft}
              onCancel={() => setView("invoices")}
              onAction={flash}
              onFinalize={() => {
                const subtotal = invoiceDraft.items.reduce(
                  (sum, item) => sum + item.qty * item.rate,
                  0,
                );
                const total = Math.round(subtotal * 1.08);
                setInvoices((current) => [
                  {
                    id: `i-${Date.now()}`,
                    number: invoiceDraft.number,
                    client: invoiceDraft.client,
                    project: invoiceDraft.projects.length === 1 ? invoiceDraft.projects[0] : undefined,
                    projectId: invoiceDraft.projects.length === 1 ? `PRJ-${String(Date.now()).slice(-4)}` : undefined,
                    projectCount: invoiceDraft.projects.length > 1 ? invoiceDraft.projects.length : undefined,
                    billingModel: "Fixed Fee",
                    period: "Apr 2026",
                    invoiced: invoiceDraft.invoiced,
                    amount: `$${total.toLocaleString("en-US")}`,
                    due: invoiceDraft.due,
                    status: "Draft",
                  },
                  ...current,
                ]);
                setView("invoices");
                flash(`${invoiceDraft.number} created as draft`);
              }}
            />
          ) : null}

          {view === "reports" ? (
            <ReportsView
              onDone={() => flash("Reports layout saved")}
              onChart={(title) => flash(`${title} options`)}
            />
          ) : null}
        </div>
        <Panel
            title={selectedClient ? selectedClient.name : stat ? stat.label : panelTitle(panel)}
            open={panelOpen}
            onClose={() => {
              setPanel(null);
              setStat(null);
              setSelectedClient(null);
            }}
          >
            {selectedClient ? (
              <>
                <div className={panelStyles.row} data-active="true">
                  <div className={panelStyles.rowTitle}>
                    <Chip label={selectedClient.status} tone={toneForStatus(selectedClient.status)} />
                    <span>{selectedClient.unbilled} unbilled</span>
                  </div>
                  <div className={panelStyles.rowMeta}>{selectedClient.lastActivity}</div>
                </div>
                {[
                  ["Code", selectedClient.code],
                  ["Legal name", selectedClient.legalName],
                  ["Owner", selectedClient.owner],
                  ["Main contact", selectedClient.contact],
                  ["Email", selectedClient.email],
                  ["Main phone", selectedClient.phone],
                  ["Main address", selectedClient.address],
                ].map(([label, value]) => (
                  <div key={label} className={panelStyles.row}>
                    <div className={panelStyles.rowMeta}>{label}</div>
                    <div className={panelStyles.rowBody}>{value}</div>
                  </div>
                ))}
                <div className={panelStyles.row}>
                  <div className={panelStyles.rowMeta}>Client type</div>
                  <Chip label={selectedClient.clientType} />
                </div>
                <div className={panelStyles.row}>
                  <div className={panelStyles.rowMeta}>Currency</div>
                  <Chip label={selectedClient.currency} />
                </div>
                {projects.filter((project) => project.client === selectedClient.name).map((project) => (
                  <div key={project.id} className={panelStyles.row}>
                    <div className={panelStyles.rowTitle}>
                      <span>{project.name}</span>
                      <span>{project.used}</span>
                    </div>
                    <div className={panelStyles.rowBody}>
                      {project.phase} · {project.budget}
                    </div>
                    <div className={panelStyles.rowMeta}>Project</div>
                  </div>
                ))}
                {invoices
                  .filter((invoice) => invoice.client === selectedClient.name)
                  .map((invoice) => (
                    <div key={invoice.id} className={panelStyles.row}>
                      <div className={panelStyles.rowTitle}>
                        <span>{invoice.number}</span>
                        <span>{invoice.amount}</span>
                      </div>
                      <div className={panelStyles.rowBody}>
                        {invoice.status} · due {invoice.due}
                      </div>
                      <div className={panelStyles.rowMeta}>Invoice</div>
                    </div>
                  ))}
              </>
            ) : null}

            {stat ? (
              <>
                <div className={panelStyles.row} data-active="true">
                  <div className={panelStyles.rowTitle}>
                    <span>{stat.value}</span>
                    <span>{stat.note}</span>
                  </div>
                  {stat.meta ? <div className={panelStyles.rowMeta}>{stat.meta}</div> : null}
                </div>
                {stat.detail.map((line) => (
                  <div key={line} className={panelStyles.row}>
                    <div className={panelStyles.rowBody}>{line}</div>
                  </div>
                ))}
                {stat.agentId ? (
                  <button
                    type="button"
                    className={panelStyles.row}
                    onClick={() => {
                      handleSelectAgent(stat.agentId!);
                      setStat(null);
                    }}
                  >
                    <div className={panelStyles.rowTitle}>Open {stat.meta}</div>
                    <div className={panelStyles.rowBody}>Department, skills, routines, and Take items.</div>
                  </button>
                ) : null}
              </>
            ) : null}

            {panel === "inbox" ? (
              INBOX.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={panelStyles.row}
                  onClick={() => flash(item.subject)}
                >
                  <div className={panelStyles.rowTitle}>
                    <span>{item.from}</span>
                    <span className={panelStyles.rowMeta}>{item.time}</span>
                  </div>
                  <div className={panelStyles.rowBody}>{item.subject}</div>
                  <div className={panelStyles.rowMeta}>{item.preview}</div>
                </button>
              ))
            ) : null}

            {panel === "notifications" ? (
              NOTIFICATIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={panelStyles.row}
                  onClick={() => {
                    if (item.title.includes("close")) setView("overview");
                    if (item.title.includes("Receipt")) setView("expense");
                    if (item.title.includes("Timesheet")) setView("time");
                    setPanel(null);
                  }}
                >
                  <div className={panelStyles.rowTitle}>
                    <span>{item.title}</span>
                    {item.unread ? <span className={panelStyles.unread} /> : null}
                  </div>
                  <div className={panelStyles.rowBody}>{item.body}</div>
                  <div className={panelStyles.rowMeta}>{item.time}</div>
                </button>
              ))
            ) : null}

            {panel === "settings" ? (
              ["Workspace", "Billing defaults", "Agents", "Notifications"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={panelStyles.row}
                  onClick={() => flash(`${item} saved in this prototype`)}
                >
                  <div className={panelStyles.rowTitle}>{item}</div>
                  <div className={panelStyles.rowBody}>Mocked preferences for the prototype.</div>
                </button>
              ))
            ) : null}

            {panel === "help" ? (
              ["What can agents take?", "How close works", "Keyboard"].map((item) => (
                <div key={item} className={panelStyles.row}>
                  <div className={panelStyles.rowTitle}>{item}</div>
                  <div className={panelStyles.rowBody}>
                    Ask from Overview, or open a tile. Nothing here writes to a live system.
                  </div>
                </div>
              ))
            ) : null}

            {panel === "apps" ? (
              apps.map((app) => (
                <div key={app.id} className={panelStyles.appRow}>
                  <AppLogo id={app.id} name={app.name} size={28} />
                  <div>
                    <div className={panelStyles.rowTitle}>{app.name}</div>
                    <div className={panelStyles.rowMeta}>{app.description}</div>
                  </div>
                  <button
                    type="button"
                    className={panelStyles.toggle}
                    data-press
                    onClick={() =>
                      setApps((current) =>
                        current.map((entry) =>
                          entry.id === app.id ? { ...entry, connected: !entry.connected } : entry,
                        ),
                      )
                    }
                  >
                    {app.connected ? "Connected" : "Connect"}
                  </button>
                </div>
              ))
            ) : null}

            {panel === "workspace" ? (
              <div className={panelStyles.row} data-active="true">
                <div className={panelStyles.rowTitle}>{USER.name}</div>
                <div className={panelStyles.rowBody}>Workspace owner · March close in 6 days</div>
              </div>
            ) : null}
        </Panel>
      </div>

      <Dialog
        open={dialog !== null}
        title={
          dialog === "add-agent" ? (editingAgent ? "Edit Agent" : "Add Agent") : dialog ? dialogCopy[dialog].title : ""
        }
        size={dialog === "add-agent" ? "lg" : "md"}
        onClose={dialog === "add-agent" ? closeAgentDialog : () => setDialog(null)}
      >
        {dialog === "add-agent" ? (
          <AddAgentForm
            key={editingAgent?.id ?? "new"}
            agent={editingAgent ?? undefined}
            connectedApps={apps.filter((app) => app.connected)}
            onCreate={handleCreateAgent}
            onSave={handleSaveAgent}
            onCancel={closeAgentDialog}
          />
        ) : dialog ? (
          <form className={dialogStyles.form} onSubmit={handleDialogSubmit}>
            {dialogCopy[dialog].fields.map((field) => (
              <label key={field.name} className={dialogStyles.field}>
                {field.label}
                <input name={field.name} placeholder={field.placeholder} />
              </label>
            ))}
            <div className={dialogStyles.actions}>
              <button type="button" className={dialogStyles.ghost} data-press onClick={() => setDialog(null)}>
                Cancel
              </button>
              <button type="submit" className={dialogStyles.primary} data-press>
                {dialogCopy[dialog].action}
              </button>
            </div>
          </form>
        ) : null}
      </Dialog>

      {toast ? (
        <div
          className={`${styles.toast} ${toastOpen ? styles.toastOpen : ""}`}
          onTransitionEnd={(event) => {
            if (event.propertyName !== "transform" && event.propertyName !== "opacity") return;
            if (!toastOpen) setToast(null);
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function panelTitle(panel: PanelId) {
  if (panel === "inbox") return "Inbox";
  if (panel === "notifications") return "Notifications";
  if (panel === "settings") return "Settings";
  if (panel === "help") return "Help";
  if (panel === "apps") return "Connect apps";
  if (panel === "workspace") return "Workspace";
  return "Details";
}
