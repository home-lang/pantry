/**
 * Server-side chart generation using ts-charts (D3 in TypeScript)
 *
 * Generates SVG path strings and chart data on the server,
 * which are embedded directly into STX templates as inline SVGs.
 */

import { scaleLinear, scaleTime, scaleBand, scaleOrdinal } from '@ts-charts/scale'
import { line, area, arc, pie } from '@ts-charts/shape'
import { max, extent, sum } from '@ts-charts/array'
import { format as d3format } from '@ts-charts/format'

// ---------------------------------------------------------------------------
// Color palette (OKLCH-compatible hex fallbacks for SVG attributes)
// ---------------------------------------------------------------------------
const CHART_COLORS = [
  '#5b9cf5', // accent blue
  '#6dd97a', // green
  '#e6c84d', // yellow
  '#e25c5c', // red
  '#c084fc', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ec4899', // pink
]

// ---------------------------------------------------------------------------
// Internal types for chart data
// ---------------------------------------------------------------------------
interface TimePoint {
  date: Date
  count: number
}

// ---------------------------------------------------------------------------
// Sparkline — minimal line chart for thumbnails
// ---------------------------------------------------------------------------
export interface SparklineResult {
  path: string
  areaPath: string
  width: number
  height: number
  minVal: number
  maxVal: number
}

export function generateSparkline(
  data: number[],
  width = 120,
  height = 32,
  padding = 2,
): SparklineResult {
  if (data.length === 0) {
    return { path: '', areaPath: '', width, height, minVal: 0, maxVal: 0 }
  }

  const xScale = scaleLinear()
    .domain([0, Math.max(data.length - 1, 1)])
    .range([padding, width - padding])

  const [minVal, maxVal] = extent(data) as [number, number]
  const yScale = scaleLinear()
    .domain([Math.min(minVal, 0), Math.max(maxVal, 1)])
    .range([height - padding, padding])

  const lineGen = line<number>()
    .x((_d: number, i: number) => xScale(i)!)
    .y((d: number) => yScale(d)!)

  const areaGen = area<number>()
    .x((_d: number, i: number) => xScale(i)!)
    .y0(height - padding)
    .y1((d: number) => yScale(d)!)

  return {
    path: lineGen(data) || '',
    areaPath: areaGen(data) || '',
    width,
    height,
    minVal,
    maxVal,
  }
}

// ---------------------------------------------------------------------------
// Line chart — full timeline chart with axes data
// ---------------------------------------------------------------------------
export interface LineChartPoint {
  x: number
  y: number
  label: string
  value: number
}

export interface LineChartResult {
  linePath: string
  areaPath: string
  points: LineChartPoint[]
  xLabels: Array<{ x: number, label: string }>
  yLabels: Array<{ y: number, label: string }>
  width: number
  height: number
  maxValue: number
}

