import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Radio, Droplets, Bell, Cpu, Thermometer, CloudSun, Wind, CloudRain, RefreshCw, Zap, Play } from 'lucide-react';
import { api, timeAgo, fmt } from '../lib/api';
import StatCard from '../components/StatCard';
import { Sparkline, BarChart, Gauge } from '../components/Charts';

export default function Dashboard({ go }: any) {
  const [a, setA] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<any[]>([]);
  const [weather, setWeather] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);

  const load = async () => {
    try {
      const [an, sn, w, z, f] = await Promise.all([
        api.get('/api/analytics'),
        api.get('/api/sensors'),
        api.get('/api/weather?limit=1'),
        api.get('/api/irrigation-zones'),
        api.get('/api/fields')
      ]);
      setA(an); setSensors(sn); setWeather(w); setZones(z); setFields(f);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const simulate = async () => {
    setSimulating(true);
    try {
      const online = sensors.filter(s => s.status === 'online');
      const rows = online.map(s => {
        const base = Number(s.last_value) || 50;
        const jitter = (Math.random() - 0.5) * (s.type === 'temperature' ? 2 : s.type === 'ph' ? 0.3 : 8);
        let v = Math.round((base + jitter) * 10) / 10;
        if (s.type === 'soil_moisture') v = Math.min(100, Math.max(5, v));
        if (s.type === 'ph') v = Math.min(9, Math.max(4, v));
        return { sensor_id: s.id, field_id: s.field_id, value: v };
      });
      if (rows.length) await api.post('/api/readings', rows);
      await load();
    } catch (e) { alert('Simulation failed'); }
    finally { setSimulating(false); }
  };

  if (loading && !a) return <div className="p-8 grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-32 rounded-2xl bg-white animate-pulse border border-slate-100" />)}</div>;

  const w = weather[0] || {};
  const moistureVals = (a?.moistureTrend || []).map((x: any) => x.v);
  const tempVals = (a?.tempTrend || []).map((x: any) => x.v);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farm Command Center</h1>
          <p className="text-sm text-slate-500">Real-time cloud telemetry from your fields • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setLoading(true); load(); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw size={15} /> Refresh</button>
          <button onClick={simulate} disabled={simulating} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 hover:opacity-90 disabled:opacity-60"><Zap size={15} /> {simulating ? 'Streaming...' : 'Simulate Live IoT Stream'}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Sprout} label="Fields Monitored" value={a?.counts.fields ?? 0} sub={`${a?.counts.farms ?? 0} farms connected`} gradient="from-emerald-400 to-green-600" delay={0} />
        <StatCard icon={Radio} label="Sensors Online" value={`${a?.onlineSensors ?? 0}/${a?.counts.sensors ?? 0}`} sub={`Avg soil moisture ${fmt(a?.avgMoisture)}%`} gradient="from-sky-400 to-blue-600" delay={1} />
        <StatCard icon={Droplets} label="Water Used Today" value={`${a?.waterToday ?? 0} L`} sub={`Total ${a?.waterTotal ?? 0} L this week`} gradient="from-cyan-400 to-teal-600" delay={2} />
        <StatCard icon={Bell} label="Active Alerts" value={a?.unreadAlerts ?? 0} sub={`${a?.onlineDevices ?? 0}/${a?.counts.devices ?? 0} devices online`} gradient="from-amber-400 to-orange-600" delay={3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-[#0b1f16] via-[#123524] to-[#0b3b2e] text-white p-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/10" />
          <div className="absolute right-16 top-6 w-24 h-24 rounded-full bg-teal-300/10" />
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest"><CloudSun size={15} /> Field Weather Station</div>
          <div className="mt-3 flex items-end gap-3"><span className="text-5xl font-extrabold">{fmt(w.temperature ?? a?.avgTemp ?? 24)}</span><span className="text-xl text-emerald-200 mb-1.5">°C • {w.condition || 'Sunny'}</span></div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/10 p-3"><div className="flex items-center gap-1.5 text-[11px] text-emerald-200/80 font-semibold"><Thermometer size={12} />HUMIDITY</div><div className="text-lg font-bold">{fmt(w.humidity ?? 62, 0)}%</div></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="flex items-center gap-1.5 text-[11px] text-emerald-200/80 font-semibold"><CloudRain size={12} />RAIN</div><div className="text-lg font-bold">{fmt(w.rainfall ?? 0)}mm</div></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="flex items-center gap-1.5 text-[11px] text-emerald-200/80 font-semibold"><Wind size={12} />WIND</div><div className="text-lg font-bold">{fmt(w.wind_speed ?? 8)}km/h</div></div>
          </div>
          <div className="mt-4 text-xs text-emerald-100/70 bg-white/5 rounded-xl p-3 border border-white/10">Irrigation advisory: soil moisture at {fmt(a?.avgMoisture)}% — {(a?.avgMoisture ?? 50) < 30 ? 'start irrigation soon.' : (a?.avgMoisture ?? 50) > 65 ? 'skip irrigation, soil is moist.' : 'conditions optimal, auto-mode will maintain levels.'}</div>
        </motion.div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">Soil Moisture Trend</h3><button onClick={() => go('sensors')} className="text-xs font-bold text-emerald-600 hover:underline">View all</button></div>
          <div className="mt-2 flex justify-center"><Gauge value={fmt(a?.avgMoisture ?? 0)} label="Field Average" unit="%" color={(a?.avgMoisture ?? 50) < 30 ? '#ef4444' : '#10b981'} /></div>
          <div className="mt-1 flex justify-center"><Sparkline data={moistureVals} w={220} h={44} /></div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">Water Usage (7 days)</h3><button onClick={() => go('analytics')} className="text-xs font-bold text-emerald-600 hover:underline">Analytics</button></div>
          <div className="mt-3"><BarChart data={a?.waterByDay || []} /></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-slate-900">Live Sensor Network</h3><button onClick={() => go('sensors')} className="text-xs font-bold text-emerald-600 hover:underline">Manage sensors</button></div>
          <div className="grid sm:grid-cols-2 gap-3">
            {sensors.slice(0, 6).map(s => (
              <div key={s.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${s.status === 'online' ? 'bg-gradient-to-br from-emerald-400 to-green-600' : 'bg-slate-300'}`}><Radio size={16} /></div>
                <div className="min-w-0 flex-1"><div className="text-sm font-bold text-slate-800 truncate">{s.name}</div><div className="text-[11px] text-slate-400 capitalize">{String(s.type).replace('_', ' ')} • {timeAgo(s.last_reading_at)}</div></div>
                <div className="text-right"><div className="text-base font-extrabold text-slate-900">{fmt(s.last_value)}{s.unit}</div><div className={`text-[10px] font-bold uppercase ${s.status === 'online' ? 'text-emerald-500' : 'text-slate-400'}`}>{s.status}</div></div>
              </div>
            ))}
          </div>
          {sensors.length === 0 && <div className="text-sm text-slate-400 text-center py-6">No sensors yet — add one in Sensor Network.</div>}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-slate-900">Irrigation Zones</h3><button onClick={() => go('irrigation')} className="text-xs font-bold text-emerald-600 hover:underline">Control</button></div>
            <div className="space-y-2.5">
              {zones.slice(0, 4).map(z => (
                <div key={z.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${z.valve_status === 'open' ? 'bg-gradient-to-br from-sky-400 to-blue-600' : 'bg-slate-300'}`}><Droplets size={15} /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">{z.name}</div><div className="text-[11px] text-slate-400 capitalize">{z.mode} • {z.flow_rate} L/min</div></div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${z.valve_status === 'open' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-500'}`}>{z.valve_status}</span>
                </div>
              ))}
              {zones.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No zones configured.</div>}
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-slate-900">Recent Alerts</h3><button onClick={() => go('alerts')} className="text-xs font-bold text-emerald-600 hover:underline">View all</button></div>
            <div className="space-y-2">
              {(a?.recentAlerts || []).slice(0, 4).map((al: any) => (
                <div key={al.id} className="flex gap-2.5 items-start rounded-xl bg-slate-50 p-2.5">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${al.severity === 'critical' ? 'bg-red-500' : al.severity === 'warning' ? 'bg-amber-500' : 'bg-sky-500'}`} />
                  <div className="min-w-0"><div className="text-[13px] font-bold text-slate-800 truncate">{al.title}</div><div className="text-[11px] text-slate-400">{timeAgo(al.created_at)}</div></div>
                </div>
              ))}
              {(!a?.recentAlerts || a.recentAlerts.length === 0) && <div className="text-sm text-slate-400 text-center py-4">All clear — no alerts.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-slate-900">Fields Overview</h3><button onClick={() => go('farms')} className="text-xs font-bold text-emerald-600 hover:underline">Manage fields</button></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fields.slice(0, 4).map((f: any) => (
            <div key={f.id} className="rounded-xl overflow-hidden border border-slate-100">
              <div className="h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 relative">
                <Sprout className="absolute right-3 bottom-2 text-white/30" size={40} />
                <span className="absolute left-3 top-2.5 text-[10px] font-bold bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded-full uppercase">{f.status || 'active'}</span>
              </div>
              <div className="p-3"><div className="font-bold text-sm text-slate-900">{f.name}</div><div className="text-xs text-slate-500">{f.crop_type} • {f.area} ha • {f.growth_stage}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 flex items-center gap-3 text-sm text-slate-500">
        <Cpu size={16} className="shrink-0" /> Temperature trend (live):
        <Sparkline data={tempVals} color="#f59e0b" w={200} h={30} />
        <span className="ml-auto hidden sm:flex items-center gap-1.5 text-xs font-semibold"><Play size={13} /> Auto-refresh every 30s • Cloud sync active</span>
      </div>
    </div>
  );
}
