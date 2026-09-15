"use client";

import { ActionButton } from "@/components/ui/ActionButton";
import { IconButton } from "@/components/ui/IconButton";
import type { PanelId } from "@/lib/types";
import styles from "./Header.module.css";

type HeaderProps = {
  panel: PanelId;
  onPanel: (panel: Exclude<PanelId, null>) => void;
};

export function Header({ panel, onPanel }: HeaderProps) {
  return (
    <header className={styles.header}>
      <IconButton
        icon="inbox"
        label="Inbox"
        aria-pressed={panel === "inbox"}
        onClick={() => onPanel("inbox")}
      />
      <IconButton
        icon="bell"
        label="Notifications"
        aria-pressed={panel === "notifications"}
        onClick={() => onPanel("notifications")}
      />
      <ActionButton
        icon="gear"
        label="Settings"
        aria-pressed={panel === "settings"}
        onClick={() => onPanel("settings")}
      />
      <IconButton
        icon="help"
        label="Help"
        aria-pressed={panel === "help"}
        onClick={() => onPanel("help")}
      />
    </header>
  );
}
