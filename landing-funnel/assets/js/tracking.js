/**
 * Tracking & Analytics - The Testing Engine Lead Generation Funnel
 * Integrates with Facebook Pixel, Google Analytics 4, and LinkedIn Insight Tag
 */

// ============================================
// CONFIGURATION
// ============================================

const TRACKING_CONFIG = {
    // Facebook Pixel ID - Replace with your actual pixel ID
    facebookPixelId: 'YOUR_FACEBOOK_PIXEL_ID',

    // Google Analytics 4 Measurement ID - Replace with your actual GA4 ID
    ga4MeasurementId: 'G-XXXXXXXXXX',

    // LinkedIn Partner ID - Replace with your actual LinkedIn Partner ID
    linkedInPartnerId: 'YOUR_LINKEDIN_PARTNER_ID',

    // Enable/disable tracking (useful for testing)
    enabled: true
};

// ============================================
// FACEBOOK PIXEL
// ============================================

/**
 * Initialize Facebook Pixel
 */
function initFacebookPixel() {
    if (!TRACKING_CONFIG.enabled || TRACKING_CONFIG.facebookPixelId === 'YOUR_FACEBOOK_PIXEL_ID') {
        console.log('Facebook Pixel not configured');
        return;
    }

    // Facebook Pixel Code
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', TRACKING_CONFIG.facebookPixelId);
    fbq('track', 'PageView');

    console.log('Facebook Pixel initialized');
}

/**
 * Track Facebook CompleteRegistration event
 */
function trackFacebookLead() {
    if (typeof fbq !== 'undefined') {
        fbq('track', 'CompleteRegistration');
        console.log('Facebook Pixel: CompleteRegistration tracked');
    }
}

/**
 * Track Facebook Lead event with value
 */
function trackFacebookLeadWithValue(value = 50) {
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            value: value,
            currency: 'USD'
        });
        console.log('Facebook Pixel: Lead tracked with value $' + value);
    }
}

// ============================================
// GOOGLE ANALYTICS 4
// ============================================

/**
 * Initialize Google Analytics 4
 */
function initGA4() {
    if (!TRACKING_CONFIG.enabled || TRACKING_CONFIG.ga4MeasurementId === 'G-XXXXXXXXXX') {
        console.log('Google Analytics 4 not configured');
        return;
    }

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_CONFIG.ga4MeasurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', TRACKING_CONFIG.ga4MeasurementId);

    console.log('Google Analytics 4 initialized');
}

/**
 * Track GA4 generate_lead event
 */
function trackGA4Lead() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', {
            event_category: 'Lead Generation',
            event_label: 'Quiz Completed',
            value: 50
        });
        console.log('GA4: generate_lead event tracked');
    }
}

/**
 * Track GA4 custom event
 */
function trackGA4Event(eventName, params = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, params);
        console.log('GA4: ' + eventName + ' event tracked', params);
    }
}

// ============================================
// LINKEDIN INSIGHT TAG
// ============================================

/**
 * Initialize LinkedIn Insight Tag
 */
function initLinkedInInsight() {
    if (!TRACKING_CONFIG.enabled || TRACKING_CONFIG.linkedInPartnerId === 'YOUR_LINKEDIN_PARTNER_ID') {
        console.log('LinkedIn Insight Tag not configured');
        return;
    }

    // LinkedIn Insight Tag
    _linkedin_partner_id = TRACKING_CONFIG.linkedInPartnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(_linkedin_partner_id);

    (function(l) {
        if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";b.async = true;
        b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b, s);
    })(window.lintrk);

    console.log('LinkedIn Insight Tag initialized');
}

/**
 * Track LinkedIn conversion
 */
function trackLinkedInConversion() {
    if (typeof window.lintrk !== 'undefined') {
        window.lintrk('track', { conversion_id: 'lead_capture' });
        console.log('LinkedIn: Conversion tracked');
    }
}

// ============================================
// UNIFIED TRACKING FUNCTIONS
// ============================================

/**
 * Track Quiz Started (user answers Question 1)
 */
