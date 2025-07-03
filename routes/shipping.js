const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Country validation utilities (keeping existing ones)
const COUNTRY_CODES = {
    "AF": "Afghanistan",
    "AL": "Albania",
    "DZ": "Algeria",
    "AS": "American Samoa",
    "AD": "Andorra",
    "AO": "Angola",
    "AI": "Anguilla",
    "AQ": "Antarctica",
    "AG": "Antigua and Barbuda",
    "AR": "Argentina",
    "AM": "Armenia",
    "AW": "Aruba",
    "AU": "Australia",
    "AT": "Austria",
    "AZ": "Azerbaijan",
    "BS": "Bahamas",
    "BH": "Bahrain",
    "BD": "Bangladesh",
    "BB": "Barbados",
    "BY": "Belarus",
    "BE": "Belgium",
    "BZ": "Belize",
    "BJ": "Benin",
    "BM": "Bermuda",
    "BT": "Bhutan",
    "BO": "Bolivia",
    "BA": "Bosnia and Herzegovina",
    "BW": "Botswana",
    "BR": "Brazil",
    "IO": "British Indian Ocean Territory",
    "BN": "Brunei",
    "BG": "Bulgaria",
    "BF": "Burkina Faso",
    "BI": "Burundi",
    "CV": "Cabo Verde",
    "KH": "Cambodia",
    "CM": "Cameroon",
    "CA": "Canada",
    "KY": "Cayman Islands",
    "CF": "Central African Republic",
    "TD": "Chad",
    "CL": "Chile",
    "CN": "China",
    "CO": "Colombia",
    "KM": "Comoros",
    "CD": "Congo (DRC)",
    "CG": "Congo (Republic)",
    "CR": "Costa Rica",
    "CI": "Côte d’Ivoire",
    "HR": "Croatia",
    "CU": "Cuba",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "DJ": "Djibouti",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "EC": "Ecuador",
    "EG": "Egypt",
    "SV": "El Salvador",
    "GQ": "Equatorial Guinea",
    "ER": "Eritrea",
    "EE": "Estonia",
    "SZ": "Eswatini",
    "ET": "Ethiopia",
    "FJ": "Fiji",
    "FI": "Finland",
    "FR": "France",
    "GA": "Gabon",
    "GM": "Gambia",
    "GE": "Georgia",
    "DE": "Germany",
    "GH": "Ghana",
    "GR": "Greece",
    "GL": "Greenland",
    "GD": "Grenada",
    "GU": "Guam",
    "GT": "Guatemala",
    "GN": "Guinea",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HT": "Haiti",
    "HN": "Honduras",
    "HU": "Hungary",
    "IS": "Iceland",
    "IN": "India",
    "ID": "Indonesia",
    "IR": "Iran",
    "IQ": "Iraq",
    "IE": "Ireland",
    "IL": "Israel",
    "IT": "Italy",
    "JM": "Jamaica",
    "JP": "Japan",
    "JO": "Jordan",
    "KZ": "Kazakhstan",
    "KE": "Kenya",
    "KI": "Kiribati",
    "KP": "North Korea",
    "KR": "South Korea",
    "KW": "Kuwait",
    "KG": "Kyrgyzstan",
    "LA": "Laos",
    "LV": "Latvia",
    "LB": "Lebanon",
    "LS": "Lesotho",
    "LR": "Liberia",
    "LY": "Libya",
    "LI": "Liechtenstein",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "MG": "Madagascar",
    "MW": "Malawi",
    "MY": "Malaysia",
    "MV": "Maldives",
    "ML": "Mali",
    "MT": "Malta",
    "MH": "Marshall Islands",
    "MR": "Mauritania",
    "MU": "Mauritius",
    "MX": "Mexico",
    "FM": "Micronesia",
    "MD": "Moldova",
    "MC": "Monaco",
    "MN": "Mongolia",
    "ME": "Montenegro",
    "MA": "Morocco",
    "MZ": "Mozambique",
    "MM": "Myanmar",
    "NA": "Namibia",
    "NR": "Nauru",
    "NP": "Nepal",
    "NL": "Netherlands",
    "NZ": "New Zealand",
    "NI": "Nicaragua",
    "NE": "Niger",
    "NG": "Nigeria",
    "MK": "North Macedonia",
    "NO": "Norway",
    "OM": "Oman",
    "PK": "Pakistan",
    "PW": "Palau",
    "PA": "Panama",
    "PG": "Papua New Guinea",
    "PY": "Paraguay",
    "PE": "Peru",
    "PH": "Philippines",
    "PL": "Poland",
    "PT": "Portugal",
    "QA": "Qatar",
    "RO": "Romania",
    "RU": "Russia",
    "RW": "Rwanda",
    "KN": "Saint Kitts and Nevis",
    "LC": "Saint Lucia",
    "VC": "Saint Vincent and the Grenadines",
    "WS": "Samoa",
    "SM": "San Marino",
    "ST": "São Tomé and Príncipe",
    "SA": "Saudi Arabia",
    "SN": "Senegal",
    "RS": "Serbia",
    "SC": "Seychelles",
    "SL": "Sierra Leone",
    "SG": "Singapore",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "SB": "Solomon Islands",
    "SO": "Somalia",
    "ZA": "South Africa",
    "SS": "South Sudan",
    "ES": "Spain",
    "LK": "Sri Lanka",
    "SD": "Sudan",
    "SR": "Suriname",
    "SE": "Sweden",
    "CH": "Switzerland",
    "SY": "Syria",
    "TW": "Taiwan",
    "TJ": "Tajikistan",
    "TZ": "Tanzania",
    "TH": "Thailand",
    "TL": "Timor-Leste",
    "TG": "Togo",
    "TO": "Tonga",
    "TT": "Trinidad and Tobago",
    "TN": "Tunisia",
    "TR": "Turkey",
    "TM": "Turkmenistan",
    "TV": "Tuvalu",
    "UG": "Uganda",
    "UA": "Ukraine",
    "AE": "United Arab Emirates",
    "GB": "United Kingdom",
    "US": "United States",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VU": "Vanuatu",
    "VE": "Venezuela",
    "VN": "Vietnam",
    "YE": "Yemen",
    "ZM": "Zambia",
    "ZW": "Zimbabwe"
};

