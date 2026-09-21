import { useEffect, useState } from 'react';
import { Droplets, Plus, X, Clock, Trash2, Play, Square, CalendarClock } from 'lucide-react';
import { api, timeAgo } from '../lib/api';
import { BarChart } from '../components/Charts';

export default function Irrigation() {
  const [zones, setZones] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [scheds, setScheds] = useState<any[]>([]);
  const [showZ, setShowZ] = useState(false);
  const [showS, setShowS] = useState(false);
  const [zf, setZf] = useState({ field_id: '', name: '', mode: 'auto', flow_rate: '12', area_covered: '' });
  const [sf, setSf] = useState({ zone_id: '', name: '', days: 'Mon,Wed,Fri', start_time: '06:00', duration_minutes: '20' });
  const [running, setRunning] = useState<number | null>(null);

  const load = async () => {
    try {
      const [z, f, l, s] = await Promise.all([
        api.get('/api/irrigation-zones'), api.get('/api/fields'),
        api.get('/api/irrigation-logs?limit=30'), api.get('/api/schedules')
      ]);
      setZones(z); setFields(f); setLogs(l); setScheds(s);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { load(); }, []);

  const toggleValve = async (z: any) => {
    const opening = z.valve_status !== 'open';
    setRunning(z.id);
    try {
      await api.put('/api/irrigation-zones', { id: z.id, valve_status: opening ? 'open' : 'closed', last_irrigated: opening ? new Date().toISOString() : z.last_irrigated });
      if (opening) {
        const dur = 15;
        await api.post('/api/irrigation-logs', { zone_id: z.id, action: 'irrigate', duration_minutes: dur, water_used_liters: Math.round(Number(z.flow_rate || 12) * dur), triggered_by: 'manual', status: 'completed' });
      }
      await load();
    } finally { setRunning(null); }
  };

  const setMode = async (z: any, mode: string) => { await api.put('/api/irrigation-zones', { id: z.id, mode }); load(); };

  const saveZone = async (e: any) => {
    e.preventDefault();
    await api.post('/api/irrigation-zones', { field_id: Number(zf.field_id), name: zf.name, mode: zf.mode, flow_rate: Number(zf.flow_rate) || 12, area_covered: Number(zf.area_covered) || null });
    setShowZ(false); setZf({ field_id: '', name: '', mode: 'auto', flow_rate: '12', area_covered: '' }); load();
  };

  const saveSched = async (e: any) => {
    e.preventDefault();
    await api.post('/api/schedules', { zone_id: Number(sf.zone_id), name: sf.name, days: sf.days, start_time: sf.start_time, duration_minutes: Number(sf.duration_minutes) || 20, enabled: true });
    setShowS(false); setSf({ zone_id: '', name: '', days: 'Mon,Wed,Fri', start_time: '06:00', duration_minutes: '20' }); load();
  };

  const waterByDay = (() => {
    const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 86400000); return d.toISOString().slice(0, 10); });
    return days.map(day => ({ day: day.slice(5), liters: Math.round(logs.filter(l => (l.started_at || '').slice(0, 10) === day).reduce((x, y) => x + Number(y.water_used_liters || 0), 0)) }));
  })();

  const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500";

  return (
    <div className="p-4 sm:p-6 max-w-[1300px] mx-auto space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Smart Irrigation</h1><p className="text-sm text-slate-500">Valve control • auto rules • schedules • water analytics</p></div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowS(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border text-sm font-bold text-slate-700"><CalendarClock size={15} /> New Schedule</button>
          <button onClick={() => setShowZ(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-sky-500/25"><Plus size={15} /> New Zone</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(z => {
          const fl = fields.find(f => f.id === z.field_id);
          const open = z.valve_status === 'open';
          return (
            <div key={z.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${open ? 'bg-gradient-to-br from-sky-400 to-blue-600' : 'bg-slate-300'}`}><Droplets size={19} /></div>
                <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 truncate">{z.name}</div><div className="text-xs text-slate-400">{fl?.name || 'Field #' + z.field_id} • {z.flow_rate} L/min</div></div>
                <button onClick={() => toggleValve(z)} disabled={running === z.id} className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${open ? 'bg-sky-500' : 'bg-slate-200'}`}><span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${open ? 'left-7' : 'left-1'}`} /></button>
              </div>
              <div className="mt-3 flex gap-1.5 p-1 rounded-xl bg-slate-100">
                {['manual', 'auto', 'scheduled'].map(m => (
                  <button key={m} onClick={() => setMode(z, m)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide capitalize ${z.mode === m ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>{m}</button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Last run: <b>{timeAgo(z.last_irrigated)}</b></span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${open ? 'bg-sky-100 text-sky-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>{running === z.id ? 'SWITCHING...' : open ? 'WATERING' : 'IDLE'}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggleValve(z)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold ${open ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}>{open ? <><Square size={13} />Stop</> : <><Play size={13} />Run 15 min</>}</button>
                <button onClick={async () => { if (confirm('Delete zone?')) { await api.del('/api/irrigation-zones', { id: z.id }); load(); } }} className="px-3 py-2 rounded-xl bg-slate-100 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {zones.length === 0 && <div className="col-span-full text-center text-slate-400 py-10 text-sm">No irrigation zones yet.</div>}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-sky-600" /><h3 className="font-bold text-slate-900">Schedules</h3><span className="ml-auto text-xs font-bold text-slate-400">{scheds.filter(s => s.enabled).length} active</span></div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {scheds.map(s => {
              const z = zones.find(x => x.id === s.zone_id);
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">{s.name}</div><div className="text-[11px] text-slate-400">{z?.name || 'Zone #' + s.zone_id} • {s.days} • {s.start_time} • {s.duration_minutes} min</div></div>
                  <button onClick={async () => { await api.put('/api/schedules', { id: s.id, enabled: !s.enabled }); load(); }} className={`w-11 h-6 rounded-full transition-colors shrink-0 ${s.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`block w-4 h-4 rounded-full bg-white shadow mt-1 transition-all ${s.enabled ? 'ml-6' : 'ml-1'}`} /></button>
                  <button onClick={async () => { if (confirm('Delete schedule?')) { await api.del('/api/schedules', { id: s.id }); load(); } }} className="text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              );
            })}
            {scheds.length === 0 && <div className="text-sm text-slate-400 text-center py-6">No schedules. Automate watering with a schedule.</div>}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 mb-3">Water Consumption</h3>
          <BarChart data={waterByDay} color="#0ea5e9" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-sky-50 p-2.5"><div className="text-[10px] font-bold text-sky-500">TODAY</div><div className="font-extrabold">{waterByDay[6]?.liters || 0} L</div></div>
            <div className="rounded-xl bg-sky-50 p-2.5"><div className="text-[10px] font-bold text-sky-500">7-DAY TOTAL</div><div className="font-extrabold">{waterByDay.reduce((x, y) => x + y.liters, 0)} L</div></div>
            <div className="rounded-xl bg-sky-50 p-2.5"><div className="text-[10px] font-bold text-sky-500">SESSIONS</div><div className="font-extrabold">{logs.length}</div></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">Irrigation History</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead><tr className="text-left text-[11px] uppercase text-slate-400 border-b border-slate-100"><th className="px-5 py-3">Zone</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Water</th><th className="px-4 py-3">Triggered By</th><th className="px-4 py-3">Started</th></tr></thead>
            <tbody>
              {logs.map(l => {
                const z = zones.find(x => x.id === l.zone_id);
                return (
                  <tr key={l.id} className="border-b border-slate-50"><td className="px-5 py-2.5 font-bold">{z?.name || 'Zone #' + l.zone_id}</td><td className="px-4 py-2.5 capitalize">{l.action}</td><td className="px-4 py-2.5">{l.duration_minutes} min</td><td className="px-4 py-2.5 font-bold text-sky-700">{l.water_used_liters} L</td><td className="px-4 py-2.5"><span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100">{l.triggered_by}</span></td><td className="px-4 py-2.5 text-slate-500 text-xs">{timeAgo(l.started_at)}</td></tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showZ && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <form onSubmit={saveZone} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg">New Irrigation Zone</h3><button type="button" onClick={() => setShowZ(false)}><X size={18} /></button></div>
            <select required value={zf.field_id} onChange={e => setZf({ ...zf, field_id: e.target.value })} className={inputCls}><option value="">Select field *</option>{fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
            <input required placeholder="Zone name *" value={zf.name} onChange={e => setZf({ ...zf, name: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-3 gap-3">
              <select value={zf.mode} onChange={e => setZf({ ...zf, mode: e.target.value })} className={inputCls}><option value="manual">Manual</option><option value="auto">Auto</option><option value="scheduled">Scheduled</option></select>
              <input type="number" placeholder="Flow L/min" value={zf.flow_rate} onChange={e => setZf({ ...zf, flow_rate: e.target.value })} className={inputCls} />
              <input type="number" step="0.1" placeholder="Area ha" value={zf.area_covered} onChange={e => setZf({ ...zf, area_covered: e.target.value })} className={inputCls} />
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm">Create Zone</button>
          </form>
        </div>
      )}

      {showS && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <form onSubmit={saveSched} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg">New Schedule</h3><button type="button" onClick={() => setShowS(false)}><X size={18} /></button></div>
            <select required value={sf.zone_id} onChange={e => setSf({ ...sf, zone_id: e.target.value })} className={inputCls}><option value="">Select zone *</option>{zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}</select>
            <input required placeholder="Schedule name *" value={sf.name} onChange={e => setSf({ ...sf, name: e.target.value })} className={inputCls} />
            <input placeholder="Days (Mon,Wed,Fri)" value={sf.days} onChange={e => setSf({ ...sf, days: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input type="time" value={sf.start_time} onChange={e => setSf({ ...sf, start_time: e.target.value })} className={inputCls} />
              <input type="number" placeholder="Duration min" value={sf.duration_minutes} onChange={e => setSf({ ...sf, duration_minutes: e.target.value })} className={inputCls} />
            </div>
            <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm">Create Schedule</button>
          </form>
        </div>
      )}
    </div>
  );
}
