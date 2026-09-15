"use client";

import { ActionButton } from "@/components/ui/ActionButton";
import { AppChips } from "@/components/ui/AppLogo";
import { PromptInput } from "@/components/ui/PromptInput";
import { StatCard } from "@/components/ui/StatCard";
import { USER } from "@/data/mock";
import type { ConnectedApp, DialogId, Stat } from "@/lib/types";
import styles from "./OverviewView.module.css";

type OverviewViewProps = {
  apps: ConnectedApp[];
  subtitle: string;
  work: Stat[];
  onPrompt: (value: string) => void;
  onTool: (tool: "plus" | "bolt" | "at" | "link") => void;
  onAction: (id: DialogId) => void;
  onConnectApps: () => void;
  onWork: (stat: Stat) => void;
};

export function OverviewView({
  apps,
  subtitle,
  work,
  onPrompt,
  onTool,
  onAction,
  onConnectApps,
  onWork,
}: OverviewViewProps) {
  return (
    <div className={styles.content}>
      <div className={styles.column}>
        <header className={styles.heading}>
          <h1 className={styles.greeting}>
            Good afternoon,
            <span> {USER.firstName}</span>
          </h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        <section className={styles.composer}>
          <div className={styles.actions}>
            <ActionButton icon="user-plus" label="Add Customer" onClick={() => onAction("add-customer")} />
            <ActionButton icon="timer" label="Track Time" onClick={() => onAction("track-time")} />
            <ActionButton icon="receipt" label="Upload Receipt" onClick={() => onAction("upload-receipt")} />
            <ActionButton icon="doc" label="Create Invoice" onClick={() => onAction("create-invoice")} />
            <ActionButton icon="plus-square" label="Add Transaction" onClick={() => onAction("add-transaction")} />
          </div>
          <PromptInput onSubmit={onPrompt} onTool={onTool} />
          <button type="button" className={styles.apps} onClick={onConnectApps}>
            <span>Connect apps</span>
            <svg width="4" height="8" viewBox="0 0 4 8" aria-hidden>
              <path d="M0.5 0.5 3.5 4 0.5 7.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <AppChips apps={apps} />
          </button>
        </section>

        <section className={styles.stats} aria-label="Agent work">
          {work.map((stat) => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              note={stat.note}
              meta={stat.meta}
              onClick={() => onWork(stat)}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
