/**
 * Google Sheets Integration for Shop
 * Loads products from published Google Sheets
 */

(function() {
    'use strict';

    // Google Sheets Published CSV URL - CORRECTLY PUBLISHED
    // This is the URL from File → Publish to web → CSV format
    const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAXVycf3RA08sEoKuyLkEH3a1mv-QbW6sgW4Y7Fdovx4MzgMu3lhftC8xl4Ftrfw73qwcqkwZryUSj/pub?gid=0&single=true&output=csv';
    
    // Fallback URLs (in case the main one fails)
    const SHEETS_SPREADSHEET_ID = '1Y54QSB8h2SDQb0-qSXaSoJamIfL8M11MiMwnmejyya4';
    const SHEETS_URL_FALLBACK = `https://docs.google.com/spreadsheets/d/${SHEETS_SPREADSHEET_ID}/export?format=csv&gid=0`;
    
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
            console.log('📡 Loading products from Google Sheets...');
            console.log('📍 URL:', SHEETS_URL);
            
            let csvText;
            
            // Try main URL first with CORS mode
            try {
                const response = await fetch(SHEETS_URL, {
                    method: 'GET',
                    mode: 'cors', // Try CORS first
                    cache: 'no-cache'
                });
                
                console.log('📊 Response status:', response.status);
                console.log('📊 Response ok:', response.ok);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                csvText = await response.text();
                console.log('📄 CSV loaded, first 200 chars:', csvText.substring(0, 200));
                console.log('📄 CSV total length:', csvText.length);
                
            } catch (corsError) {
                console.warn('⚠️ CORS error on main URL:', corsError.message);
                console.log('🔄 Trying fallback URL...');
                
                // Try fallback URL
                try {
                    const response = await fetch(SHEETS_URL_FALLBACK, {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'no-cache'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Fallback also failed: HTTP ${response.status}`);
                    }
                    
                    csvText = await response.text();
                    console.log('✅ Fallback URL worked!');
                    
                } catch (fallbackError) {
                    console.error('❌ Both URLs failed:', fallbackError.message);
                    throw new Error('Could not load from Google Sheets - falling back to JSON');
                }
            }
            
            // Check if we got HTML (login page) instead of CSV
            if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
                console.error('❌ Got HTML instead of CSV - Sheet might not be properly published');
                console.log('📖 Please ensure the sheet is published to web as CSV format');
                throw new Error('Sheet not published - got HTML instead of CSV');
            }
            
            // Check if CSV is empty
            if (!csvText || csvText.trim().length === 0) {
                console.error('❌ CSV is empty');
                throw new Error('Empty CSV response');
            }
            
            // Parse CSV
            console.log('🔄 Parsing CSV...');
            const products = parseCSV(csvText);
            
            console.log('✅ Parsed products:', products.length);
            if (products.length === 0) {
                throw new Error('No products found in CSV');
            }
            
            // Log first product for debugging
            console.log('📦 First raw product:', products[0]);
            
            // Convert to our format
            console.log('🔄 Converting to product format...');
            productsCache = convertToProductFormat(products);
            
            console.log('✅ Converted products:', productsCache.length);
            console.log('📸 First product with images:', {
                name: productsCache[0]?.name,
                images: productsCache[0]?.images
            });
            
            return productsCache;
            
        } catch (error) {
            console.error('❌ Error loading products from sheets:', error);
            console.error('Stack:', error.stack);
            console.log('💡 Falling back to local JSON data...');
            return null;
        }
    }

    function parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = parseCSVLine(lines[0]);
        
        console.log('CSV Headers:', headers);
        
        const products = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = parseCSVLine(lines[i]);
            const product = {};
            
            headers.forEach((header, index) => {
                product[header] = values[index] ? values[index].trim() : '';
            });
            
            // Only add if has a name
            if (product.Name || product.name) {
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
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote mode
                    inQuotes = !inQuotes;
                }
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

    /**
     * Convert Google Drive sharing URL to direct image URL
     * Using thumbnail API which works better for embedding
     * From: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
     * To: https://lh3.googleusercontent.com/d/FILE_ID (better for embedding)
     * Alternative: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
     */
    function convertGoogleDriveURL(url) {
        if (!url || url === '' || url === 'drive_link') return '';
        
        // Clean up the URL - remove trailing 'drive_link' or other artifacts
        url = url.replace(/drive_link$/, '').trim();
        
        // If already in thumbnail format, return as is
        if (url.includes('googleusercontent.com/d/') || url.includes('drive.google.com/thumbnail')) {
            return url;
        }
        
        // Extract file ID from different Google Drive URL formats
        let fileId = null;
        
        // Format 1: https://drive.google.com/file/d/FILE_ID/view (most common)
        // This handles both /view?usp=sharing and /view?usp=drive_link
        const match1 = url.match(/\/file\/d\/([^\/\?]+)/);
        if (match1) {
            fileId = match1[1];
        }
        
        // Format 2: https://drive.google.com/open?id=FILE_ID
        if (!fileId) {
            const match2 = url.match(/[?&]id=([^&]+)/);
            if (match2) {
                fileId = match2[1];
            }
        }
        
        // Format 3: Just the file ID itself
        if (!fileId && url.length > 20 && !url.includes('/') && !url.includes('http')) {
            fileId = url;
        }
        
        if (fileId) {
            // Clean the file ID (remove any trailing junk)
            fileId = fileId.split(/[?&#]/)[0];
            
            // Use GoogleUserContent URL which works better for embedding
            // Alternative formats that work:
            // 1. https://lh3.googleusercontent.com/d/FILE_ID
            // 2. https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
            
            // Using GoogleUserContent as primary (most reliable)
            const googleUserContentUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
            
            console.log(`📸 Converted Google Drive URL:`, {
                original: url.substring(0, 80),
                fileId: fileId,
                converted: googleUserContentUrl
            });
            
            return googleUserContentUrl;
        }
        
        console.warn('⚠️ Could not extract Google Drive file ID from:', url);
        return '';
    }

    function convertToProductFormat(sheetProducts) {
        return sheetProducts.map((row, index) => {
            // Get column values - adjust these based on your actual column names
            const name = row.Name || row.name || '';
            const category = row.Category || row.category || 'TAKTISCHE BEKLEIDUNG';
            const category2 = row['Category (2)'] || row['category (2)'] || '';
            const description = row.Description || row.description || '';
            const price = row.Price || row.price || '';
            const badge = row.Badge || row.badge || '';
            
            // Image URLs from columns
            const imageFront = row['ImageURL (Front)'] || row.ImageURL || '';
            const imageBack = row['ImageURL (Back)'] || '';
            const imageSide = row['ImageURL (Side)'] || '';
            
            // Additional fields
            const passformKomfort = row['Passform & Komfort'] || '';
            const materialVerarbeitung = row['Material & Verarbeitung'] || '';
            const designFunktion = row['Design & Funktion'] || '';
            const einsatzNutzung = row['Einsatz & Nutzung'] || '';
            
            // Convert Google Drive URLs to direct image URLs
            const images = [
                convertGoogleDriveURL(imageFront),
                convertGoogleDriveURL(imageBack),
                convertGoogleDriveURL(imageSide)
            ].filter(url => url !== '');
            
            // Debug: Log image conversions
            if (images.length > 0) {
                console.log(`Product "${name}" images:`, {
                    original: { front: imageFront, back: imageBack, side: imageSide },
                    converted: images
                });
            }
            
            // Fallback if no images
            if (images.length === 0) {
                console.warn(`No valid images found for product "${name}"`);
                images.push(`https://via.placeholder.com/400x400/1a1a1a/ff6b35?text=${encodeURIComponent(name)}`);
            }
            
            // Determine division
            const division = category.toLowerCase().includes('care') ? 'care' : 'tactical';
            
            // Parse specs from Category (2)
            const specs = category2 ? 
                category2.split(',').map(s => s.trim()).filter(s => s) : 
                ['Professional Grade'];
            
            // Collect features from all detail columns
            const features = [];
            if (passformKomfort) features.push(passformKomfort);
            if (materialVerarbeitung) features.push(materialVerarbeitung);
            if (designFunktion) features.push(designFunktion);
            if (einsatzNutzung) features.push(einsatzNutzung);
            
            // Default features if none provided
            if (features.length === 0) {
                features.push('Hochwertige Verarbeitung', 'Professional Grade', 'Langlebig');
            }
            
            return {
                id: `product-${index + 1}`,
                sku: name.replace(/\s+/g, '-').toUpperCase().substring(0, 20),
                division: division,
                name: {
                    de: name,
                    en: name
                },
                category: getCategoryId(category),
                tags: {
                    de: [category],
                    en: [category]
                },
                badge: badge ? {
                    de: badge,
                    en: badge
                } : null,
                description: {
                    de: description || 'Hochwertige taktische Ausrüstung für professionelle Anwendungen.',
                    en: description || 'High-quality tactical equipment for professional use.'
                },
                specs: {
                    de: specs,
                    en: specs
                },
                features: {
                    de: features,
                    en: features
                },
                price: price || 'Auf Anfrage',
                images: images,
                imageURL: images[0],
                bestseller: badge.toUpperCase().includes('BEST') || badge.toUpperCase().includes('NEU')
            };
        });
    }

    function getCategoryId(categoryName) {
        const lower = categoryName.toLowerCase();
        if (lower.includes('bekleidung') || lower.includes('apparel')) return 'tactical-apparel';
        if (lower.includes('körper') || lower.includes('armor')) return 'body-armor';
        if (lower.includes('helm')) return 'helmets';
        if (lower.includes('platten') || lower.includes('carrier')) return 'plate-carriers';
        if (lower.includes('schutz')) return 'protective-clothing';
        if (lower.includes('medical') || lower.includes('medizin')) return 'medical-equipment';
        return 'gear';
    }

    // Expose to global scope for shop.js to use
    window.loadSheetProducts = loadProductsFromSheets;
    
})();