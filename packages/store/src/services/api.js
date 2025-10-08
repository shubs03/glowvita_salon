
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { NEXT_PUBLIC_ADMIN_URL, NEXT_PUBLIC_CRM_URL, NEXT_PUBLIC_WEB_URL } from "@repo/config/config";

// Function to get base URLs with intelligent fallbacks for production
const getBaseUrls = () => {
  // If environment variables are explicitly set, use them (highest priority)
  if (NEXT_PUBLIC_WEB_URL && NEXT_PUBLIC_CRM_URL && NEXT_PUBLIC_ADMIN_URL) {
    return {
      admin: `${NEXT_PUBLIC_ADMIN_URL}/api`,
      crm: `${NEXT_PUBLIC_CRM_URL}/api`,
      web: `${NEXT_PUBLIC_WEB_URL}/api`,
    };
  }

  // In browser environment, dynamically determine URLs based on current location
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const baseUrl = `${protocol}//${hostname}${port}`;

    // For production domains with specific patterns
    if (hostname.includes('v2winonline.com')) {
      // Production environment - different subdomains for different services
      // partners.v2winonline.com is the CRM application
      if (hostname.includes('partners')) {
        // CRM application - API is on the same domain
        return {
          admin: `${protocol}//admin.v2winonline.com/api`,
          crm: `${baseUrl}/api`, // CRM API is on the same domain
          web: `${protocol}//v2winonline.com/api`,
        };
      } else if (hostname.includes('admin')) {
        // Admin application - API is on the same domain
        return {
          admin: `${baseUrl}/api`, // Admin API is on the same domain
          crm: `${protocol}//partners.v2winonline.com/api`,
          web: `${protocol}//v2winonline.com/api`,
        };
      } else {
        // Main website - API is on the same domain
        return {
          admin: `${protocol}//admin.v2winonline.com/api`,
          crm: `${protocol}//partners.v2winonline.com/api`,
          web: `${baseUrl}/api`, // Web API is on the same domain
        };
      }
    } else {
      // Local development - use port-based routing
      return {
        admin: `${protocol}//${hostname}:3002/api`,
        crm: `${protocol}//${hostname}:3001/api`,
        web: `${protocol}//${hostname}:3000/api`,
      };
    }
  }

  // Server-side rendering or when window is not available
  // Fallback to localhost defaults
  return {
    admin: 'http://localhost:3002/api',
    crm: 'http://localhost:3001/api',
    web: 'http://localhost:3000/api',
  };
};

const API_BASE_URLS = getBaseUrls();