const COUNTRY_NAMES_TO_CODES = Object.fromEntries(
    Object.entries(COUNTRY_CODES).map(([code, name]) => [name.toLowerCase(), code])
);

const validateCountry = (country) => {
    if (!country || typeof country !== 'string') return false;
    const cleaned = country.trim().toUpperCase();

    if (COUNTRY_CODES[cleaned]) return true;

    const lowerCountry = country.trim().toLowerCase();
    if (COUNTRY_NAMES_TO_CODES[lowerCountry]) return true;

    return false;
};

const formatCountryCode = (country) => {
    if (!country) return null;
    const cleaned = country.trim().toUpperCase();

    if (COUNTRY_CODES[cleaned]) return cleaned;

    const lowerCountry = country.trim().toLowerCase();
    return COUNTRY_NAMES_TO_CODES[lowerCountry] || null;
};

// Shopify Admin API GraphQL client
const shopifyAdminGraphQL = async (query, variables = {}) => {
    try {
        const response = await fetch(
            `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
                },
                body: JSON.stringify({ query, variables })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shopify Admin API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.errors) {
            throw new Error(`Admin GraphQL errors: ${data.errors.map(e => e.message).join(', ')}`);
        }

        return data.data;
    } catch (error) {
        console.error('Shopify Admin GraphQL Error:', error);
        throw error;
    }
};

// Shopify Storefront API GraphQL client - UPDATED FOR CART API WITH PROPER LOCALIZATION
const shopifyStorefrontGraphQL = async (query, variables = {}, countryCode = 'US') => {
    try {
        // Add @inContext directive to variables for proper currency localization
        const contextualizedVariables = {
            ...variables,
            country: countryCode
        };

        const response = await fetch(
            `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
                    'Shopify-Storefront-Buyer-IP': '127.0.0.1',
                    'Accept-Language': 'en',
                    'Shopify-Storefront-Buyer-Country': countryCode
                },
                body: JSON.stringify({
                    query,
                    variables: contextualizedVariables
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shopify Storefront API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.errors) {
            throw new Error(`Storefront GraphQL errors: ${data.errors.map(e => e.message).join(', ')}`);
        }

        return data.data;
    } catch (error) {
        console.error('Shopify Storefront GraphQL Error:', error);
        throw error;
    }
};

// NEW: Get shipping estimates using Cart API with proper localization (replaces deprecated Checkout API)
const getShippingEstimatesWithCartAPI = async (variantId, countryCode, provinceCode = null, zipCode = null, quantity = 1) => {
    try {
        // Step 1: Create the cart
        const cartCreateMutation = `
            mutation cartCreate($input: CartInput!) {
                cartCreate(input: $input) {
                    cart {
                        id
                        checkoutUrl
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        // Format variant ID properly
        const formattedVariantId = variantId.startsWith('gid://')
            ? variantId
            : `gid://shopify/ProductVariant/${variantId}`;

        const cartCreateResponse = await shopifyStorefrontGraphQL(
            cartCreateMutation,
            {
                input: {
                    lines: [{
                        merchandiseId: formattedVariantId,
                        quantity: parseInt(quantity)
                    }],
                    buyerIdentity: {
                        countryCode: countryCode
                    }
                }
            },
            countryCode
        );

        if (cartCreateResponse.cartCreate.userErrors?.length > 0) {
            throw new Error(cartCreateResponse.cartCreate.userErrors.map(e => e.message).join(', '));
        }

        const cartId = cartCreateResponse.cartCreate.cart.id;

        // Step 2: Update buyer identity with full delivery address
        const cartBuyerIdentityUpdateMutation = `
            mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
                cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
                    cart {
                        id
                        checkoutUrl
                        cost {
                            totalAmount {
                                amount
                                currencyCode
                            }
                            subtotalAmount {
                                amount
                                currencyCode
                            }
                            totalTaxAmount {
                                amount
                                currencyCode
                            }
                            totalDutyAmount {
                                amount
                                currencyCode
                            }
                        }
                        deliveryGroups(first: 10) {
                            edges {
                                node {
                                    deliveryAddress {
                                        country
                                        province
                                        zip
                                    }
                                    deliveryOptions {
                                        handle
                                        title
                                        description
                                        deliveryMethodType
                                        estimatedCost {
                                            amount
                                            currencyCode
                                        }
                                    }
                                    selectedDeliveryOption {
                                        title
                                        estimatedCost {
                                            amount
                                            currencyCode
                                        }
                                    }
                                }
                            }
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        const buyerIdentity = {
            countryCode: countryCode,
            deliveryAddressPreferences: [{
                deliveryAddress: {
                    country: countryCode,
                    ...(provinceCode && { province: provinceCode }),
                    ...(zipCode && { zip: zipCode })
                }
            }]
        };

        const cartUpdateResponse = await shopifyStorefrontGraphQL(
            cartBuyerIdentityUpdateMutation,
            {
                cartId,
                buyerIdentity
            },
            countryCode
        );

        if (cartUpdateResponse.cartBuyerIdentityUpdate.userErrors?.length > 0) {
            throw new Error(cartUpdateResponse.cartBuyerIdentityUpdate.userErrors.map(e => e.message).join(', '));
        }

        const cart = cartUpdateResponse.cartBuyerIdentityUpdate.cart;
        const shippingRates = [];

        // Extract all available shipping rates
        if (cart.deliveryGroups?.edges) {
            for (const edge of cart.deliveryGroups.edges) {
                if (edge.node.deliveryOptions) {
                    for (const option of edge.node.deliveryOptions) {
                        shippingRates.push({
                            id: option.handle,
                            name: option.title,
                            description: option.description || '',
                            methodType: option.deliveryMethodType,
                            price: parseFloat(option.estimatedCost.amount),
                            currency: option.estimatedCost.currencyCode,
                            deliveryAddress: edge.node.deliveryAddress
                        });
                    }
                }
            }
        }

        return {
            cartId: cart.id,
            checkoutUrl: cart.checkoutUrl,
            shippingRates,
            cartCurrency: cart.cost.totalAmount.currencyCode,
            subtotalAmount: parseFloat(cart.cost.subtotalAmount.amount),
            totalTaxAmount: parseFloat(cart.cost.totalTaxAmount?.amount || 0),
            totalDutyAmount: parseFloat(cart.cost.totalDutyAmount?.amount || 0),
            totalAmount: parseFloat(cart.cost.totalAmount.amount)
        };

    } catch (error) {
        console.error('Cart API shipping estimates error:', error);
        throw error;
    }
};

// NEW: Get market information and currency conversion rates
const getMarketInfo = async (countryCode) => {
    try {
        // Updated market query that works with standard Shopify stores
        const marketQuery = `
            query getShopInfo($country: CountryCode!) @inContext(country: $country) {
                shop {
                    paymentSettings {
                        enabledPresentmentCurrencies
                    }
                    shipsToCountries
                }
            }
        `;

        const shopData = await shopifyStorefrontGraphQL(
            marketQuery,
            { country: countryCode },
            countryCode
        );

        const expectedCurrency = getCurrencyForCountry(countryCode);
        const supportsLocalCurrency = shopData.shop.paymentSettings.enabledPresentmentCurrencies.includes(expectedCurrency);

        return {
            marketId: 'primary',
            marketHandle: 'primary',
            baseCurrency: shopData.shop.paymentSettings.enabledPresentmentCurrencies[0] || 'USD',
            localCurrencies: shopData.shop.paymentSettings.enabledPresentmentCurrencies,
            supportsLocalCurrency,
            shipsToCountry: shopData.shop.shipsToCountries.includes(countryCode)
        };

    } catch (error) {
        console.log('Market query failed, using fallback:', error.message);
        const expectedCurrency = getCurrencyForCountry(countryCode);

        return {
            marketId: null,
            marketHandle: 'primary',
            baseCurrency: 'USD',
            localCurrencies: ['USD'],
            supportsLocalCurrency: false,
            shipsToCountry: true
        };
    }
};

// Helper function to get expected currency for country
const getCurrencyForCountry = (countryCode) => {
    if (countryCode === 'AL') return 'ALL';
    const currencyMap = {
        'AF': 'AFN', // Afghanistan (AFN ؋)
        'AX': 'EUR', // Åland Islands (EUR €)
        'AL': 'ALL', // Albania (ALL L)
        'DZ': 'DZD', // Algeria (DZD د.ج)
        'AD': 'EUR', // Andorra (EUR €)
        'AI': 'XCD', // Anguilla (XCD $)
        'AG': 'XCD', // Antigua & Barbuda (XCD $)
        'AR': 'EUR', // Argentina (EUR €)
        'AM': 'AMD', // Armenia (AMD դր.)
        'AW': 'AWG', // Aruba (AWG ƒ)
        'AU': 'AUD', // Australia (AUD $)
        'AT': 'EUR', // Austria (EUR €)
        'AZ': 'AZN', // Azerbaijan (AZN ₼)
        'BS': 'BSD', // Bahamas (BSD $)
        'BH': 'EUR', // Bahrain (EUR €)
        'BD': 'BDT', // Bangladesh (BDT ৳)
        'BB': 'BBD', // Barbados (BBD $)
        'BY': 'EUR', // Belarus (EUR €)
        'BE': 'EUR', // Belgium (EUR €)
        'BZ': 'BZD', // Belize (BZD $)
        'BM': 'USD', // Bermuda (USD $)
        'BT': 'EUR', // Bhutan (EUR €)
        'BO': 'BOB', // Bolivia (BOB Bs.)
        'BA': 'BAM', // Bosnia & Herzegovina (BAM КМ)
        'BR': 'EUR', // Brazil (EUR €)
        'VG': 'USD', // British Virgin Islands (USD $)
        'BN': 'BND', // Brunei (BND $)
        'BG': 'BGN', // Bulgaria (BGN лв.)
        'KH': 'KHR', // Cambodia (KHR ៛)
        'CA': 'CAD', // Canada (CAD $)
        'BQ': 'USD', // Caribbean Netherlands (USD $)
        'KY': 'KYD', // Cayman Islands (KYD $)
        'CL': 'EUR', // Chile (EUR €)
        'CN': 'CNY', // China (CNY ¥)
        'CX': 'AUD', // Christmas Island (AUD $)
        'CC': 'AUD', // Cocos (Keeling) Islands (AUD $)
        'CO': 'EUR', // Colombia (EUR €)
        'CK': 'NZD', // Cook Islands (NZD $)
        'CR': 'CRC', // Costa Rica (CRC ₡)
        'HR': 'EUR', // Croatia (EUR €)
        'CW': 'ANG', // Curaçao (ANG ƒ)
        'CY': 'EUR', // Cyprus (EUR €)
        'CZ': 'CZK', // Czechia (CZK Kč)
        'DK': 'DKK', // Denmark (DKK kr.)
        'DM': 'XCD', // Dominica (XCD $)
        'DO': 'DOP', // Dominican Republic (DOP $)
        'EC': 'USD', // Ecuador (USD $)
        'EG': 'EGP', // Egypt (EGP ج.م)
        'SV': 'USD', // El Salvador (USD $)
        'EE': 'EUR', // Estonia (EUR €)
        'FK': 'FKP', // Falkland Islands (FKP £)
        'FO': 'DKK', // Faroe Islands (DKK kr.)
        'FJ': 'FJD', // Fiji (FJD $)
        'FI': 'EUR', // Finland (EUR €)
        'FR': 'EUR', // France (EUR €)
        'GF': 'EUR', // French Guiana (EUR €)
        'PF': 'XPF', // French Polynesia (XPF Fr)
        'GE': 'EUR', // Georgia (EUR €)
        'DE': 'EUR', // Germany (EUR €)
        'GI': 'GBP', // Gibraltar (GBP £)
        'GR': 'EUR', // Greece (EUR €)
        'GL': 'DKK', // Greenland (DKK kr.)
        'GD': 'XCD', // Grenada (XCD $)
        'GP': 'EUR', // Guadeloupe (EUR €)
        'GT': 'GTQ', // Guatemala (GTQ Q)
        'GG': 'GBP', // Guernsey (GBP £)
        'GY': 'GYD', // Guyana (GYD $)
        'HT': 'EUR', // Haiti (EUR €)
        'HN': 'HNL', // Honduras (HNL L)
        'HK': 'HKD', // Hong Kong SAR (HKD $)
        'HU': 'HUF', // Hungary (HUF Ft)
        'IS': 'ISK', // Iceland (ISK kr)
        'IN': 'INR', // India (INR ₹)
        'ID': 'IDR', // Indonesia (IDR Rp)
        'IQ': 'EUR', // Iraq (EUR €)
        'IE': 'EUR', // Ireland (EUR €)
        'IM': 'GBP', // Isle of Man (GBP £)
        'IL': 'ILS', // Israel (ILS ₪)
        'IT': 'EUR', // Italy (EUR €)
        'JM': 'JMD', // Jamaica (JMD $)
        'JP': 'JPY', // Japan (JPY ¥)
        'JE': 'EUR', // Jersey (EUR €)
        'JO': 'EUR', // Jordan (EUR €)
        'KZ': 'KZT', // Kazakhstan (KZT ₸)
        'KI': 'EUR', // Kiribati (EUR €)
        'XK': 'EUR', // Kosovo (EUR €)
        'KW': 'EUR', // Kuwait (EUR €)
        'KG': 'KGS', // Kyrgyzstan (KGS som)
        'LA': 'LAK', // Laos (LAK ₭)
        'LV': 'EUR', // Latvia (EUR €)
        'LB': 'LBP', // Lebanon (LBP ل.ل)
        'LI': 'CHF', // Liechtenstein (CHF CHF)
        'LT': 'EUR', // Lithuania (EUR €)
        'LU': 'EUR', // Luxembourg (EUR €)
        'MO': 'MOP', // Macao SAR (MOP P)
        'MY': 'MYR', // Malaysia (MYR RM)
        'MV': 'MVR', // Maldives (MVR MVR)
        'MT': 'EUR', // Malta (EUR €)
        'MQ': 'EUR', // Martinique (EUR €)
        'MX': 'EUR', // Mexico (EUR €)
        'MD': 'MDL', // Moldova (MDL L)
        'MC': 'EUR', // Monaco (EUR €)
        'MN': 'MNT', // Mongolia (MNT ₮)
        'ME': 'EUR', // Montenegro (EUR €)
        'MS': 'XCD', // Montserrat (XCD $)
        'MA': 'MAD', // Morocco (MAD د.م.)
        'MM': 'MMK', // Myanmar (Burma) (MMK K)
        'NR': 'AUD', // Nauru (AUD $)
        'NP': 'NPR', // Nepal (NPR Rs.)
        'NL': 'EUR', // Netherlands (EUR €)
        'NC': 'XPF', // New Caledonia (XPF Fr)
        'NZ': 'NZD', // New Zealand (NZD $)
        'NI': 'NIO', // Nicaragua (NIO C$)
        'NU': 'NZD', // Niue (NZD $)
        'NF': 'AUD', // Norfolk Island (AUD $)
        'MK': 'MKD', // North Macedonia (MKD ден)
        'NO': 'EUR', // Norway (EUR €)
        'OM': 'EUR', // Oman (EUR €)
        'PK': 'PKR', // Pakistan (PKR ₨)
        'PS': 'ILS', // Palestinian Territories (ILS ₪)
        'PA': 'USD', // Panama (USD $)
        'PG': 'PGK', // Papua New Guinea (PGK K)
        'PY': 'PYG', // Paraguay (PYG ₲)
        'PE': 'PEN', // Peru (PEN S/)
        'PH': 'PHP', // Philippines (PHP ₱)
        'PN': 'NZD', // Pitcairn Islands (NZD $)
        'PL': 'PLN', // Poland (PLN zł)
        'PT': 'EUR', // Portugal (EUR €)
        'QA': 'QAR', // Qatar (QAR ر.ق)
        'RO': 'RON', // Romania (RON Lei)
        'WS': 'WST', // Samoa (WST T)
        'SM': 'EUR', // San Marino (EUR €)
        'SA': 'SAR', // Saudi Arabia (SAR ر.س)
        'RS': 'RSD', // Serbia (RSD РСД)
        'SG': 'SGD', // Singapore (SGD $)
        'SX': 'ANG', // Sint Maarten (ANG ƒ)
        'SK': 'EUR', // Slovakia (EUR €)
        'SI': 'EUR', // Slovenia (EUR €)
        'SB': 'SBD', // Solomon Islands (SBD $)
        'GS': 'GBP', // South Georgia & South Sandwich Islands (GBP £)
        'KR': 'KRW', // South Korea (KRW ₩)
        'ES': 'EUR', // Spain (EUR €)
        'LK': 'LKR', // Sri Lanka (LKR ₨)
        'BL': 'EUR', // St. Barthélemy (EUR €)
        'KN': 'XCD', // St. Kitts & Nevis (XCD $)
        'LC': 'XCD', // St. Lucia (XCD $)
        'MF': 'EUR', // St. Martin (EUR €)
        'PM': 'EUR', // St. Pierre & Miquelon (EUR €)
        'VC': 'XCD', // St. Vincent & Grenadines (XCD $)
        'SR': 'EUR', // Suriname (EUR €)
        'SJ': 'EUR', // Svalbard & Jan Mayen (EUR €)
        'SE': 'SEK', // Sweden (SEK kr)
        'CH': 'CHF', // Switzerland (CHF CHF)
        'TW': 'TWD', // Taiwan (TWD $)
        'TJ': 'TJS', // Tajikistan (TJS ЅМ)
        'TH': 'THB', // Thailand (THB ฿)
        'TL': 'USD', // Timor-Leste (USD $)
        'TK': 'NZD', // Tokelau (NZD $)
        'TO': 'TOP', // Tonga (TOP T$)
        'TT': 'TTD', // Trinidad & Tobago (TTD $)
        'TN': 'EUR', // Tunisia (EUR €)
        'TR': 'EUR', // Türkiye (EUR €)
        'TM': 'EUR', // Turkmenistan (EUR €)
        'TC': 'USD', // Turks & Caicos Islands (USD $)
        'TV': 'AUD', // Tuvalu (AUD $)
        'UM': 'USD', // U.S. Outlying Islands (USD $)
        'UA': 'UAH', // Ukraine (UAH ₴)
        'AE': 'AED', // United Arab Emirates (AED د.إ)
        'GB': 'GBP', // United Kingdom (GBP £)
        'US': 'USD', // United States (USD $)
        'UY': 'UYU', // Uruguay (UYU $U)
        'UZ': 'UZS', // Uzbekistan (UZS so'm)
        'VU': 'VUV', // Vanuatu (VUV Vt)
        'VA': 'EUR', // Vatican City (EUR €)
        'VE': 'USD', // Venezuela (USD $)
        'VN': 'VND', // Vietnam (VND ₫)
        'WF': 'XPF', // Wallis & Futuna (XPF Fr)
        'YE': 'YER'  // Yemen (YER ﷼)
    };
    return currencyMap[countryCode] || 'USD';
};

// Simple currency conversion using exchange rates API (fallback)
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;

    try {
        // Using a free exchange rate API as fallback
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await response.json();

        if (data.rates && data.rates[toCurrency]) {
            return amount * data.rates[toCurrency];
        }
    } catch (error) {
        console.log('Currency conversion failed:', error.message);
    }

    // If conversion fails, return original amount
    return amount;
};
const getShippingRatesViaAdmin = async (variantId, countryCode, provinceCode = null, zipCode = null, quantity = 1) => {
    try {
        // Get shipping zones and rates from Admin API
        const shippingZonesQuery = `
      query {
        deliveryProfiles(first: 10) {
          edges {
            node {
              id
              name
              profileLocationGroups {
                locationGroup {
                  id
                }
                locationGroupZones(first: 10) {
                  edges {
                    node {
                      zone {
                        id
                        name
                        countries {
                          code {
                            countryCode
                          }
                          provinces {
                            code
                          }
                        }
                      }
                      methodDefinitions(first: 10) {
                        edges {
                          node {
                            id
                            name
                            description
                            rateProvider {
                              ... on DeliveryRateDefinition {
                                id
                                price {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

        const adminData = await shopifyAdminGraphQL(shippingZonesQuery);

        let shippingRates = [];

        // Process delivery profiles to find matching shipping rates for the country
        if (adminData.deliveryProfiles?.edges) {
            for (const profileEdge of adminData.deliveryProfiles.edges) {
                const profile = profileEdge.node;

                for (const locationGroup of profile.profileLocationGroups) {
                    for (const zoneEdge of locationGroup.locationGroupZones.edges) {
                        const zone = zoneEdge.node.zone;

                        // Check if this zone covers the requested country
                        const matchingCountry = zone.countries.find(country =>
                            country.code.countryCode === countryCode
                        );

                        if (matchingCountry) {
                            // Extract shipping methods for this zone
                            for (const methodEdge of zoneEdge.node.methodDefinitions.edges) {
                                const method = methodEdge.node;

                                if (method.rateProvider?.price) {
                                    shippingRates.push({
                                        id: method.id,
                                        name: method.name,
                                        description: method.description,
                                        price: parseFloat(method.rateProvider.price.amount),
                                        currency: method.rateProvider.price.currencyCode,
                                        zone: zone.name
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return {
            shippingRates: shippingRates,
            method: 'admin_api'
        };

    } catch (error) {
        console.error('Admin API shipping rates error:', error);
        throw error;
    }
};

// NEW: Get product variant details with proper localized pricing
const getVariantDetails = async (variantId, countryCode) => {
    try {
        const variantQuery = `
      query getVariant($id: ID!, $country: CountryCode!) @inContext(country: $country) {
        node(id: $id) {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            product {
              id
              title
              handle
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
            availableForSale
          }
        }
      }
    `;

        let formattedVariantId = variantId;
        if (!variantId.startsWith('gid://')) {
            formattedVariantId = `gid://shopify/ProductVariant/${variantId}`;
        }

        const variantData = await shopifyStorefrontGraphQL(
            variantQuery,
            { id: formattedVariantId, country: countryCode },
            countryCode
        );

        if (!variantData.node) {
            throw new Error('Product variant not found');
        }

        return {
            id: variantData.node.id,
            title: variantData.node.title,
            price: parseFloat(variantData.node.price.amount),
            currency: variantData.node.price.currencyCode,
            compareAtPrice: variantData.node.compareAtPrice ? parseFloat(variantData.node.compareAtPrice.amount) : null,
            product: {
                ...variantData.node.product,
                priceRange: {
                    min: parseFloat(variantData.node.product.priceRange.minVariantPrice.amount),
                    max: parseFloat(variantData.node.product.priceRange.maxVariantPrice.amount),
                    currency: variantData.node.product.priceRange.minVariantPrice.currencyCode
                }
            },
            availableForSale: variantData.node.availableForSale
        };

    } catch (error) {
        console.error('Variant details error:', error);
        throw error;
    }
};
const CURRENCY_CODES = [
    'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
    'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
    'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
    'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD',
    'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GGP', 'GHS',
    'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF',
    'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD',
    'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT',
    'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD',
    'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN',
    'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK',
    'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR',
    'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SPL', 'SRD',
    'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY',
    'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VEF',
    'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR',
    'ZMW', 'ZWD'
];

const validateCurrency = (currency) => {
    if (!currency || typeof currency !== 'string') return false;
    return CURRENCY_CODES.includes(currency.trim().toUpperCase());
};
// UPDATED: Main shipping rates endpoint using Cart API
router.post('/shipping-rates', async (req, res) => {
    try {
        const { country, variantId, quantity = 1, zipCode = null, province = null, currency: requestedCurrency } = req.body;
        // Validate inputs
        if (!country || !validateCountry(country)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid country provided',
                details: {
                    message: 'Country must be a valid 2-letter ISO code or full country name',
                    received: country,
                    examples: {
                        valid_iso_codes: ['US', 'CA', 'GB', 'AU', 'IN'],
                        valid_names: ['United States', 'Canada', 'United Kingdom', 'Australia', 'India']
                    }
                }
            });
        }

        if (!variantId) {
            return res.status(400).json({
                success: false,
                error: 'Product variant ID is required'
            });
        }

        // Validate currency if provided
        if (requestedCurrency && !validateCurrency(requestedCurrency)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid currency code provided',
                details: {
                    message: 'Currency must be a valid 3-letter ISO code',
                    received: requestedCurrency,
                    examples: ['USD', 'EUR', 'GBP', 'JPY', 'CAD']
                }
            });
        }


        const countryCode = formatCountryCode(country);
        const effectiveCurrency = requestedCurrency || getCurrencyForCountry(countryCode);
        const lang = req.headers['accept-language']?.split(',')[0]?.split('-')[0]?.toLowerCase() || 'en';
        const translations = {
            en: {
                zipNote: 'Rates based on provided location',
                defaultNote: (country) => `Rates based on ${country} default location`
            },
            fr: {
                zipNote: 'Tarifs basés sur l’emplacement fourni',
                defaultNote: (country) => `Tarifs basés sur l’emplacement par défaut de ${country}`
            },
            es: {
                zipNote: 'Tarifas basadas en la ubicación proporcionada',
                defaultNote: (country) => `Tarifas basadas en la ubicación predeterminada de ${country}`
            },
            de: {
                zipNote: 'Preise basierend auf dem angegebenen Standort',
                defaultNote: (country) => `Preise basierend auf dem Standardstandort von ${country}`
            },
            it: {
                zipNote: 'Tariffe basate sulla posizione fornita',
                defaultNote: (country) => `Tariffe basate sulla posizione predefinita di ${country}`
            },
            nl: {
                zipNote: 'Tarieven gebaseerd op opgegeven locatie',
                defaultNote: (country) => `Tarieven gebaseerd op de standaardlocatie van ${country}`
            }
        };
        const t = translations[lang] || translations['en'];
        // Default zip codes for countries where rates are zip-dependent
        const COUNTRY_DEFAULT_ZIPS = {
            "AF": "1001",       // Kabul
            "AL": "1001",       // Tirana
            "DZ": "16000",      // Algiers
            "AS": "96799",      // Pago Pago
            "AD": "AD500",      // Andorra la Vella
            "AO": "1000",       // Luanda
            "AI": "AI-2640",    // The Valley
            "AQ": "0001",       // Antarctica (not applicable but placeholder)
            "AG": "00000",      // St. John's (no formal ZIP system)
            "AR": "C1000",      // Buenos Aires
            "AM": "0010",       // Yerevan
            "AW": "00000",      // Oranjestad (no ZIP system)
            "AU": "2000",       // Sydney
            "AT": "1010",       // Vienna
            "AZ": "1000",       // Baku
            "BS": "N-14162",    // Nassau
            "BH": "199",        // Manama
            "BD": "1000",       // Dhaka
            "BB": "BB11000",    // Bridgetown
            "BY": "220030",     // Minsk
            "BE": "1000",       // Brussels
            "BZ": "00000",      // Belize City (no ZIP)
            "BJ": "229",        // Porto-Novo (no formal ZIP)
            "BM": "HM 12",      // Hamilton
            "BT": "11001",      // Thimphu
            "BO": "0101",       // La Paz
            "BA": "71000",      // Sarajevo
            "BW": "00000",      // Gaborone (no ZIP)
            "BR": "01000-000",  // São Paulo
            "IO": "BBND 1ZZ",   // Diego Garcia
            "BN": "BS8710",     // Bandar Seri Begawan
            "BG": "1000",       // Sofia
            "BF": "00000",      // Ouagadougou
            "BI": "0000",       // Bujumbura (no ZIP)
            "CV": "7600",       // Praia
            "KH": "12200",      // Phnom Penh
            "CM": "237",        // Yaoundé
            "CA": "M5V 3L9",    // Toronto
            "KY": "KY1-1001",   // George Town
            "CF": "00000",      // Bangui
            "TD": "235",        // N'Djamena
            "CL": "8320000",    // Santiago
            "CN": "100000",     // Beijing
            "CO": "110111",     // Bogotá
            "KM": "00000",      // Moroni
            "CD": "243",        // Kinshasa
            "CG": "00000",      // Brazzaville
            "CR": "10101",      // San José
            "CI": "225",        // Abidjan
            "HR": "10000",      // Zagreb
            "CU": "10100",      // Havana
            "CY": "1010",       // Nicosia
            "CZ": "11000",      // Prague
            "DK": "1000",       // Copenhagen
            "DJ": "99999",      // Djibouti
            "DM": "00152",      // Roseau
            "DO": "10101",      // Santo Domingo
            "EC": "170150",     // Quito
            "EG": "11511",      // Cairo
            "SV": "01101",      // San Salvador
            "GQ": "00000",      // Malabo
            "ER": "00000",      // Asmara
            "EE": "10111",      // Tallinn
            "SZ": "H100",       // Mbabane
            "ET": "1000",       // Addis Ababa
            "FJ": "00000",      // Suva
            "FI": "00100",      // Helsinki
            "FR": "75001",      // Paris
            "GA": "00000",      // Libreville
            "GM": "00000",      // Banjul
            "GE": "0105",       // Tbilisi
            "DE": "10115",      // Berlin
            "GH": "GA100",      // Accra
            "GR": "10557",      // Athens
            "GL": "3900",       // Nuuk
            "GD": "00000",      // St. George’s
            "GU": "96910",      // Hagåtña
            "GT": "01001",      // Guatemala City
            "GN": "0000",       // Conakry
            "GW": "1000",       // Bissau
            "GY": "592",        // Georgetown
            "HT": "HT6110",     // Port-au-Prince
            "HN": "11101",      // Tegucigalpa
            "HU": "1051",       // Budapest
            "IS": "101",        // Reykjavik
            "IN": "110001",     // Delhi
            "ID": "10110",      // Jakarta
            "IR": "11369",      // Tehran
            "IQ": "10001",      // Baghdad
            "IE": "D01",        // Dublin
            "IL": "91999",      // Jerusalem
            "IT": "00100",      // Rome
            "JM": "JMACE13",    // Kingston
            "JP": "100-0001",   // Tokyo
            "JO": "11118",      // Amman
            "KZ": "010000",     // Astana
            "KE": "00100",      // Nairobi
            "KI": "00000",      // Tarawa
            "KP": "999999",     // Pyongyang
            "KR": "04524",      // Seoul
            "KW": "13001",      // Kuwait City
            "KG": "720001",     // Bishkek
            "LA": "01000",      // Vientiane
            "LV": "LV-1050",    // Riga
            "LB": "1107",       // Beirut
            "LS": "100",        // Maseru
            "LR": "1000",       // Monrovia
            "LY": "218",        // Tripoli
            "LI": "9490",       // Vaduz
            "LT": "01100",      // Vilnius
            "LU": "1111",       // Luxembourg
            "MG": "101",        // Antananarivo
            "MW": "1000",       // Lilongwe
            "MY": "50000",      // Kuala Lumpur
            "MV": "20026",      // Malé
            "ML": "1000",       // Bamako
            "MT": "VLT 1111",   // Valletta
            "MH": "96960",      // Majuro
            "MR": "00000",      // Nouakchott
            "MU": "742CU001",   // Port Louis
            "MX": "01000",      // Mexico City
            "FM": "96941",      // Palikir
            "MD": "2012",       // Chișinău
            "MC": "98000",      // Monaco
            "MN": "15160",      // Ulaanbaatar
            "ME": "81000",      // Podgorica
            "MA": "10000",      // Rabat
            "MZ": "1100",       // Maputo
            "MM": "11181",      // Naypyidaw
            "NA": "10001",      // Windhoek
            "NR": "00000",      // Yaren (no ZIP system)
            "NP": "44600",      // Kathmandu
            "NL": "1011",       // Amsterdam
            "NZ": "6011",       // Wellington
            "NI": "11001",      // Managua
            "NE": "8000",       // Niamey
            "NG": "100001",     // Lagos
            "MK": "1000",       // Skopje
            "NO": "0010",       // Oslo
            "OM": "100",        // Muscat
            "PK": "44000",      // Islamabad
            "PW": "96940",      // Ngerulmud
            "PA": "0801",       // Panama City
            "PG": "121",        // Port Moresby
            "PY": "1209",       // Asunción
            "PE": "15001",      // Lima
            "PH": "1000",       // Manila
            "PL": "00-001",     // Warsaw
            "PT": "1100-000",   // Lisbon
            "QA": "00000",      // Doha
            "RO": "010011",     // Bucharest
            "RU": "101000",     // Moscow
            "RW": "00000",      // Kigali
            "KN": "00000",      // Basseterre
            "LC": "00000",      // Castries
            "VC": "VC0100",     // Kingstown
            "WS": "00000",      // Apia
            "SM": "47890",      // San Marino
            "ST": "1000",       // São Tomé
            "SA": "11564",      // Riyadh
            "SN": "10000",      // Dakar
            "RS": "11000",      // Belgrade
            "SC": "00000",      // Victoria
            "SL": "00000",      // Freetown
            "SG": "018989",     // Singapore
            "SK": "811 01",     // Bratislava
            "SI": "1000",       // Ljubljana
            "SB": "00000",      // Honiara
            "SO": "252",        // Mogadishu
            "ZA": "0001",       // Pretoria
            "SS": "21100",      // Juba
            "ES": "28001",      // Madrid
            "LK": "00100",      // Colombo
            "SD": "11111",      // Khartoum
            "SR": "00000",      // Paramaribo
            "SE": "111 20",     // Stockholm
            "CH": "3000",       // Bern
            "SY": "1000",       // Damascus
            "TW": "100",        // Taipei
            "TJ": "734000",     // Dushanbe
            "TZ": "11101",      // Dodoma
            "TH": "10330",      // Bangkok
            "TL": "1000",       // Dili
            "TG": "00000",      // Lomé
            "TO": "0000",       // Nukuʻalofa
            "TT": "00000",      // Port of Spain
            "TN": "1000",       // Tunis
            "TR": "06000",      // Ankara
            "TM": "744000",     // Ashgabat
            "TV": "00000",      // Funafuti
            "UG": "256",        // Kampala
            "UA": "01001",      // Kyiv
            "AE": "00000",      // Abu Dhabi
            "GB": "SW1A 1AA",   // London
            "US": "10001",      // New York
            "UY": "11000",      // Montevideo
            "UZ": "100000",     // Tashkent
            "VU": "00000",      // Port Vila
            "VE": "1010",       // Caracas
            "VN": "100000",     // Hanoi
            "YE": "10001",      // Sana'a
            "ZM": "10101",      // Lusaka
            "ZW": "00000"       // Harare
        };


        // Use default zip if required but not provided
        const effectiveZipCode = zipCode || COUNTRY_DEFAULT_ZIPS[countryCode] || '';
        const effectiveProvince = province || '';

        // First get variant details to verify availability
        const variant = await getVariantDetails(variantId, countryCode);
        if (!variant.availableForSale) {
            return res.status(400).json({
                success: false,
                error: 'Product variant is not available for sale'
            });
        }

        // Get market info for currency handling
        const marketInfo = await getMarketInfo(countryCode);
        const expectedCurrency = getCurrencyForCountry(countryCode);

        try {
            // Get shipping rates with effective address
            const result = await getShippingEstimatesWithCartAPI(
                variantId,
                countryCode,
                effectiveProvince,
                effectiveZipCode,
                quantity
            );

            // Convert currencies if needed
            let convertedVariant = { ...variant };
            let convertedShippingRates = [...result.shippingRates];

            if (variant.currency !== effectiveCurrency) {
                convertedVariant.price = await convertCurrency(variant.price, variant.currency, effectiveCurrency);
                convertedVariant.currency = effectiveCurrency;
                if (convertedVariant.compareAtPrice) {
                    convertedVariant.compareAtPrice = await convertCurrency(
                        variant.compareAtPrice,
                        variant.currency,
                        effectiveCurrency
                    );
                }

                // Convert shipping rates
                for (let rate of convertedShippingRates) {
                    if (rate.currency !== effectiveCurrency) {
                        rate.price = await convertCurrency(rate.price, rate.currency, effectiveCurrency);
                        rate.currency = effectiveCurrency;
                        rate.converted = true;
                    }
                }

                // Convert pricing breakdown if it exists
                if (result.pricingBreakdown) {
                    result.pricingBreakdown.subtotal = await convertCurrency(
                        result.pricingBreakdown.subtotal,
                        result.pricingBreakdown.currency,
                        effectiveCurrency
                    );
                    result.pricingBreakdown.shipping = await convertCurrency(
                        result.pricingBreakdown.shipping,
                        result.pricingBreakdown.currency,
                        effectiveCurrency
                    );
                    result.pricingBreakdown.taxes = await convertCurrency(
                        result.pricingBreakdown.taxes,
                        result.pricingBreakdown.currency,
                        effectiveCurrency
                    );
                    result.pricingBreakdown.duties = await convertCurrency(
                        result.pricingBreakdown.duties,
                        result.pricingBreakdown.currency,
                        effectiveCurrency
                    );
                    result.pricingBreakdown.total = await convertCurrency(
                        result.pricingBreakdown.total,
                        result.pricingBreakdown.currency,
                        effectiveCurrency
                    );
                    result.pricingBreakdown.currency = effectiveCurrency;
                }
            }

            // Select default shipping rate
            const selectedShippingRate = convertedShippingRates[0] || {
                price: 0,
                currency: expectedCurrency,
                name: 'Standard Shipping'
            };

            // Prepare response with accuracy indicator
            const response = {
                success: true,
                country: countryCode,
                variantId: variantId,
                variant: {
                    title: convertedVariant.title,
                    price: convertedVariant.price,
                    currency: convertedVariant.currency,
                    originalPrice: variant.price,
                    originalCurrency: variant.currency,
                    compareAtPrice: convertedVariant.compareAtPrice,
                    product: convertedVariant.product
                },
                shippingRates: convertedShippingRates,
                checkoutUrl: result.checkoutUrl,
                pricingBreakdown: result.pricingBreakdown || {
                    subtotal: convertedVariant.price * quantity,
                    shipping: convertedShippingRates[0]?.price || 0,
                    taxes: 0,
                    duties: 0,
                    total: (convertedVariant.price * quantity) + (convertedShippingRates[0]?.price || 0),
                    currency: effectiveCurrency
                },
                estimateAccuracy: zipCode ? 'exact' : 'approximate',
                marketInfo: {
                    supportsLocalCurrency: marketInfo.supportsLocalCurrency,
                    baseCurrency: marketInfo.baseCurrency,
                    requestedCurrency: effectiveCurrency,
                    shipsToCountry: marketInfo.shipsToCountry
                },
                timestamp: new Date().toISOString(),
                note: zipCode
                    ? t.zipNote
                    : t.defaultNote(COUNTRY_CODES[countryCode] || countryCode),
                currencyConversion: {
                    requestedCurrency: effectiveCurrency,
                    originalCurrency: variant.currency,
                    ratesConverted: variant.currency !== effectiveCurrency
                }
            };

            res.json(response);

        } catch (error) {
            console.error('Cart API failed, trying Admin API fallback:', error.message);

            // Fallback to Admin API
            const adminResult = await getShippingRatesViaAdmin(
                variantId,
                countryCode,
                effectiveProvince,
                effectiveZipCode,
                quantity
            );

            // Convert rates to expected currency
            let convertedShippingRates = await Promise.all(
                adminResult.shippingRates.map(async rate => ({
                    ...rate,
                    price: await convertCurrency(rate.price, rate.currency, expectedCurrency),
                    currency: expectedCurrency,
                    converted: rate.currency !== expectedCurrency
                }))
            );

            res.json({
                success: true,
                country: countryCode,
                variantId: variantId,
                shippingRates: convertedShippingRates,
                estimateAccuracy: 'fallback',
                method: 'admin_api_fallback',
                note: 'Used Admin API fallback - final rates may vary',
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('All shipping methods failed:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to calculate shipping',
            details: error.message,
            suggestion: 'Please try again or contact support'
        });
    }
});
// Get shop configuration - UPDATED
router.get('/shop-config', async (req, res) => {
    try {
        const adminQuery = `
      query {
        shop {
          name
          currencyCode
          shipsToCountries
          enabledPresentmentCurrencies
        }
      }
    `;

        const storefrontQuery = `
      query {
        shop {
          name
          primaryDomain {
            host
          }
          paymentSettings {
            enabledPresentmentCurrencies
          }
        }
      }
    `;

        let shopData = {};

        try {
            const adminData = await shopifyAdminGraphQL(adminQuery);
            const storefrontData = await shopifyStorefrontGraphQL(storefrontQuery);

            shopData = {
                name: adminData.shop.name,
                baseCurrency: adminData.shop.currencyCode,
                shippingCountries: adminData.shop.shipsToCountries,
                enabledCurrencies: adminData.shop.enabledPresentmentCurrencies,
                domain: storefrontData.shop.primaryDomain.host
            };

        } catch (error) {
            console.log('Failed to fetch shop data:', error.message);
            shopData = {
                name: 'Unknown Store',
                baseCurrency: 'USD',
                shippingCountries: Object.keys(COUNTRY_CODES),
                enabledCurrencies: ['USD']
            };
        }

        res.json({
            success: true,
            shop: shopData,
            availableCountries: COUNTRY_CODES,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Shop config error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch shop configuration'
        });
    }
});

// Health check endpoint - UPDATED
router.get('/health', (req, res) => {
    const requiredEnvVars = [
        'SHOPIFY_STORE_DOMAIN',
        'SHOPIFY_ACCESS_TOKEN',
        'SHOPIFY_STOREFRONT_ACCESS_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    res.json({
        status: missingVars.length === 0 ? 'healthy' : 'configuration_needed',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        missingEnvironmentVariables: missingVars,
        apiStatus: {
            cartApiSupported: true,
            checkoutApiDeprecated: true,
            migrationComplete: true
        },
        notes: missingVars.length > 0 ? [
            'SHOPIFY_STOREFRONT_ACCESS_TOKEN is required for Cart API access',
            'Checkout API has been deprecated and replaced with Cart API'
        ] : [
            'Successfully migrated from deprecated Checkout API to Cart API',
            'All shipping rate calculations now use the modern Cart API'
        ]
    });
});

module.exports = router;