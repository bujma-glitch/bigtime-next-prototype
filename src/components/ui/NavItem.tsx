import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./NavItem.module.css";

type NavItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  subtab?: boolean;
};

export function NavItem({
  label,
  icon,
  trailing,
  active = false,
  subtab = false,
  className,
  ...props
}: NavItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${active ? styles.active : ""} ${subtab ? styles.subtab : ""} ${className ?? ""}`}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{label}</span>
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
    </button>
  );
}
