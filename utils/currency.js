// utils/currency.js
const axios = require('axios');
const NodeCache = require('node-cache');

// Configuration
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const BASE_CURRENCY = process.env.BASE_CURRENCY || 'USD'; // Your Shopify store's base currency
const CACHE_TTL = 86400; // Cache for 24 hours
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

// Create cache instance
const currencyCache = new NodeCache({ 
    stdTTL: CACHE_TTL,
    checkperiod: 3600, // Check for expired keys every hour
    useClones: false // Better performance for simple objects
});

// Fallback exchange rates (updated as of recent date)
const FALLBACK_RATES = {
    USD: 1,
    AED: 3.6725, AFN: 70.5975, ALL: 84.2455, AMD: 384.8114, ANG: 1.7900,
    AOA: 918.1451, ARS: 1189.8300, AUD: 1.5306, AWG: 1.7900, AZN: 1.7005,
    BAM: 1.6705, BBD: 2.0000, BDT: 122.2756, BGN: 1.6705, BHD: 0.3760,
    BIF: 2974.4973, BMD: 1.0000, BND: 1.2760, BOB: 6.9319, BRL: 5.4812,
    BSD: 1.0000, BTN: 85.5581, BWP: 13.3786, BYN: 3.0621, BZD: 2.0000,
    CAD: 1.3675, CDF: 2877.2616, CHF: 0.7997, CLP: 933.0793, CNY: 7.1694,
    COP: 4073.4915, CRC: 505.7848, CUP: 24.0000, CVE: 94.1764, CZK: 21.1252,
    DJF: 177.7210, DKK: 6.3701, DOP: 59.1779, DZD: 129.9198, EGP: 49.8952,
    ERN: 15.0000, ETB: 135.2452, EUR: 0.8541, FJD: 2.2469, FKP: 0.7295,
    GBP: 0.7295, GEL: 2.7236, GHS: 10.7895, GIP: 0.7295, GMD: 72.7270,
    GNF: 8672.0397, GTQ: 7.6994, GYD: 209.2570, HKD: 7.8501, HNL: 26.1346,
    HRK: 6.4352, HTG: 131.0478, HUF: 340.6258, IDR: 16239.2188, ILS: 3.3880,
    INR: 85.5582, IQD: 1310.8346, IRR: 42100.8335, ISK: 121.2267, JMD: 160.1723,
    JOD: 0.7090, JPY: 144.6523, KES: 129.1399, KGS: 87.2722, KHR: 4013.1431,
    KMF: 420.1856, KRW: 1358.9055, KWD: 0.3059, KYD: 0.8333, KZT: 519.8525,
    LAK: 21638.1869, LBP: 89500.0000, LKR: 299.9270, LRD: 200.1617, LSL: 17.8207,
    LYD: 5.4180, MAD: 9.0314, MDL: 17.0133, MGA: 4430.5255, MKD: 52.7603,
    MMK: 2103.9138, MNT: 3593.6396, MOP: 8.0856, MRU: 39.7334, MUR: 45.3258,
    MVR: 15.4670, MWK: 1746.8626, MXN: 18.8457, MYR: 4.2287, MZN: 63.5871,
    NAD: 17.8207, NGN: 1540.3785, NIO: 36.8148, NOK: 10.0803, NPR: 136.8930,
    NZD: 1.6513, OMR: 0.3845, PAB: 1.0000, PEN: 3.5607, PGK: 4.1216,
    PHP: 56.5810, PKR: 283.9276, PLN: 3.6192, PYG: 8002.4031, QAR: 3.6400,
    RON: 4.3366, RSD: 100.0416, RUB: 78.5468, RWF: 1449.6691, SAR: 3.7500,
    SBD: 8.5243, SCR: 14.7530, SDG: 544.7909, SEK: 9.4871, SGD: 1.2760,
    SHP: 0.7295, SLE: 22.4620, SLL: 22461.9976, SOS: 571.5676, SRD: 37.8031,
    SSP: 4691.0068, STN: 20.9252, SYP: 12953.3928, SZL: 17.8207, THB: 32.5945,
    TJS: 9.8725, TMT: 3.5002, TND: 2.8820, TOP: 2.3794, TRY: 39.8892,
    TTD: 6.8084, TWD: 28.9352, TZS: 2635.4526, UAH: 41.6642, UGX: 3588.7142,
    UYU: 40.3528, UZS: 12610.0261, VES: 107.6245, VND: 26095.3148, VUV: 119.5045,
    WST: 2.6976, XAF: 560.2474, XCD: 2.7000, XDR: 0.7257, XOF: 560.2474,
    XPF: 101.9205, YER: 242.7808, ZAR: 17.8207, ZMW: 23.6870, ZWL: 26.9389
};

/**
 * Fetch exchange rates from API with fallback support
 * @returns {Promise<Object>} Exchange rates object
 */
