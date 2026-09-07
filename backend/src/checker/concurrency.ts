/**
 * Runs `items` through `worker` with at most `limit` running concurrently.
 * This is the piece that maps directly to the non-blocking connection
 * handling from the C++ web server project: many in-flight operations,
 * none of them blocking the others, bounded so we don't open thousands
 * of sockets at once.
 */
export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    const current = nextIndex++;
    if (current >= items.length) return;
    results[current] = await worker(items[current]);
    return runNext();
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => runNext());
  await Promise.all(workers);
  return results;
}
