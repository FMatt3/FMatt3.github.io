// ==============================================
// DATEI: js/cookie-consent.js
// Consent Mode V2 Initialisierung (Muss im <head> geladen werden)
// ==============================================

const GA_MEASUREMENT_ID = 'G-51W2X1R8C5';

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// 1. Consent-Standardeinstellungen: ALLES WIRD ABGELEHNT (Standard: denied)
gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',         // Neu für Consent Mode V2
    'ad_personalization': 'denied',   // Neu für Consent Mode V2
    'wait_for_update': 500 // Max. 500ms warten, bis consent-update von JS kommt
});

// 2. Lade Google Tag Manager Skript (GA4)
gtag('js', new Date());
gtag('config', GA_MEASUREMENT_ID, {
    // Empfohlen für DSGVO-Konformität: IP-Anonymisierung
    'anonymize_ip': true,
    // Empfohlen für moderne Browser und Third-Party-Cookies
    'cookie_flags': 'SameSite=Lax;Secure'
});