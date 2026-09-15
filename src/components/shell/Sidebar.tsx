"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { NavItem } from "@/components/ui/NavItem";
import { USER } from "@/data/mock";
import type { Agent, ViewId } from "@/lib/types";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  view: ViewId;
  selectedAgentId: string | null;
  agentsOpen: boolean;
  timeOpen: boolean;
  agents: Agent[];
  onView: (view: ViewId) => void;
  onSelectAgent: (id: string | null) => void;
  onTime: () => void;
  onAddAgent: () => void;
  onWorkspace: () => void;
};

export function Sidebar({
  view,
  selectedAgentId,
  agentsOpen,
  timeOpen,
  agents,
  onView,
  onSelectAgent,
  onTime,
  onAddAgent,
  onWorkspace,
}: SidebarProps) {
  const agentIndexActive = view === "agents" && selectedAgentId === null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/logo.svg" alt="BigTime" width={84} height={24} />
      </div>
      <nav className={styles.nav} aria-label="Primary">
        <div className={styles.group}>
          <NavItem
            label="Overview"
            active={view === "overview"}
            icon={<Icon name="grid" />}
            onClick={() => onView("overview")}
          />
          <NavItem
            label="Agents"
            active={agentIndexActive}
            icon={<Icon name="people" />}
            trailing={<Icon name={agentsOpen ? "chevron-up" : "chevron-right"} />}
            onClick={() => onSelectAgent(null)}
            aria-expanded={agentsOpen}
          />
          {agentsOpen ? (
            <>
              {agents.map((agent) => (
                <NavItem
                  key={agent.id}
                  label={agent.name}
                  subtab
                  active={view === "agents" && selectedAgentId === agent.id}
                  icon={
                    agent.avatar === "project-manager" || agent.avatar === "revops" ? (
                      <Avatar
                        size="sm"
                        src={
                          agent.avatar === "project-manager"
                            ? "/avatars/project-manager.png"
                            : "/avatars/revops.png"
                        }
                      />
                    ) : (
                      <Avatar
                        size="sm"
                        initials={agent.name.slice(0, 2).toUpperCase()}
                        color={agent.color}
                      />
                    )
                  }
                  onClick={() => onSelectAgent(agent.id)}
                />
              ))}
              <NavItem
                label="Add Agent"
                subtab
                data-tone="muted"
                icon={
                  <span className={styles.subIcon}>
                    <Icon name="plus" size={14} />
                  </span>
                }
                onClick={onAddAgent}
              />
            </>
          ) : null}
        </div>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Operations</p>
          <div className={styles.group}>
            <NavItem
              label="Clients"
              active={view === "clients"}
              icon={<Icon name="person" />}
              onClick={() => onView("clients")}
            />
            <NavItem
              label="Projects"
              active={view === "projects"}
              icon={<Icon name="folder" />}
              onClick={() => onView("projects")}
            />
            <NavItem
              label="Time"
              active={view === "time" && !timeOpen}
              icon={<Icon name="timer" />}
              trailing={<Icon name={timeOpen ? "chevron-up" : "chevron-right"} />}
              onClick={onTime}
              aria-expanded={timeOpen}
            />
            {timeOpen ? (
              <>
                <NavItem
                  label="Timesheet"
                  subtab
                  active={view === "time"}
                  icon={
                    <span className={styles.subIcon}>
                      <Icon name="doc" size={14} />
                    </span>
                  }
                  onClick={() => onView("time")}
                />
                <NavItem
                  label="Tracker"
                  subtab
                  active={view === "time-tracker"}
                  icon={
                    <span className={styles.subIcon}>
                      <Icon name="play" size={14} />
                    </span>
                  }
                  onClick={() => onView("time-tracker")}
                />
              </>
            ) : null}
            <NavItem
              label="Expense"
              active={view === "expense"}
              icon={<Icon name="receipt" />}
              trailing={<Icon name="chevron-right" />}
              onClick={() => onView("expense")}
            />
            <NavItem
              label="Invoices"
              active={view === "invoices"}
              icon={<Icon name="doc" />}
              onClick={() => onView("invoices")}
            />
            <NavItem
              label="Reports"
              active={view === "reports"}
              icon={<Icon name="chart" />}
              onClick={() => onView("reports")}
            />
          </div>
        </div>
      </nav>
      <button type="button" className={styles.workspace} data-press onClick={onWorkspace}>
        <Avatar size="md" initials={USER.initials} />
        <span className={styles.workspaceName}>{USER.name}</span>
      </button>
    </aside>
  );
}
