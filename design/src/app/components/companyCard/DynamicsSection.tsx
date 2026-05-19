import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { CompanyDetails, YearlyFinancials } from '../../data/companyDetails';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import { fmtMoneyTable } from './helpers';
import s from './CompanyCard.module.css';

type MetricKey = 'revenue' | 'cost' | 'profit' | 'assets' | 'receivable';

interface ChartMetric {
  key: MetricKey;
  label: string;
  color: string;
}

const CHART_METRICS: ChartMetric[] = [
  { key: 'revenue',    label: 'Выручка',        color: '#0DF0E6' },
  { key: 'cost',       label: 'Расходы',        color: '#3b82f6' },
  { key: 'profit',     label: 'Чистая прибыль', color: '#22c55e' },
  { key: 'assets',     label: 'Вложения',       color: '#f59e0b' },
  { key: 'receivable', label: 'Дебиторка',      color: '#ec4899' },
];

const VIEWPORT = { w: 700, h: 280, padL: 80, padR: 20, padT: 20, padB: 30 } as const;

export function DynamicsSection({ details }: { details: CompanyDetails }) {
  const isMobile = useIsMobile();
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(
    new Set(CHART_METRICS.map(m => m.key))
  );
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const fins = details.financials
    .filter(f => f.year >= 2021 && f.year <= 2025)
    .sort((a, b) => a.year - b.year);
  if (fins.length === 0) return null;

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const activeKeys = CHART_METRICS.filter(m => activeMetrics.has(m.key));
  const maxVal = computeMaxValue(fins, activeKeys);
  const chart = makeChartGeometry(fins.length, maxVal);

  return (
    <div className={s.card}>
      <div className={s.sectionHead}>
        <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
        <span className={s.sectionTitle}>Динамика за 5 лет</span>
      </div>

      <div className={s.metricTabs}>
        {CHART_METRICS.map(m => {
          const active = activeMetrics.has(m.key);
          return (
            <button
              key={m.key}
              type="button"
              className={s.metricTab}
              onClick={() => toggleMetric(m.key)}
              style={active ? { background: m.color, color: 'var(--bg-base)' } : undefined}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className={s.chartBox}>
        <ChartSvg
          fins={fins}
          activeMetrics={activeKeys}
          chart={chart}
          hoverIdx={hoverIdx}
          onHoverChange={setHoverIdx}
        />
        {hoverIdx !== null && (
          <ChartTooltip
            year={fins[hoverIdx].year}
            metrics={activeKeys}
            row={fins[hoverIdx]}
            xCenter={chart.getX(hoverIdx)}
          />
        )}
      </div>

      <DataTable fins={fins} isMobile={isMobile} />
    </div>
  );
}

// ── Geometry helpers ────────────────────────────────────────────

interface ChartGeometry {
  getX: (i: number) => number;
  getY: (v: number) => number;
  yLabels: number[];
  xStep: number;
}

function computeMaxValue(fins: YearlyFinancials[], metrics: ChartMetric[]): number {
  let max = 0;
  for (const f of fins) {
    for (const m of metrics) {
      if (f[m.key] > max) max = f[m.key];
    }
  }
  return max === 0 ? 1 : max;
}

function makeChartGeometry(pointsCount: number, maxVal: number): ChartGeometry {
  const { w, h, padL, padR, padT, padB } = VIEWPORT;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const xStep = pointsCount > 1 ? chartW / (pointsCount - 1) : 0;
  const getX = (i: number) => padL + i * xStep;
  const getY = (v: number) => padT + chartH - (v / maxVal) * chartH;
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);
  return { getX, getY, yLabels, xStep };
}

// ── Subcomponents ───────────────────────────────────────────────

interface ChartSvgProps {
  fins: YearlyFinancials[];
  activeMetrics: ChartMetric[];
  chart: ChartGeometry;
  hoverIdx: number | null;
  onHoverChange: (idx: number | null) => void;
}

function ChartSvg({ fins, activeMetrics, chart, hoverIdx, onHoverChange }: ChartSvgProps) {
  const { w, h, padL, padR, padT, padB } = VIEWPORT;
  const chartH = h - padT - padB;
  const { getX, getY, yLabels, xStep } = chart;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
      onMouseLeave={() => onHoverChange(null)}
    >
      {yLabels.map((v, i) => (
        <g key={i}>
          <line x1={padL} y1={getY(v)} x2={w - padR} y2={getY(v)} stroke="rgba(255,255,255,0.06)" />
          <text
            x={padL - 8} y={getY(v) + 4} textAnchor="end"
            fill="rgba(255,255,255,0.4)" fontSize="10"
            fontFamily="'Space Grotesk', sans-serif"
          >
            {fmtMoneyTable(v)}
          </text>
        </g>
      ))}

      {fins.map((f, i) => (
        <text
          key={f.year} x={getX(i)} y={h - 4} textAnchor="middle"
          fill={hoverIdx === i ? '#fff' : 'rgba(255,255,255,0.4)'}
          fontSize="12"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight={hoverIdx === i ? 600 : 400}
        >
          {f.year}
        </text>
      ))}

      {activeMetrics.map(m => {
        const points = fins.map((f, i) => `${getX(i)},${getY(f[m.key])}`).join(' ');
        return (
          <g key={m.key}>
            <polyline points={points} fill="none" stroke={m.color} strokeWidth="2.5" strokeLinejoin="round" />
            {fins.map((f, i) => (
              <circle
                key={i}
                cx={getX(i)} cy={getY(f[m.key])}
                r={hoverIdx === i ? 6 : 4}
                fill={m.color} stroke="#111920" strokeWidth="2"
              />
            ))}
          </g>
        );
      })}

      {hoverIdx !== null && (
        <line
          x1={getX(hoverIdx)} y1={padT}
          x2={getX(hoverIdx)} y2={padT + chartH}
          stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3"
        />
      )}

      {fins.map((_, i) => {
        const zoneW = i === 0 || i === fins.length - 1 ? xStep / 2 + 40 : xStep;
        const zoneX = i === 0 ? 0 : getX(i) - xStep / 2;
        return (
          <rect
            key={i}
            x={zoneX} y={0} width={zoneW} height={h}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onMouseEnter={() => onHoverChange(i)}
          />
        );
      })}
    </svg>
  );
}

interface ChartTooltipProps {
  year: number;
  metrics: ChartMetric[];
  row: YearlyFinancials;
  xCenter: number;
}

function ChartTooltip({ year, metrics, row, xCenter }: ChartTooltipProps) {
  const { w, padT } = VIEWPORT;
  const tooltipRight = xCenter > w / 2;
  return (
    <div
      className={s.tooltip}
      style={{
        top: padT,
        left: tooltipRight ? undefined : xCenter + 12,
        right: tooltipRight ? w - xCenter + 12 : undefined,
      }}
    >
      <div className={s.tooltipYear}>{year}</div>
      {metrics.map(m => (
        <div key={m.key} className={s.tooltipRow}>
          <div className={s.tooltipLabel}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color, flexShrink: 0 }} />
            <span className={s.tooltipLabelText}>{m.label}</span>
          </div>
          <span className={s.tooltipValue}>{fmtMoneyTable(row[m.key])}</span>
        </div>
      ))}
    </div>
  );
}

interface DataTableProps {
  fins: YearlyFinancials[];
  isMobile: boolean;
}

function DataTable({ fins, isMobile }: DataTableProps) {
  return (
    <div className={s.dataTableWrap}>
      <table className={s.dataTable}>
        <thead>
          <tr>
            <th className={`${s.dataTableLeft} ${isMobile ? s.dataTableStickyLeft : ''}`} />
            {fins.map(f => <th key={f.year}>{f.year}</th>)}
          </tr>
        </thead>
        <tbody>
          {CHART_METRICS.map(m => (
            <tr key={m.key}>
              <td className={`${s.dataTableLeft} ${isMobile ? s.dataTableStickyLeft : ''}`}>
                {m.label}
              </td>
              {fins.map(f => (
                <td key={f.year}>{fmtMoneyTable(f[m.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
