export const funnelRoutes = {
  root:     '/funnel',
  overview: '/funnel',
  settings: '/settings',
  api: {
    metrics:   '/api/funnel/metrics',
    metricsId: (id: string) => `/api/funnel/metrics/${id}`,
    summary:   '/api/funnel/summary',
    trend:     '/api/funnel/trend',
    sync:      '/api/ashby/sync',
    settings:  '/api/settings',
    settingKey: (key: string) => `/api/settings/${key}`,
  },
};
