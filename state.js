const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function (event) {
  try {
    const { data, error } = await supabase
      .from('envelopes')
      .select('id, opened')
      .order('id', { ascending: true });

    if (error) throw error;

    const openedRow = data.find(row => row.opened);

    if (!openedRow) {
      return {
        statusCode: 200,
        body: JSON.stringify({ opened: false, openedId: null, message: null })
      };
    }

    // Fetch the message only for the opened envelope
    const { data: fullRow, error: msgError } = await supabase
      .from('envelopes')
      .select('message')
      .eq('id', openedRow.id)
      .single();

    if (msgError) throw msgError;

    return {
      statusCode: 200,
      body: JSON.stringify({
        opened: true,
        openedId: openedRow.id,
        message: fullRow.message
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
