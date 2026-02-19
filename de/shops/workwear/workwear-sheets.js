/**
 * workwear-sheets.js
 * Google Sheets Integration for CKP Workwear Shop
 */

(function() {
    'use strict';

    // ─── CONFIGURATION ───────────────────────────────────────────────────────────
    const SHEETS_BASE           = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vStgR9svrKTscTa0_wkTzxneVFMMyNSJGKFh1QMWAqfI3gKqD7Tx1xCujw4L1USdQTwfgMVlTt1eZO6/pub';
    const SHEETS_SPREADSHEET_ID = '18_YdSTVieki1fZJFtRl9feEhalB3mXmL6W2Vfn8IW1w';

    const GID_DE = '0';
    const GID_EN = '1136313357';

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
            console.log('[WorkwearSheets] 📡 Fetching CSV...');

            let csvText = await fetchCSV(SHEETS_URL);
            if (!csvText) {
                console.warn('[WorkwearSheets] Main URL failed, trying fallback...');
                csvText = await fetchCSV(SHEETS_URL_FALLBACK);
            }
            if (!csvText) throw new Error('Both URLs failed.');
            if (csvText.trimStart().startsWith('<!')) throw new Error('Got HTML instead of CSV — sheet not published as CSV.');

            const rows = parseCSV(csvText);
            if (!rows.length) throw new Error('No product rows found.');

            productsCache = rows.map(convertToProduct);
            console.log(`[WorkwearSheets] ✅ Loaded ${productsCache.length} products.`);
            return productsCache;

        } catch (err) {
            console.warn('[WorkwearSheets] ⚠️', err.message);
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
            console.warn('[WorkwearSheets] fetch error:', e.message);
            return null;
        }
    }

    // ─── CSV PARSING ─────────────────────────────────────────────────────────────

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

    // ─── PRODUCT CONVERSION ──────────────────────────────────────────────────────

    function convertToProduct(row, index) {
        const name        = row['Name']         || '';
        const category    = row['Category']     || 'Workwear';
        const category2   = row['Category (2)'] || '';
        const description = row['Description']  || '';
        const badge       = row['Badge']        || '';
        const badge2      = row['Badge (2)']    || '';

        const rawPrice = row['Price'] || '';
        const price    = rawPrice.trim() || 'Auf Anfrage';

        // Up to 6 images
        const imageFront = row['ImageURL (Front)'] || '';
        const imageBack  = row['ImageURL (Back)']  || '';
        const imageSide  = row['ImageURL (Side)']  || '';
        const image4     = row['ImageURL 4']       || '';
        const image5     = row['ImageURL 5']       || '';
        const image6     = row['ImageURL 6']       || '';

        // Workwear-specific feature columns
        const features = [
            row['Passform & Schnitt (1)'],
            row['Passform & Schnitt (2)'],
            row['Material & Qualität (1)'],
            row['Material & Qualität (2)'],
            row['Schutz & Sicherheit (1)'],
            row['Schutz & Sicherheit (2)'],
            row['Einsatzbereich (1)'],
            row['Einsatzbereich (2)']
        ].filter(Boolean);

        if (!features.length) features.push('Hochwertige Verarbeitung', 'Professional Grade');

        const specs = category2
            ? category2.split(',').map(s => s.trim()).filter(Boolean)
            : ['Professional Grade'];

        const images = [imageFront, imageBack, imageSide, image4, image5, image6]
            .map(convertGoogleDriveURL)
            .filter(Boolean);

        if (!images.length) {
            images.push(`https://via.placeholder.com/400x400/2d4a2d/a3c47a?text=${encodeURIComponent(name)}`);
        }

        return {
            id:       `workwear-${index + 1}`,
            sku:      name.replace(/\s+/g, '-').toUpperCase().substring(0, 20),
            division: 'workwear',
            name:     { de: name, en: name },
            category: getCategoryId(category),
            tags:     { de: [category], en: [category] },
            badge:    badge ? { de: badge2 ? `${badge} · ${badge2}` : badge, en: badge2 ? `${badge} · ${badge2}` : badge } : null,
            description: {
                de: description || 'Hochwertige Berufsbekleidung für professionelle Anwendungen.',
                en: description || 'High-quality workwear for professional use.'
            },
            specs:    { de: specs,    en: specs    },
            features: { de: features, en: features },
            price,
            images,
            imageURL:   images[0],
            bestseller: badge.toUpperCase().includes('BEST')
        };
    }

    function getCategoryId(name) {
        const l = name.toLowerCase();
        if (l.includes('jacke')    || l.includes('jacket'))    return 'jackets';
        if (l.includes('hose')     || l.includes('trouser'))   return 'trousers';
        if (l.includes('overall')  || l.includes('coverall'))  return 'coveralls';
        if (l.includes('weste')    || l.includes('vest'))      return 'vests';
        if (l.includes('shirt')    || l.includes('hemd'))      return 'shirts';
        if (l.includes('schutz')   || l.includes('protect'))   return 'protection';
        if (l.includes('zubehör')  || l.includes('accessory')) return 'accessories';
        return 'workwear-apparel';
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