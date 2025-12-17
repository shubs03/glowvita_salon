/**
 * Validation Engine Module
 * Comprehensive data validation and error handling for the booking system
 */

// Regular expressions for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;
const PINCODE_REGEX = /^\d{6}$/;
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export function validateEmail(email) {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether phone number is valid
 */
export function validatePhone(phone) {
  return PHONE_REGEX.test(phone);
}

/**
 * Validate pincode format
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} - Whether pincode is valid
 */
export function validatePincode(pincode) {
  return PINCODE_REGEX.test(pincode);
}

/**
 * Validate time format
 * @param {string} time - Time to validate (HH:MM format)
 * @returns {boolean} - Whether time is valid
 */
export function validateTime(time) {
  return TIME_REGEX.test(time);
}

/**
 * Validate date format
 * @param {string} date - Date to validate (YYYY-MM-DD format)
 * @returns {boolean} - Whether date is valid
 */
export function validateDate(date) {
  return DATE_REGEX.test(date) && !isNaN(Date.parse(date));
}

/**
 * Validate coordinates
 * @param {Object} location - Location object with lat/lng
 * @returns {boolean} - Whether coordinates are valid
 */
export function validateCoordinates(location) {
  if (!location || typeof location !== 'object') {
    return false;
  }
  
  const { lat, lng } = location;
  
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }
  
  // Latitude must be between -90 and 90
  if (lat < -90 || lat > 90) {
    return false;
  }
  
  // Longitude must be between -180 and 180
  if (lng < -180 || lng > 180) {
    return false;
  }
  
  return true;
}

/**
 * Validate service data
 * @param {Object} service - Service object to validate
 * @returns {Object} - Validation result
 */
