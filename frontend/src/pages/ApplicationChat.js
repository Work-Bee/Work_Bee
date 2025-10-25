import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationAPI, messagesAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const ApplicationChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [application, setApplication] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [appRes, msgRes] = await Promise.all([
        applicationAPI.getApplication(id),
        messagesAPI.getMessages(id)
      ]);
      setApplication(appRes.data?.data || appRes.data);
      setMessages(msgRes.data || []);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || 'Unable to load chat';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setSending(true);
      await messagesAPI.postMessage(id, text.trim());
      setText('');
      await load();
    } catch (e) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const onDelete = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await messagesAPI.deleteMessage(messageId);
      await load();
    } catch (e) {
      alert('Failed to delete message');
    }
  };

  const canChat = application?.status === 'shortlisted';
  const otherParty = user?.role === 'employer' ? (application?.applicant?.name || 'Candidate') : (application?.job?.company?.name || 'Employer');

  return (
    <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
            {application && (
              <p className="text-sm text-gray-600">{application.job?.title} • {otherParty}</p>
            )}
          </div>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
            <LoadingSpinner text="Loading chat..." />
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 text-red-600">
            {error}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm text-gray-700">
              Chat with {otherParty}
            </div>
            <div className="h-[60vh] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">No messages yet.</div>
              ) : messages.map((m) => {
                const mine = String(m.sender?._id) === String(user?._id);
                return (
                  <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow ${mine ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <div className={`text-[11px] ${mine ? 'text-primary-100' : 'text-gray-500'} mb-1`}>{m.sender?.name || 'User'} • {new Date(m.createdAt).toLocaleString()}</div>
                      <div className="whitespace-pre-wrap">{m.body}</div>
                      {mine && (
                        <div className="mt-2 text-[11px] opacity-80">
                          <button onClick={() => onDelete(m._id)} className={`underline ${mine ? 'text-primary-100 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={onSend} className="p-3 border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={canChat ? 'Type a message...' : 'Chat available when application is shortlisted'}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!canChat || sending}
              />
              <button type="submit" className="btn btn-primary" disabled={!canChat || sending || !text.trim()}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}

        {application && (
          <div className="mt-4 text-sm text-gray-600">
            <Link to={user?.role === 'employer' ? '/employer/applications' : '/applications'} className="underline">Back to applications</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationChat;
