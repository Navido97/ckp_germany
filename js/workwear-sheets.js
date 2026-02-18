/**
 * Google Sheets Integration for CKP Workwear Shop
 *
 * ─── HOW TO GET THE CORRECT CSV URL ────────────────────────────────────────────
 *
 * Your sheet is currently published as "Web page" — that gives an HTML URL
 * ending in /pubhtml. You need the CSV version instead.
 *
 * OPTION A — Quickest: just change "pubhtml" to "pub?output=csv" in your URL:
 *   From: https://docs.google.com/spreadsheets/d/e/LONG_ID/pubhtml
 *   To:   https://docs.google.com/spreadsheets/d/e/LONG_ID/pub?output=csv
 *
 * OPTION B — Re-publish correctly:
 *   1. File → Share → Publish to web
 *   2. Left dropdown: choose your specific sheet tab (not "Entire document")
 *   3. Right dropdown: change "Web page" → "Comma-separated values (.csv)"
 *   4. Click Publish → copy the new URL → paste below
 *
 * ─── YOUR SHEET'S PUBLISHED ID ─────────────────────────────────────────────────
 * Based on your published link, your sheet's published ID is:
 *   2PACX-1vStgR9svrKTscTa0_wkTzxneVFMMyNSJGKFh1QMWAqfI3gKqD7Tx1xCujw4L1USdQTwfgMVlTt1eZO6
 *
 * So your CSV URL should be:
 *   https://docs.google.com/spreadsheets/d/e/2PACX-1vStgR9svrKTscTa0_wkTzxneVFMMyNSJGKFh1QMWAqfI3gKqD7Tx1xCujw4L1USdQTwfgMVlTt1eZO6/pub?output=csv
 *
 * ─── REQUIRED COLUMN NAMES IN YOUR SHEET ───────────────────────────────────────
 *   Name                  Product name
 *   Category              e.g. "Taktische Bekleidung"
 *   Category (2)          Comma-separated spec tags, e.g. "Stretch, Wasserdicht"
 *   Description           Short product description
 *   Price                 e.g. "€49.90" or "Auf Anfrage"
 *   Badge                 Primary badge, e.g. "NEU", "BESTSELLER"
 *   Badge (2)             Secondary badge (optional), e.g. "PROFESSIONAL"
 *   ImageURL (Front)      Google Drive sharing link (front image)
 *   ImageURL (Back)       Google Drive sharing link (back image, optional)
 *   ImageURL (Side)       Google Drive sharing link (side image, optional)
 *   Passform & Komfort    Feature bullet
 *   Passform & Komfort (2) Feature bullet (optional second line)
 *   Material & Verarbeitung  Feature bullet
 *   Material & Verarbeitung (2) Feature bullet (optional)
 *   Design & Funktion     Feature bullet
 *   Design & Funktion (2) Feature bullet (optional)
 *   Einsatz & Nutzung     Feature bullet
 *   Einsatz & Nutzung (2) Feature bullet (optional)
 */

