export function Sparkline({ data, color = '#10b981', w = 120, h = 36 }: { data: number[]; color?: string; w?: number; h?: number }) {
  if (!data.length) return <svg width={w} height={h}><text x="4" y={h / 2} fontSize="10" fill="#94a3b8">no data</text></svg>;
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1 || 1)) * (w - 4) + 2},${h - 4 - ((v - min) / rng) * (h - 10)}`).join(' ');
  const lx = ((data.length - 1) / (data.length - 1 || 1)) * (w - 4) + 2;
  const ly = h - 4 - ((data[data.length - 1] - min) / rng) * (h - 10);
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  );
}

export function BarChart({ data, color = '#10b981' }: { data: { day: string; liters: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.liters), 1);
  return (
    <div className="flex items-end gap-2 h-44">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="text-[10px] font-bold text-slate-500">{d.liters > 0 ? d.liters : ''}</div>
          <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(6, (d.liters / max) * 110)}px`, background: d.liters > 0 ? `linear-gradient(180deg, ${color}, ${color}55)` : '#e2e8f0' }} />
          <div className="text-[10px] font-semibold text-slate-400">{d.day}</div>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, color = '#10b981', height = 150 }: { data: { t: string; v: number }[]; color?: string; height?: number }) {
  const w = 600, h = height;
  if (!data.length) return <div className="text-sm text-slate-400 py-8 text-center">No readings yet</div>;
  const vals = data.map(d => d.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const rng = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1 || 1)) * (w - 10) + 5},${h - 22 - ((d.v - min) / rng) * (h - 40)}`);
  const path = 'M' + pts.join(' L');
  const area = `${path} L${w - 5},${h - 18} L5,${h - 18} Z`;
  const gid = 'g' + color.replace('#', '');
  const step = Math.max(1, Math.ceil(data.length / 6));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {data.map((d, i) => {
        if (i % step !== 0 && i !== data.length - 1) return null;
        const x = (i / (data.length - 1 || 1)) * (w - 10) + 5;
        return <text key={i} x={x} y={h - 4} fontSize="9" fill="#94a3b8" textAnchor="middle">{d.t}</text>;
      })}
    </svg>
  );
}

export function Gauge({ value, min = 0, max = 100, label, unit, color = '#10b981' }: any) {
  const pct = Math.min(100, Math.max(0, ((Number(value) - min) / (max - min)) * 100));
  const r = 44, c = Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="72" viewBox="0 0 120 72">
        <path d="M 12 64 A 44 44 0 0 1 108 64" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
        <path d="M 12 64 A 44 44 0 0 1 108 64" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <div className="-mt-7 text-xl font-extrabold text-slate-900">{value}<span className="text-xs font-semibold text-slate-400 ml-0.5">{unit}</span></div>
      <div className="text-xs font-semibold text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
