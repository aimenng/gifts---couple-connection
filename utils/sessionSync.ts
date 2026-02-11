export const SESSION_SYNC_EVENT = 'gifts-session-sync';

export const triggerSessionSync = (): void => {
  window.dispatchEvent(new Event(SESSION_SYNC_EVENT));
};

export const onSessionSync = (handler: () => void): (() => void) => {
  window.addEventListener(SESSION_SYNC_EVENT, handler);
  return () => window.removeEventListener(SESSION_SYNC_EVENT, handler);
};
