import { useEffect, useState } from 'react';
import { Cpu, Plus, X, Trash2, Wifi, WifiOff, Wrench, Battery } from 'lucide-react';
import { api, timeAgo } from '../lib/api';

export default function Devices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ field_id: '', name: '', type: 'sensor_node', status: 'online', battery_level: '100', firmware: 'v2.4.1' });

  const load = async () => {
    try {
      const [d, fl] = await Promise.all([api.get('/api/devices'), api.get('/api/fields')]);
      setDevices(d); setFields(fl);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { load(); }, []);

  const save = async (e: any) => {
    e.preventDefault();
    await api.post('/api/devices', { field_id: f.field_id ? Number(f.field_id) : null, name: f.name, type: f.type, status: f.status, battery_level: Number(f.battery_level) || 100, firmware: f.firmware });
    setShow(false); load();
  };

  const cycle = async (d: any) => {
    const next = d.status === 'online' ? 'offline' : d.status === 'offline' ? 'maintenance' : 'online';
    await api.put('/api/devices', { id: d.id, status: next });
    load();
  };

  const ping = async (d: any) => {
    await api.put('/api/devices', { id: d.id, battery_level: Math.max(5, (d.battery_level || 100) - 1) });
    load();
  };

  const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="p-4 sm:p-6 max-w-[1300px] mx-auto space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Edge Devices</h1><p className="text-sm text-slate-500">{devices.filter(d => d.status === 'online').length} online • gateways, valves, pumps & weather stations</p></div>
        <button onClick={() => setShow(true)} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold"><Plus size={15} /> Register Device</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(d => {
          const fl = fields.find(x => x.id === d.field_id);
          return (
            <div key={d.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${d.status === 'online' ? 'bg-gradient-to-br from-emerald-400 to-green-600' : d.status === 'maintenance' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-slate-300'}`}>
                  {d.status === 'online' ? <Wifi size={18} /> : d.status === 'maintenance' ? <Wrench size={18} /> : <WifiOff size={18} />}
                </div>
                <div className="flex-1 min-w-0"><div className="font-bold text-slate-900 truncate">{d.name}</div><div className="text-[11px] text-slate-400 capitalize">{String(d.type || '').replace('_', ' ')} • {fl?.name || 'Unassigned'}</div></div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${d.status === 'online' ? 'bg-emerald-50 text-emerald-600' : d.status === 'maintenance' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{d.status}</span>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500"><span className="flex items-center gap-1 font-semibold"><Battery size={13} />Battery</span><b className="text-slate-800">{d.battery_level}%</b></div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${(d.battery_level ?? 100) < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${d.battery_level || 0}%` }} /></div>
                <div className="flex justify-between text-slate-500 pt-1"><span>Firmware</span><b className="text-slate-800 font-mono text-[11px]">{d.firmware || '—'}</b></div>
                <div className="flex justify-between text-slate-500"><span>Last seen</span><b className="text-slate-800">{timeAgo(d.last_seen)}</b></div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => ping(d)} className="flex-1 py-2 rounded-xl bg-slate-100 text-xs font-bold hover:bg-slate-200">Ping</button>
                <button onClick={() => cycle(d)} className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">Set {d.status === 'online' ? 'Offline' : d.status === 'offline' ? 'Maint.' : 'Online'}</button>
                <button onClick={async () => { if (confirm('Remove device?')) { await api.del('/api/devices', { id: d.id }); load(); } }} className="px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {devices.length === 0 && <div className="col-span-full text-center text-slate-400 py-12 text-sm">No devices registered.</div>}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 flex flex-wrap items-center gap-4">
        <Cpu size={28} className="text-emerald-300" />
        <div><div className="font-bold">LoRa Gateway • agri-gw-01</div><div className="text-xs text-emerald-200/70">MQTT broker connected • 868 MHz • {devices.length} nodes joined • TLS encrypted</div></div>
        <div className="ml-auto flex gap-6 text-center">
          <div><div className="text-xl font-extrabold text-emerald-300">-71</div><div className="text-[10px] uppercase text-white/50 font-bold">RSSI dBm</div></div>
          <div><div className="text-xl font-extrabold text-emerald-300">12ms</div><div className="text-[10px] uppercase text-white/50 font-bold">Latency</div></div>
          <div><div className="text-xl font-extrabold text-emerald-300">99.8%</div><div className="text-[10px] uppercase text-white/50 font-bold">Uptime</div></div>
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg">Register Device</h3><button type="button" onClick={() => setShow(false)}><X size={18} /></button></div>
            <input required placeholder="Device name *" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })} className={inputCls}><option value="sensor_node">Sensor Node</option><option value="irrigation_valve">Irrigation Valve</option><option value="pump">Water Pump</option><option value="weather_station">Weather Station</option><option value="gateway">LoRa Gateway</option><option value="drone">Crop Drone</option></select>
              <select value={f.field_id} onChange={e => setF({ ...f, field_id: e.target.value })} className={inputCls}><option value="">No field</option>{fields.map(fl => <option key={fl.id} value={fl.id}>{fl.name}</option>)}</select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className={inputCls}><option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maint.</option></select>
              <input type="number" value={f.battery_level} onChange={e => setF({ ...f, battery_level: e.target.value })} className={inputCls} />
              <input value={f.firmware} onChange={e => setF({ ...f, firmware: e.target.value })} className={inputCls} />
            </div>
            <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm">Register</button>
          </form>
        </div>
      )}
    </div>
  );
}
