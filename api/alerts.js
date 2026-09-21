import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { unread, limit, severity } = req.query;
      let query = supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(limit ? parseInt(limit) : 100);
      if (unread === 'true') query = query.eq('is_read', false);
      if (severity) query = query.eq('severity', severity);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { field_id, sensor_id, type, severity, title, message } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });
      const { data, error } = await supabase.from('alerts').insert({
        field_id, sensor_id, type: type || 'system', severity: severity || 'info',
        title, message, is_read: false
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, is_read, mark_all } = req.body;
      if (mark_all) {
        const { error } = await supabase.from('alerts').update({ is_read: true }).eq('is_read', false);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from('alerts').update({ is_read }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id, clear_read } = req.body;
      if (clear_read) {
        const { error } = await supabase.from('alerts').delete().eq('is_read', true);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('alerts').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('alerts api:', err);
    return res.status(500).json({ error: err.message });
  }
}
