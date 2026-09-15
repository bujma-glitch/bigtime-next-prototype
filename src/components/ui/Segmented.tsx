import type { IconName } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import styles from "./Segmented.module.css";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

type SegmentedProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  label: string;
};

export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div className={styles.group} role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={styles.option}
          data-press
          onClick={() => onChange(option.value)}
        >
          {option.icon ? (
            <span className={styles.icon}>
              <Icon name={option.icon} size={14} />
            </span>
          ) : null}
          <span className={styles.label}>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
