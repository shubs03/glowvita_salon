
export function normalizeDialCode(dialCode) {
  if (!dialCode) return '';
  return dialCode.toString().replace(/[^0-9]/g, '').trim();
}


export function cleanLocalNumber(phone) {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '');
}


export function buildE164(dialCode, localNumber) {
  const code = normalizeDialCode(dialCode);
  const local = cleanLocalNumber(localNumber);

  if (!code || !local) return local;

  if (local.startsWith(code)) {
    return local;
  }

  return `${code}${local}`;
}


export function validateLocalNumber(localNumber, dialCode = '') {
  if (!localNumber || localNumber.length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (localNumber.length < 5 || localNumber.length > 15) {
    return { valid: false, error: 'Phone number must be between 5 and 15 digits' };
  }

  // India-specific validation
  if (dialCode === '91') {
    if (!/^[6-9]\d{9}$/.test(localNumber)) {
      return { valid: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6–9' };
    }
  }

  return { valid: true, error: null };
}


export function validateDialCode(dialCode) {
  const code = normalizeDialCode(dialCode);
  if (!code || code.length === 0) {
    return { valid: false, error: 'Country code is required' };
  }
  if (code.length > 4) {
    return { valid: false, error: 'Invalid country code' };
  }
  return { valid: true, error: null };
}
