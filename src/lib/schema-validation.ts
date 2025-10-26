// Comprehensive validation system based on schema.sql database constraints
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class SchemaValidator {
  // Email validation (from users and space_owners CHECK constraint)
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    
    if (!email.trim()) {
      errors.push("Email is required");
    } else if (!emailRegex.test(email)) {
      errors.push("Invalid email format");
    } else if (email.length > 255) {
      errors.push("Email must be less than 255 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Phone validation (from users and space_owners CHECK constraint)
  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    
    if (!phone.trim()) {
      errors.push("Phone number is required");
    } else if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      errors.push("Invalid phone number format. Use +91XXXXXXXXXX format");
    } else if (phone.length > 15) {
      errors.push("Phone number must be less than 15 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Name validation
  static validateName(name: string, fieldName: string = "Name", maxLength: number = 100): ValidationResult {
    const errors: string[] = [];
    
    if (!name.trim()) {
      errors.push(`${fieldName} is required`);
    } else if (name.trim().length < 2) {
      errors.push(`${fieldName} must be at least 2 characters long`);
    } else if (name.length > maxLength) {
      errors.push(`${fieldName} must be less than ${maxLength} characters`);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Password validation
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push("Password is required");
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    } else if (password.length > 72) {
      errors.push("Password must be less than 72 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // City validation
  static validateCity(city: string): ValidationResult {
    const errors: string[] = [];
    
    if (!city.trim()) {
      errors.push("City is required");
    } else if (city.length > 100) {
      errors.push("City name must be less than 100 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // GST Number validation (from business_info CHECK constraint)
  static validateGST(gst: string): ValidationResult {
    const errors: string[] = [];
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    
    if (gst.trim() && !gstRegex.test(gst.trim())) {
      errors.push("Invalid GST format. Should be like: 22AAAAA0000A1Z5");
    } else if (gst.length > 15) {
      errors.push("GST number must be exactly 15 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // PAN Number validation (from business_info CHECK constraint)
  static validatePAN(pan: string): ValidationResult {
    const errors: string[] = [];
    const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
    
    if (!pan.trim()) {
      errors.push("PAN number is required");
    } else if (!panRegex.test(pan.trim())) {
      errors.push("Invalid PAN format. Should be like: ABCDE1234F");
    } else if (pan.length !== 10) {
      errors.push("PAN number must be exactly 10 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Pincode validation (from business_info and spaces CHECK constraint)
  static validatePincode(pincode: string): ValidationResult {
    const errors: string[] = [];
    const pincodeRegex = /^\d{6}$/;
    
    if (!pincode.trim()) {
      errors.push("Pincode is required");
    } else if (!pincodeRegex.test(pincode.trim())) {
      errors.push("Pincode must be exactly 6 digits");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // IFSC Code validation (from payment_info CHECK constraint)
  static validateIFSC(ifsc: string): ValidationResult {
    const errors: string[] = [];
    const ifscRegex = /^[A-Z]{4}\d{7}$/;
    
    if (!ifsc.trim()) {
      errors.push("IFSC code is required");
    } else if (!ifscRegex.test(ifsc.trim())) {
      errors.push("Invalid IFSC format. Should be like: SBIN0001234");
    } else if (ifsc.length !== 11) {
      errors.push("IFSC code must be exactly 11 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // UPI ID validation (from payment_info CHECK constraint)
  static validateUPI(upi: string): ValidationResult {
    const errors: string[] = [];
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    
    if (upi.trim() && !upiRegex.test(upi.trim())) {
      errors.push("Invalid UPI ID format. Should be like: user@bank");
    } else if (upi.length > 50) {
      errors.push("UPI ID must be less than 50 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Bank Account Number validation
  static validateBankAccount(accountNumber: string): ValidationResult {
    const errors: string[] = [];
    
    if (!accountNumber.trim()) {
      errors.push("Bank account number is required");
    } else if (accountNumber.length < 9 || accountNumber.length > 20) {
      errors.push("Bank account number must be between 9 and 20 digits");
    } else if (!/^\d+$/.test(accountNumber.trim())) {
      errors.push("Bank account number must contain only digits");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Business name validation
  static validateBusinessName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name.trim()) {
      errors.push("Business name is required");
    } else if (name.length < 3) {
      errors.push("Business name must be at least 3 characters long");
    } else if (name.length > 200) {
      errors.push("Business name must be less than 200 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Space pricing validation (from spaces CHECK constraint)
  static validatePrice(price: string | number, fieldName: string = "Price"): ValidationResult {
    const errors: string[] = [];
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (!price || isNaN(numPrice)) {
      errors.push(`${fieldName} is required`);
    } else if (numPrice <= 0) {
      errors.push(`${fieldName} must be greater than 0`);
    } else if (numPrice > 999999.99) {
      errors.push(`${fieldName} must be less than 10,00,000`);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Seats validation (from spaces CHECK constraint)
  static validateSeats(totalSeats: string | number, availableSeats: string | number): ValidationResult {
    const errors: string[] = [];
    const numTotalSeats = typeof totalSeats === 'string' ? parseInt(totalSeats) : totalSeats;
    const numAvailableSeats = typeof availableSeats === 'string' ? parseInt(availableSeats) : availableSeats;
    
    if (!totalSeats || isNaN(numTotalSeats)) {
      errors.push("Total seats is required");
    } else if (numTotalSeats <= 0) {
      errors.push("Total seats must be greater than 0");
    }
    
    if (availableSeats && !isNaN(numAvailableSeats)) {
      if (numAvailableSeats < 0) {
        errors.push("Available seats cannot be negative");
      } else if (numAvailableSeats > numTotalSeats) {
        errors.push("Available seats cannot exceed total seats");
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Coordinates validation (from spaces CHECK constraint)
  static validateCoordinates(latitude: string | number, longitude: string | number): ValidationResult {
    const errors: string[] = [];
    const numLat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const numLng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    
    if ((latitude && !longitude) || (!latitude && longitude)) {
      errors.push("Both latitude and longitude must be provided together");
    }
    
    if (latitude && (isNaN(numLat) || numLat < -90 || numLat > 90)) {
      errors.push("Latitude must be between -90 and 90");
    }
    
    if (longitude && (isNaN(numLng) || numLng < -180 || numLng > 180)) {
      errors.push("Longitude must be between -180 and 180");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Rating validation (from reviews CHECK constraint)
  static validateRating(rating: number): ValidationResult {
    const errors: string[] = [];
    
    if (!rating || isNaN(rating)) {
      errors.push("Rating is required");
    } else if (rating < 1 || rating > 5) {
      errors.push("Rating must be between 1 and 5");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Time validation (from bookings CHECK constraint)
  static validateTimeRange(startTime: string, endTime: string): ValidationResult {
    const errors: string[] = [];
    
    if (!startTime) {
      errors.push("Start time is required");
    }
    
    if (!endTime) {
      errors.push("End time is required");
    }
    
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      
      if (start >= end) {
        errors.push("End time must be after start time");
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Date validation (from bookings CHECK constraint)
  static validateBookingDate(date: string | Date): ValidationResult {
    const errors: string[] = [];
    const bookingDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!date) {
      errors.push("Booking date is required");
    } else if (isNaN(bookingDate.getTime())) {
      errors.push("Invalid date format");
    } else if (bookingDate < today) {
      errors.push("Booking date cannot be in the past");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Amount validation (from bookings CHECK constraint)
  static validateAmount(amount: string | number, fieldName: string = "Amount"): ValidationResult {
    const errors: string[] = [];
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (!amount || isNaN(numAmount)) {
      errors.push(`${fieldName} is required`);
    } else if (numAmount <= 0) {
      errors.push(`${fieldName} must be greater than 0`);
    } else if (numAmount > 99999999.99) {
      errors.push(`${fieldName} is too large`);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Professional role validation (from users table enum)
  static validateProfessionalRole(role: string): ValidationResult {
    const errors: string[] = [];
    const validRoles = ['violet', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red', 'grey', 'white', 'black'];
    
    if (!role.trim()) {
      errors.push("Professional role is required");
    } else if (!validRoles.includes(role.trim())) {
      errors.push("Invalid professional role");
    }
    
    return { isValid: errors.length === 0, errors };
  }

  // Comprehensive form validators
  static validateUserForm(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    professionalRole?: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    const validations = [
      this.validateEmail(data.email),
      this.validatePassword(data.password),
      this.validateName(data.firstName, "First name"),
      this.validateName(data.lastName, "Last name"),
      this.validatePhone(data.phone),
      this.validateCity(data.city),
    ];

    if (data.professionalRole) {
      validations.push(this.validateProfessionalRole(data.professionalRole));
    }

    validations.forEach(validation => {
      errors.push(...validation.errors);
    });
    
    return { isValid: errors.length === 0, errors };
  }

  static validateSpaceOwnerBusinessForm(data: {
    businessName: string;
    businessType: string;
    gstNumber?: string;
    panNumber: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessPincode: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    const validations = [
      this.validateBusinessName(data.businessName),
      this.validatePAN(data.panNumber),
      this.validatePincode(data.businessPincode),
    ];

    if (!data.businessType.trim()) {
      errors.push("Business type is required");
    }
    
    if (!data.businessAddress.trim()) {
      errors.push("Business address is required");
    }
    
    if (!data.businessCity.trim()) {
      errors.push("Business city is required");
    }
    
    if (!data.businessState.trim()) {
      errors.push("Business state is required");
    }
    
    if (data.gstNumber) {
      validations.push(this.validateGST(data.gstNumber));
    }

    validations.forEach(validation => {
      errors.push(...validation.errors);
    });
    
    return { isValid: errors.length === 0, errors };
  }

  static validatePaymentInfoForm(data: {
    bankAccountNumber: string;
    bankIfscCode: string;
    bankAccountHolderName: string;
    bankName: string;
    upiId?: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    const validations = [
      this.validateBankAccount(data.bankAccountNumber),
      this.validateIFSC(data.bankIfscCode),
      this.validateName(data.bankAccountHolderName, "Account holder name"),
    ];

    if (!data.bankName.trim()) {
      errors.push("Bank name is required");
    } else if (data.bankName.length > 100) {
      errors.push("Bank name must be less than 100 characters");
    }
    
    if (data.upiId) {
      validations.push(this.validateUPI(data.upiId));
    }

    validations.forEach(validation => {
      errors.push(...validation.errors);
    });
    
    return { isValid: errors.length === 0, errors };
  }

  static validateSpaceForm(data: {
    name: string;
    description: string;
    address: string;
    city: string;
    pincode: string;
    totalSeats: string | number;
    availableSeats: string | number;
    pricePerHour: string | number;
    pricePerDay: string | number;
    latitude?: string | number;
    longitude?: string | number;
  }): ValidationResult {
    const errors: string[] = [];
    
    const validations = [
      this.validateName(data.name, "Space name", 200),
      this.validateCity(data.city),
      this.validatePincode(data.pincode),
      this.validateSeats(data.totalSeats, data.availableSeats),
      this.validatePrice(data.pricePerHour, "Hourly price"),
      this.validatePrice(data.pricePerDay, "Daily price"),
    ];

    if (!data.description.trim()) {
      errors.push("Space description is required");
    }
    
    if (!data.address.trim()) {
      errors.push("Space address is required");
    }
    
    if (data.latitude || data.longitude) {
      validations.push(this.validateCoordinates(data.latitude!, data.longitude!));
    }

    validations.forEach(validation => {
      errors.push(...validation.errors);
    });
    
    return { isValid: errors.length === 0, errors };
  }

  static validateBookingForm(data: {
    spaceId: string;
    userId: string;
    date: string | Date;
    startTime: string;
    endTime: string;
    seatsBooked: string | number;
    baseAmount: string | number;
    totalAmount: string | number;
  }): ValidationResult {
    const errors: string[] = [];
    
    const validations = [
      this.validateBookingDate(data.date),
      this.validateTimeRange(data.startTime, data.endTime),
      this.validateAmount(data.seatsBooked, "Seats booked"),
      this.validateAmount(data.baseAmount, "Base amount"),
      this.validateAmount(data.totalAmount, "Total amount"),
    ];

    if (!data.spaceId.trim()) {
      errors.push("Space ID is required");
    }
    
    if (!data.userId.trim()) {
      errors.push("User ID is required");
    }
    
    const seats = typeof data.seatsBooked === 'string' ? parseInt(data.seatsBooked) : data.seatsBooked;
    if (seats && seats < 1) {
      errors.push("At least 1 seat must be booked");
    }

    validations.forEach(validation => {
      errors.push(...validation.errors);
    });
    
    return { isValid: errors.length === 0, errors };
  }

  static validateReviewForm(data: {
    rating: number;
    comment?: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    const ratingValidation = this.validateRating(data.rating);
    errors.push(...ratingValidation.errors);
    
    if (data.comment && data.comment.length > 1000) {
      errors.push("Comment must be less than 1000 characters");
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

// Utility function to display validation errors
export const displayValidationErrors = (errors: string[]): string => {
  return errors.join(', ');
};

// React hook for form validation
import { useState, useCallback } from 'react';

export const useSchemaValidation = () => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  const validate = useCallback((fieldName: string, value: any, validator: (value: any) => ValidationResult) => {
    const result = validator(value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.errors
    }));
    return result.isValid;
  }, []);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const getFieldError = useCallback((fieldName: string): string | null => {
    const fieldErrors = errors[fieldName];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
  }, [errors]);
  
  const hasErrors = useCallback((): boolean => {
    return Object.values(errors).some(fieldErrors => fieldErrors.length > 0);
  }, [errors]);
  
  return {
    errors,
    validate,
    clearErrors,
    getFieldError,
    hasErrors
  };
};
