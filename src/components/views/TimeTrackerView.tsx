"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { PROJECTS } from "@/data/mock";
import type { TimeLog } from "@/lib/types";
import styles from "./TimeTrackerView.module.css";

type TimeTrackerViewProps = {
  logs: TimeLog[];
  onLog: (log: TimeLog) => void;
  onEntry: (log: TimeLog) => void;
  onAction: (message: string) => void;
};

type DayGroup = { key: string; label: string; seconds: number; logs: TimeLog[] };
type WeekGroup = { key: string; label: string; seconds: number; days: DayGroup[] };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function TimeTrackerView({ logs, onLog, onEntry, onAction }: TimeTrackerViewProps) {
  const [description, setDescription] = useState("");
  const [project, setProject] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const tick = useRef(0);

  useEffect(() => {
    if (startedAt === null) return;
    tick.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(tick.current);
  }, [startedAt]);

  const weeks = useMemo(() => groupLogs(logs), [logs]);
  const running = startedAt !== null;

  function toggleTimer() {
    if (!running) {
      setStartedAt(Date.now());
      setElapsed(0);
      return;
    }
    const end = new Date();
    const begin = new Date(startedAt);
    const picked = PROJECTS.find((entry) => entry.name === project);
    onLog({
      id: `l-${Date.now()}`,
      description: description.trim() || "No description",
      project: picked?.name ?? "Unassigned",
      client: picked?.client ?? "Internal",
      date: isoDate(begin),
      start: clock(begin),
      end: clock(end),
      seconds: Math.max(1, Math.floor((end.getTime() - startedAt) / 1000)),
      overnight: isoDate(begin) !== isoDate(end),
    });
    setStartedAt(null);
    setElapsed(0);
    setDescription("");
    setProject(null);
  }

  function cycleProject() {
    const index = PROJECTS.findIndex((entry) => entry.name === project);
    const next = PROJECTS[(index + 1) % PROJECTS.length];
    setProject(next.name);
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Operations</p>
          <h1 className={styles.title}>Tracker</h1>
          <p className={styles.subtitle}>Start a timer, or review what the week already holds.</p>
        </header>

        <div className={styles.timer} data-running={running}>
          <label className={styles.field}>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What are you working on?"
              aria-label="What are you working on?"
            />
          </label>
          <div className={styles.timerTrail}>
            {project ? (
              <button type="button" className={styles.projectPick} data-press onClick={cycleProject}>
                <Chip label={project} tone="info" />
              </button>
            ) : (
              <ActionButton icon="folder" label="Project" onClick={cycleProject} />
            )}
            <IconButton icon="tag" label="Add tag" onClick={() => onAction("Tags are mocked here")} />
            <p className={styles.elapsed} aria-live="off">
              {formatDuration(elapsed)}
            </p>
            <ActionButton
              icon={running ? "stop" : "play"}
              label={running ? "Stop" : "Start"}
              tone="primary"
              onClick={toggleTimer}
            />
          </div>
        </div>

        {weeks.map((week) => (
          <section key={week.key} className={styles.week}>
            <div className={styles.weekHead}>
              <h2 className={styles.weekLabel}>{week.label}</h2>
              <p className={styles.weekTotal}>
                Week total: <span>{formatDuration(week.seconds)}</span>
              </p>
            </div>
            {week.days.map((day) => (
              <div key={day.key} className={styles.day}>
                <div className={styles.dayHead}>
                  <p className={styles.dayLabel}>{day.label}</p>
                  <p className={styles.dayTotal}>
                    Total: <span>{formatDuration(day.seconds)}</span>
                  </p>
                </div>
                <div className={styles.rows}>
                  {day.logs.map((log) => (
                    <div key={log.id} className={styles.row} onClick={() => onEntry(log)}>
                      <p className={styles.rowName}>{log.description}</p>
                      <p className={styles.rowProject}>
                        <span className={styles.dot} aria-hidden="true" />
                        <span className={styles.client}>{log.client}</span>
                        <span className={styles.sep}>·</span>
                        {log.project}
                      </p>
                      <div className={styles.rowTag}>
                        {log.tag ? <Chip label={log.tag} /> : <Icon name="tag" size={16} />}
                      </div>
                      <p className={styles.rowClock}>
                        {log.start} <span className={styles.sep}>–</span> {log.end}
                        {log.overnight ? <sup className={styles.overnight}>+1</sup> : null}
                      </p>
                      <div className={styles.rowDate}>
                        <Icon name="calendar" size={16} />
                      </div>
                      <p className={styles.rowDuration}>{formatDuration(log.seconds)}</p>
                      <div className={styles.rowActions}>
                        <IconButton
                          icon="play"
                          label={`Resume ${log.description}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setDescription(log.description);
                            setProject(log.project);
                            setStartedAt(Date.now());
                            setElapsed(0);
                          }}
                        />
                        <IconButton
                          icon="dots"
                          label={`More for ${log.description}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAction(`${log.description} options`);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        {weeks.length === 0 ? <p className={styles.empty}>No time tracked yet.</p> : null}
      </div>
    </div>
  );
}

export function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  return [hours, minutes, safe % 60].map((part) => String(part).padStart(2, "0")).join(":");
}

function isoDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function clock(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Parse as local midnight — `new Date("2026-03-12")` is UTC and shifts the day west of Greenwich. */
function parseDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Monday of the week the date falls in. */
function weekStart(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function shortDate(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function groupLogs(logs: TimeLog[]): WeekGroup[] {
  const weeks = new Map<string, Map<string, TimeLog[]>>();

  for (const log of [...logs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))) {
    const key = isoDate(weekStart(parseDate(log.date)));
    const days = weeks.get(key) ?? new Map<string, TimeLog[]>();
    days.set(log.date, [...(days.get(log.date) ?? []), log]);
    weeks.set(key, days);
  }

  return [...weeks.entries()].map(([key, days]) => {
    const start = parseDate(key);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const dayGroups: DayGroup[] = [...days.entries()].map(([date, entries]) => {
      const parsed = parseDate(date);
      return {
        key: date,
        label: `${DAYS[parsed.getDay()]}, ${shortDate(parsed)}`,
        seconds: entries.reduce((total, entry) => total + entry.seconds, 0),
        logs: entries,
      };
    });

    return {
      key,
      label: `${shortDate(start)} – ${shortDate(end)}, ${end.getFullYear()}`,
      seconds: dayGroups.reduce((total, day) => total + day.seconds, 0),
      days: dayGroups,
    };
  });
}
