// utils.js
import { PRICING, REX_FREE_DAYS_LIMIT, EXPIRES_SOON_THRESHOLD_DAYS } from './config.js';

/**
 * Dynamically determine subscription status based on expiration date
 */
export function getSubscriptionStatus(expiresAt) {
    if (!expiresAt) return { status: 'inactive', message: 'No active subscription' };
    
    const now = new Date();
    const expiration = new Date(expiresAt);
    
    if (expiration < now) {
        return { status: 'expired', message: 'Subscription expired' };
    }
    
    const thresholdMs = EXPIRES_SOON_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
    if (expiration - now <= thresholdMs) {
        return { 
            status: 'expires_soon', 
            message: `Expires on ${expiration.toLocaleDateString()}` 
        };
    }
    
    return { 
        status: 'active', 
        message: `Active until ${expiration.toLocaleDateString()}` 
    };
}

/**
 * Check if a specific subject is active for the user
 */
export function isSubjectActive(userProfile, subjectName) {
    if (!userProfile || !userProfile.subjects) return false;
    if (Array.isArray(userProfile.subjects)) {
        return userProfile.subjects.includes(subjectName.toLowerCase());
    }
    return false;
}

/**
 * Get formatted dynamic price
 */
export function getFormattedPrice() {
    return `$${PRICING.subject_monthly} ${PRICING.currency}`;
}

/**
 * Check REX subscription status
 */
export function getRexStatus(userProfile) {
    if (!userProfile) return { active: false, message: 'REX inactive' };
    
    const isActive = userProfile.rex_subscription_active;
    const expiresAt = userProfile.rex_subscription_expires_at;
    
    if (!isActive) {
        return { 
            active: false, 
            message: `Free access: Last ${REX_FREE_DAYS_LIMIT} days only` 
        };
    }
    
    if (expiresAt) {
        const expDate = new Date(expiresAt);
        return { 
            active: true, 
            message: `Full access until ${expDate.toLocaleDateString()}` 
        };
    }
    
    return { active: true, message: 'Full access active' };
}