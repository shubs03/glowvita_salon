import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api", // Default base URL
  prepareHeaders: (headers, { getState, endpoint }) => {
    const adminAuthState = localStorage.getItem("adminAuthState");
    const vendorAccessToken = localStorage.getItem("vendor_access_token");

    const adminAccessToken = adminAuthState && JSON.parse(adminAuthState).token;

    // Dynamically set baseUrl based on endpoint
    if (endpoint.startsWith('getAdmin') || endpoint.startsWith('createAdmin') || endpoint.startsWith('updateAdmin') || endpoint.startsWith('deleteAdmin') || endpoint.startsWith('getUsers') || endpoint.startsWith('adminLogin') || endpoint.startsWith('registerAdmin') || endpoint.startsWith('getReferrals') || endpoint.startsWith('createReferral') || endpoint.startsWith('updateReferral') || endpoint.startsWith('deleteReferral') || endpoint.startsWith('updateSettings') || endpoint.startsWith('getSettings') || endpoint.startsWith('getSuperData') || endpoint.startsWith('createSuperDataItem') || endpoint.startsWith('updateSuperDataItem') || endpoint.startsWith('deleteSuperDataItem') || endpoint.startsWith('getVendors') || endpoint.startsWith('createVendor') || endpoint.startsWith('updateVendor') || endpoint.startsWith('updateVendorStatus') || endpoint.startsWith('deleteVendor') || endpoint.startsWith('getDoctors') || endpoint.startsWith('createDoctor') || endpoint.startsWith('updateDoctor') || endpoint.startsWith('deleteDoctor') || endpoint.startsWith('getSubscriptionPlans') || endpoint.startsWith('createSubscriptionPlan') || endpoint.startsWith('updateSubscriptionPlan') || endpoint.startsWith('deleteSubscriptionPlan') || endpoint.startsWith('getSuppliers') || endpoint.startsWith('createSupplier') || endpoint.startsWith('updateSupplier') || endpoint.startsWith('deleteSupplier') || endpoint.startsWith('getGeoFences') || endpoint.startsWith('createGeoFence') || endpoint.startsWith('updateGeoFence') || endpoint.startsWith('deleteGeoFence') || endpoint.startsWith('getCategories') || endpoint.startsWith('createCategory') || endpoint.startsWith('updateCategory') || endpoint.startsWith('deleteCategory') || endpoint.startsWith('getServices') || endpoint.startsWith('createService') || endpoint.startsWith('updateService') || endpoint.startsWith('deleteService') || endpoint.startsWith('getNotifications') || endpoint.startsWith('createNotification') || endpoint.startsWith('updateNotification') || endpoint.startsWith('deleteNotification') || endpoint.startsWith('getTaxFeeSettings') || endpoint.startsWith('updateTaxFeeSettings')) {
       // This is a brittle way to check, but for now it works.
       // A better solution would be to have separate api slices.
       headers.set('baseUrl', 'http://localhost:3002/api');
    }

    if (adminAccessToken) {
      headers.set("Admin-Authorization", `Bearer ${adminAccessToken}`);
    }
    
    if (vendorAccessToken) {
      headers.set("Vendor-Authorization", `Bearer ${vendorAccessToken}`);
    }

    return headers;
  },
  credentials: "include",
});

const dynamicBaseQuery = async (args, api, extraOptions) => {
  let { url } = args;
  const baseUrlFromHeader = api.getState().api.config.middlewareRegistered ? api.getRunningQueriesThunk() && api.getRunningQueriesThunk()[0] && api.getRunningQueriesThunk()[0].originalArgs && api.getRunningQueriesThunk()[0].originalArgs.headers ? api.getRunningQueriesThunk()[0].originalArgs.headers.baseUrl : undefined : undefined;
  
  const endpointName = api.endpoint;
  
  let dynamicBaseUrl = '/api'; // Default to CRM
  
  // A list of endpoint prefixes that belong to the admin panel
  const adminPrefixes = [
    'getAdmin', 'createAdmin', 'updateAdmin', 'deleteAdmin', 'getUsers', 'adminLogin',
    'registerAdmin', 'getReferrals', 'createReferral', 'updateReferral', 'deleteReferral',
    'updateSettings', 'getSettings', 'getSuperData', 'createSuperDataItem', 'updateSuperDataItem',
    'deleteSuperDataItem', 'getVendors', 'createVendor', 'updateVendor', 'updateVendorStatus',
    'deleteVendor', 'getDoctors', 'createDoctor', 'updateDoctor', 'deleteDoctor',
    'getSubscriptionPlans', 'createSubscriptionPlan', 'updateSubscriptionPlan', 'deleteSubscriptionPlan',
    'getSuppliers', 'createSupplier', 'updateSupplier', 'deleteSupplier', 'getGeoFences',
    'createGeoFence', 'updateGeoFence', 'deleteGeoFence', 'getCategories', 'createCategory',
    'updateCategory', 'deleteCategory', 'getServices', 'createService', 'updateService',
    'deleteService', 'getNotifications', 'createNotification', 'updateNotification',
    'deleteNotification', 'getTaxFeeSettings', 'updateTaxFeeSettings'
  ];

  if (adminPrefixes.some(prefix => endpointName.startsWith(prefix))) {
    dynamicBaseUrl = 'http://localhost:3002/api';
  }
  
  const adjustedArgs = { ...args, url: `${dynamicBaseUrl}${url}` };

  let result = await baseQuery(adjustedArgs, api, extraOptions);
  
  // Re-auth logic can be added here if necessary in the future

  return result;
};


export const glowvitaApi = createApi({
  reducerPath: "glowvitaApi",
  baseQuery: dynamicBaseQuery,
  tagTypes: [
    "admin",
    "offers",
    "Referrals",
    "Settings",
    "SuperData",
    "Supplier", "Subscription",
    "Vendor", "doctors", "GeoFence", "Category", "Service", "Notification", "TaxFeeSettings", "SubscriptionPlan"
  ],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["admin"],
    }),

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
    
    // Subscription Plan Endpoints
    getSubscriptionPlans: builder.query({
      query: () => '/admin/subscription-plans',
      providesTags: ['SubscriptionPlan']
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
        method: 'PATCH',
        body: plan,
        params: { id: plan.id }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SubscriptionPlan', id }]
    }),

    deleteSubscriptionPlan: builder.mutation({
      query: (id) => ({
        url: '/admin/subscription-plans',
        method: 'DELETE',
        params: { id }
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
    }),
    // Categories
    getCategories: builder.query({
      query: () => "/admin/categories",
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
      query: () => "/admin/services",
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
      query: () => "/admin/custompushnotification",
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
      query: () => "/admin/tax-fees",
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

  // Vendor Endpoints

  useVendorLoginMutation,
  useVendorRegisterMutation,
} = glowvitaApi;
