"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { PromptInput } from "@/components/ui/PromptInput";
import type { Message } from "@/lib/types";
import styles from "./ChatView.module.css";

type ChatViewProps = {
  title: string;
  messages: Message[];
  onBack: () => void;
  onNew: () => void;
  onPrompt: (value: string) => void;
  onTool: (tool: "plus" | "bolt" | "at" | "link") => void;
};

export function ChatView({ title, messages, onBack, onNew, onPrompt, onTool }: ChatViewProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <IconButton icon="chevron-left" label="Back to Overview" onClick={onBack} />
        <h1 className={styles.title}>{title}</h1>
        <IconButton icon="plus" label="New chat" onClick={onNew} />
      </header>

      <div className={styles.thread}>
        <div className={styles.column}>
          {messages.map((message) =>
            message.role === "user" ? (
              <p key={message.id} className={styles.user}>
                {message.text}
              </p>
            ) : (
              <div key={message.id} className={styles.agent}>
                <p className={styles.agentText}>{message.text}</p>
                {message.status ? (
                  <p className={styles.status}>
                    <Icon name="check" size={14} />
                    {message.status}
                  </p>
                ) : null}
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.composer}>
          <PromptInput placeholder="Reply..." onSubmit={onPrompt} onTool={onTool} />
          <p className={styles.disclaimer}>BigTime can make mistakes. Please double-check responses.</p>
        </div>
      </footer>
    </div>
  );
}
