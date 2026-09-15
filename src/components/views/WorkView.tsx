"use client";

import { ReactNode, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./WorkView.module.css";

type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
};

type WorkViewProps<T extends { id: string }> = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  rows: T[];
  columns: Column<T>[];
  actions?: ReactNode;
  primaryAction?: ReactNode;
  /** Headline figure shown beside the row count — an invoiced total, say. */
  summary?: ReactNode;
  onRow?: (row: T) => void;
};

export function WorkView<T extends { id: string }>({
  eyebrow = "Operations",
  title,
  subtitle,
  searchPlaceholder,
  rows,
  columns,
  actions,
  primaryAction,
  summary,
  onRow,
}: WorkViewProps<T>) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(needle));
  }, [query, rows]);

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
        <div className={styles.toolbar}>
          <div className={styles.toolbarStart}>
            <label className={styles.search}>
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />
            </label>
            <p className={styles.count}>
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </p>
            {summary ? <p className={styles.summary}>{summary}</p> : null}
          </div>
          {actions || primaryAction ? (
            <div className={styles.toolbarTrail}>
              {actions}
              {primaryAction}
            </div>
          ) : null}
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} onClick={() => onRow?.(row)}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? <p className={styles.empty}>Nothing matches “{query}”.</p> : null}
        </div>
      </div>
    </div>
  );
}
