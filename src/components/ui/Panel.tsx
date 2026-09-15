"use client";

import { ReactNode, useEffect, useState, TransitionEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./Panel.module.css";

type PanelProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Panel({ title, open, onClose, children }: PanelProps) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let cancelled = false;
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setEntered(true);
        });
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }
    setEntered(false);
  }, [open]);

  function handleTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.propertyName !== "transform" && event.propertyName !== "opacity") return;
    if (!open) setMounted(false);
  }

  if (!mounted) return null;

  return (
    <aside
      className={`${styles.panel} ${entered ? styles.open : ""}`}
      aria-label={title}
      onTransitionEnd={handleTransitionEnd}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button type="button" className={styles.close} aria-label="Close panel" data-press onClick={onClose}>
          <Icon name="x" size={16} />
        </button>
      </header>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
