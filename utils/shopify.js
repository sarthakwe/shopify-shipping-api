// Shopify utility functions

/**
 * Validate country name
 * @param {string} country - Country name to validate
 * @returns {boolean} - Whether the country name is valid
 */
function validateCountry(country) {
    if (!country || typeof country !== 'string') {
        return false;
    }
    
    // Basic validation - adjust as needed
    const trimmed = country.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
}

/**
 * Format shipping rates from Shopify API response
 * @param {object} zone - Shipping zone object from Shopify
 * @returns {array} - Formatted shipping rates
 */
function formatShippingRates(zone) {
    const rates = [];
    
    // Add price-based shipping rates
    if (zone.price_based_shipping_rates) {
        zone.price_based_shipping_rates.forEach(rate => {
            rates.push({
                id: rate.id,
                name: rate.name,
                price: parseFloat(rate.price || 0),
                currency: 'USD', // You might want to get this from shop settings
                type: 'price_based',
                min_order_subtotal: rate.min_order_subtotal ? parseFloat(rate.min_order_subtotal) : null,
                max_order_subtotal: rate.max_order_subtotal ? parseFloat(rate.max_order_subtotal) : null,
                conditions: getConditionsText(rate)
            });
        });
    }
    
    // Add weight-based shipping rates
    if (zone.weight_based_shipping_rates) {
        zone.weight_based_shipping_rates.forEach(rate => {
            rates.push({
                id: rate.id,
                name: rate.name,
                price: parseFloat(rate.price || 0),
                currency: 'USD',
                type: 'weight_based',
                min_weight: rate.min_weight ? parseFloat(rate.min_weight) : null,
                max_weight: rate.max_weight ? parseFloat(rate.max_weight) : null,
                conditions: getWeightConditionsText(rate)
            });
        });
    }
    
    // Sort rates by price (cheapest first)
    return rates.sort((a, b) => a.price - b.price);
}

/**
 * Get conditions text for price-based rates
 * @param {object} rate - Shipping rate object
 * @returns {string} - Human-readable conditions
 */
function getConditionsText(rate) {
    const conditions = [];
    
    if (rate.min_order_subtotal) {
        conditions.push(`Minimum order: $${rate.min_order_subtotal}`);
    }
    
    if (rate.max_order_subtotal) {
        conditions.push(`Maximum order: $${rate.max_order_subtotal}`);
    }
    
    return conditions.join(', ') || 'No minimum order';
}

/**
 * Get conditions text for weight-based rates
 * @param {object} rate - Shipping rate object
 * @returns {string} - Human-readable conditions
 */
function getWeightConditionsText(rate) {
    const conditions = [];
    
    if (rate.min_weight) {
        conditions.push(`Minimum weight: ${rate.min_weight} kg`);
    }
    
    if (rate.max_weight) {
        conditions.push(`Maximum weight: ${rate.max_weight} kg`);
    }
    
    return conditions.join(', ') || 'No weight restrictions';
}

/**
 * Handle Shopify API errors
 * @param {number} statusCode - HTTP status code
 * @returns {string} - User-friendly error message
 */
function handleShopifyError(statusCode) {
    switch (statusCode) {
        case 401:
            return 'Authentication failed - check your Shopify credentials';
        case 403:
            return 'Access denied - insufficient permissions';
        case 404:
            return 'Shopify store not found';
        case 429:
            return 'Rate limit exceeded - please try again later';
        case 500:
        case 502:
        case 503:
            return 'Shopify service temporarily unavailable';
        default:
            return 'Failed to connect to Shopify';
    }
}

/**
 * Get country code from country name (basic mapping)
 * @param {string} countryName - Country name
 * @returns {string} - Country code
 */
function getCountryCode(countryName) {
    const countryMap = {
        'India': 'IN',
        'United States': 'US',
        'Canada': 'CA',
        'United Kingdom': 'GB',
        'Australia': 'AU',
        'Germany': 'DE',
        'France': 'FR',
        'Japan': 'JP',
        'China': 'CN',
        'Brazil': 'BR'
        // Add more as needed
    };
    
    return countryMap[countryName] || countryName.toUpperCase().slice(0, 2);
}

module.exports = {
    validateCountry,
    formatShippingRates,
    getConditionsText,
    getWeightConditionsText,
    handleShopifyError,
    getCountryCode
};