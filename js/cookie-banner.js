const COOKIE_PREF_KEY = 'cookiePreferences';
const COOKIE_DATE_KEY = 'cookiePreferencesDate';
const MARKETING_COOKIES_TO_DELETE = ['_fbp', 'fr', 'IDE', 'test_cookie']; // Beispiele für Marketing-Cookies

let cookiePreferences = {
    essential: true,
    analytics: false,
    marketing: false
};

// ==============================================
// INIT
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
    loadPreferences();
    
    // Zeige Banner nur, wenn noch keine Einstellung vorhanden
    const saved = localStorage.getItem(COOKIE_PREF_KEY);
    if (!saved) {
        showBanner();
    } else {
        // Zeige Cookie-Settings-Button, wenn Einstellungen bereits gesetzt
        document.getElementById('cookieSettingsBtn').style.display = 'block';
    }
});

// ==============================================
// UTILITY FUNKTIONEN
// ==============================================

function deleteCookie(name) {
    // Löscht das Cookie global, um sicherzugehen
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = name + '=; Path=/; Domain=' + window.location.hostname + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    const parts = window.location.hostname.split('.');
    if (parts.length > 1) {
        const rootDomain = '.' + parts.slice(parts.length - 2).join('.');
        document.cookie = name + '=; Path=/; Domain=' + rootDomain + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}

function deleteAnalyticsCookies() {
    document.cookie.split(';').forEach(function(cookie) {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.startsWith('_ga') || cookieName.startsWith('_gcl')) {
            deleteCookie(cookieName);
        }
    });
    // Fallback für alte GA-Versionen
    // Die Variable 'GA_MEASUREMENT_ID' ist global verfügbar, da sie in cookie-consent.js definiert wurde.
    window['ga-disable-' + GA_MEASUREMENT_ID] = true;
}

function deleteMarketingCookies() {
    MARKETING_COOKIES_TO_DELETE.forEach(name => deleteCookie(name));
}

function loadPreferences() {
    const saved = localStorage.getItem(COOKIE_PREF_KEY);
    if (saved) {
        const preferences = JSON.parse(saved);
        cookiePreferences.analytics = preferences.analytics ?? false;
        cookiePreferences.marketing = preferences.marketing ?? false;

        // UI aktualisieren (nur wenn Banner-Elemente vorhanden sind)
        const analyticsCheckbox = document.getElementById('analyticsCookies');
        const marketingCheckbox = document.getElementById('marketingCookies');
        if (analyticsCheckbox) {
            analyticsCheckbox.checked = cookiePreferences.analytics;
        }
        if (marketingCheckbox) {
            marketingCheckbox.checked = cookiePreferences.marketing;
        }

        // Einstellungen anwenden (wichtig, da das Consent-Script schon im Head geladen wurde)
        applyTrackingSettings(cookiePreferences);
    }
}

function applyTrackingSettings(settings) {
    if (typeof gtag === 'function') {
        gtag('consent', 'update', {
            'analytics_storage': settings.analytics ? 'granted' : 'denied',
            'ad_storage': settings.marketing ? 'granted' : 'denied',
            'ad_user_data': settings.marketing ? 'granted' : 'denied',
            'ad_personalization': settings.marketing ? 'granted' : 'denied'
        });

        // Cookies löschen, wenn Consent entzogen wurde
        if (!settings.analytics) {
            deleteAnalyticsCookies();
        }
        if (!settings.marketing) {
            deleteMarketingCookies();
        }
    }
}

// ==============================================
// BANNER FUNKTIONEN
// ==============================================

function showBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
        // Stelle die UI auf die aktuell gespeicherten Präferenzen ein
        loadPreferences(); 
    }
}

function closeBanner() {
    const banner = document.getElementById('cookieBanner');
    const settingsBtn = document.getElementById('cookieSettingsBtn');
    
    if (banner) {
        banner.style.display = 'none';
    }
    document.body.style.overflow = '';
    if (settingsBtn) {
        settingsBtn.style.display = 'block';
    }
}

function toggleDetails(id) {
    const element = document.getElementById(id);
    // Sicherstellen, dass das Element existiert, bevor darauf zugegriffen wird
    if (!element) return;
    
    // 'previousElementSibling' ist der <button> selbst, wir brauchen den Header
    const header = element.parentElement.querySelector('.cookie-category-header');
    const icon = header.nextElementSibling.querySelector('i'); // Den Button über das nächste Geschwister finden
    
    if (element.style.display === 'none') {
        element.style.display = 'block';
        if (icon) icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        element.style.display = 'none';
        if (icon) icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
}


function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cookie-notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => { notification.classList.add('show'); }, 10);
    setTimeout(() => { 
        notification.classList.remove('show');
        setTimeout(() => { notification.remove(); }, 300);
    }, 3000);
}

// ==============================================
// AKTIONEN
// ==============================================

function savePreferences() {
    cookiePreferences.analytics = document.getElementById('analyticsCookies').checked;
    cookiePreferences.marketing = document.getElementById('marketingCookies').checked;
    
    localStorage.setItem(COOKIE_PREF_KEY, JSON.stringify(cookiePreferences));
    localStorage.setItem(COOKIE_DATE_KEY, new Date().toISOString());
    
    applyTrackingSettings(cookiePreferences);
    
    closeBanner();
    showNotification('Ihre Cookie-Einstellungen wurden gespeichert!');
}

function acceptAll() {
    document.getElementById('analyticsCookies').checked = true;
    document.getElementById('marketingCookies').checked = true;
    savePreferences();
}

function rejectAll() {
    document.getElementById('analyticsCookies').checked = false;
    document.getElementById('marketingCookies').checked = false;
    savePreferences();
}