export function generateLineChart(
  timeline: Array<{ date: string, count: number }>,
  width = 700,
  height = 200,
  margin = { top: 10, right: 10, bottom: 24, left: 45 },
): LineChartResult {
  const empty: LineChartResult = {
    linePath: '',
    areaPath: '',
    points: [],
    xLabels: [],
    yLabels: [],
    width,
    height,
    maxValue: 0,
  }

  if (timeline.length === 0) return empty

  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const dates = timeline.map(d => new Date(d.date))
  const counts = timeline.map(d => d.count)

  const dateExtent = extent(dates) as [Date, Date]
  const xScale = scaleTime()
    .domain(dateExtent)
    .range([margin.left, margin.left + innerW])

  const maxCount = max(counts) || 1
  const yScale = scaleLinear()
    .domain([0, maxCount * 1.1])
    .range([margin.top + innerH, margin.top])
    .nice()

  const lineGen = line<TimePoint>()
    .x((d: TimePoint) => xScale(d.date)!)
    .y((d: TimePoint) => yScale(d.count)!)

  const areaGen = area<TimePoint>()
    .x((d: TimePoint) => xScale(d.date)!)
    .y0(margin.top + innerH)
    .y1((d: TimePoint) => yScale(d.count)!)

  const chartData: TimePoint[] = timeline.map((d, i) => ({ date: dates[i], count: d.count }))

  const points: LineChartPoint[] = chartData.map((d: TimePoint) => ({
    x: xScale(d.date)!,
    y: yScale(d.count)!,
    label: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.count,
  }))

  // X-axis labels: show ~5 evenly spaced dates
  const xTicks = xScale.ticks(5)
  const xLabels = xTicks.map((d: Date) => ({
    x: xScale(d)!,
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  // Y-axis labels
  const yTicks = yScale.ticks(4)
  const fmt = d3format('.2s')
  const yLabels = yTicks.map((v: number) => ({
    y: yScale(v)!,
    label: v >= 1000 ? fmt(v) : String(v),
  }))

  return {
    linePath: lineGen(chartData) || '',
    areaPath: areaGen(chartData) || '',
    points,
    xLabels,
    yLabels,
    width,
    height,
    maxValue: maxCount,
  }
}

// ---------------------------------------------------------------------------
// Horizontal bar chart — for version distribution, etc.
// ---------------------------------------------------------------------------
export interface HBarChartBar {
  x: number
  y: number
  width: number
  height: number
  label: string
  value: number
  formattedValue: string
  percentage: string
  color: string
}

export function generateHorizontalBarChart(
  items: Array<{ label: string, value: number }>,
  width = 400,
  barHeight = 28,
  gap = 6,
  labelWidth = 120,
): { bars: HBarChartBar[], chartWidth: number, chartHeight: number } {
  if (items.length === 0) return { bars: [], chartWidth: width, chartHeight: 0 }

  const chartHeight = items.length * (barHeight + gap)
  const barAreaWidth = width - labelWidth - 10
  const maxVal = max(items, (d: { label: string, value: number }) => d.value) || 1
  const total = sum(items, (d: { label: string, value: number }) => d.value) || 1

  const xScale = scaleLinear()
    .domain([0, maxVal])
    .range([0, barAreaWidth])

  const colorScale = scaleOrdinal<string>()
    .domain(items.map(d => d.label))
    .range(CHART_COLORS)

  const fmt = d3format(',')
  const bars: HBarChartBar[] = items.map((d, i) => ({
    x: labelWidth,
    y: i * (barHeight + gap),
    width: Math.max(xScale(d.value)!, 2),
    height: barHeight,
    label: d.label,
    value: d.value,
    formattedValue: fmt(d.value),
    percentage: `${((d.value / total) * 100).toFixed(1)}%`,
    color: colorScale(d.label)!,
  }))

  return { bars, chartWidth: width, chartHeight }
}

// ---------------------------------------------------------------------------
// Pie / Donut chart
// ---------------------------------------------------------------------------
export interface PieSlice {
  path: string
  label: string
  value: number
  percentage: string
  color: string
  centroidX: number
  centroidY: number
}

export function generatePieChart(
  items: Array<{ label: string, value: number }>,
  outerRadius = 80,
  innerRadius = 45,
): { slices: PieSlice[], size: number } {
  if (items.length === 0) return { slices: [], size: outerRadius * 2 }

  const total = sum(items, (d: { label: string, value: number }) => d.value) || 1

  const pieGen = pie<{ label: string, value: number }>()
    .value((d: { label: string, value: number }) => d.value)
    .sort(null)

  const arcGen = arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

  const colorScale = scaleOrdinal<string>()
    .domain(items.map(d => d.label))
    .range(CHART_COLORS)

  const arcs = pieGen(items)

  const slices: PieSlice[] = arcs.map((a: any) => {
    const centroid = arcGen.centroid(a)
    return {
      path: arcGen(a) || '',
      label: a.data.label,
      value: a.data.value,
      percentage: `${((a.data.value / total) * 100).toFixed(1)}%`,
      color: colorScale(a.data.label)!,
      centroidX: centroid[0],
      centroidY: centroid[1],
    }
  })

  return { slices, size: outerRadius * 2 }
}

// ---------------------------------------------------------------------------
// Multi-line chart — for compare page (multiple datasets on one chart)
// ---------------------------------------------------------------------------
export interface MultiLineDataset {
  label: string
  color: string
  path: string
  points: LineChartPoint[]
}

export interface MultiLineChartResult {
  datasets: MultiLineDataset[]
  xLabels: Array<{ x: number, label: string }>
  yLabels: Array<{ y: number, label: string }>
  width: number
  height: number
}

export function generateMultiLineChart(
  series: Array<{
    label: string
    timeline: Array<{ date: string, count: number }>
  }>,
  width = 700,
  height = 250,
  margin = { top: 10, right: 10, bottom: 24, left: 45 },
): MultiLineChartResult {
  const empty: MultiLineChartResult = {
    datasets: [],
    xLabels: [],
    yLabels: [],
    width,
    height,
  }

  if (series.length === 0) return empty

  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  // Find global date extent and max count
  const allDates: Date[] = []
  let globalMax = 0
  for (const s of series) {
    for (const d of s.timeline) {
      allDates.push(new Date(d.date))
      if (d.count > globalMax) globalMax = d.count
    }
  }

  if (allDates.length === 0) return empty

  const dateExtent = extent(allDates) as [Date, Date]
  const xScale = scaleTime()
    .domain(dateExtent)
    .range([margin.left, margin.left + innerW])

  const yScale = scaleLinear()
    .domain([0, Math.max(globalMax * 1.1, 1)])
    .range([margin.top + innerH, margin.top])
    .nice()

  const colorScale = scaleOrdinal<string>()
    .domain(series.map(s => s.label))
    .range(CHART_COLORS)

  const datasets: MultiLineDataset[] = series.map((s) => {
    const chartData: TimePoint[] = s.timeline.map((d: { date: string, count: number }) => ({
      date: new Date(d.date),
      count: d.count,
    }))
    const lineGen = line<TimePoint>()
      .x((d: TimePoint) => xScale(d.date)!)
      .y((d: TimePoint) => yScale(d.count)!)

    const points: LineChartPoint[] = chartData.map((d: TimePoint) => ({
      x: xScale(d.date)!,
      y: yScale(d.count)!,
      label: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: d.count,
    }))

    return {
      label: s.label,
      color: colorScale(s.label)!,
      path: lineGen(chartData) || '',
      points,
    }
  })

  const xTicks = xScale.ticks(5)
  const xLabels = xTicks.map((d: Date) => ({
    x: xScale(d)!,
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const yTicks = yScale.ticks(4)
  const fmt = d3format('.2s')
  const yLabels = yTicks.map((v: number) => ({
    y: yScale(v)!,
    label: v >= 1000 ? fmt(v) : String(v),
  }))

  return { datasets, xLabels, yLabels, width, height }
}

// ---------------------------------------------------------------------------
// Utility: Format numbers for display
// ---------------------------------------------------------------------------
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
