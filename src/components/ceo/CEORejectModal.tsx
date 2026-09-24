import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { FormSubmission } from '../../types';

interface CEORejectModalProps {
  submission: FormSubmission;
  onClose: () => void;
  onConfirmReject: (id: string, note: string) => void;
}

export const CEORejectModal: React.FC<CEORejectModalProps> = ({
  submission,
  onClose,
  onConfirmReject,
}) => {
  const [rejectionNote, setRejectionNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReject(submission.id, rejectionNote.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Reject Application</h3>
              <p className="text-[11px] text-slate-400">
                Filing #{submission.id} • {submission.userName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Rejecting will remove this filing from your executive queue and immediately update the user's dashboard status to <strong className="text-rose-400 font-bold uppercase">&ldquo;Rejected&rdquo;</strong> with your feedback notes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">
              Rejection Reason / Executive Feedback (Visible to Submitter)
            </label>
            <textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g. Incomplete verification documents or outside current compliance parameters..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Confirm Rejection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
