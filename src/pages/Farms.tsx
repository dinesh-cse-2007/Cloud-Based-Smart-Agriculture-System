import { useEffect, useState } from 'react';
import { Plus, Sprout, MapPin, Trash2, Pencil, X, Wheat } from 'lucide-react';
import { api } from '../lib/api';

const stages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvested'];

export default function Farms() {
  const [farms, setFarms] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFarm, setShowFarm] = useState(false);
  const [showField, setShowField] = useState(false);
  const [editFarm, setEditFarm] = useState<any>(null);
  const [editField, setEditField] = useState<any>(null);
  const [ff, setFf] = useState({ name: '', location: '', total_area: '', owner: '', description: '' });
  const [fi, setFi] = useState({ farm_id: '', name: '', crop_type: '', area: '', growth_stage: 'Vegetative', planting_date: '', expected_harvest: '', status: 'active', soil_type: 'Loamy' });
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([api.get('/api/farms'), api.get('/api/fields')]);
      setFarms(a); setFields(b);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const saveFarm = async (e: any) => {
    e.preventDefault();
    try {
      if (editFarm) await api.put('/api/farms', { id: editFarm.id, ...ff, total_area: Number(ff.total_area) || null });
      else await api.post('/api/farms', { ...ff, total_area: Number(ff.total_area) || null });
      setShowFarm(false); setEditFarm(null);
      setFf({ name: '', location: '', total_area: '', owner: '', description: '' });
      load();
    } catch (e: any) { setErr(e.message); }
  };

  const saveField = async (e: any) => {
    e.preventDefault();
    try {
      const p: any = { ...fi, farm_id: Number(fi.farm_id), area: Number(fi.area) || null };
      if (editField) await api.put('/api/fields', { id: editField.id, ...p });
      else await api.post('/api/fields', p);
      setShowField(false); setEditField(null);
      setFi({ farm_id: '', name: '', crop_type: '', area: '', growth_stage: 'Vegetative', planting_date: '', expected_harvest: '', status: 'active', soil_type: 'Loamy' });
      load();
    } catch (e: any) { setErr(e.message); }
  };

  if (loading) return <div className="p-6 grid sm:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-2xl bg-white animate-pulse border" />)}</div>;

  const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="p-4 sm:p-6 max-w-[1300px] mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Farms & Fields</h1><p className="text-sm text-slate-500">Manage farm sites, crop plots and growth stages</p></div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setEditFarm(null); setFf({ name: '', location: '', total_area: '', owner: '', description: '' }); setShowFarm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border text-sm font-bold text-slate-700 hover:bg-slate-50"><Plus size={15} /> New Farm</button>
          <button onClick={() => { setEditField(null); setShowField(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25"><Plus size={15} /> New Field</button>
        </div>
      </div>
      {err && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {farms.map(f => (
          <div key={f.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 relative p-4">
              <Wheat className="absolute right-4 bottom-3 text-white/25" size={44} />
              <div className="text-white font-extrabold text-lg">{f.name}</div>
              <div className="flex items-center gap-1 text-emerald-100 text-xs"><MapPin size={12} />{f.location || '—'} • {f.total_area || 0} ha</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-slate-500 font-medium">Owner: {f.owner || '—'}</div>
              <div className="text-[13px] text-slate-500 mt-1 line-clamp-2">{f.description || 'No description'}</div>
              <div className="mt-2 text-xs font-bold text-emerald-700">{fields.filter(x => x.farm_id === f.id).length} fields</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { setEditFarm(f); setFf({ name: f.name || '', location: f.location || '', total_area: String(f.total_area || ''), owner: f.owner || '', description: f.description || '' }); setShowFarm(true); }} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg bg-slate-100 hover:bg-slate-200"><Pencil size={13} />Edit</button>
                <button onClick={async () => { if (confirm('Delete farm?')) { await api.del('/api/farms', { id: f.id }); load(); } }} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={13} />Delete</button>
              </div>
            </div>
          </div>
        ))}
        {farms.length === 0 && <div className="col-span-full text-center text-slate-400 py-10 text-sm">No farms yet. Create your first farm site.</div>}
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2"><Sprout size={17} className="text-emerald-600" /><h3 className="font-bold text-slate-900">All Fields / Crop Plots</h3><span className="ml-auto text-xs font-bold text-slate-400">{fields.length} plots</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100"><th className="px-5 py-3">Field</th><th className="px-4 py-3">Farm</th><th className="px-4 py-3">Crop</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Growth Stage</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {fields.map(fl => {
                const fm = farms.find(f => f.id === fl.farm_id);
                return (
                  <tr key={fl.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-bold text-slate-800">{fl.name}</td>
                    <td className="px-4 py-3 text-slate-500">{fm?.name || '#' + fl.farm_id}</td>
                    <td className="px-4 py-3 text-slate-600">{fl.crop_type || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{fl.area} ha</td>
                    <td className="px-4 py-3"><span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{fl.growth_stage || '—'}</span></td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-bold px-2 py-1 rounded-full uppercase ${fl.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>{fl.status}</span></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => { setEditField(fl); setFi({ farm_id: String(fl.farm_id), name: fl.name || '', crop_type: fl.crop_type || '', area: String(fl.area || ''), growth_stage: fl.growth_stage || 'Vegetative', planting_date: fl.planting_date || '', expected_harvest: fl.expected_harvest || '', status: fl.status || 'active', soil_type: fl.soil_type || 'Loamy' }); setShowField(true); }} className="text-xs font-bold text-emerald-600 hover:underline mr-3">Edit</button>
                      <button onClick={async () => { if (confirm('Delete field?')) { await api.del('/api/fields', { id: fl.id }); load(); } }} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showFarm && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <form onSubmit={saveFarm} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg">{editFarm ? 'Edit Farm' : 'New Farm'}</h3><button type="button" onClick={() => setShowFarm(false)}><X size={18} /></button></div>
            <input required placeholder="Farm name *" value={ff.name} onChange={e => setFf({ ...ff, name: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Location" value={ff.location} onChange={e => setFf({ ...ff, location: e.target.value })} className={inputCls} />
              <input placeholder="Total area (ha)" type="number" step="0.1" value={ff.total_area} onChange={e => setFf({ ...ff, total_area: e.target.value })} className={inputCls} />
            </div>
            <input placeholder="Owner" value={ff.owner} onChange={e => setFf({ ...ff, owner: e.target.value })} className={inputCls} />
            <textarea placeholder="Description" value={ff.description} onChange={e => setFf({ ...ff, description: e.target.value })} rows={3} className={inputCls} />
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm">{editFarm ? 'Save Changes' : 'Create Farm'}</button>
          </form>
        </div>
      )}

      {showField && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <form onSubmit={saveField} className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between"><h3 className="font-extrabold text-lg">{editField ? 'Edit Field' : 'New Field'}</h3><button type="button" onClick={() => setShowField(false)}><X size={18} /></button></div>
            <select required value={fi.farm_id} onChange={e => setFi({ ...fi, farm_id: e.target.value })} className={inputCls}><option value="">Select farm *</option>{farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Field name *" value={fi.name} onChange={e => setFi({ ...fi, name: e.target.value })} className={inputCls} />
              <input placeholder="Crop type (e.g. Wheat)" value={fi.crop_type} onChange={e => setFi({ ...fi, crop_type: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Area (ha)" type="number" step="0.1" value={fi.area} onChange={e => setFi({ ...fi, area: e.target.value })} className={inputCls} />
              <select value={fi.growth_stage} onChange={e => setFi({ ...fi, growth_stage: e.target.value })} className={inputCls}>{stages.map(s => <option key={s}>{s}</option>)}</select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={fi.planting_date} onChange={e => setFi({ ...fi, planting_date: e.target.value })} className={inputCls} />
              <input type="date" value={fi.expected_harvest} onChange={e => setFi({ ...fi, expected_harvest: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={fi.status} onChange={e => setFi({ ...fi, status: e.target.value })} className={inputCls}><option value="active">Active</option><option value="fallow">Fallow</option><option value="harvested">Harvested</option></select>
              <select value={fi.soil_type} onChange={e => setFi({ ...fi, soil_type: e.target.value })} className={inputCls}><option>Loamy</option><option>Sandy</option><option>Clay</option><option>Silt</option><option>Black</option></select>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm">{editField ? 'Save Changes' : 'Create Field'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
