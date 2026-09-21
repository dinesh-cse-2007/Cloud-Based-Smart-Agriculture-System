import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { field_id } = req.query;
      let query = supabase.from('irrigation_zones').select('*').order('id', { ascending: true });
      if (field_id) query = query.eq('field_id', field_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { field_id, name, valve_status, mode, flow_rate, area_covered } = req.body;
      if (!field_id || !name) return res.status(400).json({ error: 'field_id and name required' });
      const { data, error } = await supabase.from('irrigation_zones').insert({
        field_id, name, valve_status: valve_status || 'closed', mode: mode || 'auto',
        flow_rate: flow_rate ?? 12, area_covered
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from('irrigation_zones').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('irrigation_zones').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('zones api:', err);
    return res.status(500).json({ error: err.message });
  }
}
