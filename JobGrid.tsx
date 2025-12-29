
import React from 'react';
import { JobEntry, Category } from '../types';

interface JobGridProps {
  jobs: JobEntry[];
  onJobClick: (job: JobEntry) => void;
  onCategoryViewAll: (cat: Category) => void;
}

const JobGrid: React.FC<JobGridProps> = ({ jobs, onJobClick, onCategoryViewAll }) => {
  const sections = [
    { title: 'RESULTS', cat: Category.RESULT, color: 'border-[#ff0000]', headBg: 'bg-[#ff0000]' },
    { title: 'ADMIT CARD', cat: Category.ADMIT_CARD, color: 'border-[#000080]', headBg: 'bg-[#000080]' },
    { title: 'LATEST JOBS', cat: Category.LATEST_JOB, color: 'border-[#006400]', headBg: 'bg-[#006400]' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {sections.map(sec => (
        <div key={sec.cat} className={`bg-white border-2 ${sec.color} rounded shadow-2xl flex flex-col min-h-[550px] transform hover:shadow-3xl transition-shadow`}>
          <div className={`${sec.headBg} text-white text-center font-black p-3 uppercase text-[15px] flex justify-between px-5 items-center italic tracking-tighter`}>
             <span>{sec.title}</span>
             <button onClick={() => onCategoryViewAll(sec.cat)} className="text-[10px] bg-white/20 border border-white/40 px-3 py-1 rounded hover:bg-white/40 transition-colors uppercase">All</button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
            {jobs.filter(j => j.category === sec.cat).length > 0 ? (
              jobs.filter(j => j.category === sec.cat).slice(0, 18).map(job => (
                <button 
                  key={job.id} 
                  onClick={() => onJobClick(job)}
                  className="w-full text-left p-3.5 px-5 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-[#ff0000] flex items-start gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[#000080] font-black text-[12px] uppercase leading-relaxed tracking-tight block">
                      {job.title}
                    </span>
                  </div>
                  {new Date(job.postedDate).getTime() > Date.now() - 4*24*60*60*1000 && (
                    <img src="https://www.sarkariresult.com/images/new.gif" alt="New" className="h-4 mt-0.5 shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="p-10 text-center text-gray-300 font-black uppercase text-xs">Waiting for AI updates...</div>
            )}
          </div>
          <div className="bg-gray-50 p-3 text-center border-t-2 border-gray-100">
            <button onClick={() => onCategoryViewAll(sec.cat)} className="text-[11px] font-black text-[#ff0000] hover:underline uppercase tracking-widest italic">View More Result / Updates »</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobGrid;
