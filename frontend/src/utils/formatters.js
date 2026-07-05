/**
 * Utility functions for formatting various types of data on the frontend.
 */

/**
 * Format currency in INR (₹)
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format percentage changes (e.g. +1.50% or -2.30%)
 * @param {number} value - The percentage value
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value) => {
  if (value === undefined || value === null) return '0.00%';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
};

/**
 * Format date in a readable Indian format
 * @param {string|Date} dateStr - Date string or object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format large numbers in Indian Lakhs/Crores
 * @param {number} num - The number
 * @returns {string} Formatted string
 */
export const formatIndianNumber = (num) => {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  }
  return num.toString();
};
