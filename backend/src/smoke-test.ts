/**
 * Standalone proof that the concurrent, non-blocking check logic works,
 * without depending on a generated Prisma client. Run with: npm run smoke
 */
import axios from 'axios';
import { runWithConcurrencyLimit } from './checker/concurrency';

type Status = 'UP' | 'DOWN';

async function checkOne(url: string, timeoutMs = 5000) {
  const startedAt = Date.now();
  try {
    const res = await axios.get(url, { timeout: timeoutMs, validateStatus: () => true });
    const responseMs = Date.now() - startedAt;
    const status: Status = res.status >= 200 && res.status < 400 ? 'UP' : 'DOWN';
    return { url, status, statusCode: res.status, responseMs };
  } catch (err: any) {
    const responseMs = Date.now() - startedAt;
    return { url, status: 'DOWN' as Status, error: err.code || err.message, responseMs };
  }
}

async function main() {
  const targets = [
    'https://api.github.com',
    'https://registry.npmjs.org',
    'https://this-domain-should-not-resolve-12345.invalid',
  ];

  console.log(`Checking ${targets.length} targets concurrently (limit 20)...\n`);
  const startedAt = Date.now();

  const results = await runWithConcurrencyLimit(targets, 20, (url) => checkOne(url));

  const totalMs = Date.now() - startedAt;
  results.forEach((r) => console.log(r));
  console.log(`\nDone in ${totalMs}ms for ${targets.length} targets.`);
}

main();
