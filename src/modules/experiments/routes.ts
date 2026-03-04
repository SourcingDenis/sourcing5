export const experimentsRoutes = {
  root:   '/experiments',
  detail: (id: string) => `/experiments/${id}`,
  api: {
    list:     '/api/experiments',
    detail:   (id: string) => `/api/experiments/${id}`,
    variants: (id: string) => `/api/experiments/${id}/variants`,
    results:  (id: string) => `/api/experiments/${id}/results`,
  },
};
