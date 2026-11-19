// Storage manager with LocalStorage persistence, JSON export/import and clean scratch reset
import { getCleanUserData, DEFAULT_TRANSACTIONS } from './seedData';

const STORAGE_KEY = 'project19_management_system_v1';

export const loadDataFromStorage = (profile = {}) => {
  if (typeof window === 'undefined') {
    return getCleanUserData(profile);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.challenge && parsed.categories && parsed.routines && parsed.tasks) {
        // Automatically migrate any legacy Project 19 challenge names or 19-day durations to 90 days
        if (!parsed.challenge.name || parsed.challenge.name.includes('Project 19')) {
          parsed.challenge.name = 'Project 90: Personal Management System';
        }
        if (!parsed.challenge.totalDurationDays || Number(parsed.challenge.totalDurationDays) === 19) {
          parsed.challenge.totalDurationDays = 90;
          if (parsed.challenge.startDate) {
            const s = new Date(parsed.challenge.startDate);
            const e = new Date(s);
            e.setDate(s.getDate() + 89);
            parsed.challenge.endDate = e.toISOString().split('T')[0];
          }
        }
        if (!parsed.challenge.currentDay) {
          parsed.challenge.currentDay = 1;
        }
        // Ensure owner profile has email & password seeded if blank or default
        if (!parsed.profile) parsed.profile = {};
        if (!parsed.profile.email || parsed.profile.email === '' || parsed.profile.email === 'user@example.com') {
          parsed.profile.email = 'abdulazizisa579@gmail.com';
        }
        if (!parsed.profile.password) {
          parsed.profile.password = 'password';
        }
        if (!parsed.profile.name || parsed.profile.name === 'User') {
          parsed.profile.name = 'Abdulaziz';
        }
        if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
          parsed.transactions = DEFAULT_TRANSACTIONS;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored Apex OS data', e);
  }
  const initial = getCleanUserData(profile);
  saveDataToStorage(initial);
  return initial;
};

export const saveDataToStorage = (data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save Apex OS data', e);
  }
};

export const exportDataAsJSON = (data: any) => {
  if (typeof window === 'undefined') return;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `apex_os_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportTimeEntriesAsCSV = (...args: any[]) => {};

export const importDataFromJSON = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.challenge && parsed.categories && parsed.routines) {
      saveDataToStorage(parsed);
      return parsed;
    }
    throw new Error('Invalid Apex OS data format');
  } catch (err) {
    throw err;
  }
};

export const resetToCleanUserData = (profile = {}) => {
  const initial = getCleanUserData(profile);
  saveDataToStorage(initial);
  return initial;
};

export const resetToDemoData = () => {
  return resetToCleanUserData();
};
