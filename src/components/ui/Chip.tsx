import styles from "./Chip.module.css";
import { Icon } from "@/components/ui/Icon";

export type ChipTone = "neutral" | "success" | "info" | "warning";

type ChipProps = {
  label: string;
  tone?: ChipTone;
  onRemove?: () => void;
};

const statusTone: Record<string, ChipTone> = {
  Active: "success",
  Onboarding: "info",
  Paused: "warning",
  Running: "success",
  Approved: "success",
  Posted: "success",
  Paid: "success",
  Submitted: "info",
  Sent: "info",
  Coded: "info",
  Open: "info",
  Closed: "success",
  "In review": "warning",
  Draft: "neutral",
  Idle: "neutral",
  "Needs review": "warning",
  Overdue: "warning",
};

export function toneForStatus(status: string): ChipTone {
  return statusTone[status] ?? "neutral";
}

export function Chip({ label, tone = "neutral", onRemove }: ChipProps) {
  return (
    <span className={styles.chip} data-tone={tone} data-dismissible={onRemove ? "true" : undefined}>
      {label}
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remove ${label}`}
          data-press
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <Icon name="x" size={12} />
        </button>
      ) : null}
    </span>
  );
}
