"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import menu from "./FieldMenu.module.css";
import styles from "./TagPicker.module.css";

export type TagOption = {
  id: string;
  label: string;
};

type TagPickerProps = {
  label: string;
  options: TagOption[];
  selected: string[];
  trailing?: ReactNode;
  onChange: (next: string[]) => void;
};

export function TagPicker({ label, options, selected, trailing, onChange }: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedOptions = options.filter((option) => selected.includes(option.id));

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

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  return (
    <div className={styles.field} ref={rootRef}>
      <div className={styles.head}>
        <p className={styles.label}>{label}</p>
        {trailing}
      </div>
      <div className={menu.wrap} data-open={open ? "true" : undefined}>
        <button
          type="button"
          className={menu.trigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
        >
          {selected.length} {label.toLowerCase()} selected
          <Icon name="chevron-down" size={14} />
        </button>
        {open ? (
          <div className={menu.menu} id={listId} role="listbox" aria-multiselectable="true">
            {options.map((option) => {
              const on = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={menu.option}
                  data-press
                  onClick={() => toggle(option.id)}
                >
                  {option.label}
                  {on ? <Icon name="check" size={14} /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {selectedOptions.length > 0 ? (
        <div className={styles.chips}>
          {selectedOptions.map((option) => (
            <Chip key={option.id} label={option.label} onRemove={() => toggle(option.id)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
