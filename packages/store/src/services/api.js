
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAdminAuth } from "@repo/store/slices/adminAuthSlice";

const API_BASE_URLS = {
  admin: 'http://localhost:3002/api',
  crm: 'http://localhost:3001/api',
  web: 'http://localhost:3000/api',
};

// Base query function that determines the API URL and sets headers.
const baseQuery = fetchBaseQuery({
  baseUrl: '/', // Default base, will be overridden dynamically
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Determine the target service from the endpoint definition if available,
    // otherwise fallback to localStorage check for broader compatibility.
    const state = getState();
    const adminToken = state.auth.token;
    const vendorAccessToken = localStorage.getItem("vendor_access_token");

    // Check which token to use based on the endpoint, defaulting to admin for now.
    // This logic assumes endpoints are defined in a way that we can infer the target.
    // For this setup, we'll primarily check for the admin token.
    if (adminToken) {
      headers.set("Admin-Authorization", `Bearer ${adminToken}`);
    } else if (vendorAccessToken) {
      // In a real scenario, you'd differentiate between CRM and Admin calls here.
      headers.set("Vendor-Authorization", `Bearer ${vendorAccessToken}`);
    }
    
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let requestUrl = typeof args === 'string' ? args : args.url;
  
  // This ensures requestUrl is always a string for the checks below.
  if (typeof requestUrl !== 'string') {
    console.error("Request URL is not a string:", requestUrl);
    return { error: { status: 'CUSTOM_ERROR', error: 'Invalid URL provided' } };
  }
  
  let targetService = 'web'; // Default
  if (requestUrl.startsWith('/admin')) {
    targetService = 'admin';
  } else if (requestUrl.startsWith('/crm')) {
    targetService = 'crm';
  }
  
  const baseUrl = API_BASE_URLS[targetService];

  // Create a new fetchBaseQuery instance for this specific call with the dynamic base URL.
  const dynamicFetch = fetchBaseQuery({ 
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token && targetService === 'admin') {
        headers.set('Admin-Authorization', `Bearer ${token}`);
      }
      // Add other auth logic if needed (e.g., for CRM/vendor)
      return headers;
    }
  });

  let result = await dynamicFetch(args, api, extraOptions);

  // If we receive a 401 error, it means the token is invalid or expired.
  // We log the user out by clearing their auth state.
  if (result.error && result.error.status === 401) {
    console.warn('Received 401 Unauthorized. Logging out.');
    api.dispatch(clearAdminAuth());
    // Optionally, you can redirect here, but it's better handled in UI components
    // to avoid breaking React's rendering flow.
  }
  
  return result;
};


