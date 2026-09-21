import { useEffect, useState } from 'react';
import { Menu, Bell, Search, CloudSun } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import Sensors from './pages/Sensors';
import Irrigation from './pages/Irrigation';
import Devices from './pages/Devices';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import { api } from './lib/api';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [q, setQ] = useState('');

  const loadUnread = async () => {
    try {
      const a = await api.get('/api/alerts?unread=true&limit=100');
      setUnread(a.length);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadUnread();
    const t = setInterval(loadUnread, 15000);
    return () => clearInterval(t);
  }, [tab]);

  return (
    <div className="min-h-screen bg-[#f1f5f4] flex text-slate-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar tab={tab} setTab={setTab} open={open} setOpen={setOpen} unread={unread} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#f1f5f4]/85 backdrop-blur border-b border-slate-200/60 px-4 sm:px-6 py-3 flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-xl bg-white border" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-72">
            <Search size={15} className="text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search sensors, fields, zones..." className="bg-transparent outline-none text-sm w-full" />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"><CloudSun size={13} /> CLOUD SYNCED • MQTT</span>
            <button onClick={() => setTab('alerts')} className="relative p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
              <Bell size={17} />
              {unread > 0 && <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{unread}</span>}
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-extrabold text-sm shadow">FM</div>
          </div>
        </header>
        <main className="flex-1">
          {tab === 'dashboard' && <Dashboard go={setTab} />}
          {tab === 'farms' && <Farms />}
          {tab === 'sensors' && <Sensors />}
          {tab === 'irrigation' && <Irrigation />}
          {tab === 'devices' && <Devices />}
          {tab === 'alerts' && <Alerts />}
          {tab === 'analytics' && <Analytics />}
        </main>
        <footer className="px-6 py-4 text-center text-[11px] text-slate-400">AgriCloud Smart Agriculture Platform • Cloud backend (Vercel + Supabase Postgres) • Frontend (React + Tailwind) • IoT via MQTT/LoRaWAN</footer>
      </div>
    </div>
  );
}
