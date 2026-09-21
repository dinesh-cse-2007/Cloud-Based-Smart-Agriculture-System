import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, gradient, delay = 0 }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay * 0.06 }}
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-15 bg-gradient-to-br ${gradient}`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md`}><Icon size={19} /></div>
      <div className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
      <div className="text-[13px] font-semibold text-slate-500">{label}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </motion.div>
  );
}
