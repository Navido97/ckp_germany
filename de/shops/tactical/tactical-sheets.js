/**
 * tactical-sheets.js
 * Google Sheets Integration for CKP Tactical Shop
 * Loads products from published Google Sheets CSV
 */

(function() {
    'use strict';

    // ─── CONFIGURATION ───────────────────────────────────────────────────────────
    const SHEETS_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAXVycf3RA08sEoKuyLkEH3a1mv-QbW6sgW4Y7Fdovx4MzgMu3lhftC8xl4Ftrfw73qwcqkwZryUSj/pub';
    const SHEETS_SPREADSHEET_ID = '1Y54QSB8h2SDQb0-qSXaSoJamIfL8M11MiMwnmejyya4';

    // Tab GIDs — find yours: open sheet → click tab → check URL for #gid=XXXXXXX
    const GID_DE = '0';
    const GID_EN = '717896398';

    // Auto-detect language from URL
    const isEN = window.location.pathname.includes('/en/');
    const activeGid = isEN ? GID_EN : GID_DE;

    const SHEETS_URL = `${SHEETS_BASE}?gid=${activeGid}&single=true&output=csv`;
    const SHEETS_URL_FALLBACK = `https://docs.google.com/spreadsheets/d/${SHEETS_SPREADSHEET_ID}/export?format=csv&gid=${activeGid}`;
    // ─────────────────────────────────────────────────────────────────────────────

    let productsCache = null;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        // Works on any page that loads this script — no pathname guard needed
        // since this file now only lives in shops/tactical/
        const products = await loadProductsFromSheets();
        if (products) {
            window.sheetsProducts = products;
        }
    }

    async function loadProductsFromSheets() {
        if (productsCache) return productsCache;

        try {
            console.log('[TacticalSheets] 📡 Fetching CSV from Google Sheets...');

            let csvText = await fetchCSV(SHEETS_URL);

            if (!csvText) {
                console.warn('[TacticalSheets] Main URL failed, trying fallback...');
                csvText = await fetchCSV(SHEETS_URL_FALLBACK);
            }

            if (!csvText) throw new Error('Both URLs failed.');

            if (csvText.trimStart().startsWith('<!')) {
                throw new Error('Got HTML instead of CSV — sheet is not published as CSV format.');
            }

            const rows = parseCSV(csvText);
            if (!rows.length) throw new Error('No product rows found in CSV.');

            productsCache = rows.map(convertToProduct);
            console.log(`[TacticalSheets] ✅ Loaded ${productsCache.length} products.`);
            return productsCache;

        } catch (err) {
            console.warn('[TacticalSheets] ⚠️', err.message, '— falling back to JSON.');
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
            console.warn('[TacticalSheets] fetch error:', e.message);
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
            headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
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

    // ─── PRODUCT CONVERSION ──────────────────────────────────────────────────────

    function convertToProduct(row, index) {
        const name        = row['Name']        || '';
        const category    = row['Category']    || 'Taktische Bekleidung';
        const category2   = row['Category (2)']|| '';
        const description = row['Description'] || '';
        const badge       = row['Badge']       || '';
        const badge2      = row['Badge (2)']   || '';

        // Price — strip currency symbols
        const rawPrice = row['Price'] || '';
        const price    = rawPrice.trim() || 'Auf Anfrage';

        // Up to 6 images — exact column names from sheet
        const imageFront = row['ImageURL (Front)'] || '';
        const imageBack  = row['ImageURL (Back)']  || '';
        const imageSide  = row['ImageURL (Side)']  || '';
        const image4     = row['ImageURL 4']       || '';
        const image5     = row['ImageURL 5']       || '';
        const image6     = row['ImageURL 6']       || '';

        // Exact feature column names from sheet
        const features = [
            row['Passform & Komfort (1)'],
            row['Passform & Komfort (2)'],
            row['Material & Verarbeitung (1)'],
            row['Material & Verarbeitung (2)'],
            row['Design & Funktion (1)'],
            row['Design & Funktion (2)'],
            row['Einsatz & Nutzung (1)'],
            row['Einsatz & Nutzung (2)']
        ].filter(Boolean);

        if (!features.length) features.push('Hochwertige Verarbeitung', 'Professional Grade');

        const specs = category2
            ? category2.split(',').map(s => s.trim()).filter(Boolean)
            : ['Professional Grade'];

        const images = [imageFront, imageBack, imageSide, image4, image5, image6]
            .map(convertGoogleDriveURL)
            .filter(Boolean);

        if (!images.length) {
            images.push(`https://via.placeholder.com/400x400/1a1a1a/ff6b35?text=${encodeURIComponent(name)}`);
        }

        return {
            id: `tactical-${index + 1}`,
            sku: name.replace(/\s+/g, '-').toUpperCase().substring(0, 20),
            division: 'tactical',
            name: { de: name, en: name },
            category: getCategoryId(category),
            tags: { de: [category], en: [category] },
            badge: badge ? { de: badge2 ? `${badge} · ${badge2}` : badge, en: badge2 ? `${badge} · ${badge2}` : badge } : null,
            description: {
                de: description || 'Hochwertige taktische Ausrüstung für professionelle Anwendungen.',
                en: description || 'High-quality tactical equipment for professional use.'
            },
            specs:    { de: specs,    en: specs    },
            features: { de: features, en: features },
            price,
            images,
            imageURL: images[0],
            bestseller: badge.toUpperCase().includes('BEST')
        };
    }

    function getCategoryId(name) {
        const l = name.toLowerCase();
        if (l.includes('bekleidung') || l.includes('apparel'))   return 'tactical-apparel';
        if (l.includes('körper')     || l.includes('armor'))     return 'body-armor';
        if (l.includes('helm'))                                   return 'helmets';
        if (l.includes('platten')    || l.includes('carrier'))   return 'plate-carriers';
        if (l.includes('schutz'))                                 return 'protective-clothing';
        if (l.includes('medical')    || l.includes('medizin'))   return 'medical-equipment';
        return 'gear';
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

        return url.startsWith('http') ? url : '';
    }

    // Expose for tactical-shop.js
    window.loadSheetProducts = loadProductsFromSheets;

})();