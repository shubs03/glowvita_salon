import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  prepareHeaders: (headers, { getState }) => {
    const accessToken = localStorage.getItem("accessToken");
    const adminAuthState = localStorage.getItem("adminAuthState");
    const vendorAccessToken = localStorage.getItem("vendor_access_token");

    const adminAccessToken = adminAuthState && JSON.parse(adminAuthState).token;

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
  tagTypes: [
    "admin",
    "offers",
    "Referrals",
    "Settings",
    "SuperData",
    "Supplier",
  ],
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

    // offfers

    getAdminOffers: builder.query({
      query: () => "/admin/offers",
      providesTags: ["offers"],
    }),

    createAdminOffer: builder.mutation({
      query: (offer) => ({
        url: "/admin/offers",
        method: "POST",
        body: offer,
      }),
      invalidatesTags: ["offers"],
    }),

    updateAdminOffer: builder.mutation({
      query: (offer) => ({
        url: `/admin/offers`,
        method: "PUT",
        body: offer,
      }),
      invalidatesTags: ["offers"],
    }),

    deleteAdminOffer: builder.mutation({
      query: (id) => ({
        url: `/admin/offers`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["offers"],
    }),

    // refferal endpoints

    getReferrals: builder.query({
      query: (referralType) => ({
        url: "/admin/referrals",
        params: { referralType },
      }),
      providesTags: ["Referrals"],
    }),
    createReferral: builder.mutation({
      query: (referral) => ({
        url: "/admin/referrals",
        method: "POST",
        body: referral,
      }),
      invalidatesTags: ["Referrals"],
    }),
    updateReferral: builder.mutation({
      query: (referral) => ({
        url: "/admin/referrals",
        method: "PUT",
        body: referral,
      }),
      invalidatesTags: ["Referrals"],
    }),
    deleteReferral: builder.mutation({
      query: (id) => ({
        url: "/admin/referrals",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Referrals"],
    }),
    updateSettings: builder.mutation({
      query: ({ referralType, settings }) => ({
        url: "/admin/referrals",
        method: "PATCH",
        body: { referralType, settings },
      }),
      invalidatesTags: ["Settings"],
    }),
    getSettings: builder.query({
      query: (referralType) => ({
        url: "/admin/referrals",
        params: { settings: true, referralType },
      }),
      providesTags: ["Settings"],
    }),

    // SuperData (Dropdowns) Endpoints
    getSuperData: builder.query({
      query: () => "/super-data",
      providesTags: ["SuperData"],
    }),
    createSuperDataItem: builder.mutation({
      query: (item) => ({
        url: "/super-data",
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["SuperData"],
    }),
    updateSuperDataItem: builder.mutation({
      query: (item) => ({
        url: "/super-data",
        method: "PUT",
        body: item,
      }),
      invalidatesTags: ["SuperData"],
    }),
    deleteSuperDataItem: builder.mutation({
      query: ({ id }) => ({
        url: "/super-data",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["SuperData"],
    }),

    // Vendor Endpoints

    createVendor: builder.mutation({
      query: (vendorData) => ({
        url: "/admin/vendor",
        method: "POST",
        body: vendorData,
      }),
      invalidatesTags: ["Vendor"],
    }),

    getVendors: builder.query({
      query: () => "/admin/vendor",
      providesTags: ["Vendor"],
      transformResponse: (response) => response,
    }),

    getVendorById: builder.query({
      query: (id) => `/admin/vendor?id=${id}`,
      providesTags: (result, error, id) => [{ type: "Vendor", id }],
    }),

    updateVendor: builder.mutation({
      query: ({ id, ...vendorData }) => ({
        url: "/admin/vendor",
        method: "PUT",
        body: { id, ...vendorData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendor", id },
        "Vendor",
      ],
    }),

    updateVendorStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: "/admin/vendor",
        method: "PATCH",
        body: { id, status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendor", id },
        "Vendor",
      ],
    }),

    deleteVendor: builder.mutation({
      query: ({ id }) => ({
        url: "/admin/vendor",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Vendor"],
    }),

    // Doctor Endpoints

    getDoctors: builder.query({
      query: () => "/admin/doctors",
      providesTags: ["doctors"],
    }),

    createDoctor: builder.mutation({
      query: (doctor) => ({
        url: "/admin/doctors",
        method: "POST",
        body: doctor,
      }),
      invalidatesTags: ["doctors"],
    }),

    updateDoctor: builder.mutation({
      query: (doctor) => ({
        url: "/admin/doctors",
        method: "PUT",
        body: doctor,
      }),
      invalidatesTags: ["doctors"],
    }),

    deleteDoctor: builder.mutation({
      query: (id) => ({
        url: "/admin/doctors",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["doctors"],
    }),

    // Supplier Endpoints
    getSuppliers: builder.query({
      query: () => "/admin/suppliers",
      providesTags: ["Supplier"],
    }),
    createSupplier: builder.mutation({
      query: (supplierData) => ({
        url: "/admin/suppliers",
        method: "POST",
        body: supplierData,
      }),
      invalidatesTags: ["Supplier"],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...supplierData }) => ({
        url: `/admin/suppliers`,
        method: "PUT",
        body: { id, ...supplierData },
      }),
      invalidatesTags: ["Supplier"],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/admin/suppliers`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Supplier"],
    }),

    // Geo Fence
    getGeoFences: builder.query({
      query: () => "/admin/geofence",
      providesTags: ["GeoFence"],
    }),
    createGeoFence: builder.mutation({
      query: (geoFence) => ({
        url: "/admin/geofence",
        method: "POST",
        body: geoFence,
      }),
      invalidatesTags: ["GeoFence"],
    }),
    updateGeoFence: builder.mutation({
      query: ({ _id, ...geoFence }) => ({
        url: "/admin/geofence",
        method: "PUT",
        body: { _id, ...geoFence },
      }),
      invalidatesTags: ["GeoFence"],
    }),
    deleteGeoFence: builder.mutation({
      query: (_id) => ({
        url: "/admin/geofence",
        method: "DELETE",
        body: { _id },
      }),
      invalidatesTags: ["GeoFence"],
    }),
  }),
});

export const {
  // AdminPanel Endpoints

  // adminUsers
  useAdminLoginMutation,
  useRegisterAdminMutation,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAdminsQuery,

  // offers
  useGetAdminOffersQuery,
  useCreateAdminOfferMutation,
  useUpdateAdminOfferMutation,
  useDeleteAdminOfferMutation,

  // refferal
  useGetReferralsQuery,
  useCreateReferralMutation,
  useUpdateReferralMutation,
  useDeleteReferralMutation,
  useUpdateSettingsMutation,
  useGetSettingsQuery,

  // SuperData (Dropdowns)
  useGetSuperDataQuery,
  useCreateSuperDataItemMutation,
  useUpdateSuperDataItemMutation,
  useDeleteSuperDataItemMutation,

  // Vendor Endpoints
  useCreateVendorMutation,
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useUpdateVendorMutation,
  useUpdateVendorStatusMutation,
  useDeleteVendorMutation,

  // Doctor Endpoints
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,

  // Supplier Endpoints
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,

  // Geo Fence Endpoints
  useGetGeoFencesQuery,
  useCreateGeoFenceMutation,
  useUpdateGeoFenceMutation,
  useDeleteGeoFenceMutation,
} = glowvitaApi;
