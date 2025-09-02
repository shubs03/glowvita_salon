
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";

const API_BASE_URLS = {
  admin: "http://localhost:3002/api",
  crm: "http://localhost:3001/api",
  web: "http://localhost:3000/api",
};

// Base query function that determines the API URL and sets headers.
const baseQuery = async (args, api, extraOptions) => {
  let requestUrl = typeof args === "string" ? args : args.url;

  if (typeof requestUrl !== "string") {
    console.error("Request URL is not a string:", requestUrl);
    return { error: { status: "CUSTOM_ERROR", error: "Invalid URL provided" } };
  }

  let targetService = "web"; // Default
  let token = null;
  const state = api.getState();

  if (requestUrl.startsWith("/admin")) {
    targetService = "admin";
    token = state.adminAuth.token || state.crmAuth.token;
  } else if (requestUrl.startsWith("/crm")) {
    targetService = "crm";
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
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await dynamicFetch(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn(
      `Received 401 Unauthorized for ${targetService}. Logging out.`
    );
    if (targetService === "admin") {
      api.dispatch(clearAdminAuth());
    } else if (targetService === "crm") {
      api.dispatch(clearCrmAuth());
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
    "SubscriptionPlan",
    "Vendor",
    "doctors",
    "GeoFence",
    "Category",
    "Service",
    "Staff",
    "Offers",
    "Notification",
    "TaxFeeSettings",
    "User",
    "PendingServices",
    "AdminProductCategory",
    "ProductCategory",
    "SmsTemplate",
    "SmsPackage",
    "SocialMediaTemplate",
    "Marketing",
    "SubscriptionPlan",
    "Vendor",
    "doctors",
    "GeoFence",
    "Category",
    "Service",
    "Staff",
    "Offers",
    "Notification",
    "TaxFeeSettings",
    "User",
    "PendingServices",
    "AdminProductCategory",
    "ProductCategory",
    "SmsTemplate",
    "SmsPackage",
    "SocialMediaTemplate",
  ],

  endpoints: (builder) => ({
    // SMS Templates Endpoints
    getSmsTemplates: builder.query({
      query: () => "/admin/sms-template",
      providesTags: ["SmsTemplate"],
    }),

    getSmsTemplateById: builder.query({
      query: (id) => `/admin/sms-template/${id}`,
      providesTags: (result, error, id) => [{ type: "SmsTemplate", id }],
    }),

    createSmsTemplate: builder.mutation({
      query: (templateData) => ({
        url: "/admin/sms-template",
        method: "POST",
        body: templateData,
      }),
      invalidatesTags: ["SmsTemplate"],
    }),

    updateSmsTemplate: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/admin/sms-template?id=${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        "SmsTemplate",
        { type: "SmsTemplate", id },
      ],
    }),

    deleteSmsTemplate: builder.mutation({
      query: (id) => ({
        url: `/admin/sms-template?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SmsTemplate"],
    }),

    // Social Media Template Endpoints
    getSocialMediaTemplates: builder.query({
      query: () => "/admin/social-media-templates",
      providesTags: ["SocialMediaTemplate"],
    }),

    getSocialMediaTemplateById: builder.query({
      query: (id) => `/admin/social-media-templates/${id}`,
      providesTags: (result, error, id) => [
        { type: "SocialMediaTemplate", id },
      ],
    }),

    createSocialMediaTemplate: builder.mutation({
      query: (templateData) => ({
        url: "/admin/social-media-templates",
        method: "POST",
        body: templateData,
      }),
      invalidatesTags: ["SocialMediaTemplate"],
    }),

    updateSocialMediaTemplate: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/admin/social-media-templates?id=${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        "SocialMediaTemplate",
        { type: "SocialMediaTemplate", id },
      ],
    }),

    deleteSocialMediaTemplate: builder.mutation({
      query: (id) => ({
        url: `/admin/social-media-templates?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SocialMediaTemplate"],
    }),

    // SMS Packages Endpoints
    getSmsPackages: builder.query({
      query: () => "/admin/sms-packages",
      providesTags: ["SmsPackage"],
    }),

    getSmsPackageById: builder.query({
      query: (id) => `/admin/sms-packages/${id}`,
      providesTags: (result, error, id) => [{ type: "SmsPackage", id }],
    }),

    createSmsPackage: builder.mutation({
      query: (packageData) => ({
        url: "/admin/sms-packages",
        method: "POST",
        body: packageData,
      }),
      invalidatesTags: ["SmsPackage"],
    }),

    updateSmsPackage: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/admin/sms-packages?id=${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        "SmsPackage",
        { type: "SmsPackage", id },
      ],
    }),

    deleteSmsPackage: builder.mutation({
      query: (id) => ({
        url: `/admin/sms-packages?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SmsPackage"],
    }),
    // Web App Endpoints
    getMe: builder.query({
      query: () => ({ url: "/auth/me", method: "GET" }),
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
    // Service Approval Endpoints
    getPendingServices: builder.query({
      query: () => ({ url: "/admin/services/service-approval", method: "GET" }),
      providesTags: ["PendingServices"],
    }),
    updateServiceStatus: builder.mutation({
      query: ({ serviceId, status }) => ({
        url: "/admin/services/service-approval",
        method: "PATCH",
        body: { serviceId, status },
      }),
      invalidatesTags: ["PendingServices", "VendorServices"],
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

    // CRM-specific referral endpoints
    getCrmReferrals: builder.query({
      query: (referralType) => ({
        url: "/crm/referrals",
        method: "GET",
        params: { referralType },
      }),
      providesTags: ["CrmReferrals"],
    }),
    getCrmReferralSettings: builder.query({
      query: (referralType) => ({
        url: "/crm/referrals",
        method: "POST",
        body: { action: 'getSettings', referralType },
      }),
      providesTags: ["CrmSettings"],
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

    // Marketing Endpoints
    // Other marketing-related endpoints can go here

    createSmsTemplate: builder.mutation({
      query: (template) => ({
        url: "/admin/sms-template",
        method: "POST",
        body: template,
      }),
      invalidatesTags: ["SmsTemplate"],
    }),

    updateSmsTemplate: builder.mutation({
      query: ({ _id, ...updates }) => ({
        url: `/admin/sms-template?id=${_id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { _id }) => [
        "SmsTemplate",
        { type: "SmsTemplate", id: _id },
      ],
    }),

    deleteSmsTemplate: builder.mutation({
      query: (id) => ({
        url: `/admin/sms-template?id=${id}`,
        method: "DELETE",
        body: { _id: id },
      }),
      invalidatesTags: ["Marketing"],
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
      query: () => ({ url: "/admin/subscription-plans", method: "GET" }),
      providesTags: ["SubscriptionPlan"],
    }),

    createSubscriptionPlan: builder.mutation({
      query: (plan) => ({
        url: "/admin/subscription-plans",
        method: "POST",
        body: plan,
      }),
      invalidatesTags: ["SubscriptionPlan"],
    }),

    updateSubscriptionPlan: builder.mutation({
      query: ({ _id, ...planData }) => ({
        url: `/admin/subscription-plans?id=${_id}`,
        method: "PATCH",
        body: planData,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "SubscriptionPlan", id: _id },
        "SubscriptionPlan",
      ],
    }),

    deleteSubscriptionPlan: builder.mutation({
      query: (id) => ({
        url: `/admin/subscription-plans?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubscriptionPlan"],
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

    // Geo Fence Endpoints
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
      query: () => "/admin/faqs",
      providesTags: ["Faq"],
    }),

    createFaq: builder.mutation({
      query: (faq) => ({
        url: "/admin/faqs",
        method: "POST",
        body: faq,
      }),
      invalidatesTags: ["Faq"],
    }),

    updateFaq: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: "/admin/faqs",
        method: "PATCH",
        body: { id, ...updates },
      }),
      invalidatesTags: ["Faq"],
    }),

    deleteFaq: builder.mutation({
      query: (id) => ({
        url: "/admin/faqs",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Faq"],
    }),

    // Admin Product Categories Endpoints
    getAdminProductCategories: builder.query({
      query: () => ({
        url: "/admin/product-categories",
        method: "GET",
      }),
      providesTags: ["AdminProductCategory"],
      transformResponse: (response) => {
        // Ensure we always return an array
        if (Array.isArray(response)) {
          return response;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        if (
          response &&
          response.productCategories &&
          Array.isArray(response.productCategories)
        ) {
          return response.productCategories;
        }
        return [];
      },
    }),

    createAdminProductCategory: builder.mutation({
      query: (category) => ({
        url: "/admin/product-categories",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["AdminProductCategory"],
    }),

    updateAdminProductCategory: builder.mutation({
      query: (category) => ({
        url: "/admin/product-categories",
        method: "PUT",
        body: category,
      }),
      invalidatesTags: ["AdminProductCategory"],
    }),

    deleteAdminProductCategory: builder.mutation({
      query: ({ id }) => ({
        url: "/admin/product-categories",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["AdminProductCategory"],
    }),

    // Product Approval

    getVendorProducts: builder.query({
      query: () => ({ url: "/admin/product-approval", method: "GET" }),
      providesTags: ["Product"],
    }),

    updateProductStatus: builder.mutation({
      query: ({ productId, status }) => ({
        url: "/admin/product-approval", 
        method: "PATCH",
        body: { productId, status },
      }),
      invalidatesTags: ["Product", "CrmProducts"],
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

    getVendorServices: builder.query({
      query: ({
        vendorId,
        page = 1,
        limit = 100,
        status = null,
        category = null,
      }) => ({
        url: `/crm/services?vendorId=${vendorId}&page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${category ? `&category=${category}` : ""}`,
        method: "GET",
      }),
      providesTags: ["VendorServices"],
    }),

    createVendorServices: builder.mutation({
      query: ({ vendor, services }) => ({
        url: "/crm/services",
        method: "POST",
        body: { vendor, services },
      }),
      invalidatesTags: ["VendorServices"],
    }),

    updateVendorServices: builder.mutation({
      query: ({ vendor, services }) => ({
        url: "/crm/services",
        method: "PUT",
        body: { vendor, services },
      }),
      invalidatesTags: ["VendorServices"],
    }),

    deleteVendorServices: builder.mutation({
      query: ({ vendor, serviceId }) => ({
        url: "/crm/services",
        method: "DELETE",
        body: { vendor, serviceId },
      }),
      invalidatesTags: ["VendorServices"],
    }),

    getOffers: builder.query({
      query: () => "/crm/offers",
      providesTags: ["Offer"],
    }),

    createOffer: builder.mutation({
      query: (body) => ({
        url: "/crm/offers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Offer"],
    }),

    updateOffer: builder.mutation({
      query: (body) => ({
        url: "/crm/offers",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Offer"],
    }),

    deleteOffer: builder.mutation({
      query: (id) => ({
        url: "/crm/offers",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Offer"],
    }),

    getVendorNotifications: builder.query({
      query: ({ vendorId }) => ({
        url: `/crm/notifications?vendorId=${vendorId}`,
        method: "GET",
      }),
      providesTags: ["VendorNotifications"],
    }),

    createVendorNotification: builder.mutation({
      query: (notification) => ({
        url: "/crm/notifications",
        method: "POST",
        body: notification,
      }),
      invalidatesTags: ["VendorNotifications"],
    }),

    deleteVendorNotification: builder.mutation({
      query: ({ notificationId }) => ({
        url: "/crm/notifications",
        method: "DELETE",
        body: { notificationId },
      }),
      invalidatesTags: ["VendorNotifications"],
    }),

    // Products endpoints
    getCrmProducts: builder.query({
      query: () => ({
        url: "/crm/products",
        method: "GET",
      }),
      providesTags: ["Product"],
      transformResponse: (response) => {
        // Handle both direct array and wrapped response formats
        if (Array.isArray(response)) {
          return response;
        }
        if (response && response.success && Array.isArray(response.data)) {
          return response.data;
        }
        // Fallback for unexpected response structure
        console.warn(
          "Unexpected API response structure for products:",
          response
        );
        return [];
      },
    }),

    createCrmProduct: builder.mutation({
      query: (product) => ({
        url: "/crm/products",
        method: "POST",
        body: product,
      }),
      invalidatesTags: ["Product"],
    }),

    updateCrmProduct: builder.mutation({
      query: (product) => ({
        url: "/crm/products",
        method: "PUT",
        body: product,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteCrmProduct: builder.mutation({
      query: (id) => ({
        url: `/crm/products?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // shipping charge endpoints
    getShippingConfig: builder.query({
      query: () => ({
        url: "/crm/shipping",
        method: "GET",
      }),
      providesTags: ["ShippingCharge"],
      transformResponse: (response) => response.data || response,
    }),

    updateShippingConfig: builder.mutation({
      query: (charge) => ({
        url: "/crm/shipping",
        method: "PUT",
        body: charge,
      }),
      invalidatesTags: ["ShippingCharge"],
      transformResponse: (response) => response.data || response,
    }),

    // product categories endpoints
    getProductCategories: builder.query({
      query: () => ({
        url: "/crm/productcategories",
        method: "GET",
      }),
      providesTags: ["ProductCategory"],
    }),
    createProductCategory: builder.mutation({
      query: (category) => ({
        url: "/crm/productcategories",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["ProductCategory"],
    }),
    
    // Staff Endpoints
    getStaff: builder.query({
      query: () => ({
        url: "/crm/staff",
        method: "GET",
      }),
      providesTags: ["Staff"],
    }),
    createStaff: builder.mutation({
      query: (staff) => ({
        url: "/crm/staff",
        method: "POST",
        body: staff,
      }),
      invalidatesTags: ["Staff"],
    }),
    updateStaff: builder.mutation({
      query: (staff) => ({
        url: "/crm/staff",
        method: "PUT",
        body: staff,
      }),
      invalidatesTags: ["Staff"],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: "/crm/staff",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Staff"],
    }),

    // =============================================== Doctor Working Hours ================================================= //

    getDoctorWorkingHours: builder.query({
      query: (doctorId) => ({
        url: `/api/doctor/working-hours?doctorId=${doctorId}`,
        method: 'GET',
      }),
      providesTags: ['DoctorWorkingHours'], // For caching/invalidation
    }),
    updateDoctorWorkingHours: builder.mutation({
      query: ({ doctorId, hours }) => ({
        url: `/api/doctor/working-hours`,
        method: 'PUT',
        body: { doctorId, hours },
      }),
      invalidatesTags: ['DoctorWorkingHours'], // Invalidate cache after update
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

  // Service Approval
  useGetPendingServicesQuery,
  useUpdateServiceStatusMutation,

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

  // Admin Product Categories
  useGetAdminProductCategoriesQuery,
  useCreateAdminProductCategoryMutation,
  useUpdateAdminProductCategoryMutation,
  useDeleteAdminProductCategoryMutation,

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
  
  // Marketing hooks
  useGetSmsTemplatesQuery,
  useGetSmsTemplateByIdQuery,
  useCreateSmsTemplateMutation,
  useUpdateSmsTemplateMutation,
  useDeleteSmsTemplateMutation,
  
  // SMS Package Endpoints
  useGetSmsPackagesQuery,
  useGetSmsPackageByIdQuery,
  useCreateSmsPackageMutation,
  useUpdateSmsPackageMutation,
  useDeleteSmsPackageMutation,
  
  // Social Media Template Endpoints
  useGetSocialMediaTemplatesQuery,
  useGetSocialMediaTemplateByIdQuery,
  useCreateSocialMediaTemplateMutation,
  useUpdateSocialMediaTemplateMutation,
  useDeleteSocialMediaTemplateMutation,

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

  // Admin Custom Push Notification Endpoints
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

  // Product Approval
  useGetVendorProductsQuery,
  useUpdateProductStatusMutation,

  //======================================================== CRM Endpoints ====================================================//

  // CRM Endpoints

  // Vendor Endpoints
  useVendorLoginMutation,
  useVendorRegisterMutation,

  // Services Endpoints
  useGetVendorServicesQuery,
  useCreateVendorServicesMutation,
  useUpdateVendorServicesMutation,
  useDeleteVendorServicesMutation,

  // Offer Endpoints
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,

  // Vendor Notification Endpoints
  useGetVendorNotificationsQuery,
  useCreateVendorNotificationMutation,
  useDeleteVendorNotificationMutation,

  // Products endpoints
  useGetCrmProductsQuery,
  useCreateCrmProductMutation,
  useUpdateCrmProductMutation,
  useDeleteCrmProductMutation,

  // shipping charge endpoints
  useGetShippingConfigQuery,
  useUpdateShippingConfigMutation,

  // product categories endpoints
  useGetProductCategoriesQuery,
  useCreateProductCategoryMutation,
  // Staff Endpoints
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,

  // Doctor Working Hours Endpoints
  useGetDoctorWorkingHoursQuery,
  useUpdateDoctorWorkingHoursMutation,

  // CRM Referral Endpoints
  useGetCrmReferralsQuery,
  useGetCrmReferralSettingsQuery,

} = glowvitaApi;
