
import React from 'react';
import { JobEntry } from '../types';

interface JobDetailProps {
  job: JobEntry;
  onClose: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onClose }) => {
  const handlePrint = () => window.print();
  const currentYear = new Date().getFullYear();

  const renderText = (text?: string) => {
    if (!text) return 'Refer Notification';
    return text.split('\n').map((line, i) => (
      <div key={i} className="mb-1 flex items-start gap-2">
        <span className="text-black font-bold">•</span>
        <span>{line.replace(/^•\s*/, '')}</span>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-0 md:p-4 bg-white overflow-y-auto animate-fadeIn print:p-0">
      <div className="w-full max-w-4xl bg-white min-h-screen relative print:static border-x-2 border-gray-100">
        
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-50 shadow-sm print:hidden">
          <button onClick={onClose} className="px-5 py-2 bg-gray-800 text-white font-black rounded uppercase text-[10px] tracking-widest shadow-lg">← Back</button>
          <div className="text-[#ff0000] font-black italic hidden md:block">SARKARI PORTAL AI</div>
          <button onClick={handlePrint} className="px-5 py-2 bg-blue-700 text-white font-black rounded uppercase text-[10px] tracking-widest shadow-lg">Print Post</button>
        </div>

        <div className="p-4 md:p-10 space-y-8 text-black font-sans">
          
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-[#FF00FF] uppercase leading-tight drop-shadow-sm">{job.department} {job.title} {currentYear}</h1>
            <div className="flex justify-center gap-6 text-[10px] font-black uppercase text-gray-500">
              <span className="border-r pr-6">Author: Admin</span>
              <span>Category: {job.category}</span>
            </div>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-xl border-l-8 border-blue-600 shadow-inner">
            <p className="text-[15px] leading-relaxed text-gray-800 italic">
              <span className="text-red-600 font-black uppercase not-italic">Detailed Information : </span>
              {job.shortInfo || `The ${job.department} has officially announced the recruitment process for ${job.title}. Eligible candidates are invited to apply for ${job.totalPosts || 'multiple'} vacancies. Please read the full details below for eligibility, fees, and application process.`}
            </p>
          </div>

          <div className="border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            
            <div className="bg-white border-b-[3px] border-black p-6 text-center space-y-2">
               <h2 className="text-red-700 font-black text-2xl uppercase tracking-tighter underline decoration-blue-600 decoration-4 underline-offset-8">{job.department}</h2>
               <h3 className="text-blue-800 font-black text-xl uppercase italic">{job.title} Recruitment {currentYear}</h3>
               <p className="text-green-700 font-black text-sm uppercase">Official Advt No. 01/Recruit/{currentYear}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border-b-[3px] border-black">
              <div className="border-b-[3px] md:border-b-0 md:border-r-[3px] border-black">
                 <div className="bg-[#ADD8E6] p-2 text-center font-black border-b-[3px] border-black uppercase text-xs tracking-widest">Important Dates</div>
                 <div className="p-5 text-[13px] font-bold space-y-2">
                    {renderText(job.importantDates || `Application Start : ${job.postedDate}\nLast Date : ${job.lastDate}`)}
                 </div>
              </div>
              <div className="bg-white">
                 <div className="bg-[#ADD8E6] p-2 text-center font-black border-b-[3px] border-black uppercase text-xs tracking-widest">Application Fee</div>
                 <div className="p-5 text-[13px] font-bold space-y-2">
                    {renderText(job.fee || 'General / OBC / EWS : 100/-\nSC / ST / PH : 0/-\nPayment Mode: Online')}
                 </div>
              </div>
            </div>

            <div className="border-b-[3px] border-black bg-white">
               <div className="bg-[#ADD8E6] p-2 text-center font-black border-b-[3px] border-black uppercase text-xs tracking-widest">Age Limit Info</div>
               <div className="p-5 text-[13px] font-bold">
                  {renderText(job.ageLimit || 'Minimum Age : 18 Years\nMaximum Age : 27-40 Years\nAge Relaxation Extra as per Rules')}
               </div>
            </div>

            <div className="border-b-[3px] border-black bg-white">
               <div className="bg-[#ADD8E6] p-2 text-center font-black border-b-[3px] border-black uppercase text-xs tracking-widest">Vacancy Details</div>
               <div className="p-4 text-center">
                  <span className="text-red-600 font-black text-2xl tracking-tighter">Total Vacancy : {job.totalPosts || 'Check Notification'}</span>
                  <div className="mt-4 text-left font-bold text-sm bg-gray-50 p-4 rounded border border-gray-200">
                    {renderText(job.vacancyDetails || 'Refer to the official notification for post-wise breakdown.')}
                  </div>
               </div>
            </div>

            <div className="border-b-[3px] border-black bg-white">
               <div className="bg-[#ADD8E6] p-2 text-center font-black border-b-[3px] border-black uppercase text-xs tracking-widest">Educational Eligibility</div>
               <div className="p-5 text-[13px] font-bold leading-loose">
                  {renderText(job.eligibility || 'Candidate must possess the required degree/diploma from any recognized university in India.')}
               </div>
            </div>

            <div className="bg-white">
               <div className="bg-[#ADD8E6] p-2 text-center font-black border-b-[3px] border-black uppercase text-xs tracking-widest">Important Links</div>
               <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b-[3px] border-black group">
                       <td className="bg-[#FFEBCD] p-5 text-center w-3/4 border-r-[3px] border-black font-black text-red-900 text-xl uppercase tracking-tighter">Apply Online</td>
                       <td className="bg-[#FFEBCD] p-5 text-center"><a href={job.link} target="_blank" className="text-blue-700 font-black underline text-lg hover:text-red-600 transition-colors">Click Here</a></td>
                    </tr>
                    <tr className="border-b-[3px] border-black">
                       <td className="bg-[#FFEBCD] p-5 text-center border-r-[3px] border-black font-black text-red-900 text-lg uppercase tracking-tight">Download Notification</td>
                       <td className="bg-[#FFEBCD] p-5 text-center"><a href={job.notificationLink || job.link} target="_blank" className="text-blue-700 font-black underline text-lg hover:text-red-600">Click Here</a></td>
                    </tr>
                    <tr>
                       <td className="bg-[#FFEBCD] p-5 text-center border-r-[3px] border-black font-black text-red-900 text-lg uppercase tracking-tight">Official Website</td>
                       <td className="bg-[#FFEBCD] p-5 text-center"><a href={job.officialWebsite || '#'} target="_blank" className="text-blue-700 font-black underline text-lg hover:text-red-600">Click Here</a></td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </div>

          <div className="text-center py-10 border-t-4 border-black border-dashed mt-12 bg-gray-900 text-white rounded-t-3xl">
            <p className="font-black text-yellow-400 text-xl uppercase italic tracking-[0.2em] mb-2">WWW.SARKARIPORTALAI.COM</p>
            <p className="text-[9px] font-black text-gray-400 tracking-widest">FASTEST RECRUITMENT UPDATES SINCE 2024</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetail;
