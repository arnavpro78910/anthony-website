import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  MoreHorizontal,
  Mail,
  User,
  Crown,
  Eye,
  Trash2,
  Send
} from 'lucide-react';
import { FormSubmission, UserAccount, CompanyBranding } from '../../types';
import { getStatusBadge } from '../../utils/theme'; // We'll move the helper or define here

interface AdminSubmissionsTabProps {
  submissions: FormSubmission[];
  users: UserAccount[];
  onStatusUpdate: (id: string, status: FormSubmission['status']) => void;
  onDelete: (id: string) => void;
  onEscalate: (submission: FormSubmission) => void;
}

export const AdminSubmissionsTab: React.FC<AdminSubmissionsTabProps> = ({
  submissions,
  users,
  onStatusUpdate,
  onDelete,
  onEscalate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.formTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeLocal = (status: FormSubmission['status']) => {
    const styles = {
      'Pending Review': 'bg-amber-100 text-amber-700 border-amber-200',
      'Under Evaluation': 'bg-blue-100 text-blue-700 border-blue-200',
      'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Rejected': 'bg-rose-100 text-rose-700 border-rose-200',
      'Action Required': 'bg-orange-100 text-orange-700 border-orange-200',
      'Acknowledged': 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Submissions Ledger</h2>
          <p className="text-slate-500 font-medium mt-1">Audit, evaluate, and manage all incoming form intakes.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
           </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 transition-all text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 transition-all text-sm outline-none font-bold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Evaluation">Under Evaluation</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Action Required">Action Required</option>
          </select>
        </div>
      </div>

      {/* Table Desktop / Card Mobile */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Submitter</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold">No submissions match your current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            sub.isVipSubmission ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                            {sub.isVipSubmission ? <Crown className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 font-mono tracking-tight uppercase">{sub.id}</span>
                              {sub.isVipSubmission && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[8px] font-black uppercase tracking-widest shadow-sm shadow-amber-500/20">VIP Priority</span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-600 mt-0.5 line-clamp-1">{sub.formTitle}</p>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                               <Clock className="w-3 h-3" />
                               {new Date(sub.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                             {sub.userName.charAt(0)}
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-900">{sub.userName}</p>
                             <p className="text-[10px] text-slate-400 font-medium">{sub.userEmail}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {getStatusBadgeLocal(sub.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Details"
                          >
                             <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => onStatusUpdate(sub.id, 'Approved')}
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Quick Approve"
                          >
                             <CheckCircle2 className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => onEscalate(sub)}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Escalate to CEO"
                          >
                             <Send className="w-4.5 h-4.5" />
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-1" />
                          <button 
                            onClick={() => onDelete(sub.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                             <Trash2 className="w-4.5 h-4.5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedSubmission(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl ${selectedSubmission.isVipSubmission ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {selectedSubmission.isVipSubmission ? <Crown className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Submission Audit</h3>
                      <p className="text-xs text-slate-500 font-mono">{selectedSubmission.id}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="p-2 rounded-xl bg-slate-100 text-slate-400">
                   <XCircle className="w-5 h-5" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitter Name</p>
                      <p className="text-sm font-bold text-slate-900">{selectedSubmission.userName}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitter Email</p>
                      <p className="text-sm font-bold text-slate-900">{selectedSubmission.userEmail}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                      <div>{getStatusBadgeLocal(selectedSubmission.status)}</div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted At</p>
                      <p className="text-sm font-bold text-slate-900">
                        {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Form Data Entries</h4>
                   <div className="space-y-4 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      {Object.entries(selectedSubmission.data || {}).map(([key, value]) => {
                         if (key === 'projectBriefFile' || key === 'resumeFile' || (typeof value === 'object' && value !== null)) {
                            return (
                               <div key={key} className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{key}</p>
                                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs text-blue-600 font-bold">
                                     <ExternalLink className="w-3.5 h-3.5" />
                                     <span>{(value as any).name || 'Attachment'}</span>
                                  </div>
                               </div>
                            );
                         }
                         return (
                            <div key={key} className="space-y-1">
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{key}</p>
                               <p className="text-sm text-slate-800 font-medium">{String(value)}</p>
                            </div>
                         );
                      })}
                   </div>
                </div>
             </div>

             <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => onStatusUpdate(selectedSubmission.id, 'Rejected')}
                  className="px-6 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Reject Intake
                </button>
                <button 
                  onClick={() => onStatusUpdate(selectedSubmission.id, 'Approved')}
                  className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-900/20 transition-colors cursor-pointer"
                >
                  Approve Filing
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
