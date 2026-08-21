import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('envelopes')
      .select('id, message, opened')
      .order('id', { ascending: true });

    if (error) throw error;

    const openedRow = data.find(row => row.opened);

    res.status(200).json({
      opened: !!openedRow,
      openedId: openedRow ? openedRow.id : null,
      message: openedRow ? openedRow.message : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load state' });
  }
}
