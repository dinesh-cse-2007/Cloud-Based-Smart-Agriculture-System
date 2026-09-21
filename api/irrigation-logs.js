import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { zone_id, limit } = req.query;
      let query = supabase.from('irrigation_logs').select('*').order('started_at', { ascending: false }).limit(limit ? parseInt(limit) : 100);
      if (zone_id) query = query.eq('zone_id', zone_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { zone_id, action, duration_minutes, water_used_liters, triggered_by, status } = req.body;
      if (!zone_id) return res.status(400).json({ error: 'zone_id required' });
      const now = new Date();
      const dur = duration_minutes || 15;
      const end = new Date(now.getTime() + dur * 60000);
      const { data, error } = await supabase.from('irrigation_logs').insert({
        zone_id, action: action || 'irrigate', duration_minutes: dur,
        water_used_liters: water_used_liters || 0, triggered_by: triggered_by || 'manual',
        started_at: now.toISOString(), ended_at: end.toISOString(), status: status || 'completed'
      }).select().single();
      if (error) throw error;
      await supabase.from('irrigation_zones').update({ last_irrigated: now.toISOString() }).eq('id', zone_id);
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('logs api:', err);
    return res.status(500).json({ error: err.message });
  }
}
