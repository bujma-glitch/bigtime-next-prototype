"use client";

import { ReactNode, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./Disclosure.module.css";

type DisclosureProps = {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function Disclosure({ label, children, defaultOpen = false }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.disclosure}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.label}>{label}</span>
        <span className={styles.chevron} data-open={open}>
          <Icon name="chevron-down" size={16} />
        </span>
      </button>
      {open ? <div className={styles.body}>{children}</div> : null}
    </div>
  );
}
