import { format } from 'date-fns';

/**
 * Safely formats a date value with error handling
 * @param {string|Date} dateValue - The date value to format
 * @param {string} formatString - The format string (default: 'MMM dd, yyyy')
 * @returns {string} - Formatted date string or fallback text
 */
export const formatDateSafely = (dateValue, formatString = 'MMM dd, yyyy') => {
  if (!dateValue) return 'N/A';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateValue);
      return 'Invalid Date';
    }
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error, 'Value:', dateValue);
    return 'Date Error';
  }
};

/**
 * Safely creates a Date object with validation
 * @param {string|Date} dateValue - The date value to parse
 * @returns {Date|null} - Valid Date object or null if invalid
 */
export const createSafeDate = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateValue);
      return null;
    }
    return date;
  } catch (error) {
    console.error('Date creation error:', error, 'Value:', dateValue);
    return null;
  }
};

/**
 * Checks if a date value is valid
 * @param {string|Date} dateValue - The date value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  
  try {
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};
