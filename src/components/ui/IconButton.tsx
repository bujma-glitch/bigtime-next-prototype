import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/types";
import styles from "./IconButton.module.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  label: string;
};

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${styles.button} ${className ?? ""}`}
      data-press
      {...props}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}
