import { Icon } from "@/components/ui/Icon";
import styles from "./Stepper.module.css";

export type Step = {
  id: string;
  label: string;
};

type StepperProps = {
  steps: Step[];
  current: number;
  onStep?: (index: number) => void;
  /** "compact" trades the labelled rail for progress segments plus one label. */
  variant?: "full" | "compact";
};

export function Stepper({ steps, current, onStep, variant = "full" }: StepperProps) {
  if (variant === "compact") {
    return (
      <div className={styles.compact}>
        <ol className={styles.segments}>
          {steps.map((step, index) => (
            <li key={step.id}>
              <button
                type="button"
                className={styles.segment}
                data-state={index <= current ? "on" : "off"}
                aria-label={step.label}
                aria-current={index === current ? "step" : undefined}
                disabled={!onStep || index > current}
                onClick={() => onStep?.(index)}
              />
            </li>
          ))}
        </ol>
        <p className={styles.compactLabel}>{steps[current]?.label}</p>
      </div>
    );
  }

  return (
    <ol className={styles.stepper}>
      {steps.map((step, index) => {
        const state = index < current ? "done" : index === current ? "active" : "todo";
        return (
          <li key={step.id} className={styles.step} data-state={state}>
            <button
              type="button"
              className={styles.button}
              data-press
              aria-current={state === "active" ? "step" : undefined}
              // Only steps already completed are safe to jump back to.
              disabled={!onStep || index > current}
              onClick={() => onStep?.(index)}
            >
              <span className={styles.marker}>
                {state === "done" ? <Icon name="check" size={14} /> : index + 1}
              </span>
              <span className={styles.label}>{step.label}</span>
            </button>
            {index < steps.length - 1 ? <span className={styles.line} aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
