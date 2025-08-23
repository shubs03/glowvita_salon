
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { jwtDecode } from "jwt-decode";

const API_BASE_URLS = {
  admin: "http://localhost:3002/api",
  crm: "http://localhost:3001/api",
  web: "http://localhost:3000/api",
};

// Base query function that determines the API URL and sets headers.
const baseQuery = async (args, api, extraOptions) => {
  let requestUrl = typeof args === 'string' ? args : args.url;
    
  if (typeof requestUrl !== 'string') {
    console.error("Request URL is not a string:", requestUrl);
    return { error: { status: "CUSTOM_ERROR", error: "Invalid URL provided" } };
  }
    
  let targetService = 'web'; // Default
  let token = null;
  const state = api.getState();

  if (requestUrl.startsWith('/admin')) {
    targetService = 'admin';
    token = state.adminAuth.token;
  } else if (requestUrl.startsWith('/crm')) {
    targetService = 'crm';
    token = state.crmAuth.token;
  } else {
    // For web routes, it might use either, but let's assume a default or check both
    token = state.crmAuth.token || state.adminAuth.token;
  }

  const baseUrl = API_BASE_URLS[targetService];
  
  const dynamicFetch = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await dynamicFetch(args, api, extraOptions);
  
  // Enhanced 401 handling
  if (result.error && result.error.status === 401) {
    console.warn(`Received 401 Unauthorized for ${targetService}. Logging out.`);
    if (targetService === 'admin') {
      api.dispatch(clearAdminAuth());
    } else if (targetService === 'crm') {
      api.dispatch(clearCrmAuth());
    }
  }
  
  // Check for token expiry on the client-side as well
  if(token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
        console.warn(`Token expired for ${targetService}. Logging out.`);
         if (targetService === 'admin') {
          api.dispatch(clearAdminAuth());
        } else if (targetService === 'crm') {
          api.dispatch(clearCrmAuth());
        }
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
    // Categories
    getCategories: builder.query({
      query: () => '/admin/categories',
      providesTags: ['Category'],
    }),
    
    createCategory: builder.mutation({
      query: (category) => ({
        url: '/admin/categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    
    updateCategory: builder.mutation({
      query: (category) => ({
        url: `/admin/categories`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    
    deleteCategory: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/categories`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: ['Category'],
    }),

    // Services
    getServices: builder.query({
      query: () => '/admin/services',
      providesTags: ['Service'],
    }),
    
    createService: builder.mutation({
      query: (service) => ({
        url: '/admin/services',
        method: 'POST',
        body: service,
      }),
      invalidatesTags: ['Service'],
    }),
    
    updateService: builder.mutation({
      query: (service) => ({
        url: `/admin/services`,
        method: 'PUT',
        body: service,
      }),
      invalidatesTags: ['Service'],
    }),
    
    deleteService: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/services`,
        method: 'DELETE',
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
    
    deleteSubscriptionPlan: builder.mutation({
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
  // AdminPanel Endpoints

  // adminUsers
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
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,

  // Supplier Endpoints
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  
  // Subscription Management
  
  // Subscription Plans
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useToggleSubscriptionPlanStatusMutation,

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
