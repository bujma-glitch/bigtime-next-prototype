"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./Dialog.module.css";

type DialogProps = {
  open: boolean;
  title: string;
  size?: "md" | "lg";
  onClose: () => void;
  children: ReactNode;
};

export function Dialog({ open, title, size = "md", onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (open) {
      if (!node.open) node.showModal();
      const frame = requestAnimationFrame(() => {
        node.classList.add(styles.open);
      });
      return () => cancelAnimationFrame(frame);
    }

    if (!node.open) return;

    node.classList.remove(styles.open);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.close();
      return;
    }

    const dialog = node;
    function done(event: TransitionEvent) {
      if (event.target !== dialog || event.propertyName !== "opacity") return;
      dialog.close();
    }

    dialog.addEventListener("transitionend", done);
    const fallback = window.setTimeout(() => {
      if (dialog.open) dialog.close();
    }, 280);
    return () => {
      window.clearTimeout(fallback);
      dialog.removeEventListener("transitionend", done);
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${size === "lg" ? styles.lg : ""}`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} aria-label="Close" data-press onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