function trackQuizStarted() {
    console.log('Event: Quiz Started');

    // Facebook
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'QuizStarted');
    }

    // GA4
    trackGA4Event('quiz_started', {
        event_category: 'Engagement',
        event_label: 'Quiz Started'
    });
}

/**
 * Track Quiz Completed (form submitted successfully)
 */
function trackQuizCompleted() {
    console.log('Event: Quiz Completed');

    // Facebook
    trackFacebookLead();
    trackFacebookLeadWithValue(50);

    // Google Analytics
    trackGA4Lead();

    // LinkedIn
    trackLinkedInConversion();
}

/**
 * Track Exit Popup Shown
 */
function trackExitPopupShown() {
    console.log('Event: Exit Popup Shown');

    // Facebook
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'ExitPopupShown');
    }

    // GA4
    trackGA4Event('exit_popup_shown', {
        event_category: 'Engagement',
        event_label: 'Exit Intent Triggered'
    });
}

/**
 * Track Exit Popup Converted (email captured)
 */
function trackExitPopupConverted() {
    console.log('Event: Exit Popup Converted');

    // Facebook
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'ExitPopupConverted');
        fbq('track', 'Lead', {
            value: 10,
            currency: 'USD'
        });
    }

    // GA4
    trackGA4Event('exit_popup_converted', {
        event_category: 'Lead Generation',
        event_label: 'Exit Popup Email Captured',
        value: 10
    });
}

/**
 * Track Button Click
 */
function trackButtonClick(buttonName) {
    console.log('Event: Button Click -', buttonName);

    // GA4
    trackGA4Event('button_click', {
        event_category: 'Engagement',
        event_label: buttonName
    });
}

/**
 * Track Page View (for SPA-style navigation)
 */
function trackPageView(pagePath) {
    console.log('Event: Page View -', pagePath);

    // Facebook
    if (typeof fbq !== 'undefined') {
        fbq('track', 'PageView');
    }

    // GA4
    if (typeof gtag !== 'undefined') {
        gtag('config', TRACKING_CONFIG.ga4MeasurementId, {
            page_path: pagePath
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all tracking pixels
 */
function initTracking() {
    if (!TRACKING_CONFIG.enabled) {
        console.log('Tracking is disabled');
        return;
    }

    console.log('Initializing tracking pixels...');

    // Initialize each platform
    initFacebookPixel();
    initGA4();
    initLinkedInInsight();

    console.log('All tracking pixels initialized');
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracking);
} else {
    initTracking();
}

// ============================================
// ENHANCED E-COMMERCE TRACKING (OPTIONAL)
// ============================================

/**
 * Track funnel step (for enhanced e-commerce)
 */
function trackFunnelStep(stepNumber, stepName) {
    console.log(`Funnel Step ${stepNumber}: ${stepName}`);

    // GA4 Enhanced Measurement
    trackGA4Event('funnel_step', {
        event_category: 'Funnel',
        event_label: stepName,
        step: stepNumber
    });
}

// ============================================
// UTM PARAMETER TRACKING
// ============================================

/**
 * Get UTM parameters from URL
 */
function getUTMParameters() {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term: params.get('utm_term') || '',
        utm_content: params.get('utm_content') || ''
    };
}

/**
 * Store UTM parameters in session storage
 */
function storeUTMParameters() {
    const utmParams = getUTMParameters();

    // Only store if at least one UTM parameter exists
    if (Object.values(utmParams).some(val => val !== '')) {
        sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
        console.log('UTM parameters stored:', utmParams);
    }
}

// Store UTM parameters on page load
storeUTMParameters();

// ============================================
// EXPORTS (make functions available globally)
// ============================================

window.trackQuizStarted = trackQuizStarted;
window.trackQuizCompleted = trackQuizCompleted;
window.trackExitPopupShown = trackExitPopupShown;
window.trackExitPopupConverted = trackExitPopupConverted;
window.trackButtonClick = trackButtonClick;
window.trackPageView = trackPageView;
window.trackFunnelStep = trackFunnelStep;
