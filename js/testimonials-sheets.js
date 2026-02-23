/**
 * testimonials-sheets.js
 * Google Sheets Integration for CKP Testimonials / Kundenreferenzen
 * Sheet columns: Name | Position | Unternehmen | Zitat | Profilbild (URL) | Bewertung (1-5)
 */

(function() {
    'use strict';

    // ─── CONFIGURATION ───────────────────────────────────────────────────────────
    const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4IuCWnlDPStirXYuRSYyPqog7toFzfYdNpX5e7-iSjPH6KR53HPDClNj19W6bCO-dMEKae7Ugd8m2/pub?output=csv';
    // ─────────────────────────────────────────────────────────────────────────────

    let cache = null;

    async function loadTestimonials() {
        if (cache) return cache;

        try {
            console.log('[Testimonials] 📡 Fetching CSV...');
            const res = await fetch(SHEETS_URL, { method: 'GET', mode: 'cors', cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const text = await res.text();
            if (!text || text.trim().startsWith('<!')) throw new Error('Got HTML instead of CSV.');

            const rows = parseCSV(text);
            if (!rows.length) throw new Error('No rows found.');

            cache = rows.map(convertToTestimonial).filter(t => t.name);
            console.log(`[Testimonials] ✅ Loaded ${cache.length} testimonials.`);
            return cache;

        } catch (err) {
            console.warn('[Testimonials] ⚠️', err.message);
            return getFallbackTestimonials();
        }
    }

    function parseCSV(csv) {
        const lines = csv.split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]);
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
            if (row['Name'] || row['name']) rows.push(row);
        }
        return rows;
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

    function convertToTestimonial(row) {
        const name       = row['Name']             || '';
        const position   = row['Position']         || '';
        const company    = row['Unternehmen']       || '';
        const quote      = row['Zitat']             || '';
        const imageURL   = row['Profilbild (URL)']  || '';
        const rawRating  = row['Bewertung (1-5)']   || '5';
        const rating     = Math.min(5, Math.max(1, parseInt(rawRating) || 5));

        // Derive initials from name
        const initials = name
            .split(' ')
            .map(w => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();

        return { name, position, company, quote, imageURL, rating, initials };
    }

    // Fallback data shown if Sheets is unreachable
    function getFallbackTestimonials() {
        return [
            {
                name: 'Thomas Berger',
                position: 'Leiter Einsatzplanung',
                company: 'Bundespolizei',
                quote: 'Die Qualität der taktischen Ausrüstung von CKP Germany überzeugt uns seit Jahren. Zuverlässiger Partner für unsere Einsätze.',
                imageURL: '',
                rating: 5,
                initials: 'TB'
            },
            {
                name: 'Sarah Müller',
                position: 'Rettungsdienstleiterin',
                company: 'DRK Regionalverband',
                quote: 'CKP Care liefert uns stets pünktlich und in einwandfreier Qualität. Die Beratung ist kompetent und lösungsorientiert.',
                imageURL: '',
                rating: 5,
                initials: 'SM'
            },
            {
                name: 'Klaus Hoffmann',
                position: 'Geschäftsführer',
                company: 'Sicherheitsdienst Nord GmbH',
                quote: 'Von der Anfrage bis zur Lieferung — CKP Germany überzeugt auf ganzer Linie. Professionell, schnell und zuverlässig.',
                imageURL: '',
                rating: 5,
                initials: 'KH'
            }
        ];
    }

    // Expose globally
    window.loadTestimonials = loadTestimonials;

})();/**
 * testimonials-sheets.js
 * Google Sheets Integration for CKP Testimonials / Kundenreferenzen
 * Sheet columns: Name | Position | Unternehmen | Zitat | Profilbild (URL) | Bewertung (1-5)
 */

(function() {
    'use strict';

    // ─── CONFIGURATION ───────────────────────────────────────────────────────────
    const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4IuCWnlDPStirXYuRSYyPqog7toFzfYdNpX5e7-iSjPH6KR53HPDClNj19W6bCO-dMEKae7Ugd8m2/pub?output=csv';
    // ─────────────────────────────────────────────────────────────────────────────

    let cache = null;

    async function loadTestimonials() {
        if (cache) return cache;

        try {
            console.log('[Testimonials] 📡 Fetching CSV...');
            const res = await fetch(SHEETS_URL, { method: 'GET', mode: 'cors', cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const text = await res.text();
            if (!text || text.trim().startsWith('<!')) throw new Error('Got HTML instead of CSV.');

            const rows = parseCSV(text);
            if (!rows.length) throw new Error('No rows found.');

            cache = rows.map(convertToTestimonial).filter(t => t.name);
            console.log(`[Testimonials] ✅ Loaded ${cache.length} testimonials.`);
            return cache;

        } catch (err) {
            console.warn('[Testimonials] ⚠️', err.message);
            return getFallbackTestimonials();
        }
    }

    function parseCSV(csv) {
        const lines = csv.split('\n').filter(l => l.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]);
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
            if (row['Name'] || row['name']) rows.push(row);
        }
        return rows;
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

    function convertToTestimonial(row) {
        const name       = row['Name']             || '';
        const position   = row['Position']         || '';
        const company    = row['Unternehmen']       || '';
        const quote      = row['Zitat']             || '';
        const imageURL   = row['Profilbild (URL)']  || '';
        const rawRating  = row['Bewertung (1-5)']   || '5';
        const rating     = Math.min(5, Math.max(1, parseInt(rawRating) || 5));

        // Derive initials from name
        const initials = name
            .split(' ')
            .map(w => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();

        return { name, position, company, quote, imageURL, rating, initials };
    }

    // Fallback data shown if Sheets is unreachable
    function getFallbackTestimonials() {
        return [
            {
                name: 'Thomas Berger',
                position: 'Leiter Einsatzplanung',
                company: 'Bundespolizei',
                quote: 'Die Qualität der taktischen Ausrüstung von CKP Germany überzeugt uns seit Jahren. Zuverlässiger Partner für unsere Einsätze.',
                imageURL: '',
                rating: 5,
                initials: 'TB'
            },
            {
                name: 'Sarah Müller',
                position: 'Rettungsdienstleiterin',
                company: 'DRK Regionalverband',
                quote: 'CKP Care liefert uns stets pünktlich und in einwandfreier Qualität. Die Beratung ist kompetent und lösungsorientiert.',
                imageURL: '',
                rating: 5,
                initials: 'SM'
            },
            {
                name: 'Klaus Hoffmann',
                position: 'Geschäftsführer',
                company: 'Sicherheitsdienst Nord GmbH',
                quote: 'Von der Anfrage bis zur Lieferung — CKP Germany überzeugt auf ganzer Linie. Professionell, schnell und zuverlässig.',
                imageURL: '',
                rating: 5,
                initials: 'KH'
            }
        ];
    }

    // Expose globally
    window.loadTestimonials = loadTestimonials;

})();