import React, { useCallback, useEffect, useRef, useState } from 'react';
import { messagesAPI } from '../utils/api';

const ChatPanel = ({ applicationId, canChat = true, otherPartyLabel = 'Contact' }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await messagesAPI.getMessages(applicationId);
      setMessages(res.data || []);
    } catch (e) {
      setError('Unable to load messages');
    } finally {
      setLoading(false);
      // Scroll to bottom after load
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
    // Poll lightly every 10s for now (can be replaced by websockets later)
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    try {
      setSending(true);
      await messagesAPI.postMessage(applicationId, text.trim());
      setText('');
      await load();
    } catch (e) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-72 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
        Chat with {otherPartyLabel}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-xs text-gray-500">Loading messages...</div>
        ) : error ? (
          <div className="text-xs text-red-600">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-gray-500">No messages yet. Start the conversation.</div>
        ) : (
          messages.map((m) => (
            <div key={m._id} className="text-sm">
              <div className="inline-block max-w-[85%] bg-gray-100 rounded-md px-2 py-1">
                <div className="text-[11px] text-gray-500 mb-0.5">{m.sender?.name || 'User'} • {new Date(m.createdAt).toLocaleString()}</div>
                <div className="text-gray-800 whitespace-pre-wrap">{m.body}</div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSend} className="p-2 border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder={canChat ? 'Type a message...' : 'Chat disabled for this status'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!canChat || sending}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!canChat || sending || !text.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
