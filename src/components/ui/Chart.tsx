"use client";

import { useEffect, useRef } from "react";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import styles from "./Chart.module.css";

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, SVGRenderer]);

type ChartProps = {
  option: EChartsCoreOption;
};

export function Chart({ option }: ChartProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const chart = echarts.init(node, undefined, { renderer: "svg" });
    chartRef.current = chart;
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(node);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    chart.setOption(
      {
        animation: !reduce,
        animationDuration: 280,
        animationEasing: "cubicOut",
        ...option,
      },
      true,
    );
  }, [option]);

  return <div ref={rootRef} className={styles.chart} role="img" />;
}
