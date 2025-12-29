
import React, { useState, useEffect } from 'react';
import { Category, JobEntry, SiteSettings, JobStatus } from '../types';
import { addJob, updateJob, deleteJob, saveSiteSettings, subscribeToJobs, subscribeToSettings } from '../db';
import { generatePostFromTitle, syncPostFromLink, generateOnlyDescription } from '../geminiService';

interface AdminPanelProps {
  onUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'settings'>('create');
  const [manageFilter, setManageFilter] = useState<JobStatus>('published');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState<Partial<JobEntry>>({
    title: '', department: '', category: Category.LATEST_JOB,
    link: '', isUrgent: false, totalPosts: '', eligibility: '',
    ageLimit: '', fee: '', importantDates: '', shortInfo: '',
    howToApply: '', selectionProcess: '', notificationLink: '', officialWebsite: '',
    status: 'published', publishAt: ''
  });

  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    publisherId: '', adSlotTop: '', adSlotSide: '', adSlotBottom: '',
    telegramLink: '', whatsappLink: '', siteName: '', footerText: ''
  });

  useEffect(() => {
    const unsubJobs = subscribeToJobs(setJobs);
    const unsubSettings = subscribeToSettings((data) => {
      setSiteSettings(data);
      setSettingsForm(data);
    });
    return () => { unsubJobs(); unsubSettings(); };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('Invalid Admin Password');
  };

  const handleMagicDescription = async () => {
    if (!formData.title || !formData.department) return alert('Title & Department are needed for AI Description!');
    setIsAiLoading(true);
    try {
      const desc = await generateOnlyDescription(formData.title as string, formData.department as string);
      setFormData(prev => ({ ...prev, shortInfo: desc }));
    } catch (e) {
      alert('Failed to generate description.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiSync = async () => {
    if (!formData.link) return alert('Paste a Link first!');
    setIsAiLoading(true);
    try {
      const data = await syncPostFromLink(formData.link);
      setFormData(prev => ({ ...prev, ...data }));
    } catch (e) {
      alert('AI Sync failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.title) return alert('Enter a Title first!');
    setIsAiLoading(true);
    try {
      const data = await generatePostFromTitle(formData.title);
      setFormData(prev => ({ ...prev, ...data }));
    } catch (e) {
      alert('AI Generation failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', department: '', category: Category.LATEST_JOB, 
      link: '', status: 'published', publishAt: '', shortInfo: '',
      importantDates: '', fee: '', totalPosts: '', eligibility: '',
      vacancyDetails: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent, targetStatus?: JobStatus) => {
    e.preventDefault();
    const finalStatus = targetStatus || formData.status || 'published';
    
    if (!formData.shortInfo || formData.shortInfo.length < 50) {
      if (!confirm('Description is very short. Use AI to generate 200 words?')) return;
      await handleMagicDescription();
    }

    const payload = { 
      ...formData, 
      status: finalStatus,
      lastDate: formData.importantDates || 'Refer Notification' 
    } as any;

    if (editingId) {
      await updateJob(editingId, payload);
      alert('Updated successfully!');
    } else {
      await addJob(payload);
      alert('Published successfully!');
    }
    resetForm();
    setActiveTab('manage');
  };

  const handleEdit = (job: JobEntry) => {
    setFormData(job);
    setEditingId(job.id);
    setActiveTab('create');
    window.scrollTo(0,0);
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSiteSettings(settingsForm);
      alert('Settings Updated Successfully!');
    } catch (err) {
      alert('Error updating settings');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center py-20 px-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border-t-8 border-[#ff0000] w-full max-sm:max-w-xs sm:max-w-sm">
          <h2 className="text-xl font-black mb-6 text-center text-[#000080] uppercase tracking-tighter">Admin Secure Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Admin Password" className="w-full p-4 border-2 rounded-lg font-bold" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full py-4 bg-[#000080] text-white font-black rounded-lg hover:bg-red-600 transition shadow-lg">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  if (!siteSettings) return null;

  return (
    <div className="bg-white rounded-xl shadow-2xl border-2 border-[#000080] overflow-hidden">
      <div className="bg-[#000080] text-white p-4 flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-lg font-black uppercase italic tracking-tighter">
          {editingId ? 'Edit Post Mode' : 'Admin Dashboard'}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => { resetForm(); setActiveTab('create'); }} className={`px-4 py-2 rounded font-black text-[10px] uppercase transition ${activeTab === 'create' && !editingId ? 'bg-[#ff0000]' : 'bg-white/10'}`}>New</button>
          <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded font-black text-[10px] uppercase transition ${activeTab === 'manage' ? 'bg-[#ff0000]' : 'bg-white/10'}`}>Manage</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded font-black text-[10px] uppercase transition ${activeTab === 'settings' ? 'bg-[#ff0000]' : 'bg-white/10'}`}>Settings</button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {activeTab === 'create' && (
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input type="text" placeholder="Post Title" className="w-full p-3 border-2 rounded font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <input type="text" placeholder="Organization" className="w-full p-3 border-2 rounded font-bold" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                
                <div className="relative">
                  <textarea placeholder="Job Summary" className="w-full p-3 border-2 rounded font-bold h-48 bg-gray-50 text-sm" value={formData.shortInfo} onChange={(e) => setFormData({...formData, shortInfo: e.target.value})} />
                  <button type="button" onClick={handleMagicDescription} className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 px-3 rounded text-[9px] font-black uppercase shadow-lg">✨ AI Auto-Write</button>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <label className="text-[10px] font-black uppercase text-gray-500 block mb-2">Publish Options</label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input type="radio" checked={formData.status === 'published'} onChange={() => setFormData({...formData, status: 'published'})} />
                      Publish Now
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input type="radio" checked={formData.status === 'draft'} onChange={() => setFormData({...formData, status: 'draft'})} />
                      Draft
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input type="radio" checked={formData.status === 'scheduled'} onChange={() => setFormData({...formData, status: 'scheduled'})} />
                      Schedule
                    </label>
                  </div>
                  {formData.status === 'scheduled' && (
                    <input 
                      type="datetime-local" 
                      className="w-full p-2 border rounded font-bold text-xs"
                      value={formData.publishAt}
                      onChange={(e) => setFormData({...formData, publishAt: e.target.value})}
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                   <button type="button" onClick={handleAiGenerate} disabled={isAiLoading} className="flex-1 bg-purple-700 text-white py-3 rounded font-black uppercase text-[10px]">AI Generate All</button>
                   <button type="button" onClick={handleAiSync} disabled={isAiLoading} className="flex-1 bg-blue-700 text-white py-3 rounded font-black uppercase text-[10px]">AI Link Sync</button>
                </div>
                <input type="text" placeholder="Paste Official Link" className="w-full p-3 border-2 rounded font-bold text-sm bg-blue-50" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
                <select className="w-full p-3 border-2 rounded font-bold text-sm bg-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as Category})}>
                  {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea placeholder="Fees Structure" className="w-full p-3 border-2 rounded font-bold h-24 text-sm" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} />
                <textarea placeholder="Vacancy & Qualification" className="w-full p-3 border-2 rounded font-bold h-24 text-sm" value={formData.vacancyDetails} onChange={(e) => setFormData({...formData, vacancyDetails: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={(e) => handleSubmit(e, 'draft')} className="flex-1 py-4 bg-gray-600 text-white font-black rounded uppercase">Save as Draft</button>
              <button type="submit" className="flex-[2] py-4 bg-red-600 text-white font-black text-xl rounded shadow-2xl uppercase tracking-tighter">
                {editingId ? 'Update & Save' : (formData.status === 'scheduled' ? 'Schedule Post' : 'Publish Live')}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-6 py-4 bg-black text-white font-black rounded uppercase">Cancel</button>
              )}
            </div>
          </form>
        )}
        
        {activeTab === 'manage' && (
          <div className="space-y-4">
            <div className="flex gap-2 border-b pb-4">
              <button onClick={() => setManageFilter('published')} className={`px-4 py-2 font-black text-xs uppercase rounded ${manageFilter === 'published' ? 'bg-[#000080] text-white' : 'bg-gray-100 text-gray-500'}`}>Live Posts</button>
              <button onClick={() => setManageFilter('scheduled')} className={`px-4 py-2 font-black text-xs uppercase rounded ${manageFilter === 'scheduled' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Scheduled</button>
              <button onClick={() => setManageFilter('draft')} className={`px-4 py-2 font-black text-xs uppercase rounded ${manageFilter === 'draft' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>Drafts</button>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b-2">
                  <tr className="text-[10px] font-black uppercase text-gray-500">
                    <th className="p-4">Post Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">{manageFilter === 'scheduled' ? 'Schedule Date' : 'Posted Date'}</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs.filter(j => j.status === manageFilter || (!j.status && manageFilter === 'published')).map(j => (
                    <tr key={j.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-black text-[12px] text-[#000080]">{j.title}</td>
                      <td className="p-4"><span className="text-[9px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">{j.category}</span></td>
                      <td className="p-4 text-[10px] font-bold text-gray-400">
                        {manageFilter === 'scheduled' ? new Date(j.publishAt!).toLocaleString() : j.postedDate}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(j)} className="text-blue-600 font-black text-[10px] uppercase hover:bg-blue-50 px-2 py-1 rounded">Edit</button>
                        <button onClick={() => { if(confirm('Delete this post?')) deleteJob(j.id); }} className="text-red-600 font-black text-[10px] hover:bg-red-50 px-2 py-1 rounded uppercase">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {jobs.filter(j => j.status === manageFilter || (!j.status && manageFilter === 'published')).length === 0 && (
                <div className="p-10 text-center font-black text-gray-300 uppercase italic">No posts in this section.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-[#000080] uppercase mb-6 border-b-4 border-red-600 inline-block">Site Configuration</h3>
            <form onSubmit={handleSettingsSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Site Branding Name</label>
                  <input type="text" className="w-full p-3 border-2 rounded font-bold text-sm" value={settingsForm.siteName} onChange={(e) => setSettingsForm({...settingsForm, siteName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Footer Website Link (Text)</label>
                  <input type="text" className="w-full p-3 border-2 rounded font-bold text-sm" value={settingsForm.footerText} onChange={(e) => setSettingsForm({...settingsForm, footerText: e.target.value})} />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-100 space-y-4">
                <h4 className="font-black text-blue-800 uppercase text-xs">Social & Community Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500">Telegram Channel URL</label>
                    <input type="url" placeholder="https://t.me/yourchannel" className="w-full p-3 border-2 rounded font-bold text-sm" value={settingsForm.telegramLink} onChange={(e) => setSettingsForm({...settingsForm, telegramLink: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500">WhatsApp Group URL</label>
                    <input type="url" placeholder="https://wa.me/..." className="w-full p-3 border-2 rounded font-bold text-sm" value={settingsForm.whatsappLink} onChange={(e) => setSettingsForm({...settingsForm, whatsappLink: e.target.value})} />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-green-600 text-white font-black text-lg rounded shadow-xl hover:bg-green-700 transition uppercase tracking-widest">Update Site Settings</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
