import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => 'auth/me',
    }),
  }),
});

export const { useGetMeQuery } = authApi;
