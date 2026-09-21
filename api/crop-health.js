import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { field_id } = req.query;
      let query = supabase.from('crop_health').select('*').order('recorded_at', { ascending: false }).limit(100);
      if (field_id) query = query.eq('field_id', field_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { field_id, ndvi, health_score, pest_risk, disease_risk, notes } = req.body;
      if (!field_id) return res.status(400).json({ error: 'field_id required' });
      const { data, error } = await supabase.from('crop_health').insert({
        field_id, ndvi, health_score, pest_risk, disease_risk, notes,
        recorded_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('crop-health api:', err);
    return res.status(500).json({ error: err.message });
  }
}
