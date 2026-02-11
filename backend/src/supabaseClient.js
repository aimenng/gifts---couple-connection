import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetriableNetworkError = (error) => {
  const message = String(error?.message || error || '');
  if (error?.name === 'AbortError') return true;
  if (message.includes('UND_ERR_CONNECT_TIMEOUT')) return true;
  if (message.includes('Connect Timeout Error')) return true;
  if (message.includes('fetch failed')) return true;
  if (message.includes('ECONNRESET')) return true;
  return false;
};

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const robustFetch = async (url, options = {}) => {
  const method = String(options?.method || 'GET').toUpperCase();
  const isIdempotent = IDEMPOTENT_METHODS.has(method);
  const maxAttempts = isIdempotent ? config.supabaseReadMaxAttempts : config.supabaseWriteMaxAttempts;
  const timeoutMs = isIdempotent ? config.supabaseReadTimeoutMs : config.supabaseWriteTimeoutMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const externalSignal = options.signal;
    const onAbort = () => controller.abort();

    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener('abort', onAbort, { once: true });
    }

    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (error) {
      if (attempt === maxAttempts || !isRetriableNetworkError(error)) {
        throw error;
      }
      await sleep(250 * attempt);
    } finally {
      clearTimeout(timeout);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onAbort);
      }
    }
  }

  throw new Error('Unexpected fetch retry state');
};

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: robustFetch,
  },
});