export function validateService(service) {
  const errors = [];
  
  if (!service) {
    errors.push('Service data is required');
    return { isValid: false, errors };
  }
  
  // Validate required fields
  if (!service.name || typeof service.name !== 'string' || service.name.trim().length === 0) {
    errors.push('Service name is required');
  } else if (service.name.length > 100) {
    errors.push('Service name must be less than 100 characters');
  }
  
  if (!service.description || typeof service.description !== 'string' || service.description.trim().length === 0) {
    errors.push('Service description is required');
  } else if (service.description.length > 500) {
    errors.push('Service description must be less than 500 characters');
  }
  
  if (service.price === undefined || service.price === null || typeof service.price !== 'number' || service.price < 0) {
    errors.push('Service price must be a non-negative number');
  }
  
  if (service.duration === undefined || service.duration === null || typeof service.duration !== 'number' || service.duration < 1) {
    errors.push('Service duration must be a positive number');
  }
  
  // Validate optional fields
  if (service.discountedPrice !== undefined && service.discountedPrice !== null) {
    if (typeof service.discountedPrice !== 'number' || service.discountedPrice < 0) {
      errors.push('Service discounted price must be a non-negative number');
    } else if (service.discountedPrice > service.price) {
      errors.push('Service discounted price cannot be greater than regular price');
    }
  }
  
  if (service.gender && !['men', 'women', 'unisex'].includes(service.gender)) {
    errors.push('Service gender must be one of: men, women, unisex');
  }
  
  if (service.bookingInterval !== undefined && (typeof service.bookingInterval !== 'number' || service.bookingInterval < 1)) {
    errors.push('Service booking interval must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate staff data
 * @param {Object} staff - Staff object to validate
 * @returns {Object} - Validation result
 */
export function validateStaff(staff) {
  const errors = [];
  
  if (!staff) {
    errors.push('Staff data is required');
    return { isValid: false, errors };
  }
  
  // Validate required fields
  if (!staff.fullName || typeof staff.fullName !== 'string' || staff.fullName.trim().length === 0) {
    errors.push('Staff full name is required');
  }
  
  if (!staff.position || typeof staff.position !== 'string' || staff.position.trim().length === 0) {
    errors.push('Staff position is required');
  }
  
  if (!staff.emailAddress || !validateEmail(staff.emailAddress)) {
    errors.push('Staff email is required and must be valid');
  }
  
  if (!staff.mobileNo || !validatePhone(staff.mobileNo)) {
    errors.push('Staff mobile number is required and must be valid (10 digits)');
  }
  
  // Validate optional fields
  if (staff.yearOfExperience !== undefined && (typeof staff.yearOfExperience !== 'number' || staff.yearOfExperience < 0)) {
    errors.push('Staff year of experience must be a non-negative number');
  }
  
  if (staff.clientsServed !== undefined && (typeof staff.clientsServed !== 'number' || staff.clientsServed < 0)) {
    errors.push('Staff clients served must be a non-negative number');
  }
  
  if (staff.rating !== undefined && (typeof staff.rating !== 'number' || staff.rating < 0 || staff.rating > 5)) {
    errors.push('Staff rating must be between 0 and 5');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate appointment data
 * @param {Object} appointment - Appointment object to validate
 * @returns {Object} - Validation result
 */
export function validateAppointment(appointment) {
  const errors = [];
  
  if (!appointment) {
    errors.push('Appointment data is required');
    return { isValid: false, errors };
  }
  
  // Validate required fields
  if (!appointment.vendorId) {
    errors.push('Vendor ID is required');
  }
  
  if (!appointment.clientId) {
    errors.push('Client ID is required');
  }
  
  if (!appointment.serviceId) {
    errors.push('Service ID is required');
  }
  
  if (!appointment.date || !validateDate(appointment.date)) {
    errors.push('Appointment date is required and must be valid (YYYY-MM-DD format)');
  }
  
  if (!appointment.startTime || !validateTime(appointment.startTime)) {
    errors.push('Appointment start time is required and must be valid (HH:MM format)');
  }
  
  if (!appointment.endTime || !validateTime(appointment.endTime)) {
    errors.push('Appointment end time is required and must be valid (HH:MM format)');
  }
  
  // Validate time logic
  if (appointment.startTime && appointment.endTime) {
    const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
    const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    if (endTotalMinutes <= startTotalMinutes) {
      errors.push('Appointment end time must be after start time');
    }
  }
  
  // Validate optional fields
  if (appointment.isHomeService && appointment.homeServiceLocation) {
    if (!validateCoordinates(appointment.homeServiceLocation)) {
      errors.push('Home service location coordinates are invalid');
    }
  }
  
  if (appointment.duration !== undefined && (typeof appointment.duration !== 'number' || appointment.duration < 1)) {
    errors.push('Appointment duration must be a positive number');
  }
  
  if (appointment.amount !== undefined && (typeof appointment.amount !== 'number' || appointment.amount < 0)) {
    errors.push('Appointment amount must be a non-negative number');
  }
  
  if (appointment.totalAmount !== undefined && (typeof appointment.totalAmount !== 'number' || appointment.totalAmount < 0)) {
    errors.push('Appointment total amount must be a non-negative number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate wedding package data
 * @param {Object} weddingPackage - Wedding package object to validate
 * @returns {Object} - Validation result
 */
export function validateWeddingPackage(weddingPackage) {
  const errors = [];
  
  if (!weddingPackage) {
    errors.push('Wedding package data is required');
    return { isValid: false, errors };
  }
  
  // Validate required fields
  if (!weddingPackage.name || typeof weddingPackage.name !== 'string' || weddingPackage.name.trim().length === 0) {
    errors.push('Wedding package name is required');
  }
  
  if (!weddingPackage.description || typeof weddingPackage.description !== 'string' || weddingPackage.description.trim().length === 0) {
    errors.push('Wedding package description is required');
  }
  
  if (weddingPackage.totalPrice === undefined || weddingPackage.totalPrice === null || typeof weddingPackage.totalPrice !== 'number' || weddingPackage.totalPrice < 0) {
    errors.push('Wedding package total price must be a non-negative number');
  }
  
  if (weddingPackage.duration === undefined || weddingPackage.duration === null || typeof weddingPackage.duration !== 'number' || weddingPackage.duration < 1) {
    errors.push('Wedding package duration must be a positive number');
  }
  
  // Validate services array
  if (!Array.isArray(weddingPackage.services)) {
    errors.push('Wedding package services must be an array');
  } else if (weddingPackage.services.length === 0) {
    errors.push('Wedding package must include at least one service');
  } else {
    // Validate each service in the package
    weddingPackage.services.forEach((service, index) => {
      if (!service.serviceId) {
        errors.push(`Service ${index + 1} must have a service ID`);
      }
      
      if (!service.serviceName || typeof service.serviceName !== 'string' || service.serviceName.trim().length === 0) {
        errors.push(`Service ${index + 1} must have a valid service name`);
      }
      
      if (service.quantity === undefined || service.quantity === null || typeof service.quantity !== 'number' || service.quantity < 1) {
        errors.push(`Service ${index + 1} quantity must be a positive number`);
      }
    });
  }
  
  // Validate optional fields
  if (weddingPackage.discountedPrice !== undefined && weddingPackage.discountedPrice !== null) {
    if (typeof weddingPackage.discountedPrice !== 'number' || weddingPackage.discountedPrice < 0) {
      errors.push('Wedding package discounted price must be a non-negative number');
    } else if (weddingPackage.discountedPrice > weddingPackage.totalPrice) {
      errors.push('Wedding package discounted price cannot be greater than total price');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate user-friendly error messages
 * @param {Array|string} errors - Error messages or array of errors
 * @param {string} defaultMessage - Default message if no errors provided
 * @returns {string} - Formatted error message
 */
export function generateUserFriendlyErrorMessage(errors, defaultMessage = 'Please check the form for errors') {
  if (!errors) {
    return defaultMessage;
  }
  
  if (typeof errors === 'string') {
    return errors;
  }
  
  if (Array.isArray(errors) && errors.length > 0) {
    if (errors.length === 1) {
      return errors[0];
    }
    return `Please fix the following issues:\n• ${errors.join('\n• ')}`;
  }
  
  return defaultMessage;
}

/**
 * Format validation errors for API responses
 * @param {Array} errors - Array of error messages
 * @param {string} field - Field name (optional)
 * @returns {Object} - Formatted error response
 */
export function formatValidationErrors(errors, field = null) {
  return {
    success: false,
    message: generateUserFriendlyErrorMessage(errors),
    errors: errors.map(error => ({
      field,
      message: error
    }))
  };
}

/**
 * Validate and sanitize input data
 * @param {Object} data - Data to validate and sanitize
 * @param {Object} schema - Validation schema
 * @returns {Object} - Sanitized data and validation result
 */
export function validateAndSanitize(data, schema) {
  const sanitizedData = {};
  const errors = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rules.label || key} is required`);
      continue;
    }
    
    // Skip validation for optional empty fields
    if (value === undefined || value === null || value === '') {
      continue;
    }
    
    // Apply sanitization
    let sanitizedValue = value;
    
    if (rules.trim && typeof sanitizedValue === 'string') {
      sanitizedValue = sanitizedValue.trim();
    }
    
    if (rules.lowercase && typeof sanitizedValue === 'string') {
      sanitizedValue = sanitizedValue.toLowerCase();
    }
    
    if (rules.uppercase && typeof sanitizedValue === 'string') {
      sanitizedValue = sanitizedValue.toUpperCase();
    }
    
    // Apply validation rules
    if (rules.type && typeof sanitizedValue !== rules.type) {
      errors.push(`${rules.label || key} must be of type ${rules.type}`);
      continue;
    }
    
    if (rules.regex && typeof sanitizedValue === 'string' && !rules.regex.test(sanitizedValue)) {
      errors.push(rules.message || `${rules.label || key} is invalid`);
      continue;
    }
    
    if (rules.min !== undefined && typeof sanitizedValue === 'number' && sanitizedValue < rules.min) {
      errors.push(`${rules.label || key} must be at least ${rules.min}`);
      continue;
    }
    
    if (rules.max !== undefined && typeof sanitizedValue === 'number' && sanitizedValue > rules.max) {
      errors.push(`${rules.label || key} must be no more than ${rules.max}`);
      continue;
    }
    
    if (rules.enum && Array.isArray(rules.enum) && !rules.enum.includes(sanitizedValue)) {
      errors.push(`${rules.label || key} must be one of: ${rules.enum.join(', ')}`);
      continue;
    }
    
    // Apply custom validation
    if (rules.validator && typeof rules.validator === 'function') {
      const validationResult = rules.validator(sanitizedValue);
      if (validationResult !== true) {
        errors.push(validationResult || `${rules.label || key} is invalid`);
        continue;
      }
    }
    
    sanitizedData[key] = sanitizedValue;
  }
  
  return {
    isValid: errors.length === 0,
    data: sanitizedData,
    errors
  };
}

export default {
  validateEmail,
  validatePhone,
  validatePincode,
  validateTime,
  validateDate,
  validateCoordinates,
  validateService,
  validateStaff,
  validateAppointment,
  validateWeddingPackage,
  generateUserFriendlyErrorMessage,
  formatValidationErrors,
  validateAndSanitize
};