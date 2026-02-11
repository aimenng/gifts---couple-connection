const CLOUD_ONLY_MIGRATION_MARKER = 'gifts_cloud_only_migration_v1';

const LEGACY_LOCAL_KEYS = [
  'gifts_memories',
  'gifts_events',
  'gifts_connection',
  'gifts_auth_users',
  'gifts_auth_notifications',
  'period_tracker_data',
  'pomodoro_stats',
  'pomodoro_last_date',
];

export const cleanupLegacyLocalDataOnce = (): void => {
  try {
    const done = localStorage.getItem(CLOUD_ONLY_MIGRATION_MARKER);
    if (done === '1') return;

    LEGACY_LOCAL_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.setItem(CLOUD_ONLY_MIGRATION_MARKER, '1');
  } catch (error) {
    console.error('Failed to cleanup legacy local data:', error);
  }
};

