const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Import utility functions
const { validateCountry, formatShippingRates, handleShopifyError } = require('../utils/shopify');
const { getExchangeRates, convertCurrency, currencyCache, BASE_CURRENCY } = require('../utils/currency');

// Input sanitization helper
const sanitizeCountryName = (country) => {
    return country?.trim().replace(/[^a-zA-Z\s-]/g, '');
};

// Get shipping rates by country
router.get('/shipping-rates/:country', async (req, res) => {
    const rawCountryName = req.params.country;
    const countryName = sanitizeCountryName(rawCountryName);
    const targetCurrency = (req.query.currency || 'USD').toUpperCase();

    // Basic input validation
    if (!countryName || countryName.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Invalid country name provided',
            rates: []
        });
    }

    try {
        // Validate currency
        const rates = await getExchangeRates();
        if (!rates[targetCurrency]) {
            return res.status(400).json({
                success: false,
                message: `Unsupported currency: ${targetCurrency}`,
                supported_currencies: Object.keys(rates)
            });
        }

        // Validate country using utility function
        if (!validateCountry(countryName)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid country name provided',
                rates: []
            });
        }

        // Fetch shipping zones from Shopify
        const response = await fetch(
            `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/shipping_zones.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Check if Shopify API response is ok
        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Handle Shopify API errors
        if (data.errors) {
            throw new Error(`Shopify API errors: ${JSON.stringify(data.errors)}`);
        }

        // Find the shipping zone for the country
        const targetZone = data.shipping_zones?.find(zone =>
            zone.countries?.some(country =>
                country.name.toLowerCase() === countryName.toLowerCase() ||
                country.code.toLowerCase() === countryName.toLowerCase()
            )
        );

        if (!targetZone) {
            return res.json({
                success: false,
                message: `No shipping available to ${countryName}`,
                rates: []
            });
        }

        // Format rates with currency conversion
        const formattedRates = targetZone.price_based_shipping_rates?.map(rate => {
            try {
                const convertedPrice = convertCurrency(
                    parseFloat(rate.price),
                    BASE_CURRENCY,
                    targetCurrency,
                    rates
                );

                return {
                    name: rate.name,
                    price: Math.round(convertedPrice * 100) / 100, // Round to 2 decimal places
                    currency: targetCurrency,
                    original_price: parseFloat(rate.price),
                    original_currency: BASE_CURRENCY,
                    min_order_subtotal: rate.min_order_subtotal || null,
                    max_order_subtotal: rate.max_order_subtotal || null
                };
            } catch (conversionError) {
                console.error('Currency conversion error:', conversionError);
                return {
                    name: rate.name,
                    price: parseFloat(rate.price),
                    currency: BASE_CURRENCY,
                    original_price: parseFloat(rate.price),
                    original_currency: BASE_CURRENCY,
                    conversion_error: 'Currency conversion failed'
                };
            }
        }) || [];

        // Include weight-based and carrier-calculated rates if available
        const weightBasedRates = targetZone.weight_based_shipping_rates?.map(rate => ({
            name: rate.name,
            price: convertCurrency(parseFloat(rate.price), BASE_CURRENCY, targetCurrency, rates),
            currency: targetCurrency,
            type: 'weight_based',
            weight_low: rate.weight_low,
            weight_high: rate.weight_high
        })) || [];

        const allRates = [...formattedRates, ...weightBasedRates];

        res.json({
            success: true,
            country: countryName,
            currency: targetCurrency,
            exchange_rate: rates[targetCurrency],
            zone: targetZone.name,
            rates: allRates,
            total_rates: allRates.length,
            timestamp: new Date().toISOString(),
            rate_refresh: 'Daily cache - rates update every 24 hours'
        });

    } catch (error) {
        console.error('Error fetching shipping rates:', error);

        // Handle specific error types
        if (error.message.includes('Shopify API')) {
            return res.status(502).json({
                success: false,
                message: 'External service temporarily unavailable',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch shipping rates',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get supported currencies
router.get('/supported-currencies', async (req, res) => {
    try {
        const rates = await getExchangeRates();
        const cacheInfo = currencyCache.getTtl('exchangeRates');

        res.json({
            success: true,
            base_currency: BASE_CURRENCY,
            supported_currencies: Object.keys(rates).sort(),
            total_currencies: Object.keys(rates).length,
            last_updated: cacheInfo
                ? new Date(Date.now() - (currencyCache.options.stdTTL * 1000 - cacheInfo)).toISOString()
                : 'Using fallback rates',
            cache_expires_in: cacheInfo ? Math.floor(cacheInfo / 1000) : null
        });
    } catch (error) {
        console.error('Error fetching currency information:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch currency information'
        });
    }
});

// Get all available countries with shipping
router.get('/countries', async (req, res) => {
    try {
        const response = await fetch(
            `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/shipping_zones.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.errors) {
            throw new Error(`Shopify API errors: ${JSON.stringify(data.errors)}`);
        }

        // Extract all countries from all shipping zones
        const countries = [];
        const countryMap = new Map(); // Use Map to avoid duplicates more efficiently

        data.shipping_zones?.forEach(zone => {
            zone.countries?.forEach(country => {
                if (!countryMap.has(country.code)) {
                    const countryInfo = {
                        name: country.name,
                        code: country.code,
                        zone: zone.name,
                        zone_id: zone.id
                    };
                    countryMap.set(country.code, countryInfo);
                    countries.push(countryInfo);
                }
            });
        });

        // Sort countries alphabetically
        countries.sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            countries: countries,
            total_countries: countries.length,
            zones: [...new Set(countries.map(c => c.zone))].sort()
        });

    } catch (error) {
        console.error('Error fetching countries:', error);

        if (error.message.includes('Shopify API')) {
            return res.status(502).json({
                success: false,
                message: 'External service temporarily unavailable',
                countries: []
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch countries',
            countries: []
        });
    }
});

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Quick health check
        const rates = await getExchangeRates();
        const hasValidRates = rates && Object.keys(rates).length > 0;

        res.json({
            success: true,
            status: 'healthy',
            currency_service: hasValidRates ? 'operational' : 'degraded',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: 'Service dependencies unavailable'
        });
    }
});

module.exports = router;