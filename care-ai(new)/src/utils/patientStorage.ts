import { PatientProfile, ChatMessage } from '../types';

export interface StoredPatientAccount {
  email: string;
  profile: PatientProfile;
  messages: ChatMessage[];
  updatedAt: string;
}

const STORAGE_PREFIX = 'care_ai_account_db_';
const ACTIVE_EMAIL_KEY = 'care_ai_active_patient_email';

export function getAccountKey(email: string): string {
  return `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

/**
 * Retrieves a saved patient account by Gmail address.
 */
export function loadPatientAccount(email: string): StoredPatientAccount | null {
  if (!email) return null;
  try {
    const raw = localStorage.getItem(getAccountKey(email));
    if (raw) {
      return JSON.parse(raw) as StoredPatientAccount;
    }
  } catch (e) {
    console.error('Failed to load patient account for:', email, e);
  }
  return null;
}

/**
 * Saves or updates a patient account in localStorage indexed by Gmail address.
 */
export function savePatientAccount(email: string, profile: PatientProfile, messages: ChatMessage[]): void {
  if (!email) return;
  const cleanEmail = email.trim().toLowerCase();
  const accountData: StoredPatientAccount = {
    email: cleanEmail,
    profile: {
      ...profile,
      email: cleanEmail,
    },
    messages,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(getAccountKey(cleanEmail), JSON.stringify(accountData));
    localStorage.setItem(ACTIVE_EMAIL_KEY, cleanEmail);
  } catch (e) {
    console.error('Failed to save patient account data:', e);
  }
}

/**
 * Gets the currently active signed-in patient email.
 */
export function getActivePatientEmail(): string | null {
  try {
    return localStorage.getItem(ACTIVE_EMAIL_KEY);
  } catch {
    return null;
  }
}

/**
 * Sets the active patient email.
 */
export function setActivePatientEmail(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(ACTIVE_EMAIL_KEY, email.trim().toLowerCase());
    } else {
      localStorage.removeItem(ACTIVE_EMAIL_KEY);
    }
  } catch (e) {
    console.error('Failed to set active patient email:', e);
  }
}

/**
 * Lists all registered patient Gmail accounts stored on this device.
 */
export function listSavedPatientAccounts(): StoredPatientAccount[] {
  const accounts: StoredPatientAccount[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          accounts.push(JSON.parse(raw));
        }
      }
    }
  } catch (e) {
    console.error('Error listing saved patient accounts:', e);
  }
  return accounts;
}
