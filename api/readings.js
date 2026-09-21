import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { sensor_id, field_id, limit } = req.query;
      let query = supabase.from('sensor_readings').select('*').order('recorded_at', { ascending: false }).limit(limit ? parseInt(limit) : 200);
      if (sensor_id) query = query.eq('sensor_id', sensor_id);
      if (field_id) query = query.eq('field_id', field_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const body = req.body;
      const rows = Array.isArray(body) ? body : [body];
      const prepared = rows.map(r => ({
        sensor_id: r.sensor_id, field_id: r.field_id, value: r.value,
        recorded_at: r.recorded_at || new Date().toISOString()
      }));
      if (prepared.some(r => !r.sensor_id || r.value === undefined)) return res.status(400).json({ error: 'sensor_id and value required' });
      const { data, error } = await supabase.from('sensor_readings').insert(prepared).select();
      if (error) throw error;
      // Update sensor last_value + auto threshold alerts
      for (const r of prepared) {
        await supabase.from('sensors').update({ last_value: r.value, last_reading_at: r.recorded_at }).eq('id', r.sensor_id);
        const { data: sensor } = await supabase.from('sensors').select('*').eq('id', r.sensor_id).single();
        if (sensor) {
          const below = sensor.min_threshold !== null && sensor.min_threshold !== undefined && Number(r.value) < Number(sensor.min_threshold);
          const above = sensor.max_threshold !== null && sensor.max_threshold !== undefined && Number(r.value) > Number(sensor.max_threshold);
          if (below || above) {
            await supabase.from('alerts').insert({
              field_id: r.field_id || sensor.field_id, sensor_id: r.sensor_id,
              type: 'threshold', severity: sensor.type === 'soil_moisture' ? 'critical' : 'warning',
              title: sensor.name + ' ' + (below ? 'below minimum' : 'above maximum') + ' threshold',
              message: sensor.name + ' recorded ' + r.value + (sensor.unit || '') + ' (' + (below ? 'below min ' + sensor.min_threshold : 'above max ' + sensor.max_threshold) + (sensor.unit || '') + ')',
              is_read: false
            });
          }
        }
      }
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('readings api:', err);
    return res.status(500).json({ error: err.message });
  }
}
