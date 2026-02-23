/**
 * testimonials-sheets.js
 * Google Sheets Integration for CKP Testimonials / Kundenreferenzen
 * Sheet columns: Name | Position | Unternehmen | Zitat | Profilbild (URL) | Bewertung (1-5)
 */

(function() {
    'use strict';

    // ─── CONFIGURATION ───────────────────────────────────────────────────────────
    const SHEETS_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4IuCWnlDPStirXYuRSYyPqog7toFzfYdNpX5e7-iSjPH6KR53HPDClNj19W6bCO-dMEKae7Ugd8m2/pub';
    const GID_DE = '0';
    const GID_EN = '1311645333';

    const isEN      = window.location.pathname.includes('/en/');
    const activeGid = isEN ? GID_EN : GID_DE;

    const SHEETS_URL = `${SHEETS_BASE}?gid=${activeGid}&single=true&output=csv`;
    // ─────────────────────────────────────────────────────────────────────────────

    let cache = null;

    async function loadTestimonials() {
        if (cache) return cache;

        try {
            console.log('[Testimonials] Fetching CSV...');
            const res = await fetch(SHEETS_URL, { method: 'GET', mode: 'cors', cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const text = await res.text();
            if (!text || text.trim().startsWith('<!')) throw new Error('Got HTML instead of CSV.');

            const rows = parseCSV(text);
            if (!rows.length) throw new Error('No rows found.');

            cache = rows.map(convertToTestimonial).filter(t => t.name);
            console.log(`[Testimonials] Loaded ${cache.length} testimonials.`);
            return cache;

        } catch (err) {
            console.warn('[Testimonials]', err.message);
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
        const name      = row['Name']            || '';
        const position  = row['Position']        || '';
        const company   = row['Unternehmen']     || '';
        const quote     = row['Zitat']           || '';
        const imageURL  = row['Profilbild (URL)']|| '';
        const rawRating = row['Bewertung (1-5)'] || '5';
        const rating    = Math.min(5, Math.max(1, parseInt(rawRating) || 5));
        const initials  = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
        return { name, position, company, quote, imageURL, rating, initials };
    }

    function getFallbackTestimonials() {
        const de = !isEN;
        return [
            {
                name: 'Thomas Berger',
                position: de ? 'Leiter Einsatzplanung' : 'Head of Operations Planning',
                company: 'Bundespolizei',
                quote: de ? 'Die Qualität der taktischen Ausrüstung von CKP Germany überzeugt uns seit Jahren. Zuverlässiger Partner für unsere Einsätze.'
                          : "CKP Germany's tactical equipment quality has impressed us for years. A reliable partner for our operations.",
                imageURL: '', rating: 5, initials: 'TB'
            },
            {
                name: 'Sarah Müller',
                position: de ? 'Rettungsdienstleiterin' : 'Head of Emergency Services',
                company: 'DRK Regionalverband',
                quote: de ? 'CKP Care liefert uns stets pünktlich und in einwandfreier Qualität. Die Beratung ist kompetent und lösungsorientiert.'
                          : 'CKP Care always delivers on time and in perfect quality. Their advice is competent and solution-oriented.',
                imageURL: '', rating: 5, initials: 'SM'
            },
            {
                name: 'Klaus Hoffmann',
                position: de ? 'Geschäftsführer' : 'Managing Director',
                company: 'Sicherheitsdienst Nord GmbH',
                quote: de ? 'Von der Anfrage bis zur Lieferung — CKP Germany überzeugt auf ganzer Linie. Professionell, schnell und zuverlässig.'
                          : 'From inquiry to delivery — CKP Germany convinces across the board. Professional, fast and reliable.',
                imageURL: '', rating: 5, initials: 'KH'
            }
        ];
    }

    window.loadTestimonials = loadTestimonials;

})();