// Base query function that determines the API URL and sets headers.
const baseQuery = async (args, api, extraOptions) => {
  let requestUrl = typeof args === "string" ? args : args.url;

  if (typeof requestUrl !== "string") {
    console.error("Request URL is not a string:", requestUrl);
    return { error: { status: "CUSTOM_ERROR", error: "Invalid URL provided" } };
  }

  let targetService = "web"; // Default
  if (requestUrl.startsWith("/admin")) {
    targetService = "admin";
  } else if (requestUrl.startsWith("/crm")) {
    targetService = "crm";
  }

  const baseUrl = API_BASE_URLS[targetService];

  // For CRM and Admin services, we don't strip the service prefix
  // The API endpoints are actually at /api/crm/... and /api/admin/...
  let cleanRequestUrl = requestUrl;

  // Ensure cleanRequestUrl starts with a slash to prevent issues
  cleanRequestUrl = cleanRequestUrl.startsWith("/") ? cleanRequestUrl : `/${cleanRequestUrl}`;

  const fullUrl = `${baseUrl}${cleanRequestUrl}`;
  console.log("Target Service:", targetService); // Debug log
  console.log("Original Request URL:", requestUrl); // Debug log
  console.log("Clean Request URL:", cleanRequestUrl); // Debug log
  console.log("Base URL:", baseUrl); // Debug log
  console.log("API Request URL:", fullUrl); // Debug log

  const dynamicFetch = fetchBaseQuery({
    baseUrl: "", // We're already building the full URL
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      let token = state.crmAuth?.token || state.adminAuth?.token || state.userAuth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  try {
    const result = await dynamicFetch(
      { ...(typeof args === 'object' ? args : {}), url: fullUrl },
      api,
      extraOptions
    );

    // Handle 401 Unauthorized
    if (result.error?.status === 401) {
      const state = api.getState();
      if (state.crmAuth?.token) {
        api.dispatch(clearCrmAuth());
      } else if (state.adminAuth?.token) {
        api.dispatch(clearAdminAuth());
      }
    }

    return result;
  } catch (error) {
    console.error("API Error:", error);
    return { error: { status: "CUSTOM_ERROR", error: error.message } };
  }
};

export const glowvitaApi = createApi({
  reducerPath: "glowvitaApi",
  baseQuery: baseQuery,
  tagTypes: [
    "admin", "offers", "Referrals", "Settings", "SuperData", "Supplier",
    "SubscriptionPlan", "Vendor", "doctors", "GeoFence", "Category",
    "Service", "Staff", "Client", "Offers", "Notification",
    "TaxFeeSettings", "User", "PendingServices", "AdminProductCategory",
    "ProductCategory", "SmsTemplate", "SmsPackage", "CrmSmsTemplate",
    "TestSmsTemplate", "SmsPackage", "CrmSmsPackage", "CrmCampaign",
    "SocialMediaTemplate", "CrmSocialMediaTemplate", "Marketing",
    "Appointment", "ShippingCharge", "Order", "CrmProducts",
    "SupplierProducts", "CrmOrder", "SupplierProfile", "Cart",
    "PublicVendors", "PublicVendorServices", "PublicVendorStaff",
    "PublicVendorWorkingHours", "PublicVendorOffers", "PublicProducts",
    "PublicVendorProducts", "WorkingHours"
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
        body: { _id: id },
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
      query: (formData) => ({
        url: "/admin/social-media-templates",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["SocialMediaTemplate"],
    }),

    updateSocialMediaTemplate: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `/admin/social-media-templates?id=${id}`,
        method: "PUT",
        body: formData,
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

    // Public Vendors for landing page
    getPublicVendors: builder.query({
      query: () => ({ url: "/vendors", method: "GET" }),
      providesTags: ["PublicVendors"],
      transformResponse: (response) => response,
    }),

    // Public Products for landing page
    getPublicProducts: builder.query({
      query: () => ({ url: "/products", method: "GET" }),
      providesTags: ["PublicProducts"],
      transformResponse: (response) => response,
    }),

    // Public Products for specific vendor
    getPublicVendorProducts: builder.query({
      query: (vendorId) => ({ url: `/products?vendorId=${vendorId}`, method: "GET" }),
      providesTags: (result, error, vendorId) => [{ type: "PublicVendorProducts", id: vendorId }],
      transformResponse: (response) => response,
    }),

    // Public Services for vendor details page
    getPublicVendorServices: builder.query({
      query: (vendorId) => ({ url: `/services/vendor/${vendorId}`, method: "GET" }),
      providesTags: ["PublicVendorServices"],
      transformResponse: (response) => response,
    }),

    // Public Working Hours for vendor details page
    getPublicVendorWorkingHours: builder.query({
      query: (vendorId) => ({ url: `/working-hours?vendorId=${vendorId}`, method: "GET" }),
      providesTags: ["PublicVendorWorkingHours"],
      transformResponse: (response) => response,
    }),

    // Public Staff for vendor details page
    getPublicVendorStaff: builder.query({
      query: (vendorId) => ({ url: `/staff/vendor/${vendorId}`, method: "GET" }),
      providesTags: ["PublicVendorStaff"],
      transformResponse: (response) => response,
    }),

    // Public Offers for vendor details page
    getPublicVendorOffers: builder.query({
      query: (vendorId) => ({ url: `/offers?businessId=${vendorId}`, method: "GET" }),
      providesTags: ["PublicVendorOffers"],
      transformResponse: (response) => response,
    }),

    // Admin Panel Endpoints
    getUsers: builder.query({
      query: () => ({
        url: "/admin/users",
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
        body: { id, ...data },
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

    // Admin Product Categories 

    getAdminProductCategories: builder.query({
      query: () => ({ url: "/admin/product-categories", method: "GET" }),
      providesTags: ["AdminProductCategory"],
    }),
    createAdminProductCategory: builder.mutation({
      query: (category) => ({ url: "/admin/product-categories", method: "POST", body: category }),
      invalidatesTags: ["AdminProductCategory"],
    }),
    updateAdminProductCategory: builder.mutation({
      query: (category) => ({ url: "/admin/product-categories", method: "PUT", body: category }),
      invalidatesTags: ["AdminProductCategory"],
    }),
    deleteAdminProductCategory: builder.mutation({
      query: ({ id }) => ({ url: "/admin/product-categories", method: "DELETE", body: { id } }),
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

    //======================================================== CRM Endpoints ====================================================//
    // Vendor Endpoints
    vendorLogin: builder.mutation({
      query: (credentials) => ({ url: "/crm/auth/login", method: "POST", body: credentials }),
    }),
    vendorRegister: builder.mutation({
      query: (vendorData) => ({ url: "/crm/auth/register", method: "POST", body: vendorData }),
    }),
    getVendorServices: builder.query({
      query: ({ vendorId, page = 1, limit = 100, status = null, category = null }) => ({
        url: `/crm/services?vendorId=${vendorId}&page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${category ? `&category=${category}` : ""}`,
        method: "GET",
      }),
      providesTags: ["VendorServices"],
    }),
    createVendorServices: builder.mutation({
      query: ({ vendor, services }) => ({ url: "/crm/services", method: "POST", body: { vendor, services } }),
      invalidatesTags: ["VendorServices"],
    }),
    updateVendorServices: builder.mutation({
      query: ({ vendor, services }) => ({ url: "/crm/services", method: "PUT", body: { vendor, services } }),
      invalidatesTags: ["VendorServices"],
    }),
    deleteVendorServices: builder.mutation({
      query: ({ vendor, serviceId }) => ({ url: "/crm/services", method: "DELETE", body: { vendor, serviceId } }),
      invalidatesTags: ["VendorServices"],
    }),
    getOffers: builder.query({ query: () => "/crm/offers", providesTags: ["Offer"] }),
    createOffer: builder.mutation({
      query: (body) => ({ url: "/crm/offers", method: "POST", body }),
      invalidatesTags: ["Offer"],
    }),
    updateOffer: builder.mutation({
      query: (body) => ({ url: "/crm/offers", method: "PUT", body }),
      invalidatesTags: ["Offer"],
    }),
    deleteOffer: builder.mutation({
      query: (id) => ({ url: "/crm/offers", method: "DELETE", body: { id } }),
      invalidatesTags: ["Offer"],
    }),
    getVendorNotifications: builder.query({
      query: ({ vendorId }) => ({ url: `/crm/notifications?vendorId=${vendorId}`, method: "GET" }),
      providesTags: ["VendorNotifications"],
    }),
    createVendorNotification: builder.mutation({
      query: (notification) => ({ url: "/crm/notifications", method: "POST", body: notification }),
      invalidatesTags: ["VendorNotifications"],
    }),
    deleteVendorNotification: builder.mutation({
      query: ({ notificationId }) => ({ url: "/crm/notifications", method: "DELETE", body: { notificationId } }),
      invalidatesTags: ["VendorNotifications"],
    }),

    // Products endpoints
    getCrmProducts: builder.query({
      query: () => ({ url: "/crm/products", method: "GET" }),
      providesTags: ["CrmProducts"],
      transformResponse: (response) => response.data || [],
    }),
    createCrmProduct: builder.mutation({
      query: (product) => ({ url: "/crm/products", method: "POST", body: product }),
      invalidatesTags: ["CrmProducts"],
    }),
    updateCrmProduct: builder.mutation({
      query: (product) => ({ url: "/crm/products", method: "PUT", body: product }),
      invalidatesTags: ["CrmProducts"],
    }),
    deleteCrmProduct: builder.mutation({
      query: (id) => ({ url: "/crm/products", method: "DELETE", body: { id } }),
      invalidatesTags: ["CrmProducts"],
    }),

    // New endpoint to fetch all vendor products with origin 'Vendor'
    getAllVendorProducts: builder.query({
      query: () => ({ url: "/products", method: "GET" }),
      providesTags: ["CrmProducts"],
      transformResponse: (response) => response,
    }),

    // New endpoints for vendor product operations
    updateVendorProduct: builder.mutation({
      query: (product) => ({ url: "/crm/vendor/products", method: "PUT", body: product }),
      invalidatesTags: ["CrmProducts"],
    }),
    deleteVendorProduct: builder.mutation({
      query: (id) => ({ url: "/crm/vendor/products", method: "DELETE", body: { id } }),
      invalidatesTags: ["CrmProducts"],
    }),
    createVendorProduct: builder.mutation({
      query: (product) => ({ url: "/crm/vendor/products", method: "POST", body: product }),
      invalidatesTags: ["CrmProducts"],
    }),

    // Supplier Products & Profile
    getSupplierProducts: builder.query({
      query: () => ({ url: '/crm/supplier-products' }),
      providesTags: ['SupplierProducts'],
    }),
    getSupplierProfile: builder.query({
      query: (id) => `/crm/supplier-profile/${id}`,
      providesTags: (result, error, id) => [{ type: 'SupplierProfile', id }],
    }),

    // Orders
    getCrmOrders: builder.query({
      query: () => ({ url: '/crm/orders' }),
      providesTags: ['CrmOrder'],
    }),
    createCrmOrder: builder.mutation({
      query: (orderData) => ({ url: '/crm/orders', method: 'POST', body: orderData }),
      invalidatesTags: ['CrmOrder'],
    }),
    updateCrmOrder: builder.mutation({
      query: ({ orderId, ...updateData }) => ({
        url: '/crm/orders',
        method: 'PATCH',
        body: { orderId, ...updateData },
      }),
      invalidatesTags: ['CrmOrder'],
    }),

    // shipping charge endpoints
    getShippingConfig: builder.query({
      query: () => ({ url: "/crm/shipping", method: "GET" }),
      providesTags: ["ShippingCharge"],
      transformResponse: (response) => response.data || response,
    }),
    updateShippingConfig: builder.mutation({
      query: (charge) => ({ url: "/crm/shipping", method: "PUT", body: charge }),
      invalidatesTags: ["ShippingCharge"],
      transformResponse: (response) => response.data || response,
    }),

    // product categories endpoints
    getProductCategories: builder.query({
      query: () => ({ url: "/crm/product-categories", method: "GET" }),
      providesTags: ["ProductCategory"],
    }),
    createProductCategory: builder.mutation({
      query: (category) => ({ url: "/crm/product-categories", method: "POST", body: category }),
      invalidatesTags: ["ProductCategory"],
    }),

    // Staff Endpoints
    getStaff: builder.query({
      query: () => ({ url: "/crm/staff", method: "GET" }),
      providesTags: ["Staff"],
    }),
    createStaff: builder.mutation({
      query: (staff) => ({ url: "/crm/staff", method: "POST", body: staff }),
      invalidatesTags: ["Staff"],
    }),
    updateStaff: builder.mutation({
      query: (staff) => ({ url: "/crm/staff", method: "PUT", body: staff }),
      invalidatesTags: ["Staff"],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({ url: "/crm/staff", method: "DELETE", body: { id } }),
      invalidatesTags: ["Staff"],
    }),

    //working hours endpoint
    getWorkingHours: builder.query({
      query: () => ({ url: "/crm/workinghours", method: "GET" }),
      providesTags: ["WorkingHours"],
    }),
    updateWorkingHours: builder.mutation({
      query: (workingHours) => ({ url: "/crm/workinghours", method: "PUT", body: workingHours }),
      invalidatesTags: ["WorkingHours"],
    }),
    addSpecialHours: builder.mutation({
      query: (specialHours) => ({ url: "/crm/workinghours", method: "POST", body: specialHours }),
      invalidatesTags: ["WorkingHours"],
    }),
    deleteSpecialHours: builder.mutation({
      query: (id) => ({ url: `/crm/workinghours?id=${id}`, method: "DELETE" }),
      invalidatesTags: ["WorkingHours"],
    }),

    // appointments endpoints
    getAppointments: builder.query({
      query: () => ({ url: "/crm/appointments", method: "GET" }),
      providesTags: (result = [], error, arg) => ['Appointments', ...result.map(({ id }) => ({ type: 'Appointment', id }))],
    }),
    createAppointment: builder.mutation({
      query: (appointment) => ({ url: "/crm/appointments", method: "POST", body: appointment }),
      invalidatesTags: ['Appointments'],
    }),
    updateAppointment: builder.mutation({
      query: (appointmentData) => {
        const { _id, ...updates } = appointmentData;

        return {
          url: `/crm/appointments/${_id}`,
          method: "PUT",
          body: updates,
        };
      },
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Appointment', id: _id },
        'Appointments'
      ],
    }),
    updateAppointmentStatus: builder.mutation({
      query: ({ id, status, cancellationReason }) => ({ url: `/crm/appointments`, method: "PATCH", body: { _id: id, status, cancellationReason } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Appointment', id }, 'Appointments'],
    }),
    deleteAppointment: builder.mutation({
      query: (id) => ({ url: `/crm/appointments/${id}`, method: "DELETE" }),
      invalidatesTags: ['Appointments'],
    }),

    // Client Endpoints
    getClients: builder.query({
      query: ({ search, status, page = 1, limit = 100 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return { url: `/crm/clients?${params.toString()}`, method: "GET" };
      },
      providesTags: ["Client"],
      transformResponse: (response) => (response && response.success ? response.data || [] : []),
    }),
    createClient: builder.mutation({
      query: (client) => ({ url: "/crm/clients", method: "POST", body: client }),
      invalidatesTags: ["Client"],
    }),
    updateClient: builder.mutation({
      query: (client) => ({ url: "/crm/clients", method: "PUT", body: client }),
      invalidatesTags: ["Client"],
    }),
    deleteClient: builder.mutation({
      query: (id) => ({ url: "/crm/clients", method: "DELETE", body: { id } }),
      invalidatesTags: ["Client"],
    }),

    // Vendor Profile Endpoints
    getVendorProfile: builder.query({
      query: () => ({ url: "/crm/vendor", method: "GET" }),
      providesTags: ["Vendor"],
    }),

    updateVendorProfile: builder.mutation({
      query: (vendorData) => ({ url: "/crm/vendor", method: "PUT", body: vendorData }),
      invalidatesTags: ["Vendor"],
    }),

    // Doctor Working Hours Endpoints
    getDoctorWorkingHours: builder.query({
      query: (doctorId) => ({ url: `/api/doctor/working-hours?doctorId=${doctorId}`, method: 'GET' }),
      providesTags: ['DoctorWorkingHours'],
    }),
    updateDoctorWorkingHours: builder.mutation({
      query: ({ doctorId, hours }) => ({ url: `/api/doctor/working-hours`, method: 'PUT', body: { doctorId, hours } }),
      invalidatesTags: ['DoctorWorkingHours'],
    }),

    //subscription renewal
    changePlan: builder.mutation({
      query: (data) => ({ url: `/crm/subscription/change-plan`, method: "POST", body: data }),
      invalidatesTags: ["SubscriptionPlan"],
    }),
    renewPlan: builder.mutation({
      query: (data) => ({ url: `/crm/subscription/renew`, method: "POST", body: data }),
      invalidatesTags: ["SubscriptionPlan"],
    }),

    // CRM SMS Packages Endpoints
    getCrmSmsPackages: builder.query({
      query: () => ({ url: "/crm/sms-packages", method: "GET" }),
      providesTags: ["CrmSmsPackage"],
    }),
    getCrmCampaigns: builder.query({
      query: () => ({ url: "/crm/campaigns", method: "GET" }),
      providesTags: ["CrmCampaign"],
    }),
    createCrmCampaign: builder.mutation({
      query: (campaign) => ({ url: "/crm/campaigns", method: "POST", body: campaign }),
      invalidatesTags: ["CrmCampaign"],
    }),
    getCrmSocialMediaTemplates: builder.query({
      query: () => ({ url: "/crm/social-media-templates", method: "GET" }),
      providesTags: ["CrmSocialMediaTemplate"],
      transformResponse: (response) => {
        const templates = response?.data || [];
        const total = response?.total || templates.length;
        return { templates, total };
      }
    }),
    saveCustomizedTemplate: builder.mutation({
      query: (templateData) => ({ url: "/crm/social-media-templates", method: "POST", body: templateData }),
      invalidatesTags: ["CrmSocialMediaTemplate"],
    }),

    // Cart Endpoints
    getCart: builder.query({
      query: () => ({ url: "/crm/cart", method: "GET" }),
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation({
      query: (item) => ({ url: "/crm/cart", method: "POST", body: item }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({ url: "/crm/cart", method: "PUT", body: { productId, quantity } }),
      invalidatesTags: ["Cart"],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({ url: "/crm/cart", method: "DELETE", body: { productId } }),
      invalidatesTags: ["Cart"],
    }),

    // Web App Login
    userLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Patient Endpoints
    getPatients: builder.query({
      query: () => ({ url: "/crm/patients", method: "GET" }),
      providesTags: ["Patient"],
    }),
    createPatient: builder.mutation({
      query: (patient) => ({
        url: "/crm/patients",
        method: "POST",
        body: patient,
      }),
      invalidatesTags: ["Patient"],
    }),
    updatePatient: builder.mutation({
      query: (patient) => ({
        url: "/crm/patients",
        method: "PUT",
        body: patient,
      }),
      invalidatesTags: ["Patient"],
    }),
    deletePatient: builder.mutation({
      query: (id) => ({
        url: "/crm/patients",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Patient"],
    }),

    getClientOrders: builder.query({
      query: () => ({ url: "/client/orders", method: "GET" }),
      providesTags: ["ClientOrder"],
    }),
    createClientOrder: builder.mutation({
      query: (orderData) => ({ url: "/client/orders", method: "POST", body: orderData }),
      invalidatesTags: ["ClientOrder"],
    }),


  }),
});

export const {
  // Web App
  useGetMeQuery,
  useGetPublicVendorsQuery,
  useGetPublicProductsQuery,
  useGetPublicVendorProductsQuery,
  useGetPublicVendorServicesQuery,
  useGetPublicVendorWorkingHoursQuery,
  useGetPublicVendorStaffQuery,
  useGetPublicVendorOffersQuery,
  useUserLoginMutation,
  useGetClientOrdersQuery,
  useCreateClientOrderMutation,

  // Admin Panel
  useAdminLoginMutation,
  useRegisterAdminMutation,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAdminsQuery,
  useGetUsersQuery,
  useGetPendingServicesQuery,
  useUpdateServiceStatusMutation,
  useGetAdminOffersQuery,
  useCreateAdminOfferMutation,
  useUpdateAdminOfferMutation,
  useDeleteAdminOfferMutation,
  useGetReferralsQuery,
  useCreateReferralMutation,
  useUpdateReferralMutation,
  useDeleteReferralMutation,
  useUpdateSettingsMutation,
  useGetSettingsQuery,
  useGetSuperDataQuery,
  useCreateSuperDataItemMutation,
  useUpdateSuperDataItemMutation,
  useDeleteSuperDataItemMutation,
  useGetAdminProductCategoriesQuery,
  useCreateAdminProductCategoryMutation,
  useUpdateAdminProductCategoryMutation,
  useDeleteAdminProductCategoryMutation,
  useCreateVendorMutation,
  useGetVendorsQuery,
  useGetVendorByIdQuery,
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
  useGetSmsTemplatesQuery,
  useGetSmsTemplateByIdQuery,
  useCreateSmsTemplateMutation,
  useUpdateSmsTemplateMutation,
  useDeleteSmsTemplateMutation,
  useGetSmsPackagesQuery,
  useGetSmsPackageByIdQuery,
  useCreateSmsPackageMutation,
  useUpdateSmsPackageMutation,
  useDeleteSmsPackageMutation,
  useGetSocialMediaTemplatesQuery,
  useGetSocialMediaTemplateByIdQuery,
  useCreateSocialMediaTemplateMutation,
  useUpdateSocialMediaTemplateMutation,
  useDeleteSocialMediaTemplateMutation,
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
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetVendorProductsQuery,
  useUpdateProductStatusMutation,

  // CRM Endpoints
  useVendorLoginMutation,
  useVendorRegisterMutation,
  useGetVendorServicesQuery,
  useCreateVendorServicesMutation,
  useUpdateVendorServicesMutation,
  useDeleteVendorServicesMutation,
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useGetVendorNotificationsQuery,
  useCreateVendorNotificationMutation,
  useDeleteVendorNotificationMutation,
  useGetCrmProductsQuery,
  useCreateCrmProductMutation,
  useUpdateCrmProductMutation,
  useDeleteCrmProductMutation,
  useGetSupplierProductsQuery,
  useGetSupplierProfileQuery,
  useGetCrmOrdersQuery,
  useCreateCrmOrderMutation,
  useUpdateCrmOrderMutation,
  useGetShippingConfigQuery,
  useUpdateShippingConfigMutation,
  useGetProductCategoriesQuery,
  useCreateProductCategoryMutation,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useGetWorkingHoursQuery,
  useUpdateWorkingHoursMutation,
  useAddSpecialHoursMutation,
  useDeleteSpecialHoursMutation,
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
  useGetDoctorWorkingHoursQuery,
  useUpdateDoctorWorkingHoursMutation,
  useGetCrmReferralsQuery,
  useGetCrmReferralSettingsQuery,
  useChangePlanMutation,
  useRenewPlanMutation,
  useGetCrmSmsPackagesQuery,
  useGetCrmCampaignsQuery,
  useCreateCrmCampaignMutation,
  useGetCrmSocialMediaTemplatesQuery,
  useSaveCustomizedTemplateMutation,
  // New endpoint for fetching all vendor products
  useGetAllVendorProductsQuery,
  // New endpoints for vendor product operations
  useUpdateVendorProductMutation,
  useDeleteVendorProductMutation,
  useCreateVendorProductMutation,

  // Cart Endpoints
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useUpdateAppointmentStatusMutation,
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = glowvitaApi;
