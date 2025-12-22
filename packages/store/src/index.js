export * from "./types";
export * from "./hooks";
export * from "./provider";
export { default as store, selectRootState } from "./store";

// Export only reducers and selectors, not all actions to avoid conflicts
export { default as modalReducer } from "./slices/modalSlice";
export { default as customerReducer } from "./slices/customerSlice";
export { default as crmAuthReducer } from "./slices/crmAuthSlice";
export { default as salonReducer } from "./slices/salonSlice";
export { default as vendorReducer } from "./slices/vendorSlice";
export { default as marketingReducer } from "./slices/marketingslice";
export { default as doctorsDermatsReducer } from "./slices/doctorsDermatsSlice";
export { default as supplierReducer } from "./slices/supplierSlice";
export { default as subscriptionReducer } from "./slices/subscriptionSlice";
export { default as notificationReducer } from "./slices/notificationSlice";
export { default as geoFencingReducer } from "./slices/geoFencingSlice";
export { default as smsTemplateReducer } from "./slices/smsTemplateSlice";
export { default as faqReducer } from "./slices/faqSlice";
export { default as serviceReducer } from "./slices/serviceSlice";
export { default as staffReducer } from "./slices/staffSlice";
export { default as appointmentReducer } from "./slices/appointmentSlice";
export { default as blockTimeReducer } from "./slices/blockTimeSlice";
export { default as vendorProfileReducer } from "./slices/vendorProfileSlice";
export { default as workingHoursReducer } from "./slices/workingHoursSlice";
export { default as orderReducer } from "./slices/orderSlice";
export { default as shippingReducer } from "./slices/shippingSlice";
export { default as productReducer } from "./slices/productSlice";
export { default as calendarAppointmentReducer } from "./slices/calendarAppointmentSlice";
export { default as userAuthReducer } from "./slices/Web/userAuthSlice";
export { default as staffAvailabilityReducer } from "./slices/staffAvailabilitySlice";
export { default as adminAuthReducer } from "./slices/Admin/adminAuthSlice";
export { default as refferalReducer } from "./slices/Admin/refferalSlice";
export { default as clientReducer } from "./slices/CRM/clientSlice";
export { default as cartReducer } from "./slices/cartSlice";
export { default as patientReducer } from "./slices/patientSlice";

// Export specific actions that are commonly used (namespaced)
export * from "./slices/modalSlice";
export * from "./slices/crmAuthSlice";
export * from "./slices/Web/userAuthSlice";
export * from "./slices/Admin/adminAuthSlice";