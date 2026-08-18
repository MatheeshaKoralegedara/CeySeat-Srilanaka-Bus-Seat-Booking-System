const BCP47_BY_LANG = {
    en: 'en-US',
    si: 'si-LK',
    ta: 'ta-LK',
};

// Sinhala/Tamil Intl support varies by browser/OS, so fall back to English
// formatting rather than let toLocaleString throw or silently misrender.
export function toBcp47Locale(lang) {
    return BCP47_BY_LANG[lang] || BCP47_BY_LANG.en;
}
