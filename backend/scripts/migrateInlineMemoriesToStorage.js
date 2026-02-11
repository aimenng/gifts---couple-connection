import { supabase } from '../src/supabaseClient.js';
import { persistMemoryImage } from '../src/imageStorage.js';

const mapWithConcurrency = async (items, limit, worker) => {
  if (!items.length) return [];
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      // eslint-disable-next-line no-await-in-loop
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
};

const run = async () => {
  const { data: rows, error } = await supabase
    .from('memories')
    .select('id,user_id,image')
    .ilike('image', 'data:image/%');

  if (error) throw error;
  if (!rows?.length) {
    console.log('[migrate-inline-memories] no inline images found');
    return;
  }

  let converted = 0;
  let failed = 0;

  await mapWithConcurrency(rows, 3, async (row) => {
    try {
      const nextImage = await persistMemoryImage(row.image, row.user_id);
      if (!nextImage || nextImage === row.image) return;

      const { error: updateError } = await supabase
        .from('memories')
        .update({ image: nextImage })
        .eq('id', row.id);
      if (updateError) throw updateError;
      converted += 1;
    } catch (migrationError) {
      failed += 1;
      console.warn(
        `[migrate-inline-memories] failed memory ${row.id}:`,
        migrationError?.message || migrationError
      );
    }
  });

  console.log(
    `[migrate-inline-memories] done, total=${rows.length}, converted=${converted}, failed=${failed}`
  );
};

run().catch((error) => {
  console.error('[migrate-inline-memories] failed:', error?.message || error);
  process.exit(1);
});

