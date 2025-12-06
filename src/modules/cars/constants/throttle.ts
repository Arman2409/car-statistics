export const THROTTLE_SETTINGS = {
  DEFAULT: {
    name: 'default',
    ttl: 60000, // 1 minute
    limit: 100,
  },
  FIND_ALL: {
    default: {
      limit: 50,
      ttl: 60000,
    },
  },
  STATS: {
    default: {
      limit: 50,
      ttl: 60000,
    },
  },
} as const;
