
import React, { useState, useEffect, useRef } from 'react';
import { subscribeToJobs, subscribeToSettings } from './db';
import { JobEntry, Category, View, SiteSettings } from './types';
import JobTicker from './components/JobTicker';
import JobGrid from './components/JobGrid';
import AdminPanel from './components/AdminPanel';
import AdUnit from './components/AdUnit';
import JobDetail from './components/JobDetail';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [view, setView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobEntry | null>(null);
  const lastJobIdRef = useRef<string | null>(localStorage.getItem('last_seen_job_id'));

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const unsubscribeJobs = subscribeToJobs((data) => {
      setJobs(data);
      
      // Check for new published posts to notify users
      const latestPublished = data.find(j => j.status === 'published' || !j.status);
      if (latestPublished && latestPublished.id !== lastJobIdRef.current) {
        if (lastJobIdRef.current !== null) { // Don't notify on first load
           showNotification(latestPublished);
        }
        lastJobIdRef.current = latestPublished.id;
        localStorage.setItem('last_seen_job_id', latestPublished.id);
      }
    });

    const unsubscribeSettings = subscribeToSettings((data) => {
      setSettings(data);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeSettings();
    };
  }, []);

  const showNotification = (job: JobEntry) => {
    // Browser Native Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New Update on Sarkari Portal", {
        body: job.title,
        icon: "https://www.sarkariresult.com/images/new.gif"
      });
    }
    // Simple custom toast log for internal feedback
    console.log("New Update Detected:", job.title);
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000080]">
        <div className="text-white font-black text-2xl animate-pulse tracking-tighter italic">
          CONNECTING TO CLOUD...
        </div>
      </div>
    );
  }

  // Filter jobs to only show 'published' or 'scheduled' ones that have passed their time
  const liveJobs = jobs.filter(j => {
    if (j.status === 'draft') return false;
    if (j.status === 'scheduled' && j.publishAt) {
      return new Date(j.publishAt) <= new Date();
    }
    return true; 
  });

  const filteredJobs = liveJobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.department.toLowerCase().includes(search.toLowerCase())
  );

  const renderHome = () => (
    <div className="space-y-6">
      <AdUnit type="leaderboard" publisherId={settings.publisherId} adSlot={settings.adSlotTop} />

      <div className="bg-white border-2 border-[#ff0000] rounded-md overflow-hidden shadow-lg">
         <div className="bg-[#ff0000] text-white p-1 text-center font-black uppercase text-[11px]">Latest Breaking Updates</div>
         <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            {liveJobs.slice(0, 6).map(job => (
              <button key={job.id} onClick={() => setSelectedJob(job)} className="text-[#000080] font-black text-[11px] uppercase hover:text-[#ff0000] text-left truncate">
                <span className="text-[#ff0000] mr-1">»</span> {job.title}
              </button>
            ))}
         </div>
      </div>

      <JobGrid jobs={filteredJobs} onJobClick={setSelectedJob} onCategoryViewAll={(cat) => { setSelectedCategory(cat); setView('category_view'); window.scrollTo(0,0); }} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Changed Category.SYLLABUS to Category.IMPORTANT here */}
         {[Category.IMPORTANT, Category.ANSWER_KEY, Category.ADMISSION].map(cat => (
           <div key={cat} className="bg-white border-2 border-gray-300 rounded-md overflow-hidden shadow-md min-h-[400px]">
              <div className="bg-[#555] text-white p-2.5 text-center font-black uppercase text-xs">{cat}</div>
              <div className="p-3 space-y-2.5">
                 {liveJobs.filter(j => j.category === cat).slice(0, 10).map(j => (
                   <button key={j.id} onClick={() => setSelectedJob(j)} className="block w-full text-left text-[#000080] hover:text-[#ff0000] text-[12px] font-black border-b border-gray-100 pb-2 truncate">
                      ● {j.title}
                   </button>
                 ))}
                 {liveJobs.filter(j => j.category === cat).length === 0 && (
                   <div className="py-20 text-center font-black text-gray-200 uppercase text-[10px]">No Content Found</div>
                 )}
              </div>
              <div className="p-3 text-center border-t mt-auto">
                <button onClick={() => { setSelectedCategory(cat); setView('category_view'); window.scrollTo(0,0); }} className="text-[10px] font-black text-red-600 uppercase">View All {cat} »</button>
              </div>
           </div>
         ))}
      </div>
      
      <AdUnit type="rectangle" publisherId={settings.publisherId} adSlot={settings.adSlotBottom} />
    </div>
  );

  const renderCategoryView = () => (
    <div className="space-y-6">
      <div className="bg-[#000080] text-white p-4 rounded shadow-lg flex justify-between items-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter">Viewing: {selectedCategory}</h2>
        <button onClick={() => setView('home')} className="bg-white text-[#000080] px-4 py-1 rounded font-black text-xs uppercase">Back to Home</button>
      </div>
      <div className="bg-white border-2 border-[#000080] rounded shadow-xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          {liveJobs.filter(j => j.category === selectedCategory).map(job => (
            <button 
              key={job.id} 
              onClick={() => setSelectedJob(job)}
              className="w-full text-left p-4 hover:bg-blue-50 transition-colors flex justify-between items-center group"
            >
              <span className="text-[#000080] font-black text-sm uppercase group-hover:text-red-600">● {job.title}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{job.postedDate}</span>
            </button>
          ))}
          {liveJobs.filter(j => j.category === selectedCategory).length === 0 && (
            <div className="p-20 text-center font-black text-gray-300 uppercase italic">No jobs found in this category.</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col font-sans">
      {selectedJob && <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />}

      <JobTicker jobs={liveJobs} />

      <header className="bg-white border-b-8 border-[#000080] shadow-xl sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setView('home'); window.scrollTo(0,0); }}>
             <div className="bg-[#ff0000] text-white text-4xl font-black italic p-3 rounded-lg leading-none shadow-lg">S</div>
             <div>
               <h1 className="text-2xl md:text-3xl font-black text-[#ff0000] italic uppercase">{settings.siteName}</h1>
               <p className="text-[10px] font-black text-[#000080] uppercase tracking-widest">{settings.footerText}</p>
             </div>
          </div>

          <div className="flex-1 max-w-md w-full">
            <input 
              type="text" 
              placeholder="Search Results, Jobs..." 
              className="w-full px-4 py-3 border-2 border-[#000080] rounded-full focus:outline-none font-bold text-xs" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          <div className="flex gap-2">
            {settings.telegramLink && (
              <a href={settings.telegramLink} target="_blank" className="bg-[#24A1DE] text-white px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-md">Telegram</a>
            )}
            <button onClick={() => setView(view === 'admin' ? 'home' : 'admin')} className="bg-[#000080] text-white px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-md">
               {view === 'admin' ? 'HOME' : 'ADMIN PANEL'}
            </button>
          </div>
        </div>

        <nav className="bg-[#000080] text-white overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex">
            <button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="px-6 py-4 font-black text-[11px] uppercase border-r border-white/5 hover:bg-[#ff0000] whitespace-nowrap">HOME</button>
            {[Category.LATEST_JOB, Category.RESULT, Category.ADMIT_CARD, Category.ANSWER_KEY, Category.IMPORTANT].map(cat => (
              <button key={cat} onClick={() => { setSelectedCategory(cat); setView('category_view'); window.scrollTo(0,0); }} className="px-6 py-4 font-black text-[11px] uppercase border-r border-white/5 hover:bg-[#ff0000] whitespace-nowrap">{cat}</button>
            ))}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1">
        {view === 'admin' ? <AdminPanel onUpdate={() => {}} /> : 
         view === 'category_view' ? renderCategoryView() : renderHome()}
      </main>

      <footer className="bg-[#000080] text-white py-12 border-t-[10px] border-[#ff0000]">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-3xl font-black italic text-[#ff0000] uppercase mb-4">{settings.siteName}</h2>
           <p className="text-[11px] font-bold opacity-70 uppercase mb-8">Fastest updates for India's latest jobs and results.</p>
           <div className="flex justify-center gap-4 mb-8">
             {settings.whatsappLink && <a href={settings.whatsappLink} className="bg-green-600 px-6 py-2 rounded font-black text-xs uppercase">Join WhatsApp</a>}
             {settings.telegramLink && <a href={settings.telegramLink} className="bg-blue-600 px-6 py-2 rounded font-black text-xs uppercase">Join Telegram</a>}
           </div>
           <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">COPYRIGHT © {new Date().getFullYear()} - {settings.footerText}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
