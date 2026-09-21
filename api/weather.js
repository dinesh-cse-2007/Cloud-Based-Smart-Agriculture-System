import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { farm_id, limit } = req.query;
      let query = supabase.from('weather_logs').select('*').order('recorded_at', { ascending: false }).limit(limit ? parseInt(limit) : 24);
      if (farm_id) query = query.eq('farm_id', farm_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { farm_id, temperature, humidity, rainfall, wind_speed, condition } = req.body;
      if (!farm_id) return res.status(400).json({ error: 'farm_id required' });
      const { data, error } = await supabase.from('weather_logs').insert({
        farm_id, temperature, humidity, rainfall, wind_speed, condition,
        recorded_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('weather api:', err);
    return res.status(500).json({ error: err.message });
  }
}
