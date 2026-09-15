import type { CSSProperties } from "react";
import styles from "./AppLogo.module.css";

type AppLogoProps = {
  id: string;
  name: string;
  size?: number;
};

const logos: Record<string, { src: string; fit: "cover" | "contain" }> = {
  xero: { src: "/apps/xero.png", fit: "cover" },
  qbo: { src: "/apps/qbo.png", fit: "cover" },
  slack: { src: "/apps/slack.svg", fit: "contain" },
  drive: { src: "/apps/drive.svg", fit: "contain" },
};

export function AppLogo({ id, name, size = 18 }: AppLogoProps) {
  const logo = logos[id];

  return (
    <span
      className={styles.logo}
      data-fit={logo?.fit ?? "cover"}
      style={{ width: size, height: size } satisfies CSSProperties}
      title={name}
      aria-hidden
    >
      {logo ? (
        <img src={logo.src} alt="" width={size} height={size} />
      ) : (
        <span className={styles.fallback}>{name.slice(0, 1)}</span>
      )}
    </span>
  );
}

type AppChip = {
  id: string;
  name: string;
  connected: boolean;
};

export function AppChips({ apps }: { apps: AppChip[] }) {
  const connected = apps.filter((app) => app.connected);

  if (connected.length === 0) return null;

  return (
    <span className={styles.chips}>
      {connected.map((app) => (
        <AppLogo key={app.id} id={app.id} name={app.name} size={18} />
      ))}
    </span>
  );
}
