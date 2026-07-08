// Hand-rolled SVG charts — zero deps, styled to the design system.

const NS = 'http://www.w3.org/2000/svg';

export interface Journey {
  name: string;
  final: number;
  points: { date: string; mmr: number }[];
}

// Categorical palette that stays distinct on the dark surface. Lines are also
// direct-labeled at their end, so colour is a secondary cue.
const LINE_COLORS = ['#F0B429', '#E4483B', '#4CC38A', '#5B9DEF', '#C98BDB', '#E6EAF0'];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Multi-series rating-over-time line chart. Returns an <svg> + legend markup. */
export function mmrJourneyChart(journeys: Journey[]): string {
  const W = 660;
  const H = 300;
  const pad = { t: 14, r: 96, b: 26, l: 40 };
  if (!journeys.length) return '<p class="panel__foot">No rating history for this game.</p>';

  const times = journeys.flatMap((j) => j.points.map((p) => new Date(p.date).getTime()));
  const mmrs = journeys.flatMap((j) => j.points.map((p) => p.mmr));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const y0 = Math.min(...mmrs);
  const y1 = Math.max(...mmrs);
  const yLo = Math.floor((y0 - 20) / 100) * 100;
  const yHi = Math.ceil((y1 + 20) / 100) * 100;

  const x = (t: number) => pad.l + ((t - t0) / (t1 - t0 || 1)) * (W - pad.l - pad.r);
  const y = (m: number) => pad.t + (1 - (m - yLo) / (yHi - yLo || 1)) * (H - pad.t - pad.b);

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rating over time for top players">`;

  // horizontal gridlines + y labels
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = yLo + ((yHi - yLo) / steps) * i;
    const yy = y(val);
    svg += `<line x1="${pad.l}" y1="${yy}" x2="${W - pad.r}" y2="${yy}" stroke="#1e242e" stroke-width="1"/>`;
    svg += `<text x="${pad.l - 8}" y="${yy + 3}" fill="#58616f" font-size="10" font-family="IBM Plex Mono, monospace" text-anchor="end">${val}</text>`;
  }
  // year ticks
  const startYear = new Date(t0).getFullYear();
  const endYear = new Date(t1).getFullYear();
  for (let yr = startYear; yr <= endYear; yr++) {
    const tt = new Date(`${yr}-01-01`).getTime();
    if (tt < t0 || tt > t1) continue;
    const xx = x(tt);
    svg += `<line x1="${xx}" y1="${pad.t}" x2="${xx}" y2="${H - pad.b}" stroke="#1a2028" stroke-width="1"/>`;
    svg += `<text x="${xx}" y="${H - pad.b + 16}" fill="#58616f" font-size="10" font-family="IBM Plex Mono, monospace" text-anchor="middle">${yr}</text>`;
  }

  journeys.forEach((j, i) => {
    const color = LINE_COLORS[i % LINE_COLORS.length];
    const d = j.points.map((p, k) => `${k ? 'L' : 'M'}${x(new Date(p.date).getTime()).toFixed(1)} ${y(p.mmr).toFixed(1)}`).join(' ');
    svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" opacity="0.92"/>`;
    const last = j.points[j.points.length - 1];
    svg += `<text x="${x(new Date(last.date).getTime()) + 6}" y="${y(last.mmr) + 3}" fill="${color}" font-size="11" font-family="IBM Plex Mono, monospace">${esc(j.name)}</text>`;
  });

  svg += '</svg>';
  return svg;
}

export interface MonthBar { month: string; cs: number; dota: number; total: number }

/** Stacked monthly-activity bar chart (CS amber + Dota crimson). */
export function timelineChart(rows: MonthBar[]): string {
  const W = 660;
  const H = 240;
  const pad = { t: 12, r: 8, b: 30, l: 30 };
  if (!rows.length) return '';
  const max = Math.max(...rows.map((r) => r.total));
  const yHi = Math.ceil(max / 20) * 20;
  const bw = (W - pad.l - pad.r) / rows.length;
  const y = (v: number) => pad.t + (1 - v / (yHi || 1)) * (H - pad.t - pad.b);
  const base = H - pad.b;

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Matches played per month">`;
  for (let i = 0; i <= 3; i++) {
    const val = (yHi / 3) * i;
    const yy = y(val);
    svg += `<line x1="${pad.l}" y1="${yy}" x2="${W - pad.r}" y2="${yy}" stroke="#1e242e"/>`;
    svg += `<text x="${pad.l - 6}" y="${yy + 3}" fill="#58616f" font-size="10" font-family="IBM Plex Mono, monospace" text-anchor="end">${Math.round(val)}</text>`;
  }
  rows.forEach((r, i) => {
    const bx = pad.l + i * bw + bw * 0.15;
    const w = bw * 0.7;
    const hCs = (r.cs / (yHi || 1)) * (H - pad.t - pad.b);
    const hDota = (r.dota / (yHi || 1)) * (H - pad.t - pad.b);
    const hOther = ((r.total - r.cs - r.dota) / (yHi || 1)) * (H - pad.t - pad.b);
    let yTop = base;
    // other games (steel), then dota, then cs on top
    if (hOther > 0) { yTop -= hOther; svg += `<rect x="${bx}" y="${yTop}" width="${w}" height="${hOther}" fill="#3a424e"/>`; }
    if (hDota > 0) { yTop -= hDota; svg += `<rect x="${bx}" y="${yTop}" width="${w}" height="${hDota}" fill="#E4483B"/>`; }
    if (hCs > 0) { yTop -= hCs; svg += `<rect x="${bx}" y="${yTop}" width="${w}" height="${hCs}" fill="#F0B429"/>`; }
    // year label at january
    if (r.month.endsWith('-01') || i === 0) {
      svg += `<text x="${bx + w / 2}" y="${H - pad.b + 16}" fill="#58616f" font-size="10" font-family="IBM Plex Mono, monospace" text-anchor="middle">${r.month.slice(0, 4)}</text>`;
    }
  });
  svg += '</svg>';
  svg += `<div class="chart-legend">
    <span><i style="background:#F0B429"></i>Counter-Strike</span>
    <span><i style="background:#E4483B"></i>Dota 2</span>
    <span><i style="background:#3a424e"></i>Other games</span>
  </div>`;
  return svg;
}
