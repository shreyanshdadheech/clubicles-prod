// Form validation utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  numeric?: boolean;
  positive?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class FormValidator {
  static validateField(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];
    
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push('This field is required');
      return { isValid: false, errors };
    }
    
    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: true, errors: [] };
    }
    
    const stringValue = String(value).trim();
    
    // Length validation
    if (rules.minLength && stringValue.length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters long`);
    }
    
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      errors.push(`Must not exceed ${rules.maxLength} characters`);
    }
    
    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        errors.push('Please enter a valid email address');
      }
    }
    
    // Phone validation (Indian format)
    if (rules.phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = stringValue.replace(/[\s\-\(\)\+]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.push('Please enter a valid 10-digit Indian phone number');
      }
    }
    
    // URL validation
    if (rules.url) {
      try {
        new URL(stringValue);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }
    
    // Numeric validation
    if (rules.numeric) {
      if (isNaN(Number(stringValue))) {
        errors.push('Please enter a valid number');
      }
    }
    
    // Positive number validation
    if (rules.positive && Number(stringValue) <= 0) {
      errors.push('Please enter a positive number');
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push('Please enter a valid format');
    }
    
    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        errors.push(typeof customResult === 'string' ? customResult : 'Invalid value');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  static validateForm(formData: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult {
    const allErrors: string[] = [];
    
    Object.keys(rules).forEach(fieldName => {
      const fieldValue = formData[fieldName];
      const fieldRules = rules[fieldName];
      const result = this.validateField(fieldValue, fieldRules);
      
      if (!result.isValid) {
        result.errors.forEach(error => {
          allErrors.push(`${fieldName}: ${error}`);
        });
      }
    });
    
    return { isValid: allErrors.length === 0, errors: allErrors };
  }
}

// Specific validation rules for common fields
export const ValidationRules = {
  email: { required: true, email: true },
  password: { required: true, minLength: 8 },
  fullName: { required: true, minLength: 2, maxLength: 100 },
  phone: { required: true, phone: true },
  gstNumber: { 
    required: true, 
    minLength: 15, 
    maxLength: 15,
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    custom: (value: string) => {
      if (!value) return true;
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value) || 'Please enter a valid GST number';
    }
  },
  panNumber: { 
    required: true, 
    minLength: 10, 
    maxLength: 10,
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    custom: (value: string) => {
      if (!value) return true;
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) || 'Please enter a valid PAN number';
    }
  },
  pincode: { 
    required: true, 
    pattern: /^[1-9][0-9]{5}$/,
    custom: (value: string) => {
      if (!value) return true;
      return /^[1-9][0-9]{5}$/.test(value) || 'Please enter a valid 6-digit pincode';
    }
  },
  spaceName: { required: true, minLength: 3, maxLength: 100 },
  spaceDescription: { required: true, minLength: 10, maxLength: 1000 },
  address: { required: true, minLength: 10, maxLength: 500 },
  city: { required: true, minLength: 2, maxLength: 50 },
  seats: { required: true, numeric: true, positive: true },
  pricePerHour: { required: true, numeric: true, positive: true },
  pricePerDay: { required: true, numeric: true, positive: true },
  website: { url: true },
  bankName: { required: true, minLength: 2, maxLength: 100 },
  accountNumber: { 
    required: true, 
    minLength: 9, 
    maxLength: 18,
    numeric: true 
  },
  ifscCode: { 
    required: true, 
    minLength: 11, 
    maxLength: 11,
    pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    custom: (value: string) => {
      if (!value) return true;
      return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value) || 'Please enter a valid IFSC code';
    }
  },
  accountHolderName: { required: true, minLength: 2, maxLength: 100 }
};

// React Hook for form validation
export function useFormValidation(initialData: Record<string, any> = {}, rules: Record<string, ValidationRule> = {}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const validateField = (name: string, value: any) => {
    if (rules[name]) {
      const result = FormValidator.validateField(value, rules[name]);
      setErrors(prev => ({ ...prev, [name]: result.errors }));
      return result.isValid;
    }
    return true;
  };
  
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };
  
  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };
  
  const validateForm = () => {
    const result = FormValidator.validateForm(formData, rules);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(rules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    // Set field-specific errors
    const fieldErrors: Record<string, string[]> = {};
    Object.keys(rules).forEach(fieldName => {
      const fieldResult = FormValidator.validateField(formData[fieldName], rules[fieldName]);
      fieldErrors[fieldName] = fieldResult.errors;
    });
    setErrors(fieldErrors);
    
    return result.isValid;
  };
  
  const resetForm = (newData: Record<string, any> = initialData) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
  };
  
  const getFieldProps = (name: string) => ({
    value: formData[name] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
      handleChange(name, e.target.value),
    onBlur: () => handleBlur(name),
    error: touched[name] && errors[name]?.[0],
    hasError: touched[name] && errors[name]?.length > 0
  });
  
  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    getFieldProps,
    isValid: Object.keys(errors).every(key => !errors[key]?.length)
  };
}

import { useState } from 'react';