(function() {
    'use strict';

    // ─── CONFIGURATION ───────────────────────────────────────────────────────────
    // CSV URL auto-derived from your published sheet ID.
    // If you re-publish and get a different ID, update this URL.
    const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vStgR9svrKTscTa0_wkTzxneVFMMyNSJGKFh1QMWAqfI3gKqD7Tx1xCujw4L1USdQTwfgMVlTt1eZO6/pub?output=csv';
    // ─────────────────────────────────────────────────────────────────────────────

    let workwearProductsCache = null;

    window.WorkwearSheets = {
        loadProducts: loadProductsFromSheets,
        getCache: () => workwearProductsCache
    };

    async function loadProductsFromSheets() {
        if (workwearProductsCache) return workwearProductsCache;

        try {
            console.log('[WorkwearSheets] 📡 Fetching CSV from Google Sheets...');

            const csvText = await fetchCSV(SHEETS_URL);

            if (!csvText) throw new Error('Empty response from Sheets.');

            // Reject HTML — means the sheet is published as "Web page" not CSV
            if (csvText.trimStart().startsWith('<!')) {
                throw new Error(
                    'Received HTML instead of CSV. ' +
                    'In Google Sheets: File → Share → Publish to web → ' +
                    'select your sheet tab → change format to "CSV" → Publish.'
                );
            }

            const rows = parseCSV(csvText);
            if (!rows.length) throw new Error('CSV parsed but no product rows found.');

            workwearProductsCache = rows.map(normalizeProduct);
            console.log(`[WorkwearSheets] ✅ Loaded ${workwearProductsCache.length} products from Sheets.`);
            return workwearProductsCache;

        } catch (err) {
            console.warn('[WorkwearSheets] ⚠️', err.message, '— falling back to local JSON.');
            return null;
        }
    }

    async function fetchCSV(url) {
        try {
            const res = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            return text && text.trim().length > 0 ? text : null;
        } catch (e) {
            console.warn('[WorkwearSheets] Fetch failed:', e.message);
            return null;
        }
    }

    // ─── CSV PARSING ─────────────────────────────────────────────────────────────

    function parseCSV(csv) {
        const lines = csv.split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]);
        const products = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((h, idx) => {
                row[h.trim()] = (values[idx] || '').trim();
            });
            if (row['Name'] || row['name']) products.push(row);
        }

        return products;
    }

    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i], next = line[i + 1];
            if (ch === '"') {
                if (inQuotes && next === '"') { current += '"'; i++; }
                else inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(current); current = '';
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    }

    // ─── PRODUCT NORMALISATION ───────────────────────────────────────────────────

    function normalizeProduct(row, index) {
        const name        = row['Name']          || row['name']          || '';
        const category    = row['Category']      || row['category']      || 'Arbeitskleidung';
        const category2   = row['Category (2)']  || row['category (2)']  || '';
        const description = row['Description']   || row['description']   || '';
        const price       = row['Price']         || row['price']         || 'Auf Anfrage';

        // Support both Badge and Badge (2)
        const badge  = row['Badge']      || row['badge']      || '';
        const badge2 = row['Badge (2)']  || row['badge (2)']  || '';

        const rawFront = row['ImageURL (Front)'] || row['ImageURL'] || '';
        const rawBack  = row['ImageURL (Back)']  || '';
        const rawSide  = row['ImageURL (Side)']  || '';

        const images = [rawFront, rawBack, rawSide]
            .map(convertGoogleDriveURL)
            .filter(Boolean);

        if (images.length === 0) {
            images.push(`https://via.placeholder.com/400x400/2e7d32/ffffff?text=${encodeURIComponent(name || 'Produkt')}`);
        }

        // Feature columns — support (2) variants visible in your sheet
        const featureKeys = [
            'Passform & Komfort', 'Passform & Komfort (2)',
            'Material & Verarbeitung', 'Material & Verarbeitung (2)',
            'Design & Funktion', 'Design & Funktion (2)',
            'Einsatz & Nutzung', 'Einsatz & Nutzung (2)'
        ];
        const features = featureKeys.map(k => row[k]).filter(Boolean);
        if (!features.length) features.push('Hochwertige Verarbeitung', 'Langlebig', 'Professional Grade');

        // Spec tags from Category (2)
        const specs = category2
            ? category2.split(',').map(s => s.trim()).filter(Boolean)
            : ['Professional Grade'];

        // Combine badges — use badge as primary, badge2 as secondary
        const badgeValue = badge || badge2 || null;

        return {
            id: `workwear-${index + 1}`,
            sku: name.replace(/\s+/g, '-').toUpperCase().substring(0, 20),
            division: 'workwear',
            name: { de: name, en: name },
            category: getCategoryId(category),
            categoryLabel: category,
            tags: { de: [category], en: [category] },
            badge: badgeValue ? { de: badgeValue, en: badgeValue } : null,
            badge2: badge2 ? { de: badge2, en: badge2 } : null,
            description: {
                de: description || 'Professionelle Arbeitskleidung für den täglichen Einsatz.',
                en: description || 'Professional workwear for daily use.'
            },
            specs:    { de: specs, en: specs },
            features: { de: features, en: features },
            price,
            images,
            imageURL: images[0],
            bestseller: badge.toUpperCase().includes('BEST') || badge2.toUpperCase().includes('BEST')
        };
    }

    function getCategoryId(name) {
        const l = name.toLowerCase();
        if (l.includes('hose') || l.includes('bund'))              return 'arbeitshosen';
        if (l.includes('jack') || l.includes('mantel'))            return 'jacken';
        if (l.includes('warn') || l.includes('reflex') || l.includes('vis')) return 'warnschutz';
        if (l.includes('flamm') || l.includes('arc'))              return 'flammschutz';
        if (l.includes('schnitt'))                                 return 'schnittschutz';
        if (l.includes('shirt') || l.includes('polo'))             return 'shirts';
        if (l.includes('overall') || l.includes('kombi'))          return 'overalls';
        if (l.includes('taktisch') || l.includes('tactical'))      return 'tactical-apparel';
        return 'arbeitskleidung';
    }

    function convertGoogleDriveURL(url) {
        if (!url) return '';
        url = url.replace(/drive_link$/, '').trim();
        if (!url) return '';

        if (url.includes('googleusercontent.com/d/') || url.includes('drive.google.com/thumbnail')) return url;

        let fileId = null;
        const m1 = url.match(/\/file\/d\/([^\/\?#]+)/);
        if (m1) fileId = m1[1];
        if (!fileId) { const m2 = url.match(/[?&]id=([^&#]+)/); if (m2) fileId = m2[1]; }
        if (!fileId && url.length > 20 && !url.includes('/') && !url.includes('http')) fileId = url;

        if (fileId) {
            fileId = fileId.split(/[?&#]/)[0];
            return `https://lh3.googleusercontent.com/d/${fileId}`;
        }

        if (url.startsWith('http')) return url;
        return '';
    }

})();