/*
  Validation rules from the Phase 3 requirements. Each function returns an error
  message string, or '' when the value is fine, so you can write:

    const errors = {}
    errors.email = validateEmail(form.email)
*/

export function required(value, message = 'This field is required.') {
  if (Array.isArray(value)) return value.length ? '' : message
  return String(value ?? '').trim() ? '' : message
}

export function validateEmail(value) {
  if (!String(value ?? '').trim()) return 'Email is required.'
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? '' : 'Enter a valid email address.'
}

// FR-A1: at least 8 characters with a letter and a number
export function validatePassword(value) {
  if (!value) return 'Password is required.'
  if (value.length < 8 || !/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Password is too weak. Use 8+ characters with a letter and a number.'
  }
  return ''
}

export function validateConfirm(password, confirm) {
  if (!confirm) return 'Please confirm your password.'
  return password === confirm ? '' : 'Passwords do not match.'
}

// FR-A2: CR number is exactly 10 digits
export function validateCR(value) {
  if (!String(value ?? '').trim()) return 'CR number is required.'
  return /^\d{10}$/.test(value.trim()) ? '' : 'CR number must be exactly 10 digits.'
}

// FR-S9 / FR-C1: optional URL that must be valid when entered
export function validateUrl(value, { optional = true } = {}) {
  if (!String(value ?? '').trim()) return optional ? '' : 'Link is required.'
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? '' : 'Enter a valid link starting with https://'
  } catch {
    return 'Enter a valid link starting with https://'
  }
}

// Saudi mobile or landline, digits/spaces/+ only
export function validatePhone(value) {
  if (!String(value ?? '').trim()) return 'Phone number is required.'
  return /^\+?[\d\s-]{9,15}$/.test(value.trim()) ? '' : 'Enter a valid phone number.'
}

// FR-S1: GPA within 0-4 or 0-5 depending on the scale the student picks
export function validateGpa(value, scale) {
  if (value === '' || value === null || value === undefined) return ''
  const n = Number(value)
  if (Number.isNaN(n) || n < 0 || n > Number(scale)) return `GPA must be between 0 and ${scale}.`
  return ''
}

// FR-S9: date can't be in the future
export function validatePastDate(value) {
  if (!value) return 'Date is required.'
  return new Date(value) > new Date() ? 'Date cannot be in the future.' : ''
}

// true when an errors object has no messages
export function isValid(errors) {
  return Object.values(errors).every((e) => !e)
}
