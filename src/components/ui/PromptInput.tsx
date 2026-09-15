"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/types";
import styles from "./PromptInput.module.css";

type PromptInputProps = {
  placeholder?: string;
  onSubmit: (value: string) => void;
  onTool?: (tool: "plus" | "bolt" | "at" | "link") => void;
};

const tools: { id: "plus" | "bolt" | "at" | "link"; icon: IconName; label: string }[] = [
  { id: "plus", icon: "plus", label: "Attach" },
  { id: "bolt", icon: "bolt", label: "Actions" },
  { id: "at", icon: "user-plus", label: "Mention" },
  { id: "link", icon: "link", label: "Link" },
];

export function PromptInput({
  placeholder = "Ask, or delegate a client, project, or period...",
  onSubmit,
  onTool,
}: PromptInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    const next = value.trim();
    if (!next) return;
    onSubmit(next);
    setValue("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form className={styles.input} onSubmit={handleSubmit}>
      <textarea
        className={styles.field}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        aria-label={placeholder}
      />
      <div className={styles.toolbar}>
        <div className={styles.tools}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={styles.tool}
              aria-label={tool.label}
              onClick={() => onTool?.(tool.id)}
            >
              <Icon name={tool.icon} size={16} />
            </button>
          ))}
        </div>
        <button type="submit" className={styles.send} aria-label="Send" data-press disabled={!value.trim()}>
          <Icon name="arrow-up" size={18} />
        </button>
      </div>
    </form>
  );
}
