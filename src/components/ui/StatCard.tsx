import type { ButtonHTMLAttributes } from "react";
import styles from "./StatCard.module.css";

type StatCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  value: string;
  note?: string;
  meta?: string;
};

export function StatCard({ label, value, note, meta, className, ...props }: StatCardProps) {
  return (
    <button type="button" className={`${styles.card} ${className ?? ""}`} data-press {...props}>
      <span className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </span>
      <span className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {note ? <span className={styles.note}>{note}</span> : null}
      </span>
    </button>
  );
}
