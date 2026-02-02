/**
 * Google Sheets Integration for Shop
 * Loads products from published Google Sheets
 */

(function() {
    'use strict';

    // Google Sheets Published URL
    const SHEETS_BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAXVycf3RA08sEoKuyLkEH3a1mv-QbW6sgW4Y7Fdovx4MzgMu3lhftC8xl4Ftrfw73qwcqkwZryUSj/pub?output=csv';
    
    // Tab IDs (gid) - you need to get these from your sheets
    const TABS = {
        DE: '0',      // First tab (default)
        EN: '1234567' // Second tab - replace with actual gid
    };

    let productsCache = null;
    let currentLanguage = 'de';

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        // Only run on shop pages
        if (!window.location.pathname.includes('tactical.html') && 
            !window.location.pathname.includes('care.html')) {
            return;
        }

        // Detect language
        currentLanguage = window.location.pathname.includes('/de/') ? 'de' : 'en';
        
        // Load products from Google Sheets
        await loadProductsFromSheets();
        
        // Override shop.js products if available
        if (productsCache) {
            window.sheetsProducts = productsCache;
        }
    }

    async function loadProductsFromSheets() {
        try {
            const tabGid = currentLanguage === 'de' ? TABS.DE : TABS.EN;
            const url = `${SHEETS_BASE_URL}&gid=${tabGid}`;
            
            console.log('Loading products from Google Sheets:', url);
            
            const response = await fetch(url);
            const csvText = await response.text();
            
            // Parse CSV
            const products = parseCSV(csvText);
            
            console.log('Loaded products:', products);
            
            // Convert to our format
            productsCache = convertToProductFormat(products);
            
            return productsCache;
        } catch (error) {
            console.error('Error loading products from sheets:', error);
            return null;
        }
    }

    function parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const products = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = parseCSVLine(lines[i]);
            const product = {};
            
            headers.forEach((header, index) => {
                product[header] = values[index] ? values[index].trim() : '';
            });
            
            if (product.Name) {
                products.push(product);
            }
        }
        
        return products;
    }

    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    function convertToProductFormat(sheetProducts) {
        // Map sheet columns to our product format
        return sheetProducts.map((row, index) => {
            // Determine division from Category or default to tactical
            const category = row.Category || row['Category (2)'] || 'tactical';
            const division = category.toLowerCase().includes('care') ? 'care' : 'tactical';
            
            // Get badge text
            let badge = null;
            if (row.Badge) {
                badge = {
                    de: row.Badge,
                    en: row['Badge (2)'] || row.Badge
                };
            }
            
            // Parse specs from Category (2) or create default
            const specs = row['Category (2)'] ? 
                row['Category (2)'].split(',').map(s => s.trim()) : 
                [];
            
            // Collect all image URLs
            const images = [];
            if (row['ImageURL (Front)']) images.push(row['ImageURL (Front)']);
            if (row['ImageURL (Back)']) images.push(row['ImageURL (Back)']);
            if (row['ImageURL (Side)']) images.push(row['ImageURL (Side)']);
            
            // Fallback if no images provided
            if (images.length === 0) {
                images.push('https://via.placeholder.com/400x400/1a1a1a/ff6b35?text=' + encodeURIComponent(row.Name));
            }
            
            return {
                id: `product-${index + 1}`,
                sku: row.Name.replace(/\s+/g, '-').toUpperCase(),
                division: division,
                name: {
                    de: row.Name,
                    en: row.Name // Same for now, can be different column
                },
                category: getCategoryId(category),
                tags: {
                    de: [category],
                    en: [category]
                },
                badge: badge,
                description: {
                    de: row.Description || 'Hochwertige taktische Ausrüstung.',
                    en: row.Description || 'High-quality tactical equipment.'
                },
                specs: {
                    de: specs.length > 0 ? specs : ['Professional Grade'],
                    en: specs.length > 0 ? specs : ['Professional Grade']
                },
                features: {
                    de: parseFeatures(row['Passform & Komfort'] || row['Material & Verarbeitung']),
                    en: parseFeatures(row['Passform & Komfort'] || row['Material & Verarbeitung'])
                },
                price: row.Price || 'Auf Anfrage',
                images: images,  // Array of all images
                imageURL: images[0], // First image as main
                bestseller: badge && (badge.de === 'BESTSELLER' || badge.de === 'BEST...')
            };
        });
    }

    function getCategoryId(categoryName) {
        const lower = categoryName.toLowerCase();
        if (lower.includes('bekleidung') || lower.includes('apparel')) return 'tactical-apparel';
        if (lower.includes('körper') || lower.includes('armor')) return 'body-armor';
        if (lower.includes('helm')) return 'helmets';
        if (lower.includes('platten') || lower.includes('carrier')) return 'plate-carriers';
        return 'gear';
    }

    function parseFeatures(featuresText) {
        if (!featuresText) return ['Hochwertige Verarbeitung', 'Langlebig', 'Professional Grade'];
        
        // Try to split by common separators
        const features = featuresText.split(/[,;|]/).map(f => f.trim()).filter(f => f);
        return features.length > 0 ? features : ['Hochwertige Verarbeitung'];
    }

    // Expose to global scope for shop.js to use
    window.loadSheetProducts = loadProductsFromSheets;
    
})();