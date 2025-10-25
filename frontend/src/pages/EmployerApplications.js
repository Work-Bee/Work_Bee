import React, { useEffect, useMemo, useState } from 'react';
import { applicationAPI, API_BASE_URL } from '../utils/api';
import ChatPanel from '../components/ChatPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatters';

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  reviewed: 'bg-blue-50 text-blue-700 border border-blue-100',
  shortlisted: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  interviewed: 'bg-purple-50 text-purple-700 border border-purple-100',
  hired: 'bg-green-50 text-green-700 border border-green-100',
  rejected: 'bg-red-50 text-red-700 border border-red-100',
};

// Reserved for future extended options
// const statusOptions = [
//   { value: 'pending', label: 'Mark as Pending' },
//   { value: 'reviewed', label: 'Mark as Under Review' },
//   { value: 'interviewed', label: 'Mark as Interviewed' },
// ];

const EmployerApplications = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);

  const [selected, setSelected] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'pending', note: '' });
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [choiceStatus, setChoiceStatus] = useState('shortlisted');
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await applicationAPI.getAllEmployerApplications({ limit: 100 });
      setApplications(res.data.data || []);
    } catch (e) {
      console.error('Failed to load employer applications', e);
      setError('Unable to load applications right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openOverlay = (app) => {
    setSelected(app);
    setStatusForm({ status: app.status, note: '' });
    setStatusError('');
    setNotesDraft(app.employerNotes || '');
  };

  const closeOverlay = () => {
    setSelected(null);
    setStatusForm({ status: 'pending', note: '' });
    setStatusError('');
    setNotesDraft('');
    setSavingStatus(false);
    setSavingNotes(false);
  };

  const onChangeStatusField = (e) => {
    const { name, value } = e.target;
    setStatusForm((prev) => ({ ...prev, [name]: value }));
  };

  // onSaveStatus kept for reference; currently using quick status + confirmation

  // Quick action for intuitive statuses
  const onQuickStatus = async (target) => {
    if (!selected) return;
    try {
      setSavingStatus(true);
      setStatusError('');
      setStatusSuccess('');
      const note = statusForm.note.trim();
      const payload = note ? { status: target, note } : { status: target };
      await applicationAPI.updateApplicationStatus(selected._id, payload);
      await fetchAll();
      setSelected((prev) => {
        if (!prev) return prev;
        const fresh = applications.find((a) => a._id === prev._id);
        return fresh || prev;
      });
      setStatusForm((prev) => ({ ...prev, note: '' }));
      setStatusSuccess('Status updated');
      setTimeout(() => setStatusSuccess(''), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to update status';
      setStatusError(msg);
    } finally {
      setSavingStatus(false);
    }
  };

  const onSaveNotes = async () => {
    if (!selected) return;
    try {
      setSavingNotes(true);
      await applicationAPI.addEmployerNotes(selected._id, { notes: notesDraft });
      await fetchAll();
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const empty = useMemo(() => !loading && !error && applications.length === 0, [loading, error, applications]);

  return (
    <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Illustration */}
        <div className="mb-8 relative bg-gradient-to-r from-green-500 to-purple-500 rounded-3xl p-8 overflow-hidden shadow-lg">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 translate-x-1/2 blur-xl"></div>
          
          {/* Floating decorative shapes */}
          <div className="absolute top-10 right-1/3 animate-pulse">
            <div className="w-2.5 h-2.5 bg-white/30 rounded-full"></div>
          </div>
          <div className="absolute bottom-10 left-1/4 animate-pulse" style={{animationDelay: '0.7s'}}>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">All Applications</h1>
                <p className="text-white/90">Review every application you received across all postings.</p>
              </div>
            </div>
            
            {/* Stats badge */}
            {!loading && applications.length > 0 && (
              <div className="hidden lg:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{applications.length}</p>
                    <p className="text-sm text-white/80 font-medium">Total Applications</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
            <LoadingSpinner text="Loading applications..." />
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 text-red-600">
            {error}
          </div>
        ) : empty ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <EmptyState
              title="No applications yet"
              description="Once candidates apply to your jobs, you will see them listed here."
              primaryAction={{ label: 'Post a job', to: '/employer/jobs/new' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => {
              const applicant = app.applicant || {};
              const job = app.job || {};
              const badge = statusStyles[app.status] || 'bg-gray-100 text-gray-700';
              return (
                <div
                  key={app._id}
                  className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  onClick={() => openOverlay(app)}
                >
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-5 py-4 border-b border-gray-200 flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{applicant.name || 'Candidate'}</h3>
                      <p className="text-sm text-primary-700 font-medium truncate">{job.title} {job.company?.name ? `· ${job.company.name}` : ''}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ml-3 ${badge}`}>
                      {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Applied {formatDate(app.appliedAt)}
                      </div>
                    </div>
                    {app.coverLetter && (
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-700 line-clamp-3">
                        {app.coverLetter}
                      </div>
                    )}
                    <div className="pt-1 text-xs text-gray-500">Click to review</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-gray-800/50 backdrop-blur-sm flex items-center justify-center p-3" onClick={closeOverlay}>
          {/* Smaller, scrollable modal card */}
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[80vh] border border-gray-200 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-start justify-between shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selected.applicant?.name || 'Candidate'}</h3>
                <p className="text-xs text-gray-600">{selected.job?.title} {selected.job?.company?.name ? `· ${selected.job.company.name}` : ''}</p>
              </div>
              <button onClick={closeOverlay} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">Application</h4>
                  <div className="text-sm text-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusStyles[selected.status] || 'bg-gray-100 text-gray-700'}`}>{selected.status?.charAt(0).toUpperCase() + selected.status?.slice(1)}</span>
                      <span className="text-gray-500 text-xs">• Applied {formatDate(selected.appliedAt)}</span>
                    </div>
                    {selected.coverLetter && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-gray-600 mb-1">Cover Letter</div>
                        <div className="text-sm text-gray-700 whitespace-pre-line max-h-48 overflow-auto border border-gray-200 rounded-md p-2 bg-white">
                          {selected.coverLetter}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selected.resume?.path && (
                  <div className="flex items-center gap-3">
                    <a
                      href={`${API_BASE_URL}/${selected.resume.path.replace(/^\/+/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      View submitted resume
                    </a>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">Candidate</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div><span className="text-gray-500">Email:</span> {selected.applicant?.email || '—'}</div>
                    {selected.applicant?.phone && (<div><span className="text-gray-500">Phone:</span> {selected.applicant.phone}</div>)}
                  </div>
                </div>

                {selected.status === 'shortlisted' && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                    <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">Chat</h4>
                    <div className="text-sm text-gray-700 mb-2">Open a dedicated chat page to message {selected.applicant?.name || 'the candidate'}.</div>
                    <a href={`/applications/${selected._id}/chat`} className="btn btn-primary btn-sm">Open chat</a>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Employer Notes</h4>
                  <textarea
                    rows={5}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Add internal notes about this candidate"
                  />
                  <button className="btn btn-outline w-full mt-3" onClick={onSaveNotes} disabled={savingNotes}>
                    {savingNotes ? 'Saving...' : 'Save notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom status editor */}
            <div className="px-4 pb-4 pt-0 border-t border-gray-200">
              {!showStatusEditor ? (
                <button
                  type="button"
                  onClick={() => setShowStatusEditor(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1-1v2m-7 7h14"/></svg>
                  Update status
                </button>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800">Select a decision</h4>
                    <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setShowStatusEditor(false)}>
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold border ${choiceStatus==='hired' ? 'text-white bg-green-600 border-green-600' : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'}`}>
                      <input type="radio" name="decision" className="hidden" value="hired" checked={choiceStatus==='hired'} onChange={() => setChoiceStatus('hired')} />
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Hire
                    </label>
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold border ${choiceStatus==='shortlisted' ? 'text-white bg-indigo-600 border-indigo-600' : 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100'}`}>
                      <input type="radio" name="decision" className="hidden" value="shortlisted" checked={choiceStatus==='shortlisted'} onChange={() => setChoiceStatus('shortlisted')} />
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12l4-4m-4 4l4 4"/></svg>
                      Shortlist
                    </label>
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold border ${choiceStatus==='rejected' ? 'text-white bg-red-600 border-red-600' : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'}`}>
                      <input type="radio" name="decision" className="hidden" value="rejected" checked={choiceStatus==='rejected'} onChange={() => setChoiceStatus('rejected')} />
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      Decline
                    </label>
                  </div>
                  <textarea
                    name="note"
                    rows={2}
                    placeholder="Add a note (optional)"
                    value={statusForm.note}
                    onChange={onChangeStatusField}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                    disabled={savingStatus}
                  />
                  {statusError && (
                    <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 mb-2">{statusError}</div>
                  )}
                  {statusSuccess && (
                    <div className="rounded bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 mb-2">{statusSuccess}</div>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" className="btn btn-outline" onClick={() => setShowStatusEditor(false)} disabled={savingStatus}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => setShowConfirm(true)} disabled={savingStatus}>Save</button>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation dialog */}
            {showConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/40 p-4" onClick={() => setShowConfirm(false)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-200" onClick={(e) => e.stopPropagation()}>
                  <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h5 className="text-base font-semibold text-gray-800">Confirm update</h5>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm(false)} aria-label="Close">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <div className="px-5 py-4 space-y-3 text-sm text-gray-700">
                    <p>
                      Update status for <span className="font-semibold">{selected.applicant?.name || 'this candidate'}</span> to
                      <span className="font-semibold"> {choiceStatus === 'hired' ? 'Hired' : choiceStatus === 'shortlisted' ? 'Shortlisted' : 'Declined'}</span>?
                    </p>
                    {statusForm.note.trim() && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
                        <div className="text-xs font-semibold text-gray-600 mb-1">Note</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{statusForm.note}</div>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                    <button className="btn btn-outline" onClick={() => setShowConfirm(false)} disabled={savingStatus}>Cancel</button>
                    <button
                      className="btn btn-primary"
                      onClick={async () => {
                        await onQuickStatus(choiceStatus);
                        setShowConfirm(false);
                        setShowStatusEditor(false);
                      }}
                      disabled={savingStatus}
                    >
                      {savingStatus ? 'Saving...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerApplications;
