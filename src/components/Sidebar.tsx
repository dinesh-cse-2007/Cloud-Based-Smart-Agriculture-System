import { LayoutDashboard, Sprout, Radio, Droplets, Cpu, Bell, BarChart3, CloudSun, X } from 'lucide-react';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'farms', label: 'Farms & Fields', icon: Sprout },
  { id: 'sensors', label: 'Sensor Network', icon: Radio },
  { id: 'irrigation', label: 'Irrigation', icon: Droplets },
  { id: 'devices', label: 'Devices', icon: Cpu },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ tab, setTab, open, setOpen, unread }: any) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed z-50 lg:static inset-y-0 left-0 w-64 shrink-0 bg-[#0b1f16] text-white flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CloudSun size={24} />
          </div>
          <div>
            <div className="font-extrabold text-lg leading-tight tracking-tight">AgriCloud</div>
            <div className="text-[11px] text-emerald-300/80 font-medium tracking-widest uppercase">Smart Agriculture</div>
          </div>
          <button className="ml-auto lg:hidden text-white/60" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <div className="mx-5 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20 px-3 py-2.5 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-200">Cloud Connected • Live</span>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map(it => {
            const Icon = it.icon;
            const active = tab === it.id;
            return (
              <button key={it.id} onClick={() => { setTab(it.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-600/30' : 'text-emerald-100/60 hover:text-white hover:bg-white/5'}`}>
                <Icon size={18} />{it.label}
                {it.id === 'alerts' && unread > 0 && (
                  <span className="ml-auto text-[11px] font-bold bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">{unread}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="m-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/20 p-4">
          <div className="text-xs font-bold text-emerald-200 uppercase tracking-wide">System Health</div>
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-100/70"><span>Uptime</span><span className="font-bold text-white">99.8%</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[99%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" /></div>
          <div className="mt-2 text-[11px] text-emerald-100/50">MQTT • LoRaWAN • 4G synced</div>
        </div>
      </aside>
    </>
  );
}
