"use client";

import { useMemo, useState } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { ActionButton } from "@/components/ui/ActionButton";
import { Chart } from "@/components/ui/Chart";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { REPORT_CHARTS, REPORT_RANGE_LABEL, type ReportRange } from "@/data/mock";
import styles from "./ReportsView.module.css";

const primary = "#3385ff";
const primarySoft = "rgba(51, 133, 255, 0.22)";
const primaryFill = "rgba(51, 133, 255, 0.12)";
const ink = "#0a0a0a";
const muted = "#737373";
const line = "#ebebeb";
const average = "#a3a3a3";
const font = "Inter, system-ui, sans-serif";

type ReportsViewProps = {
  onDone: () => void;
  onChart: (title: string) => void;
};

type LegendItem = {
  label: string;
  tone: "solid" | "muted" | "dash" | "dot";
};

export function ReportsView({ onDone, onChart }: ReportsViewProps) {
  const [range, setRange] = useState<ReportRange>("3m");
  const data = REPORT_CHARTS[range];

  const burnOption = useMemo(
    () =>
      lineOption(data.months, data.burn, data.burnAvg, 100, 25, {
        area: true,
      }),
    [data],
  );
  const revenueOption = useMemo(
    () =>
      barOption(data.months, data.revenueCurrent, data.revenuePrevious, data.revenueAvg, 240, 60),
    [data],
  );
  const expensesOption = useMemo(
    () => expenseOption(data.months, data.expensesTotal, data.expensesRecurring),
    [data],
  );
  const pnlOption = useMemo(
    () => barOption(data.months, data.pnl, undefined, undefined, 150, 30),
    [data],
  );

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <header className={styles.heading}>
          <div className={styles.headingCopy}>
            <p className={styles.eyebrow}>Operations</p>
            <h1 className={styles.title}>Reports</h1>
            <p className={styles.subtitle}>Close packs the agents keep current.</p>
          </div>
          <div className={styles.toolbar}>
            <ActionButton icon="check" label="Done" onClick={onDone} />
            <label className={styles.range}>
              <Icon name="filter" size={14} />
              <select
                value={range}
                aria-label="Report range"
                onChange={(event) => setRange(event.target.value as ReportRange)}
              >
                {(Object.keys(REPORT_RANGE_LABEL) as ReportRange[]).map((key) => (
                  <option key={key} value={key}>
                    {REPORT_RANGE_LABEL[key]}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={14} />
            </label>
          </div>
        </header>

        <div className={styles.grid}>
          <ChartCard
            title="Average Monthly Burn Rate"
            value={data.burnValue}
            legend={[
              { label: "Monthly", tone: "solid" },
              { label: "Average", tone: "dash" },
            ]}
            option={burnOption}
            onMenu={() => onChart("Average Monthly Burn Rate")}
          />
          <ChartCard
            title="Revenue"
            value={data.revenueValue}
            legend={[
              { label: "Current", tone: "solid" },
              { label: "Previous", tone: "muted" },
              { label: "Average", tone: "dash" },
            ]}
            option={revenueOption}
            onMenu={() => onChart("Revenue")}
            wide
          />
          <ChartCard
            title="Average Monthly Expenses"
            value={data.expensesValue}
            legend={[
              { label: "Total", tone: "dot" },
              { label: "Recurring", tone: "muted" },
            ]}
            option={expensesOption}
            onMenu={() => onChart("Average Monthly Expenses")}
          />
          <ChartCard
            title="Profit & Loss"
            value={data.pnlValue}
            note={data.pnlRange}
            option={pnlOption}
            onMenu={() => onChart("Profit & Loss")}
          />
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  value,
  note,
  legend,
  option,
  wide,
  onMenu,
}: {
  title: string;
  value: string;
  note?: string;
  legend?: LegendItem[];
  option: EChartsCoreOption;
  wide?: boolean;
  onMenu: () => void;
}) {
  return (
    <article className={styles.card} data-wide={wide ? "true" : undefined}>
      <header className={styles.cardHead}>
        <div>
          <p className={styles.cardTitle}>{title}</p>
          <p className={styles.cardValue}>{value}</p>
          {note ? <p className={styles.cardNote}>{note}</p> : null}
          {legend ? (
            <ul className={styles.legend}>
              {legend.map((item) => (
                <li key={item.label} data-tone={item.tone}>
                  {item.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <IconButton icon="grip" label={`${title} options`} onClick={onMenu} />
      </header>
      <div className={styles.plot}>
        <Chart option={option} />
      </div>
    </article>
  );
}

function tooltip() {
  return {
    trigger: "axis" as const,
    backgroundColor: ink,
    borderWidth: 0,
    padding: [8, 10] as [number, number],
    textStyle: { color: "#fff", fontFamily: font, fontSize: 12 },
  };
}

function categoryAxis(months: string[]) {
  return {
    type: "category" as const,
    data: months,
    boundaryGap: true,
    axisTick: { show: false },
    axisLine: { lineStyle: { color: line } },
    axisLabel: { color: muted, fontFamily: font, fontSize: 11 },
  };
}

function valueAxis(max?: number, interval?: number) {
  return {
    type: "value" as const,
    max,
    interval,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: line } },
    axisLabel: { color: muted, fontFamily: font, fontSize: 11 },
  };
}

function lineOption(
  months: string[],
  values: number[],
  avg: number,
  max: number,
  interval: number,
  flags: { area?: boolean },
): EChartsCoreOption {
  return {
    grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
    tooltip: tooltip(),
    xAxis: categoryAxis(months),
    yAxis: valueAxis(max, interval),
    series: [
      {
        type: "line",
        data: values,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { color: primary, width: 2 },
        itemStyle: { color: primary, borderColor: "#fff", borderWidth: 1.5 },
        areaStyle: flags.area
          ? { color: primaryFill, origin: "start" }
          : undefined,
        z: 2,
      },
      {
        type: "line",
        data: months.map(() => avg),
        showSymbol: false,
        lineStyle: { color: average, width: 1.5, type: "dashed" },
        tooltip: { show: false },
        z: 1,
      },
    ],
  };
}

function barOption(
  months: string[],
  current: number[],
  prior: number[] | undefined,
  avg: number | undefined,
  max: number | undefined,
  interval?: number,
): EChartsCoreOption {
  const series: EChartsCoreOption["series"] = [
    {
      type: "bar",
      data: current,
      barWidth: 28,
      barGap: "20%",
      itemStyle: { color: primary, borderRadius: [4, 4, 0, 0] },
      z: 2,
    },
  ];
  if (prior) {
    series.push({
      type: "bar",
      data: prior,
      barWidth: 28,
      itemStyle: { color: primarySoft, borderRadius: [4, 4, 0, 0] },
      z: 1,
    });
  }
  if (avg !== undefined) {
    series.push({
      type: "line",
      data: months.map(() => avg),
      showSymbol: false,
      lineStyle: { color: average, width: 1.5, type: "dashed" },
      tooltip: { show: false },
      z: 3,
    });
  }
  return {
    grid: { left: 8, right: 12, top: 16, bottom: 8, containLabel: true },
    tooltip: tooltip(),
    xAxis: categoryAxis(months),
    yAxis: valueAxis(max, interval),
    series,
  };
}

function expenseOption(months: string[], total: number[], recurring: number[]): EChartsCoreOption {
  return {
    grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
    tooltip: tooltip(),
    xAxis: categoryAxis(months),
    yAxis: valueAxis(100, 25),
    series: [
      {
        type: "bar",
        data: total,
        barWidth: 10,
        itemStyle: { color: primary, borderRadius: 4 },
      },
      {
        type: "bar",
        data: recurring,
        barWidth: 10,
        itemStyle: { color: primarySoft, borderRadius: 4 },
      },
    ],
  };
}
