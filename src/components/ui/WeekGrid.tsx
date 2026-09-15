import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { DayHours } from "@/lib/types";
import styles from "./WeekGrid.module.css";

export type WeekDay = {
  key: string;
  label: string;
  today?: boolean;
  weekend?: boolean;
};

type WeekGridProps = {
  /** First column header — "Task / Location", "People (5)". */
  lead: string;
  days: WeekDay[];
  /** Per-day totals rendered under each day label. Omit for a plain header. */
  totals?: DayHours[];
  weekTotal?: number;
  children: ReactNode;
  footer?: ReactNode;
  /** Reserve the narrow end column rows use for a row menu. */
  trailing?: boolean;
};

export function WeekGrid({
  lead,
  days,
  totals,
  weekTotal,
  children,
  footer,
  trailing = true,
}: WeekGridProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.grid} data-trailing={trailing}>
        <div className={styles.head}>
          <div className={`${styles.cell} ${styles.lead} ${styles.headLead}`}>{lead}</div>
          {days.map((day, index) => (
            <div
              key={day.key}
              className={`${styles.cell} ${styles.headDay}`}
              data-today={day.today || undefined}
              data-weekend={day.weekend || undefined}
            >
              <span className={styles.dayLabel}>{day.label}</span>
              {totals ? (
                <>
                  <span className={styles.daySum}>{formatHours(totals[index].hours)}</span>
                  <CapacityBar day={totals[index]} />
                </>
              ) : null}
            </div>
          ))}
          <div className={`${styles.cell} ${styles.headDay} ${styles.totalColumn}`}>
            <span className={styles.dayLabel}>Total</span>
            {totals ? (
              <>
                <span className={styles.daySum}>{formatHours(weekTotal ?? sum(totals))}</span>
                <CapacityBar day={{ hours: weekTotal ?? sum(totals) }} capacity={40} />
              </>
            ) : null}
          </div>
        </div>
        {children}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}

type WeekGridRowProps = {
  lead: ReactNode;
  days: DayHours[];
  total: number;
  capacity?: number;
  trailing?: ReactNode;
  onClick?: () => void;
};

export function WeekGridRow({ lead, days, total, capacity, trailing, onClick }: WeekGridRowProps) {
  return (
    <div className={styles.row} data-clickable={onClick ? true : undefined} onClick={onClick}>
      <div className={`${styles.cell} ${styles.lead}`}>{lead}</div>
      {days.map((day, index) => (
        <div key={index} className={`${styles.cell} ${styles.dayCell}`} data-weekend={day.weekend || undefined}>
          <span className={styles.value} data-running={day.running || undefined}>
            {day.running ? <Icon name="timer" size={14} /> : null}
            {formatHours(day.hours)}
          </span>
          <CapacityBar day={day} capacity={capacity} />
        </div>
      ))}
      <div className={`${styles.cell} ${styles.dayCell} ${styles.totalColumn}`}>
        <span className={styles.value}>{formatHours(total)}</span>
        <CapacityBar day={{ hours: total }} capacity={(capacity ?? 8) * 5} />
      </div>
      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </div>
  );
}

/** Thin fill under each figure: how much of the day's capacity the hours used. */
function CapacityBar({ day, capacity = 8 }: { day: DayHours; capacity?: number }) {
  const tone = day.hours === 0 ? "empty" : day.weekend ? "warning" : "normal";
  const fill = Math.min(100, Math.round((day.hours / capacity) * 100));
  return (
    <span className={styles.bar} data-tone={tone} aria-hidden="true">
      <span className={styles.barFill} style={{ width: `${day.hours === 0 ? 100 : fill}%` }} />
    </span>
  );
}

export function formatHours(hours: number) {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes === 0) return `${whole}h`;
  return `${whole}h ${minutes}m`;
}

function sum(days: DayHours[]) {
  return days.reduce((total, day) => total + day.hours, 0);
}
