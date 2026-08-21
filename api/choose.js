import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const id = Number(body && body.id);

    if (![1, 2, 3].includes(id)) {
      res.status(400).json({ error: 'Invalid envelope id' });
      return;
    }

    const { data: existing, error: fetchError } = await supabase
      .from('envelopes')
      .select('id, message, opened')
      .order('id', { ascending: true });

    if (fetchError) throw fetchError;

    const alreadyOpened = existing.find(row => row.opened);

    if (alreadyOpened) {
      res.status(200).json({
        opened: true,
        openedId: alreadyOpened.id,
        message: alreadyOpened.message
      });
      return;
    }

    const { data: updated, error: updateError } = await supabase
      .from('envelopes')
      .update({ opened: true, opened_at: new Date().toISOString() })
      .eq('id', id)
      .eq('opened', false)
      .select('id, message, opened')
      .single();

    if (updateError || !updated) {
      const { data: finalState } = await supabase
        .from('envelopes')
        .select('id, message, opened')
        .order('id', { ascending: true });
      const openedRow = finalState.find(row => row.opened);
      res.status(200).json({
        opened: !!openedRow,
        openedId: openedRow ? openedRow.id : null,
        message: openedRow ? openedRow.message : null
      });
      return;
    }

    res.status(200).json({
      opened: true,
      openedId: updated.id,
      message: updated.message
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to choose envelope' });
  }
}
