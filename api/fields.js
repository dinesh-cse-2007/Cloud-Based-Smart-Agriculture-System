import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { farm_id, id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('fields').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('fields').select('*').order('id', { ascending: true });
      if (farm_id) query = query.eq('farm_id', farm_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { farm_id, name, crop_type, area, growth_stage, planting_date, expected_harvest, status, soil_type } = req.body;
      if (!farm_id || !name) return res.status(400).json({ error: 'farm_id and name required' });
      const { data, error } = await supabase.from('fields').insert({ farm_id, name, crop_type, area, growth_stage, planting_date, expected_harvest, status, soil_type }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from('fields').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('fields').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('fields api:', err);
    return res.status(500).json({ error: err.message });
  }
}
