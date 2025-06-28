const ISO_COUNTRIES = require('iso-countries');

const validateCountry = (country) => {
  if (!country || typeof country !== 'string') return false;
  
  const normalized = country.trim().toLowerCase();
  
  // Check if it's a valid ISO code
  if (normalized.length === 2) {
    return ISO_COUNTRIES.isValid(normalized.toUpperCase());
  }
  
  // Check if it's a valid country name
  return Object.values(ISO_COUNTRIES.getNames()).some(
    name => name.toLowerCase() === normalized
  );
};

const formatCountryCode = (country) => {
  if (!validateCountry(country)) return null;
  
  const normalized = country.trim().toLowerCase();
  
  if (normalized.length === 2) {
    return normalized.toUpperCase();
  }
  
  return ISO_COUNTRIES.getAlpha2Code(country, 'en');
};

module.exports = { validateCountry, formatCountryCode };
