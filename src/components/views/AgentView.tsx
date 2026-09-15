"use client";

import { ActionButton } from "@/components/ui/ActionButton";
import { Avatar } from "@/components/ui/Avatar";
import { Chip, toneForStatus } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { workForAgent } from "@/data/mock";
import type { Agent, Stat } from "@/lib/types";
import workStyles from "./WorkView.module.css";
import styles from "./AgentView.module.css";

type AgentViewProps = {
  agents: Agent[];
  selected: Agent | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: () => void;
  onWork: (stat: Stat) => void;
  onTake: (decision: string) => void;
};

export function AgentView({
  agents,
  selected,
  onSelect,
  onAdd,
  onEdit,
  onWork,
  onTake,
}: AgentViewProps) {
  if (!selected) {
    return (
      <div className={workStyles.page}>
        <div className={workStyles.column}>
          <header className={workStyles.heading}>
            <p className={workStyles.eyebrow}>Agents</p>
            <h1 className={workStyles.title}>Running agents</h1>
            <p className={workStyles.subtitle}>
              {agents.length} {agents.length === 1 ? "agent is" : "agents are"} watching the
              skills you assigned in Add Agent.
            </p>
          </header>
          <div className={workStyles.toolbar}>
            <div className={workStyles.toolbarTrail}>
              <ActionButton icon="user-plus" label="Add Agent" tone="primary" onClick={onAdd} />
            </div>
          </div>
          <div className={styles.index}>
            {agents.map((agent) => {
              const work = workForAgent(agent);
              return (
                <button
                  key={agent.id}
                  type="button"
                  className={styles.agentCard}
                  data-press
                  onClick={() => onSelect(agent.id)}
                >
                  <div className={styles.agentHead}>
                    <AgentFace agent={agent} />
                    <div className={styles.agentCopy}>
                      <p className={styles.agentName}>{agent.name}</p>
                      <p className={styles.agentRole}>{agent.role}</p>
                    </div>
                    <Chip label={agent.status} tone={toneForStatus(agent.status)} />
                  </div>
                  <p className={styles.agentAction}>{agent.lastAction}</p>
                  <div className={styles.agentMeta}>
                    {agent.department ? <Chip label={agent.department} /> : null}
                    {work.slice(0, 3).map((tile) => (
                      <Chip key={tile.id} label={tile.label} />
                    ))}
                    {(agent.skills?.length ?? 0) > 3 ? (
                      <Chip label={`+${(agent.skills?.length ?? 0) - 3}`} />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const work = workForAgent(selected);
  const runLabel = selected.runMode === "events" ? "On event triggers" : "Manually";

  return (
    <div className={workStyles.page}>
      <div className={workStyles.column}>
        <header className={workStyles.heading}>
          <p className={workStyles.eyebrow}>Agents</p>
          <div className={styles.titleBar}>
            <div className={styles.titleRow}>
              <AgentFace agent={selected} size="md" />
              <h1 className={workStyles.title}>{selected.name}</h1>
            </div>
            <ActionButton icon="gear" label="Edit agent" onClick={onEdit} />
          </div>
          <div className={workStyles.chips}>
            <Chip label={selected.status} tone={toneForStatus(selected.status)} />
            {selected.department ? <Chip label={selected.department} /> : null}
            {selected.model ? <Chip label={selected.model} /> : null}
            {selected.runMode ? <Chip label={runLabel} tone="info" /> : null}
          </div>
          <p className={workStyles.subtitle}>{selected.role}</p>
        </header>

        {work.length > 0 ? (
          <Section label="Work">
            <div className={styles.work}>
              {work.map((stat) => (
                <StatCard
                  key={stat.id}
                  label={stat.label}
                  value={stat.value}
                  note={stat.note}
                  onClick={() => onWork(stat)}
                />
              ))}
            </div>
          </Section>
        ) : null}

        <Section label="Waiting on you">
          <div className={styles.waiting}>
            {selected.decisions.map((decision) => (
              <button key={decision} type="button" data-press onClick={() => onTake(decision)}>
                {decision}
                <span>Take</span>
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function AgentFace({ agent, size = "sm" }: { agent: Agent; size?: "sm" | "md" }) {
  if (agent.avatar === "project-manager" || agent.avatar === "revops") {
    return (
      <Avatar
        size={size}
        src={agent.avatar === "project-manager" ? "/avatars/project-manager.png" : "/avatars/revops.png"}
      />
    );
  }
  return <Avatar size={size} initials={agent.name.slice(0, 2).toUpperCase()} color={agent.color} />;
}
