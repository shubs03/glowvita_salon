
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAdminAuth } from "@repo/store/slices/adminAuthSlice";
import { clearCrmAuth } from "@repo/store/slices/crmAuthSlice";
import { clearUserAuth } from "@repo/store/slices/Web/userAuthSlice";

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
  if (requestUrl.startsWith("/admin")) {
    targetService = "admin";
  } else if (requestUrl.startsWith("/crm")) {
    targetService = "crm";
  }

  const baseUrl = API_BASE_URLS[targetService];
  
  // Remove any leading slashes from requestUrl to prevent double slashes
  const cleanRequestUrl = requestUrl.startsWith("/") ? requestUrl.substring(1) : requestUrl;
  const fullUrl = `${baseUrl}/${cleanRequestUrl}`;
  
  console.log("API Request URL:", fullUrl); // Debug log

  const dynamicFetch = fetchBaseQuery({
    baseUrl: "", // We're already building the full URL
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      // Prioritize token based on which auth state is populated
      let token;
      if(state.crmAuth?.token) token = state.crmAuth.token;
      else if(state.adminAuth?.token) token = state.adminAuth.token;
      else if(state.userAuth?.token) token = state.userAuth.token;
      
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

    // Handle 401 Unauthorized globally - with MUCH more conservative criteria
    if (result.error?.status === 401) {
      // Only consider it an auth error if message EXPLICITLY says token is invalid/expired
      const errorMessage = result.error?.data?.message || '';
      const isStrictAuthError = 
        errorMessage.includes('Invalid token') || 
        errorMessage.includes('expired token') || 
        errorMessage.includes('JWT verification failed') ||
        errorMessage.includes('jwt malformed');
      
      if (isStrictAuthError) {
        console.log("Strict auth error detected, logging out:", errorMessage);
        const state = api.getState();
        if (state.crmAuth?.token) api.dispatch(clearCrmAuth());
        if (state.adminAuth?.token) api.dispatch(clearAdminAuth());
        if (state.userAuth?.token) api.dispatch(clearUserAuth());
      } else {
        // Don't log out for other 401 errors - these might be permission or parameter issues
        console.log("API returned 401 but not clearing auth:", errorMessage);
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
    "SocialMediaTemplate", "CrmSocialMediaTemplate", "Marketing", "PublicVendors", 
    "Appointment", "ShippingCharge", "Order", "CrmProducts", 
    "SupplierProducts", "CrmOrder", "SupplierProfile", "Cart", "User"
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
    logoutUser: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    // Public Vendors Endpoints
    getPublicVendors: builder.query({
      query: () => ({ url: "/vendors", method: "GET" }),
      providesTags: ["PublicVendors"],
      transformResponse: (response) => response.vendors || [],
    }),
    getPublicVendorById: builder.query({
      query: (id) => ({ url: `/vendors/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "PublicVendors", id }],
      transformResponse: (response) => response.vendor || null,
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
    getOffers: builder.query({ 
      query: (params) => {
        const queryString = params ? 
          `?businessId=${params.businessId || ''}&businessType=${params.businessType || ''}` : '';
        return `/crm/offers${queryString}`;
      }, 
      providesTags: ["Offer"] 
    }),
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
      query: (userId) => ({ 
        url: userId ? `/crm/products?userId=${userId}` : "/crm/products", 
        method: "GET" 
      }),
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
      query: () => ({ url: "/crm/vendor/products", method: "GET" }),
      providesTags: ["CrmProducts"],
      transformResponse: (response) => response, // Keep the full response to check structure
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
      providesTags: (result = [], error, arg) => [ 'Appointments', ...result.map(({ id }) => ({ type: 'Appointment', id })) ],
    }),
    createAppointment: builder.mutation({
      query: (appointment) => ({ url: "/crm/appointments", method: "POST", body: appointment }),
      invalidatesTags: ['Appointments'],
    }),
    updateAppointment: builder.mutation({
      query: (appointmentData) => {
        console.log('updateAppointment data:', appointmentData);
        // Extract the ID and updates from the appointment data
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
      invalidatesTags: (result, error, { id }) => [ { type: 'Appointment', id }, 'Appointments' ],
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
  }),
});

export const {
  // Web App
  useGetMeQuery,
  useGetPublicVendorsQuery,
  useGetPublicVendorByIdQuery,
  useUserLoginMutation,
  useLogoutUserMutation,
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
  useUpdateAppointmentStatusMutation
} = glowvitaApi;
