import type { ReactNode } from "react";
import styles from "./Section.module.css";

type SectionProps = {
  label: string;
  trailing?: ReactNode;
  children: ReactNode;
};

export function Section({ label, trailing, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <header className={styles.head}>
        <h2 className={styles.label}>{label}</h2>
        {trailing}
      </header>
      {children}
    </section>
  );
}
