import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const [farms, fields, sensors, devices, alerts, logs, readings] = await Promise.all([
      supabase.from('farms').select('*'),
      supabase.from('fields').select('*'),
      supabase.from('sensors').select('*'),
      supabase.from('devices').select('*'),
      supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('irrigation_logs').select('*').order('started_at', { ascending: false }).limit(100),
      supabase.from('sensor_readings').select('*').order('recorded_at', { ascending: false }).limit(300)
    ]);
    const s = sensors.data || [];
    const onlineSensors = s.filter(x => x.status === 'online').length;
    const avgOf = (type) => {
      const m = s.filter(x => x.type === type);
      if (!m.length) return 0;
      return Math.round((m.reduce((a, b) => a + Number(b.last_value || 0), 0) / m.length) * 10) / 10;
    };
    const d = devices.data || [];
    const onlineDevices = d.filter(x => x.status === 'online').length;
    const unreadAlerts = (alerts.data || []).filter(a => !a.is_read).length;
    const today = new Date().toISOString().slice(0, 10);
    const allLogs = logs.data || [];
    const waterToday = allLogs.filter(l => (l.started_at || '').slice(0, 10) === today).reduce((a, b) => a + Number(b.water_used_liters || 0), 0);
    const waterTotal = allLogs.reduce((a, b) => a + Number(b.water_used_liters || 0), 0);
    const last7 = [...Array(7)].map((_, i) => {
      const dt = new Date(Date.now() - (6 - i) * 86400000);
      return dt.toISOString().slice(0, 10);
    });
    const waterByDay = last7.map(day => ({
      day: day.slice(5),
      liters: Math.round(allLogs.filter(l => (l.started_at || '').slice(0, 10) === day).reduce((a, b) => a + Number(b.water_used_liters || 0), 0))
    }));
    const allReadings = readings.data || [];
    const trendFor = (type) => allReadings
      .filter(r => { const sen = s.find(x => x.id === r.sensor_id); return sen && sen.type === type; })
      .slice(0, 40).reverse()
      .map(r => ({ t: (r.recorded_at || '').slice(11, 16), v: Number(r.value) }));
    return res.status(200).json({
      counts: {
        farms: (farms.data || []).length,
        fields: (fields.data || []).length,
        sensors: s.length,
        devices: d.length
      },
      onlineSensors, onlineDevices,
      avgMoisture: avgOf('soil_moisture'), avgTemp: avgOf('temperature'),
      unreadAlerts,
      waterToday: Math.round(waterToday), waterTotal: Math.round(waterTotal),
      waterByDay,
      moistureTrend: trendFor('soil_moisture'),
      tempTrend: trendFor('temperature'),
      recentAlerts: alerts.data || [],
      recentLogs: allLogs.slice(0, 8)
    });
  } catch (err) {
    console.error('analytics api:', err);
    return res.status(500).json({ error: err.message });
  }
}
