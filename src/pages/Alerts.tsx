import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, Plus, X, AlertTriangle, Info, OctagonAlert } from 'lucide-react';
import { api, timeAgo } from '../lib/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [sev, setSev] = useState('all');
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ field_id: '', type: 'system', severity: 'info', title: '', message: '' });

  const load = async () => {
    try {
      const [a, fl] = await Promise.all([api.get('/api/alerts?limit=100'), api.get('/api/fields')]);
      setAlerts(a); setFields(fl);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

  const filtered = alerts.filter(a => sev === 'all' || a.severity === sev);
  const unread = alerts.filter(a => !a.is_read).length;
  const icon = (s: string) => s === 'critical' ? <OctagonAlert size={17} className="text-red-500" /> : s === 'warning' ? <AlertTriangle size={17} className="text-amber-500" /> : <Info size={17} className="text-sky-500" />;
  const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="p-4 sm:p-6 max-w-[1000px] mx-auto space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Alerts Center</h1><p className="text-sm text-slate-500">{unread} unread • threshold breaches, irrigation & system events</p></div>
        <div className="ml-auto flex gap-2">
          <button onClick={async () => { await api.put('/api/alerts', { mark_all: true }); load(); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border text-xs font-bold text-slate-600"><CheckCheck size={14} /> Mark all read</button>
          <button onClick={async () => { if (confirm('Clear all read alerts?')) { await api.del('/api/alerts', { clear_read: true }); load(); } }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border text-xs font-bold text-slate-600"><Trash2 size={14} /> Clear read</button>
          <button onClick={() => setShow(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"><Plus size={14} /> New</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'critical', 'warning', 'info'].map(s => (
          <button key={s} onClick={() => setSev(s)} className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${sev === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>{s} {s !== 'all' && `(${alerts.filter(a => a.severity === s).length})`}</button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.map(a => {
          const fl = fields.find(x => x.id === a.field_id);
          return (
            <div key={a.id} className={`rounded-2xl bg-white border p-4 flex gap-3 shadow-sm ${!a.is_read ? 'border-l-4 border-l-emerald-500 border-slate-100' : 'border-slate-100 opacity-80'}`}>
              <div className="mt-0.5">{icon(a.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{a.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${a.severity === 'critical' ? 'bg-red-100 text-red-700' : a.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>{a.severity}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">{a.type}</span>
                </div>
                <div className="mt-1 text-[13px] text-slate-500">{a.message || 'No details'}</div>
                <div className="mt-1.5 text-[11px] text-slate-400">{fl ? `${fl.name} • ` : ''}{timeAgo(a.created_at)}</div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {!a.is_read && <button onClick={async () => { await api.put('/api/alerts', { id: a.id, is_read: true }); load(); }} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Acknowledge</button>}
                <button onClick={async () => { await api.del('/api/alerts', { id: a.id }); load(); }} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600">Delete</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-14 rounded-2xl bg-white border border-dashed"><Bell size={30} className="mx-auto text-slate-200" /><div className="mt-2 font-bold text-slate-600 text-sm">No alerts</div><div className="text-xs text-slate-400">You're all caught up.</div></div>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <form onSubmit={async (e: any) => { e.preventDefault(); await api.post('/api/alerts', { field_id: f.field_id ? Number(f.field_id) : null, type: f.type, severity: f.severity, title: f.title, message: f.message }); setShow(false); setF({ field_id: '', type: 'system', severity: 'info', title: '', message: '' }); load(); }} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg">Raise Alert</h3><button type="button" onClick={() => setShow(false)}><X size={18} /></button></div>
            <input required placeholder="Title *" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className={inputCls} />
            <textarea placeholder="Message" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} rows={3} className={inputCls} />
            <div className="grid grid-cols-3 gap-3">
              <select value={f.field_id} onChange={e => setF({ ...f, field_id: e.target.value })} className={inputCls}><option value="">No field</option>{fields.map(fl => <option key={fl.id} value={fl.id}>{fl.name}</option>)}</select>
              <select value={f.severity} onChange={e => setF({ ...f, severity: e.target.value })} className={inputCls}><option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option></select>
              <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })} className={inputCls}><option value="system">System</option><option value="threshold">Threshold</option><option value="irrigation">Irrigation</option><option value="weather">Weather</option></select>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm">Raise Alert</button>
          </form>
        </div>
      )}
    </div>
  );
}
