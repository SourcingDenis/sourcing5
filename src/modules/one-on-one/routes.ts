export const oneOnOneRoutes = {
  root:   '/one-on-one',
  detail: (id: string) => `/one-on-one/${id}`,
  agenda: (id: string) => `/one-on-one/${id}/agenda`,

  api: {
    list:        '/api/one-on-one',
    detail:      (id: string) => `/api/one-on-one/${id}`,
    complete:    (id: string) => `/api/one-on-one/${id}/complete`,
    agenda:      (id: string) => `/api/one-on-one/${id}/agenda`,
    dashboard:   '/api/one-on-one/dashboard',
    actionItems: '/api/one-on-one/action-items',
    actionItem:  (id: string) => `/api/one-on-one/action-items/${id}`,
  },
};
