
export enum Category {
  LATEST_JOB = 'Latest Jobs',
  ADMIT_CARD = 'Admit Card',
  RESULT = 'Result',
  ANSWER_KEY = 'Answer Key',
  IMPORTANT = 'Important',
  ADMISSION = 'Admission',
  CERTIFICATE = 'Certificate Verification'
}

export type JobStatus = 'draft' | 'published' | 'scheduled';
export type Qualification = '10th Pass' | '12th Pass' | 'ITI/Diploma' | 'Graduate' | 'Post Graduate';
export type IndianState = 'Uttar Pradesh' | 'Bihar' | 'Delhi' | 'Rajasthan' | 'MP' | 'Haryana' | 'Others';
export type View = 'home' | 'admin' | 'contact' | 'privacy' | 'disclaimer' | 'about' | 'category_view';

export interface JobEntry {
  id: string;
  title: string;
  department: string;
  category: Category;
  state?: IndianState;
  qualification?: Qualification;
  lastDate: string;
  link: string;
  postedDate: string;
  isUrgent?: boolean;
  
  // Status & Scheduling
  status: JobStatus;
  publishAt?: string; // ISO string for scheduled publishing

  // Detailed Layout Fields
  shortInfo?: string; 
  importantDates?: string;
  fee?: string;
  ageLimit?: string;
  vacancyDetails?: string;
  totalPosts?: string;
  eligibility?: string;
  howToApply?: string;
  selectionProcess?: string;
  notificationLink?: string;
  officialWebsite?: string;
}

export interface SiteSettings {
  publisherId: string;
  adSlotTop: string;
  adSlotSide: string;
  adSlotBottom: string;
  telegramLink: string;
  whatsappLink: string;
  siteName: string;
  footerText: string;
}
