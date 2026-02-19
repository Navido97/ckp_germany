/**
 * merch-sheets.js
 * Google Sheets Integration for CKP Merch Shop
 */

(function() {
    'use strict';

    // ─── CONFIGURATION ───────────────────────────────────────────────────────────
    const SHEETS_BASE           = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRPR9kWveE1QYMARsosTlmV_UYOiON6tsBabUkQEGHJ6SpkztnzDga-sHGDrmTt2K8H7h0CT5_urlkz/pub';
    const SHEETS_SPREADSHEET_ID = '15iPLMV-QeYy0q2pkZeRq9LIhg4Rl1r0oU02R7b8CjtQ';

    const GID_DE = '0';
    const GID_EN = '232678604';

    const isEN      = window.location.pathname.includes('/en/');
    const activeGid = isEN ? GID_EN : GID_DE;

    const SHEETS_URL          = `${SHEETS_BASE}?gid=${activeGid}&single=true&output=csv`;
    const SHEETS_URL_FALLBACK = `https://docs.google.com/spreadsheets/d/${SHEETS_SPREADSHEET_ID}/export?format=csv&gid=${activeGid}`;
    // ─────────────────────────────────────────────────────────────────────────────

    let productsCache = null;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    async function init() {
        const products = await loadProductsFromSheets();
        if (products) window.sheetsProducts = products;
    }

    async function loadProductsFromSheets() {
        if (productsCache) return productsCache;
        try {
            console.log('[MerchSheets] 📡 Fetching CSV...');
            let csvText = await fetchCSV(SHEETS_URL);
            if (!csvText) {
                console.warn('[MerchSheets] Main URL failed, trying fallback...');
                csvText = await fetchCSV(SHEETS_URL_FALLBACK);
            }
            if (!csvText) throw new Error('Both URLs failed.');
            if (csvText.trimStart().startsWith('<!')) throw new Error('Got HTML instead of CSV.');

            const rows = parseCSV(csvText);
            if (!rows.length) throw new Error('No product rows found.');

            productsCache = rows.map(convertToProduct);
            console.log(`[MerchSheets] ✅ Loaded ${productsCache.length} products.`);
            return productsCache;
        } catch (err) {
            console.warn('[MerchSheets] ⚠️', err.message);
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
            console.warn('[MerchSheets] fetch error:', e.message);
            return null;
        }
    }

    function parseCSV(csv) {
        const lines = csv.split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];
        const headers  = parseCSVLine(lines[0]);
        const products = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row    = {};
            headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
            if (row['Name'] || row['name']) products.push(row);
        }
        return products;
    }

    function parseCSVLine(line) {
        const result = [];
        let current = '', inQuotes = false;
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

    function convertToProduct(row, index) {
        const name        = row['Name']         || '';
        const category    = row['Category']     || 'Merch';
        const category2   = row['Category (2)'] || '';
        const description = row['Description']  || '';
        const badge       = row['Badge']        || '';
        const badge2      = row['Badge (2)']    || '';

        const rawPrice = row['Price'] || '';
        const price    = rawPrice.trim() || 'Auf Anfrage';

        const imageFront = row['ImageURL (Front)'] || '';
        const imageBack  = row['ImageURL (Back)']  || '';
        const imageSide  = row['ImageURL (Side)']  || '';
        const image4     = row['ImageURL 4']       || '';
        const image5     = row['ImageURL 5']       || '';
        const image6     = row['ImageURL 6']       || '';

        // Merch-specific feature columns
        const features = [
            row['Produktart (1)'],
            row['Produktart (2)'],
            row['Material (1)'],
            row['Material (2)'],
            row['Verfügbare Farben (1)'],
            row['Verfügbare Farben (2)'],
            row['Größen & Varianten (1)'],
            row['Größen & Varianten (2)']
        ].filter(Boolean);

        if (!features.length) features.push('CKP Original', 'Premium Qualität');

        const specs = category2
            ? category2.split(',').map(s => s.trim()).filter(Boolean)
            : ['CKP Merch'];

        const images = [imageFront, imageBack, imageSide, image4, image5, image6]
            .map(convertGoogleDriveURL)
            .filter(Boolean);

        if (!images.length) {
            images.push(`https://via.placeholder.com/400x400/1a1a1a/ff6b35?text=${encodeURIComponent(name)}`);
        }

        return {
            id:       `merch-${index + 1}`,
            sku:      name.replace(/\s+/g, '-').toUpperCase().substring(0, 20),
            division: 'merch',
            name:     { de: name, en: name },
            category: getCategoryId(category),
            tags:     { de: [category], en: [category] },
            badge:    badge ? { de: badge2 ? `${badge} · ${badge2}` : badge, en: badge2 ? `${badge} · ${badge2}` : badge } : null,
            description: {
                de: description || 'Hochwertiges CKP Merchandise für echte Profis.',
                en: description || 'Premium CKP merchandise for true professionals.'
            },
            specs:    { de: specs, en: specs },
            features: { de: features, en: features },
            price,
            images,
            imageURL:   images[0],
            bestseller: badge.toUpperCase().includes('BEST')
        };
    }

    function getCategoryId(name) {
        const l = name.toLowerCase();
        if (l.includes('kleidung') || l.includes('shirt') || l.includes('hoodie') || l.includes('apparel')) return 'clothing';
        if (l.includes('flasche') || l.includes('bottle') || l.includes('trink'))  return 'drinkware';
        if (l.includes('sticker') || l.includes('aufkleber') || l.includes('druck')) return 'stickers';
        if (l.includes('schreib') || l.includes('stift') || l.includes('kugel') || l.includes('pen')) return 'stationery';
        if (l.includes('cap') || l.includes('mütze') || l.includes('hat'))         return 'headwear';
        if (l.includes('tasche') || l.includes('bag') || l.includes('rucksack'))   return 'bags';
        if (l.includes('accessoir') || l.includes('accessory'))                    return 'accessories';
        return 'merch-general';
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

    window.loadSheetProducts = loadProductsFromSheets;

})();