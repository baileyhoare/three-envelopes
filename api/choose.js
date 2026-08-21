const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let id;
  try {
    const body = JSON.parse(event.body);
    id = Number(body.id);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (![1, 2, 3].includes(id)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid envelope id' }) };
  }

  try {
    // Has ANY envelope already been opened? Check first.
    const { data: existing, error: checkError } = await supabase
      .from('envelopes')
      .select('id, opened, message')
      .eq('opened', true)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Already locked in — return the one that was actually chosen,
      // regardless of which button this request clicked.
      return {
        statusCode: 200,
        body: JSON.stringify({
          opened: true,
          openedId: existing.id,
          message: existing.message
        })
      };
    }

    // Nothing opened yet — attempt to claim this one.
    // The WHERE opened=false clause makes this safe even if two
    // requests arrive at nearly the same time.
    const { data: updated, error: updateError } = await supabase
      .from('envelopes')
      .update({ opened: true, opened_at: new Date().toISOString() })
      .eq('id', id)
      .eq('opened', false)
      .select('id, message')
      .single();

    if (updateError || !updated) {
      // Someone else claimed an envelope in the same instant.
      // Re-fetch whichever one won.
      const { data: winner } = await supabase
        .from('envelopes')
        .select('id, message')
        .eq('opened', true)
        .single();

      return {
        statusCode: 200,
        body: JSON.stringify({
          opened: true,
          openedId: winner.id,
          message: winner.message
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        opened: true,
        openedId: updated.id,
        message: updated.message
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
