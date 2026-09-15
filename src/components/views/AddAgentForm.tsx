"use client";

import { FormEvent, useMemo, useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { TagPicker } from "@/components/ui/TagPicker";
import { Toggle } from "@/components/ui/Toggle";
import { SKILLS } from "@/data/mock";
import type { Agent, AgentRoutine, ConnectedApp } from "@/lib/types";
import dialogStyles from "@/components/ui/Dialog.module.css";
import styles from "./AddAgentForm.module.css";

const DEPARTMENTS = ["Operations", "Delivery", "Finance", "Collections"] as const;
type Department = (typeof DEPARTMENTS)[number];

const MODELS = ["BigTime default", "Collections specialist", "Close specialist"] as const;

const DEPARTMENT_SEED: Record<
  Department,
  { purpose: string; skills: string[]; watches: string[]; color: string }
> = {
  Operations: {
    purpose:
      "Watch close, WIP, and the exceptions that would slip a period.\n\nFlag what needs a person before the next billing cycle.",
    skills: ["billing-prep", "wip-aging", "margin-watch"],
    watches: ["WIP", "Invoices"],
    color: "#3385ff",
  },
  Delivery: {
    purpose:
      "Keep staffing, dates, and delivery risk in one thread.\n\nSurface projects that will miss the plan if mix or hours stay as they are.",
    skills: ["staffing-gaps", "time-review"],
    watches: ["Projects", "Time"],
    color: "#4AC6B7",
  },
  Finance: {
    purpose:
      "Watch billing-ready WIP and margin against plan.\n\nDraft the pack a reviewer can send or hold.",
    skills: ["billing-prep", "margin-watch", "wip-aging"],
    watches: ["WIP"],
    color: "#2AB7EA",
  },
  Collections: {
    purpose:
      "Chase overdue invoices and confirm POs before the next close.\n\nAsk before sending anything to a client.",
    skills: ["collections-chase", "po-chase", "onboarding-flags"],
    watches: ["Invoices", "Clients"],
    color: "#0866FF",
  },
};

type AddAgentFormProps = {
  agent?: Agent;
  connectedApps: ConnectedApp[];
  onCreate: (agent: Agent) => void;
  onSave?: (agent: Agent) => void;
  onCancel: () => void;
};

export function AddAgentForm({ agent, connectedApps, onCreate, onSave, onCancel }: AddAgentFormProps) {
  const editing = Boolean(agent);
  const [name, setName] = useState(agent?.name ?? "");
  const [department, setDepartment] = useState<Department>(asDepartment(agent?.department));
  const [purpose, setPurpose] = useState(
    agent?.instructions ?? agent?.role ?? DEPARTMENT_SEED.Operations.purpose,
  );
  const [model, setModel] = useState<(typeof MODELS)[number]>(asModel(agent?.model));
  const [skills, setSkills] = useState<string[]>(agent?.skills ?? DEPARTMENT_SEED.Operations.skills);
  const [appIds, setAppIds] = useState(() => agent?.appIds ?? connectedApps.map((app) => app.id));
  const [useAllApps, setUseAllApps] = useState(() => {
    const ids = agent?.appIds ?? connectedApps.map((app) => app.id);
    return ids.length === connectedApps.length && connectedApps.length > 0;
  });
  const [runMode, setRunMode] = useState<"manual" | "events">(agent?.runMode ?? "manual");
  const [routines, setRoutines] = useState<AgentRoutine[]>(agent?.routines ?? []);
  const [routineOpen, setRoutineOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft(agent?.name ?? ""));

  const appOptions = useMemo(
    () => connectedApps.map((app) => ({ id: app.id, label: app.name })),
    [connectedApps],
  );

  function handleDepartment(next: Department) {
    const seed = DEPARTMENT_SEED[next];
    setDepartment(next);
    setPurpose(seed.purpose);
    setSkills(seed.skills);
  }

  function handleApps(next: string[]) {
    setAppIds(next);
    setUseAllApps(next.length === connectedApps.length && connectedApps.length > 0);
  }

  function handleUseAll(checked: boolean) {
    setUseAllApps(checked);
    if (checked) setAppIds(connectedApps.map((app) => app.id));
  }

  function addRoutine() {
    const title = draft.title.trim() || `${name.trim() || "Agent"} routine`;
    const instructions = draft.instructions.trim();
    if (!instructions) return;
    setRoutines((current) => [
      ...current,
      {
        id: `rt-${Date.now()}`,
        title,
        instructions,
        guardrail: draft.guardrail.trim(),
        everyCount: draft.everyCount,
        everyUnit: draft.everyUnit,
        time: draft.time,
        enabled: true,
      },
    ]);
    setDraft(emptyDraft(name));
    setRoutineOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPurpose = purpose.trim();
    if (!trimmedName || !trimmedPurpose) return;
    const seed = DEPARTMENT_SEED[department];
    const status = runMode === "events" ? "Running" : "Idle";
    const next: Agent = {
      id: agent?.id ?? `ag-${Date.now()}`,
      name: trimmedName,
      role: trimmedPurpose.split("\n")[0] ?? trimmedPurpose,
      status,
      avatar: agent?.avatar ?? "custom",
      color: seed.color,
      instructions: trimmedPurpose,
      lastAction:
        agent?.lastAction ??
        (runMode === "events"
          ? `Watching ${seed.watches.join(" and ")} for the next trigger.`
          : `Ready to run when you ask — ${seed.watches[0]}.`),
      decisions: agent?.decisions ?? [
        `Review the next ${seed.watches[0].toLowerCase()} exception`,
        "Hold Harbor Legal until kickoff",
      ],
      watches: seed.watches,
      department,
      model,
      skills,
      appIds,
      runMode,
      routines,
    };
    if (editing && onSave) {
      onSave(next);
      return;
    }
    onCreate(next);
  }

  return (
    <form className={dialogStyles.form} onSubmit={handleSubmit}>
      <label className={dialogStyles.field}>
        Name
        <input
          required
          value={name}
          placeholder="Collections"
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <Select
        label="Department"
        hint="Sets which operations lane this agent sits in."
        value={department}
        options={DEPARTMENTS.map((item) => ({ value: item, label: item }))}
        onChange={(value) => handleDepartment(value as Department)}
      />

      <label className={dialogStyles.field}>
        Custom instructions
        <textarea
          required
          data-size="lg"
          value={purpose}
          placeholder="What this agent should watch, draft, and ask before it acts."
          onChange={(event) => setPurpose(event.target.value)}
        />
      </label>

      <Select
        label="Model"
        value={model}
        options={MODELS.map((item) => ({ value: item, label: item }))}
        onChange={(value) => setModel(value as (typeof MODELS)[number])}
      />

      <TagPicker label="Skills" options={SKILLS} selected={skills} onChange={setSkills} />

      {appOptions.length > 0 ? (
        <TagPicker
          label="Integrations"
          options={appOptions}
          selected={appIds}
          onChange={handleApps}
          trailing={
            <Toggle label="Use all connected" checked={useAllApps} onChange={handleUseAll} />
          }
        />
      ) : null}

      <SegmentedControl
        label="Run"
        value={runMode}
        onChange={setRunMode}
        options={[
          { value: "manual", label: "Manually" },
          { value: "events", label: "On event triggers" },
        ]}
      />

      <section className={styles.routines}>
        <p className={styles.routinesLabel}>Routines</p>
        {routines.length === 0 && !routineOpen ? (
          <p className={styles.empty}>No routines for this agent yet.</p>
        ) : null}
        {routines.map((routine) => (
          <article key={routine.id} className={styles.routineCard}>
            <div className={styles.routineHead}>
              <p className={styles.routineTitle}>{routine.title}</p>
              <Toggle
                label={routine.enabled ? "On" : "Off"}
                checked={routine.enabled}
                onChange={(checked) =>
                  setRoutines((current) =>
                    current.map((item) => (item.id === routine.id ? { ...item, enabled: checked } : item)),
                  )
                }
              />
            </div>
            <p className={styles.routineBody}>{routine.instructions}</p>
            <p className={styles.routineMeta}>
              Every {routine.everyCount} {routine.everyUnit}
              {routine.everyCount > 1 ? "s" : ""} at {routine.time}
            </p>
          </article>
        ))}
        {routineOpen ? (
          <div className={styles.routineEditor}>
            <label className={dialogStyles.field}>
              Title
              <input
                value={draft.title}
                placeholder={`${name.trim() || "Agent"} routine`}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className={dialogStyles.field}>
              What should this agent do each time it runs?
              <textarea
                data-size="lg"
                value={draft.instructions}
                placeholder="Review overdue invoices and draft a chase for anything past terms."
                onChange={(event) => setDraft((current) => ({ ...current, instructions: event.target.value }))}
              />
            </label>
            <label className={dialogStyles.field}>
              Only run when
              <textarea
                value={draft.guardrail}
                placeholder="Optional guardrail, e.g. only run when a new invoice is overdue…"
                onChange={(event) => setDraft((current) => ({ ...current, guardrail: event.target.value }))}
              />
            </label>
            <div className={styles.schedule}>
              <Select
                label="Every"
                value={String(draft.everyCount)}
                options={[1, 2, 3, 6, 12].map((count) => ({ value: String(count), label: String(count) }))}
                onChange={(value) => setDraft((current) => ({ ...current, everyCount: Number(value) }))}
              />
              <Select
                label="Unit"
                value={draft.everyUnit}
                options={[
                  { value: "hour", label: "hour" },
                  { value: "day", label: "day" },
                  { value: "week", label: "week" },
                ]}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, everyUnit: value as AgentRoutine["everyUnit"] }))
                }
              />
              <Select
                label="At"
                value={draft.time}
                options={["06:00", "09:00", "12:00", "17:00"].map((time) => ({ value: time, label: time }))}
                onChange={(value) => setDraft((current) => ({ ...current, time: value }))}
              />
            </div>
            <div className={dialogStyles.actions}>
              <button
                type="button"
                className={dialogStyles.ghost}
                data-press
                onClick={() => {
                  setRoutineOpen(false);
                  setDraft(emptyDraft(name));
                }}
              >
                Cancel
              </button>
              <button type="button" className={dialogStyles.ghost} data-press onClick={addRoutine}>
                Add routine
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.addRoutine} data-press onClick={() => setRoutineOpen(true)}>
            + Add routine
          </button>
        )}
      </section>

      <div className={dialogStyles.actions}>
        <button type="button" className={dialogStyles.ghost} data-press onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={dialogStyles.primary} data-press>
          {editing ? "Save agent" : "Create agent"}
        </button>
      </div>
    </form>
  );
}

function asDepartment(value?: string): Department {
  return DEPARTMENTS.includes(value as Department) ? (value as Department) : "Operations";
}

function asModel(value?: string): (typeof MODELS)[number] {
  return MODELS.includes(value as (typeof MODELS)[number])
    ? (value as (typeof MODELS)[number])
    : "BigTime default";
}

function emptyDraft(name: string) {
  return {
    title: name.trim() ? `${name.trim()} routine` : "",
    instructions: "",
    guardrail: "",
    everyCount: 1,
    everyUnit: "day" as AgentRoutine["everyUnit"],
    time: "09:00",
  };
}
