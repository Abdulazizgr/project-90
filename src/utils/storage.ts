// Storage manager with LocalStorage persistence, JSON export/import and clean scratch reset
import { getCleanUserData } from './seedData';

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
        if (!parsed.challenge.name || parsed.challenge.name === 'Project 19' || parsed.challenge.name.includes('PROJECT 90')) {
          parsed.challenge.name = 'Project 19: Personal Management Sprint';
          parsed.challenge.totalDurationDays = parsed.challenge.totalDurationDays || 19;
          parsed.challenge.currentDay = parsed.challenge.currentDay || 1;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored Project 19 data', e);
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
    console.error('Failed to save Project 19 data', e);
  }
};

export const exportDataAsJSON = (data: any) => {
  if (typeof window === 'undefined') return;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `project19_backup_${new Date().toISOString().split('T')[0]}.json`);
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
    throw new Error('Invalid Project 19 data format');
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