export const glowvitaApi = createApi({
  reducerPath: "glowvitaApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "admin",
    "offers",
    "Referrals",
    "Settings",
    "SuperData",
    "Supplier", "Subscription",
    "Vendor", "doctors", "GeoFence", "Category", "Service", "Notification", "TaxFeeSettings", "SubscriptionPlan", "User"
  ],
  endpoints: (builder) => ({
    // Web App Endpoints
    getMe: builder.query({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ["User"],
    }),

    // Admin Panel Endpoints
    getUsers: builder.query({
      query: () => ({
        url: "/admin/users", // Assumes an endpoint exists at /api/admin/users
        method: "GET",
      }),
      providesTags: ["admin"],
    }),

    // Admin
    registerAdmin: builder.mutation({
      query: (admin) => ({
        url: "/admin/auth/register",
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
      query: () => ({ url: "/admin", method: "GET" }), 
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
      query: ({ id, ...data }) => ({
        url: `/admin`,
        method: "PUT",
        body: { _id: id, ...data },
      }),
      invalidatesTags: ["admin"],
    }),

    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin`,
        method: "DELETE",
        body: { _id: id },
      }),
      invalidatesTags: ["admin"],
    }),
    
    // offfers
    getAdminOffers: builder.query({
      query: () => ({ url: "/admin/offers", method: "GET" }),
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
        method: "GET",
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
        method: "GET",
        params: { settings: true, referralType },
      }),
      providesTags: ["Settings"],
    }),

    // SuperData (Dropdowns) Endpoints
    getSuperData: builder.query({
      query: () => ({ url: "/admin/super-data", method: "GET" }),
      providesTags: ["SuperData"],
    }),
    
    createSuperDataItem: builder.mutation({
      query: (item) => ({
        url: "/admin/super-data",
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["SuperData"],
    }),
    
    updateSuperDataItem: builder.mutation({
      query: (item) => ({
        url: "/admin/super-data",
        method: "PUT",
        body: item,
      }),
      invalidatesTags: ["SuperData"],
    }),
    
    deleteSuperDataItem: builder.mutation({
      query: ({ id }) => ({
        url: "/admin/super-data",
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
      query: () => ({ url: "/admin/vendor", method: "GET" }),
      providesTags: ["Vendor"],
      transformResponse: (response) => response,
    }),

    getVendorById: builder.query({
      query: (id) => ({ url: `/admin/vendor?id=${id}` }),
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
      query: () => ({ url: "/admin/doctors", method: "GET" }),
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
    
    // Subscription Plan Endpoints
    getSubscriptionPlans: builder.query({
      query: () => ({ url: '/admin/subscription-plans', method: 'GET' }),
      providesTags: (result = []) => [
        "SubscriptionPlan",
        ...result.map(({ _id }) => ({ type: "SubscriptionPlan", id: _id })),
      ],
    }),
    
    createSubscriptionPlan: builder.mutation({
      query: (plan) => ({
        url: '/admin/subscription-plans',
        method: 'POST',
        body: plan
      }),
      invalidatesTags: ['SubscriptionPlan']
    }),

    updateSubscriptionPlan: builder.mutation({
      query: (plan) => ({
        url: '/admin/subscription-plans',
        method: 'PUT',
        body: plan
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'SubscriptionPlan', id: _id }]
    }),

    deleteSubscriptionPlan: builder.mutation({
      query: (id) => ({
        url: '/admin/subscription-plans',
        method: 'DELETE',
        body: { id }
      }),
      invalidatesTags: ['SubscriptionPlan']
    }),

    // Supplier Endpoints
    getSuppliers: builder.query({
      query: () => ({ url: "/admin/suppliers", method: "GET" }),
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
      query: () => ({ url: "/admin/geofence", method: "GET" }),
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
    // Categories
    getCategories: builder.query({
      query: () => ({ url: "/admin/categories", method: "GET" }),
      providesTags: ["Category"],
    }),
    
    createCategory: builder.mutation({
      query: (category) => ({
        url: "/admin/categories",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["Category"],
    }),
    
    updateCategory: builder.mutation({
      query: (category) => ({
        url: `/admin/categories`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: ["Category"],
    }),
    
    deleteCategory: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/categories`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Category"],
    }),

    // Services
    getServices: builder.query({
      query: () => ({ url: "/admin/services", method: "GET" }),
      providesTags: ["Service"],
    }),
    
    createService: builder.mutation({
      query: (service) => ({
        url: "/admin/services",
        method: "POST",
        body: service,
      }),
      invalidatesTags: ["Service"],
    }),
    
    updateService: builder.mutation({
      query: (service) => ({
        url: `/admin/services`,
        method: "PUT",
        body: service,
      }),
      invalidatesTags: ["Service"],
    }),
    
    deleteService: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/services`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Service"],
    }),

    // Notifications
    getNotifications: builder.query({
      query: () => ({ url: "/admin/custompushnotification", method: "GET" }),
      providesTags: ["Notification"],
    }),
    
    createNotification: builder.mutation({
      query: (notification) => ({
        url: "/admin/custompushnotification",
        method: "POST",
        body: notification,
      }),
      invalidatesTags: ["Notification"],
    }),
    
    updateNotification: builder.mutation({
      query: (notification) => ({
        url: `/admin/custompushnotification`,
        method: "PUT",
        body: notification,
      }),
      invalidatesTags: ["Notification"],
    }),
    
    deleteNotification: builder.mutation({
      query: ({ _id }) => ({
        url: `/admin/custompushnotification`,
        method: "DELETE",
        body: { _id },
      }),
      invalidatesTags: ["Notification"],
    }),

    // Tax Fee Settings Endpoints
    getTaxFeeSettings: builder.query({
      query: () => ({ url: "/admin/tax-fees", method: "GET" }),
      providesTags: ["TaxFeeSettings"],
    }),
    
    updateTaxFeeSettings: builder.mutation({
      query: (settings) => ({
        url: "/admin/tax-fees",
        method: "PATCH",
        body: settings,
      }),
      invalidatesTags: ["TaxFeeSettings"],
    }),

    
    // FAQ Endpoints
    getFaqs: builder.query({
      query: () => '/admin/faqs',
      providesTags: ['Faq'],
    }),

    createFaq: builder.mutation({
      query: (faq) => ({
        url: '/admin/faqs',
        method: 'POST',
        body: faq,
      }),
      invalidatesTags: ['Faq'],
    }),

    updateFaq: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: '/admin/faqs',
        method: 'PATCH',
        body: { id, ...updates },
      }),
      invalidatesTags: ['Faq'],
    }),

    deleteFaq: builder.mutation({
      query: (id) => ({
        url: '/admin/faqs',
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: ['Faq'],
    }),

    // Crm Endpoints
    vendorLogin: builder.mutation({
      query: (credentials) => ({
        url: "/crm/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    vendorRegister: builder.mutation({
      query: (vendorData) => ({
        url: "/crm/auth/register",
        method: "POST",
        body: vendorData,
      }),
    }),
  }),
});

export const {
  // Web App
  useGetMeQuery,
  // Admin Panel
  useAdminLoginMutation,
  useRegisterAdminMutation,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAdminsQuery,
  useGetUsersQuery,

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
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,

  // Supplier Endpoints
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,

  // Subscription Plans
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,

  // Geo Fence Endpoints
  useGetGeoFencesQuery,
  useCreateGeoFenceMutation,
  useUpdateGeoFenceMutation,
  useDeleteGeoFenceMutation,

  // Category and Service Endpoints
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,

  // Admin CustoPush Notification Endpoints
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,

  // Tax Fee Settings Endpoints
  useGetTaxFeeSettingsQuery,
  useUpdateTaxFeeSettingsMutation,

    // FAQ Endpoints
    useGetFaqsQuery,
    useCreateFaqMutation,
    useUpdateFaqMutation,
    useDeleteFaqMutation,

  // Vendor Endpoints
  useVendorLoginMutation,
  useVendorRegisterMutation,
} = glowvitaApi;

