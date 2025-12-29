
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { JobEntry, SiteSettings, Category } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyAEQgnzWpmeQfEjByVVjHaPX0Q3fSNHyO0",
  authDomain: "newlive-60f4c.firebaseapp.com",
  databaseURL: "https://newlive-60f4c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "newlive-60f4c",
  storageBucket: "newlive-60f4c.firebasestorage.app",
  messagingSenderId: "307772756970",
  appId: "1:307772756970:web:dac0c876f10a5bed3d9893",
  measurementId: "G-84MDB8FSFT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const INITIAL_SETTINGS: SiteSettings = {
  publisherId: '',
  adSlotTop: '',
  adSlotSide: '',
  adSlotBottom: '',
  telegramLink: 'https://t.me/sarkariresult',
  whatsappLink: 'https://wa.me/yourgroup',
  siteName: 'SARKARI RESULT LIVE',
  footerText: 'WWW.SARKARIRESULTLIVE.COM'
};

export const subscribeToJobs = (callback: (jobs: JobEntry[]) => void) => {
  const jobsRef = ref(db, 'jobs');
  return onValue(jobsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const jobList = Object.keys(data).map(key => ({
        ...data[key],
        id: key
      })).reverse(); 
      callback(jobList);
    } else {
      callback([]);
    }
  });
};

export const subscribeToSettings = (callback: (settings: SiteSettings) => void) => {
  const settingsRef = ref(db, 'settings');
  return onValue(settingsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    } else {
      set(settingsRef, INITIAL_SETTINGS);
      callback(INITIAL_SETTINGS);
    }
  });
};

export const saveSiteSettings = async (settings: SiteSettings) => {
  const settingsRef = ref(db, 'settings');
  await set(settingsRef, settings);
};

export const addJob = async (job: Omit<JobEntry, 'id' | 'postedDate'>) => {
  const jobsRef = ref(db, 'jobs');
  const newJob = {
    ...job,
    postedDate: new Date().toISOString().split('T')[0]
  };
  await push(jobsRef, newJob);
};

export const updateJob = async (id: string, jobData: Partial<JobEntry>) => {
  const jobRef = ref(db, `jobs/${id}`);
  await update(jobRef, jobData);
};

export const deleteJob = async (id: string) => {
  const jobRef = ref(db, `jobs/${id}`);
  await remove(jobRef);
};
