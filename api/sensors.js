import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { field_id, type, id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('sensors').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('sensors').select('*').order('id', { ascending: true });
      if (field_id) query = query.eq('field_id', field_id);
      if (type) query = query.eq('type', type);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { field_id, name, type, unit, status, battery_level, last_value, min_threshold, max_threshold } = req.body;
      if (!field_id || !name || !type) return res.status(400).json({ error: 'field_id, name, type required' });
      const { data, error } = await supabase.from('sensors').insert({
        field_id, name, type, unit, status: status || 'online',
        battery_level: battery_level ?? 100, last_value: last_value ?? 0,
        min_threshold, max_threshold, last_reading_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, last_value, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const payload = { ...rest };
      if (last_value !== undefined) { payload.last_value = last_value; payload.last_reading_at = new Date().toISOString(); }
      const { data, error } = await supabase.from('sensors').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('sensors').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('sensors api:', err);
    return res.status(500).json({ error: err.message });
  }
}
