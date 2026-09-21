import { useEffect, useMemo, useState } from 'react';
import { Plus, Radio, X, Droplets, Thermometer, CloudRain, Sun, FlaskConical, Wind, Trash2, Pencil, Activity } from 'lucide-react';
import { api, timeAgo, fmt } from '../lib/api';
import { LineChart } from '../components/Charts';

const typeMeta: any = {
  soil_moisture: { icon: Droplets, color: '#0ea5e9', unit: '%', label: 'Soil Moisture' },
  temperature: { icon: Thermometer, color: '#f59e0b', unit: '°C', label: 'Temperature' },
  humidity: { icon: Wind, color: '#8b5cf6', unit: '%', label: 'Humidity' },
  ph: { icon: FlaskConical, color: '#10b981', unit: 'pH', label: 'Soil pH' },
  light: { icon: Sun, color: '#eab308', unit: 'lux', label: 'Light' },
  rainfall: { icon: CloudRain, color: '#06b6d4', unit: 'mm', label: 'Rainfall' }
};

export default function Sensors() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [sel, setSel] = useState<any>(null);
  const [hist, setHist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ field_id: '', name: '', type: 'soil_moisture', unit: '%', status: 'online', battery_level: '100', min_threshold: '', max_threshold: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [s, fl] = await Promise.all([api.get('/api/sensors'), api.get('/api/fields')]);
      setSensors(s); setFields(fl);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openDetail = async (s: any) => {
    setSel(s);
    try {
      const h = await api.get(`/api/readings?sensor_id=${s.id}&limit=60`);
      setHist([...h].reverse());
    } catch { setHist([]); }
  };

  const save = async (e: any) => {
    e.preventDefault();
    const p: any = {
      field_id: Number(f.field_id), name: f.name, type: f.type, unit: f.unit, status: f.status,
      battery_level: Number(f.battery_level),
      min_threshold: f.min_threshold === '' ? null : Number(f.min_threshold),
      max_threshold: f.max_threshold === '' ? null : Number(f.max_threshold)
    };
    if (edit) await api.put('/api/sensors', { id: edit.id, ...p });
    else await api.post('/api/sensors', { ...p, last_value: 0 });
    setShow(false); setEdit(null); load();
  };

  const filtered = useMemo(() => sensors.filter(s => (filter === 'all' || s.type === filter) && (fieldFilter === 'all' || String(s.field_id) === fieldFilter)), [sensors, filter, fieldFilter]);
  const chartData = hist.map(h => ({ t: (h.recorded_at || '').slice(11, 16), v: Number(h.value) }));
  const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="p-4 sm:p-6 max-w-[1300px] mx-auto space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="text-2xl font-extrabold text-slate-900">IoT Sensor Network</h1><p className="text-sm text-slate-500">{sensors.filter(s => s.status === 'online').length} online • {sensors.length} total nodes • LoRaWAN mesh</p></div>
        <button onClick={() => { setEdit(null); setF({ field_id: fields[0] ? String(fields[0].id) : '', name: '', type: 'soil_moisture', unit: '%', status: 'online', battery_level: '100', min_threshold: '', max_threshold: '' }); setShow(true); }} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25"><Plus size={15} /> Add Sensor</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'soil_moisture', 'temperature', 'humidity', 'ph', 'light', 'rainfall'].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize ${filter === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>{t.replace('_', ' ')}</button>
        ))}
        <select value={fieldFilter} onChange={e => setFieldFilter(e.target.value)} className="ml-auto rounded-full border border-slate-200 text-xs font-bold px-3 py-1.5 bg-white"><option value="all">All fields</option>{fields.map(fl => <option key={fl.id} value={fl.id}>{fl.name}</option>)}</select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-36 rounded-2xl bg-white animate-pulse border" />)}</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {filtered.map(s => {
              const m = typeMeta[s.type] || { icon: Radio, color: '#10b981', unit: s.unit, label: s.type };
              const Icon = m.icon;
              const fl = fields.find(x => x.id === s.field_id);
              return (
                <div key={s.id} onClick={() => openDetail(s)} className={`cursor-pointer rounded-2xl bg-white border p-5 shadow-sm hover:shadow-md transition-all ${sel?.id === s.id ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-100'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)` }}><Icon size={19} /></div>
                    <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 text-sm truncate">{s.name}</div><div className="text-[11px] text-slate-400">{m.label} • {fl?.name || 'Field #' + s.field_id}</div></div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${s.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{s.status}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div><span className="text-3xl font-extrabold text-slate-900">{fmt(s.last_value)}</span><span className="text-sm font-bold text-slate-400 ml-1">{s.unit || m.unit}</span></div>
                    <div className="text-right text-[11px] text-slate-400">Batt {s.battery_level}%<br />{timeAgo(s.last_reading_at)}</div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.battery_level}%`, background: m.color }} /></div>
                  {(s.min_threshold != null || s.max_threshold != null) && <div className="mt-2 text-[11px] font-semibold text-slate-400">Thresholds: {s.min_threshold ?? '—'} – {s.max_threshold ?? '—'} {s.unit}</div>}
                </div>
              );
            })}
            {filtered.length === 0 && <div className="col-span-full text-center text-slate-400 py-12 text-sm">No sensors match this filter.</div>}
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 h-fit lg:sticky lg:top-4">
            {!sel ? (
              <div className="text-center py-10"><Activity size={32} className="mx-auto text-slate-200" /><div className="mt-2 font-bold text-slate-700 text-sm">Select a sensor</div><div className="text-xs text-slate-400">Click any node to view live history</div></div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div><h3 className="font-extrabold text-slate-900">{sel.name}</h3><div className="text-xs text-slate-400 capitalize">{sel.type.replace('_', ' ')} • {timeAgo(sel.last_reading_at)}</div></div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEdit(sel); setF({ field_id: String(sel.field_id), name: sel.name, type: sel.type, unit: sel.unit || '', status: sel.status, battery_level: String(sel.battery_level ?? 100), min_threshold: sel.min_threshold ?? '', max_threshold: sel.max_threshold ?? '' }); setShow(true); }} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"><Pencil size={14} /></button>
                    <button onClick={async () => { if (confirm('Delete sensor?')) { await api.del('/api/sensors', { id: sel.id }); setSel(null); load(); } }} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-bold text-slate-500 mb-2">READING HISTORY (last {hist.length})</div>
                  <LineChart data={chartData} color={typeMeta[sel.type]?.color || '#10b981'} height={130} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 p-2.5"><div className="text-[10px] font-bold text-slate-400">MIN</div><div className="font-extrabold text-sm">{hist.length ? fmt(Math.min(...hist.map(h => Number(h.value)))) : '—'}</div></div>
                  <div className="rounded-xl bg-slate-50 p-2.5"><div className="text-[10px] font-bold text-slate-400">AVG</div><div className="font-extrabold text-sm">{hist.length ? fmt(hist.reduce((x, y) => x + Number(y.value), 0) / hist.length) : '—'}</div></div>
                  <div className="rounded-xl bg-slate-50 p-2.5"><div className="text-[10px] font-bold text-slate-400">MAX</div><div className="font-extrabold text-sm">{hist.length ? fmt(Math.max(...hist.map(h => Number(h.value)))) : '—'}</div></div>
                </div>
                <button onClick={() => openDetail(sel)} className="mt-3 w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">Reload History</button>
              </>
            )}
          </div>
        </div>
      )}

      {show && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg">{edit ? 'Edit Sensor' : 'Add Sensor Node'}</h3><button type="button" onClick={() => setShow(false)}><X size={18} /></button></div>
            <select required value={f.field_id} onChange={e => setF({ ...f, field_id: e.target.value })} className={inputCls}><option value="">Select field *</option>{fields.map(fl => <option key={fl.id} value={fl.id}>{fl.name}</option>)}</select>
            <input required placeholder="Sensor name *" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <select value={f.type} onChange={e => { const t = e.target.value; setF({ ...f, type: t, unit: typeMeta[t]?.unit || '' }); }} className={inputCls}>{Object.keys(typeMeta).map(t => <option key={t} value={t}>{typeMeta[t].label}</option>)}</select>
              <input placeholder="Unit" value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className={inputCls}><option value="online">Online</option><option value="offline">Offline</option></select>
              <input type="number" placeholder="Battery %" value={f.battery_level} onChange={e => setF({ ...f, battery_level: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="any" placeholder="Min threshold" value={f.min_threshold} onChange={e => setF({ ...f, min_threshold: e.target.value })} className={inputCls} />
              <input type="number" step="any" placeholder="Max threshold" value={f.max_threshold} onChange={e => setF({ ...f, max_threshold: e.target.value })} className={inputCls} />
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm">{edit ? 'Save' : 'Add Sensor'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
