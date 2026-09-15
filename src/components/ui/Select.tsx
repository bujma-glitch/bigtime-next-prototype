"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import menu from "./FieldMenu.module.css";
import styles from "./Select.module.css";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label: string;
  hint?: string;
  value: string;
  options: SelectOption[];
  className?: string;
  onChange: (value: string) => void;
};

export function Select({ label, hint, value, options, className, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`${styles.field} ${className ?? ""}`} ref={rootRef}>
      <p className={styles.label}>{label}</p>
      <div className={menu.wrap} data-open={open ? "true" : undefined}>
        <button
          type="button"
          className={menu.trigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
        >
          {selected?.label ?? value}
          <Icon name="chevron-down" size={14} />
        </button>
        {open ? (
          <div className={menu.menu} id={listId} role="listbox">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={menu.option}
                data-press
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
                {option.value === value ? <Icon name="check" size={14} /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
