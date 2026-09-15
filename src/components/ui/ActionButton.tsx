import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/types";
import styles from "./ActionButton.module.css";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconName;
  label: string;
  tone?: "default" | "primary";
};

export function ActionButton({ icon, label, tone = "default", className, ...props }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${className ?? ""}`}
      data-tone={tone}
      data-press
      {...props}
    >
      {icon ? (
        <span className={styles.icon}>
          <Icon name={icon} size={16} />
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
    </button>
  );
}