async function getExchangeRates() {
    // Check cache first
    const cachedRates = currencyCache.get('exchangeRates');
    if (cachedRates) {
        console.log('Using cached exchange rates');
        return cachedRates;
    }

    try {
        console.log('Fetching fresh exchange rates...');
        
        // Validate API key
        if (!EXCHANGE_RATE_API_KEY || EXCHANGE_RATE_API_KEY === 'your_api_key_here') {
            console.warn('No valid exchange rate API key provided, using fallback rates');
            currencyCache.set('exchangeRates', FALLBACK_RATES);
            return FALLBACK_RATES;
        }

        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${BASE_CURRENCY}`,
            {
                timeout: REQUEST_TIMEOUT,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'ShippingRatesAPI/1.0'
                }
            }
        );

        if (response.data.result === 'success') {
            const rates = response.data.conversion_rates;
            
            // Validate rates data
            if (!rates || typeof rates !== 'object' || Object.keys(rates).length === 0) {
                throw new Error('Invalid rates data received from API');
            }

            // Ensure base currency is included and equals 1
            rates[BASE_CURRENCY] = 1;

            console.log(`Successfully fetched ${Object.keys(rates).length} exchange rates`);
            currencyCache.set('exchangeRates', rates);
            return rates;
        } else {
            throw new Error(`API returned error: ${response.data.result} - ${response.data['error-type']}`);
        }
    } catch (error) {
        console.error('Currency API Error:', error.message);
        
        // Check if we have old cached data as a secondary fallback
        const staleRates = currencyCache.get('exchangeRates', true); // Get without TTL check
        if (staleRates) {
            console.warn('Using stale cached exchange rates due to API failure');
            return staleRates;
        }

        // Use hardcoded fallback rates
        console.warn('Using fallback exchange rates due to API failure');
        currencyCache.set('exchangeRates', FALLBACK_RATES);
        return FALLBACK_RATES;
    }
}

/**
 * Convert currency amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object
 * @returns {number} Converted amount
 */
function convertCurrency(amount, fromCurrency, toCurrency, rates) {
    // Validate inputs
    if (typeof amount !== 'number' || isNaN(amount)) {
        throw new Error('Amount must be a valid number');
    }

    if (!fromCurrency || !toCurrency) {
        throw new Error('Both fromCurrency and toCurrency must be provided');
    }

    // Normalize currency codes
    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();

    // Same currency, no conversion needed
    if (fromCurrency === toCurrency) {
        return amount;
    }

    // Validate rates object
    if (!rates || typeof rates !== 'object') {
        throw new Error('Invalid rates object provided');
    }

    // Check if currencies are supported
    if (!rates[fromCurrency]) {
        throw new Error(`Unsupported source currency: ${fromCurrency}`);
    }

    if (!rates[toCurrency]) {
        throw new Error(`Unsupported target currency: ${toCurrency}`);
    }

    // Convert via base currency (USD)
    // If rates are based on USD, convert: amount * (toRate / fromRate)
    const convertedAmount = (amount / rates[fromCurrency]) * rates[toCurrency];

    return convertedAmount;
}

/**
 * Get currency information including symbol and decimal places
 * @param {string} currencyCode - Currency code
 * @returns {Object} Currency information
 */
function getCurrencyInfo(currencyCode) {
    const currencyData = {
        USD: { symbol: '$', decimals: 2, name: 'US Dollar' },
        EUR: { symbol: '€', decimals: 2, name: 'Euro' },
        GBP: { symbol: '£', decimals: 2, name: 'British Pound' },
        JPY: { symbol: '¥', decimals: 0, name: 'Japanese Yen' },
        CAD: { symbol: 'C$', decimals: 2, name: 'Canadian Dollar' },
        AUD: { symbol: 'A$', decimals: 2, name: 'Australian Dollar' },
        CHF: { symbol: 'CHF', decimals: 2, name: 'Swiss Franc' },
        CNY: { symbol: '¥', decimals: 2, name: 'Chinese Yuan' },
        INR: { symbol: '₹', decimals: 2, name: 'Indian Rupee' },
        // Add more as needed
    };

    return currencyData[currencyCode.toUpperCase()] || { 
        symbol: currencyCode.toUpperCase(), 
        decimals: 2, 
        name: currencyCode.toUpperCase() 
    };
}

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currencyCode) {
    const info = getCurrencyInfo(currencyCode);
    const roundedAmount = Math.round(amount * Math.pow(10, info.decimals)) / Math.pow(10, info.decimals);
    
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode.toUpperCase(),
            minimumFractionDigits: info.decimals,
            maximumFractionDigits: info.decimals
        }).format(roundedAmount);
    } catch (error) {
        // Fallback for unsupported currencies
        return `${info.symbol}${roundedAmount.toFixed(info.decimals)}`;
    }
}

/**
 * Clear cache manually (useful for testing or admin endpoints)
 */
function clearCache() {
    currencyCache.flushAll();
    console.log('Currency cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
    return {
        keys: currencyCache.keys(),
        stats: currencyCache.getStats(),
        ttl: currencyCache.getTtl('exchangeRates')
    };
}

module.exports = {
    getExchangeRates,
    convertCurrency,
    getCurrencyInfo,
    formatCurrency,
    clearCache,
    getCacheStats,
    currencyCache,
    BASE_CURRENCY,
    FALLBACK_RATES
};