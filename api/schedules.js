import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { zone_id } = req.query;
      let query = supabase.from('irrigation_schedules').select('*').order('id', { ascending: true });
      if (zone_id) query = query.eq('zone_id', zone_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { zone_id, name, days, start_time, duration_minutes, enabled } = req.body;
      if (!zone_id || !name) return res.status(400).json({ error: 'zone_id and name required' });
      const { data, error } = await supabase.from('irrigation_schedules').insert({
        zone_id, name, days, start_time, duration_minutes: duration_minutes || 20, enabled: enabled ?? true
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from('irrigation_schedules').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('irrigation_schedules').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('schedules api:', err);
    return res.status(500).json({ error: err.message });
  }
}
