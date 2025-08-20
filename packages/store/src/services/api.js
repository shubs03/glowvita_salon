import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base URLs for each service
const API_BASE_URLS = {
  admin: 'http://localhost:3002/api',
  crm: 'http://localhost:3001/api',
  web: 'http://localhost:3000/api',
};

// This is the core fetch function that will be used by all endpoints.
const baseQueryWithDynamicBaseUrl = async (args, api, extraOptions) => {
  let { url } = args;

  // Determine the target service based on the URL prefix
  let targetService = 'web'; // Default service
  let finalUrl = url;

  if (url.startsWith('/admin')) {
    targetService = 'admin';
    finalUrl = API_BASE_URLS.admin + url;
  } else if (url.startsWith('/crm')) {
    targetService = 'crm';
    finalUrl = API_BASE_URLS.crm + url;
  } else {
    targetService = 'web';
    finalUrl = API_BASE_URLS.web + url;
  }
  
  // Create a new `fetchBaseQuery` instance for each call.
  // This allows us to set headers dynamically based on the target service.
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: '/', // The base is now part of finalUrl, so this is just a placeholder
    prepareHeaders: (headers, { getState }) => {
      // Get tokens from localStorage
      const adminAuthState = localStorage.getItem("adminAuthState");
      const vendorAccessToken = localStorage.getItem("vendor_access_token");
      
      // Attach the correct token based on the target service
      if (targetService === 'admin' && adminAuthState) {
        const adminToken = JSON.parse(adminAuthState).token;
        if (adminToken) {
          headers.set("Admin-Authorization", `Bearer ${adminToken}`);
        }
      }
      
      if (targetService === 'crm' && vendorAccessToken) {
        headers.set("Vendor-Authorization", `Bearer ${vendorAccessToken}`);
      }
      
      return headers;
    },
    credentials: "include",
  });
  
  // Adjust the arguments for the final fetch call
  const adjustedArgs = { ...args, url: finalUrl };

  return rawBaseQuery(adjustedArgs, api, extraOptions);
};

export const glowvitaApi = createApi({
  reducerPath: "glowvitaApi",
  baseQuery: baseQueryWithDynamicBaseUrl,
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
      query: () => '/auth/me',
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
      query: () => "/admin/admin", // Changed from /admin to /admin/admin to avoid conflicts
      providesTags: ["admin"],
    }),

    createAdmin: builder.mutation({
      query: (admin) => ({
        url: "/admin/admin",
        method: "POST",
        body: admin,
      }),
      invalidatesTags: ["admin"],
    }),

    updateAdmin: builder.mutation({
      query: ({ id, data }) => ({ // Expect { id, data }
        url: `/admin/admin`,
        method: "PUT",
        body: { _id: id, ...data }, // Send with _id in body as expected by API
      }),
      invalidatesTags: ["admin"],
    }),

    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/admin`,
        method: "DELETE",
        body: { _id: id },
      }),
      invalidatesTags: ["admin"],
    }),

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

    getReferrals: builder.query({
      query: (referralType) => ({
        url: "/admin/referrals",
        params: { referralType },
      }),
      providesTags: ["Referrals"],
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

    getSuperData: builder.query({
      query: () => "/admin/super-data",
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
    }),

    updateVendor: builder.mutation({
      query: ({ id, ...vendorData }) => ({
        url: "/admin/vendor",
        method: "PUT",
        body: { id, ...vendorData },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Vendor", id }, "Vendor"],
    }),

    updateVendorStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: "/admin/vendor",
        method: "PATCH",
        body: { id, status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Vendor", id }, "Vendor"],
    }),

    deleteVendor: builder.mutation({
      query: ({ id }) => ({
        url: "/admin/vendor",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Vendor"],
    }),

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
      query: ({ id, ...doctorData }) => ({
        url: "/admin/doctors",
        method: "PUT",
        body: { id, ...doctorData },
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
      query: ({ _id, ...plan }) => ({
        url: `/admin/subscription-plans?id=${_id}`,
        method: 'PATCH',
        body: plan,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'SubscriptionPlan', id: _id }]
    }),

    deleteSubscriptionPlan: builder.mutation({
      query: (id) => ({
        url: `/admin/subscription-plans?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubscriptionPlan']
    }),

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

    // CRM Endpoints
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
  useGetAdminOffersQuery,
  useCreateAdminOfferMutation,
  useUpdateAdminOfferMutation,
  useDeleteAdminOfferMutation,
  useGetReferralsQuery,
  useUpdateSettingsMutation,
  useGetSettingsQuery,
  useGetSuperDataQuery,
  useCreateSuperDataItemMutation,
  useUpdateSuperDataItemMutation,
  useDeleteSuperDataItemMutation,
  useCreateVendorMutation,
  useGetVendorsQuery,
  useUpdateVendorMutation,
  useUpdateVendorStatusMutation,
  useDeleteVendorMutation,
  useGetDoctorsQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useGetGeoFencesQuery,
  useCreateGeoFenceMutation,
  useUpdateGeoFenceMutation,
  useDeleteGeoFenceMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetTaxFeeSettingsQuery,
  useUpdateTaxFeeSettingsMutation,
  // CRM Panel
  useVendorLoginMutation,
  useVendorRegisterMutation,
} = glowvitaApi;
