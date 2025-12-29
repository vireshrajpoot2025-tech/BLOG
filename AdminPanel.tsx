
import React, { useState, useEffect } from 'react';
import { Category, JobEntry, SiteSettings, JobStatus } from '../types';
import { addJob, updateJob, deleteJob, saveSiteSettings, subscribeToJobs, subscribeToSettings } from '../db';
import { generatePostFromTitle, syncPostFromLink, generateOnlyDescription, searchLatestJobsFromWeb } from '../geminiService';

interface AdminPanelProps {
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'discover' | 'settings'>('create');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [discoveredJobs, setDiscoveredJobs] = useState<{title: string, url: string}[]>([]);
  
  const [formData, setFormData] = useState<Partial<JobEntry>>({
    title: '', department: '', category: Category.LATEST_JOB,
    link: '', isUrgent: false, totalPosts: '', eligibility: '',
    ageLimit: '', fee: '', importantDates: '', shortInfo: '',
    status: 'published'
  });

  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    publisherId: '', adSlotTop: '', adSlotSide: '', adSlotBottom: '',
    telegramLink: '', whatsappLink: '', siteName: '', footerText: ''
  });

  useEffect(() => {
    const unsubJobs = subscribeToJobs(setJobs);
    const unsubSettings = subscribeToSettings((data) => {
      setSettingsForm(data);
    });
    return () => { unsubJobs(); unsubSettings(); };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('Wrong Password!');
  };

  const handleDiscoverJobs = async () => {
    setIsAiLoading(true);
    try {
      const result = await searchLatestJobsFromWeb();
      setDiscoveredJobs(result.sources);
      setActiveTab('discover');
    } catch (e) {
      alert('Discovery failed. Check API Key in Netlify.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSyncThisJob = async (url: string) => {
    setIsAiLoading(true);
    try {
      const data = await syncPostFromLink(url);
      setFormData(prev => ({ ...prev, ...data, link: url }));
      setActiveTab('create');
    } catch (e) {
      alert('Sync failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', department: '', category: Category.LATEST_JOB, link: '', status: 'published' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, postedDate: new Date().toISOString().split('T')[0] } as any;
    if (editingId) await updateJob(editingId, payload);
    else await addJob(payload);
    alert('Site Updated Successfully!');
    resetForm();
    setActiveTab('manage');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center py-20 px-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border-t-8 border-[#ff0000] w-full max-w-sm">
          <h2 className="text-xl font-black mb-6 text-center text-[#000080] uppercase">Admin Secure Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Admin Password" className="w-full p-4 border-2 rounded-lg font-bold" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full py-4 bg-[#000080] text-white font-black rounded-lg">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl border-2 border-[#000080] overflow-hidden">
      <div className="bg-[#000080] text-white p-4 flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-lg font-black uppercase italic tracking-tighter">SARKARI CONTROL CENTER</h2>
        <div className="flex gap-2">
          <button onClick={handleDiscoverJobs} className="bg-yellow-500 text-black px-4 py-2 rounded font-black text-[10px] uppercase hover:bg-yellow-400">🔍 AI Discover</button>
          <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded font-black text-[10px] uppercase ${activeTab === 'create' ? 'bg-[#ff0000]' : 'bg-white/10'}`}>Add New</button>
          <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded font-black text-[10px] uppercase ${activeTab === 'manage' ? 'bg-[#ff0000]' : 'bg-white/10'}`}>Live Jobs</button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {activeTab === 'discover' && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-[#000080] border-b-4 border-[#ff0000] inline-block mb-4">LATEST JOBS FOUND BY AI</h3>
            {isAiLoading ? (
              <div className="p-10 text-center font-black animate-bounce">AI IS SCANNING THE INTERNET...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {discoveredJobs.map((dj, i) => (
                  <div key={i} className="p-4 border-2 border-gray-100 rounded-lg flex justify-between items-center bg-gray-50 hover:border-blue-300 transition-all">
                    <div>
                      <p className="font-black text-sm text-[#000080] uppercase">{dj.title}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-xs">{dj.url}</p>
                    </div>
                    <button onClick={() => handleSyncThisJob(dj.url)} className="bg-green-600 text-white px-4 py-2 rounded font-black text-[10px] uppercase">Sync & Publish</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="bg-blue-50 p-4 border-2 border-dashed border-blue-200 rounded-lg flex gap-2">
               <input type="text" placeholder="Paste Job URL to Auto-Fill" className="flex-1 p-3 border-2 rounded font-bold text-sm" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
               <button type="button" onClick={() => handleSyncThisJob(formData.link || '')} className="bg-[#000080] text-white px-6 font-black rounded text-[10px] uppercase">AI SYNC</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Job Title" className="p-3 border-2 rounded font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <input type="text" placeholder="Department" className="p-3 border-2 rounded font-bold" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                <select className="p-3 border-2 rounded font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as Category})}>
                  {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Last Date" className="p-3 border-2 rounded font-bold" value={formData.importantDates} onChange={(e) => setFormData({...formData, importantDates: e.target.value})} />
             </div>
             <textarea placeholder="Short Info (AI will generate)" className="w-full p-3 border-2 rounded font-bold h-32" value={formData.shortInfo} onChange={(e) => setFormData({...formData, shortInfo: e.target.value})} />
             
             <button type="submit" className="w-full py-5 bg-red-600 text-white font-black text-xl rounded shadow-xl hover:bg-red-700 transition uppercase">
                {editingId ? 'UPDATE JOB POST' : 'PUBLISH LIVE ON WEBSITE'}
             </button>
          </form>
        )}

        {activeTab === 'manage' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b-2">
                <tr className="text-[10px] font-black uppercase text-gray-500">
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobs.map(j => (
                  <tr key={j.id} className="hover:bg-gray-50">
                    <td className="p-4 font-black text-xs text-[#000080]">{j.title}</td>
                    <td className="p-4"><span className="text-[9px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">{j.category}</span></td>
                    <td className="p-4 text-right">
                      <button onClick={() => { setFormData(j); setEditingId(j.id); setActiveTab('create'); }} className="text-blue-600 font-black text-[10px] mr-4">Edit</button>
                      <button onClick={() => deleteJob(j.id)} className="text-red-600 font-black text-[10px]">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
