import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  prepareHeaders: (headers, { getState }) => {
    const accessToken = localStorage.getItem("accessToken");
    const adminAuthState = localStorage.getItem("adminAuthState");
    const vendorAccessToken = localStorage.getItem("vendor_access_token");

    const adminAccessToken =
      adminAuthState && JSON.parse(adminAuthState).token;

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (adminAccessToken) {
      headers.set("Admin-Authorization", `Bearer ${adminAccessToken}`);
    }
    if (vendorAccessToken) {
      headers.set("Student-Authorization", `Bearer ${vendorAccessToken}`);
    }

    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  const { userAuth, auth } = api.getState();
  const { refreshToken, tokenRefreshing } = userAuth;

  if (result.error?.status === 401) {
    const isAdminRequest =
      (typeof args.url === "string" && args.url.startsWith("/admin")) ||
      result.error?.data?.error?.includes("admin");

    const refreshTokenToUse = isAdminRequest ? adminRefreshToken : refreshToken;
    const refreshEndpoint = isAdminRequest
      ? "/admin/refreshtoken"
      : "/user/refreshtoken";
    const updateTokensAction = isAdminRequest
      ? updateAdminTokens
      : updateTokens;
    const logoutAction = isAdminRequest ? logoutAdmin : logout;

    if (tokenRefreshing) {
      return new Promise((resolve) => {
        const checkRefresh = setInterval(async () => {
          if (!api.getState().userAuth.tokenRefreshing) {
            clearInterval(checkRefresh);
            resolve(await baseQuery(args, api, extraOptions));
          }
        }, 100);
      });
    }

    api.dispatch(setTokenRefreshing(true));
    try {
      const refreshResult = await baseQuery(
        {
          url: refreshEndpoint,
          method: "POST",
          body: { refreshToken: refreshTokenToUse },
        },
        api,
        extraOptions
      );

      if (refreshResult.data?.success) {
        const { accessToken, refreshToken: newRefreshToken } =
          refreshResult.data.data;
        api.dispatch(
          updateTokensAction({ accessToken, refreshToken: newRefreshToken })
        );
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logoutAction());
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      api.dispatch(logoutAction());
    } finally {
      api.dispatch(setTokenRefreshing(false));
    }
  }

  return result;
};

export const glowvitaApi = createApi({
  reducerPath: "glowvitaApi",
  baseQuery: baseQuery,
  tagTypes: ["admin"],
  endpoints: (builder) => ({
    // Admin
    registerAdmin: builder.mutation({
      query: (admin) => ({
        url: "/admin/register",
        method: "POST",
        body: admin,
      }),
      invalidatesTags: ["admin"],
    }),

    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["admin"],
    }),

    getAdmins: builder.query({
      query: () => "/admin",
      providesTags: ["admin"],
    }),

    createAdmin: builder.mutation({
      query: (admin) => ({
        url: "/admin",
        method: "POST",
        body: admin,
      }),
      invalidatesTags: ["admin"],
    }),

    updateAdmin: builder.mutation({
      query: (admin) => ({
        url: `/admin`,
        method: "PUT",
        body: admin,
      }),
      invalidatesTags: ["admin"],
    }),

    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["admin"],
    }),
  }),
});

export const { 
  useAdminLoginMutation,
  useRegisterAdminMutation,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAdminsQuery,

 } = glowvitaApi;
