"use client";

import { useMemo, useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Avatar } from "@/components/ui/Avatar";
import { Chip, toneForStatus } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Segmented } from "@/components/ui/Segmented";
import { WeekGrid, WeekGridRow, formatHours } from "@/components/ui/WeekGrid";
import { TIMESHEET_WEEK } from "@/data/mock";
import type { DayHours, TimesheetPerson, TimesheetTask } from "@/lib/types";
import styles from "./TimesheetView.module.css";

type Scope = "mine" | "all";

type TimesheetViewProps = {
  tasks: TimesheetTask[];
  people: TimesheetPerson[];
  onAddTask: () => void;
  onTask: (task: TimesheetTask) => void;
  onOpenPerson: (person: TimesheetPerson) => void;
  onAction: (message: string) => void;
};

export function TimesheetView({
  tasks,
  people,
  onAddTask,
  onTask,
  onOpenPerson,
  onAction,
}: TimesheetViewProps) {
  const [scope, setScope] = useState<Scope>("mine");

  const totals = useMemo<DayHours[]>(() => {
    const rows = scope === "mine" ? tasks : people;
    return TIMESHEET_WEEK.map((day, index) => ({
      hours: rows.reduce((sum, row) => sum + row.days[index].hours, 0),
      weekend: day.weekend,
    }));
  }, [scope, tasks, people]);

  const weekTotal = totals.reduce((sum, day) => sum + day.hours, 0);

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={styles.heading}>
          <div className={styles.headingCopy}>
            <p className={styles.eyebrow}>Operations</p>
            <h1 className={styles.title}>Timesheet</h1>
            <p className={styles.subtitle}>
              {scope === "mine"
                ? `Your week, task by task. ${formatHours(weekTotal)} logged.`
                : `Who filed what this week. ${formatHours(weekTotal)} across the team.`}
            </p>
          </div>
          <div className={styles.toolbar}>
            <Segmented
              label="Timesheet scope"
              value={scope}
              onChange={setScope}
              options={[
                { value: "mine", label: "My timesheet", icon: "person" },
                { value: "all", label: "All timesheets", icon: "people" },
              ]}
            />
            <ActionButton icon="filter" label="Filter" onClick={() => onAction("Timesheet filters")} />
            <ActionButton icon="doc" label="Export" onClick={() => onAction("Exporting timesheet")} />
            {scope === "mine" ? (
              <ActionButton
                icon="check"
                label="Submit"
                tone="primary"
                onClick={() => onAction("Timesheet submitted")}
              />
            ) : (
              <ActionButton
                icon="bell"
                label="Remind"
                tone="primary"
                onClick={() => onAction("Reminders sent to anyone under capacity")}
              />
            )}
          </div>
        </header>

        {scope === "mine" ? (
          <WeekGrid
            lead="Task / Location"
            days={TIMESHEET_WEEK}
            totals={totals}
            weekTotal={weekTotal}
            footer={<ActionButton icon="plus" label="Add task" tone="primary" onClick={onAddTask} />}
          >
            {tasks.map((task) => (
              <WeekGridRow
                key={task.id}
                lead={
                  <div className={styles.task}>
                    <div className={styles.taskTop}>
                      <Icon name="link" size={14} />
                      <span className={styles.taskName}>{task.name}</span>
                      {task.days.some((day) => day.running) ? (
                        <IconButton
                          icon="stop"
                          label={`Stop ${task.name}`}
                          className={styles.stop}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAction(`Stopped ${task.name}`);
                          }}
                        />
                      ) : null}
                    </div>
                    <div className={styles.taskMeta}>
                      <Chip label={task.status} tone={toneForStatus(task.status)} />
                      <span className={styles.location}>
                        {task.team} / {task.project}
                      </span>
                    </div>
                  </div>
                }
                days={task.days}
                total={task.days.reduce((sum, day) => sum + day.hours, 0)}
                trailing={
                  <IconButton
                    icon="dots"
                    label={`More for ${task.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onAction(`${task.name} options`);
                    }}
                  />
                }
                onClick={() => onTask(task)}
              />
            ))}
          </WeekGrid>
        ) : (
          <WeekGrid
            lead={`People (${people.length})`}
            days={TIMESHEET_WEEK}
            totals={totals}
            weekTotal={weekTotal}
            trailing={false}
          >
            {people.map((person) => (
              <WeekGridRow
                key={person.id}
                lead={
                  <div className={styles.person}>
                    <Avatar
                      size="md"
                      src={person.avatar}
                      initials={person.avatar ? undefined : person.initials}
                      color={person.color}
                    />
                    <div className={styles.personCopy}>
                      <span className={styles.personName}>{person.name}</span>
                      <span className={styles.capacity}>{person.capacity}h</span>
                    </div>
                    <ActionButton
                      icon="arrow-right"
                      label="Open"
                      className={styles.open}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenPerson(person);
                      }}
                    />
                  </div>
                }
                days={person.days}
                total={person.days.reduce((sum, day) => sum + day.hours, 0)}
                capacity={person.capacity / 5}
                onClick={() => onOpenPerson(person)}
              />
            ))}
          </WeekGrid>
        )}
      </div>
    </div>
  );
}
