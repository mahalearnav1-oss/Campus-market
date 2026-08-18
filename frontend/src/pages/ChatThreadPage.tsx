import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { useAuthStore } from '../stores/authStore';
import { formatINR } from '../lib/formatters';

export interface ChatMessage {
  id: string;
  senderUserId: string;
  messageText: string;
  readAt?: string | null;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

export interface ChatThreadData {
  id: string;
  buyer?: { id: string; firstName: string; lastName: string; avatarUrl?: string | null } | null;
  seller?: { id: string; storeName: string; userId: string; rating?: number | null } | null;
  product?: { id: string; title: string; price: string | number; images?: Array<{ imageUrl: string }> } | null;
  messages: ChatMessage[];
}

export const ChatThreadPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuthStore();

  const [thread, setThread] = useState<ChatThreadData | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Reporting Modal State
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');



  const fetchThread = async (silent = false) => {
    if (!conversationId) return;
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      const res: any = await apiClient.get(`/conversations/${conversationId}`);
      setThread(res.data.conversation);
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Couldn\'t load this chat. Please try again.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchThread();

      // Poll every 3 seconds for new incoming messages
      const interval = setInterval(() => {
        fetchThread(true);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = newMessageText.trim();
    if (!textToSend || !conversationId) return;

    try {
      setIsSending(true);
      setSendError(null);

      const res: any = await apiClient.post(`/conversations/${conversationId}/messages`, {
        messageText: textToSend,
      });

      setNewMessageText('');
      setThread((prev) => (prev ? { ...prev, messages: [...prev.messages, res.data.message] } : null));
    } catch (err: any) {
      setSendError(err.message || 'Couldn\'t send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReportMessage = async () => {
    if (!reportingMessageId || !reportReason.trim()) return;
    try {
      await apiClient.post(`/messages/${reportingMessageId}/report`, { reason: reportReason.trim() });
      alert('Message report submitted for campus moderation review.');
      setReportingMessageId(null);
      setReportReason('');
    } catch (err: any) {
      alert(err.message || 'Couldn\'t submit report. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading conversation thread…</p>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-6 text-[#3B2A22]">
        <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-2">Conversation Unavailable</h2>
          <p className="font-sans text-xs text-[#6E5948] leading-relaxed">{error || 'We couldn\'t find this chat or you don\'t have permission to view it.'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchThread()} className="btn-secondary flex-1 text-xs">
            Retry
          </button>
          <Link to="/messages" className="btn-primary flex-1 text-xs">
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const isMeBuyer = thread.buyer?.id === user?.id;
  const otherPartyName = isMeBuyer
    ? thread.seller?.storeName || 'Campus Seller'
    : `${thread.buyer?.firstName || 'Student'} ${thread.buyer?.lastName ? `${thread.buyer.lastName.charAt(0)}.` : ''}`;
  const otherPartyRole = isMeBuyer ? 'Storefront Seller' : 'Student Buyer';

  const productImg =
    thread.product?.images?.[0]?.imageUrl ||
    '/images/chemistry_textbook_cover_1786457575258.png';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 text-[#3B2A22]">
      {/* Back Link */}
      <Link to="/messages" className="inline-flex items-center gap-2 font-sans text-xs text-[#8B7562] hover:text-[#3B2A22] transition-colors">
        ← Back to Direct Messages
      </Link>

      {/* Floating Warm Conversation Container */}
      <div className="rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card overflow-hidden flex flex-col h-[720px]">
        {/* Conversation Header */}
        <div className="p-6 bg-[#E7DED1] border-b border-[#D6C8B8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#F4EFE7] font-heading font-semibold text-lg flex items-center justify-center shadow-md shrink-0">
              {otherPartyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-2xl font-normal text-[#3B2A22]">{otherPartyName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  {otherPartyRole}
                </span>
              </div>
              <p className="font-sans text-xs text-[#8B7562] mt-0.5">Escrow Guaranteed Handshake Chat</p>
            </div>
          </div>

          {/* Product Preview Bar */}
          {thread.product && (
            <Link
              to={`/products/${thread.product.id}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#EDE5D9] border border-[#D6C8B8] hover:border-[#C8A46A] transition-all group shrink-0 max-w-xs"
            >
              <img
                src={productImg}
                alt={thread.product.title}
                className="w-11 h-11 object-cover rounded-xl border border-[#D6C8B8] shrink-0"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/chemistry_textbook_cover_1786457575258.png';
                }}
              />
              <div className="text-left min-w-0">
                <h4 className="font-heading text-xs font-normal text-[#3B2A22] group-hover:text-[#8B6A4F] truncate">
                  {thread.product.title}
                </h4>
                <p className="font-sans text-xs font-semibold text-[#C8A46A]">
                  {formatINR(thread.product.price)}
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Message History Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F4EFE7]/40">
          {thread.messages.length === 0 ? (
            <div className="text-center py-20 px-4 text-xs text-[#8B7562] space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E7DED1] border border-[#D6C8B8] flex items-center justify-center mx-auto text-[#8B7562]">
                💬
              </div>
              <p className="font-semibold text-[#3B2A22]">No messages in this conversation yet</p>
              <p>Type a message below to inquire about condition, price, or meetup location.</p>
            </div>
          ) : (
            thread.messages.map((msg) => {
              const isMine = msg.senderUserId === user?.id;

              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="font-sans text-[10px] text-[#8B7562] font-semibold">
                      {isMine ? 'You' : msg.sender?.firstName || 'User'}
                    </span>
                    <span className="font-sans text-[9px] text-[#8B7562]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-md p-4 rounded-2xl text-xs font-sans leading-relaxed shadow-sm relative group break-words whitespace-pre-wrap ${
                      isMine
                        ? 'bg-[#3B2A22] text-[#F4EFE7] rounded-tr-none'
                        : 'bg-[#E7DED1] text-[#3B2A22] border border-[#D6C8B8] rounded-tl-none'
                    }`}
                  >
                    {msg.messageText}

                    {!isMine && (
                      <button
                        onClick={() => setReportingMessageId(msg.id)}
                        className="opacity-0 group-hover:opacity-100 absolute -right-7 top-2 text-[#8B7562] hover:text-[#9B5C52] transition-opacity p-1"
                        title="Report message"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Error */}
        {sendError && (
          <div className="px-6 py-2 bg-[#9B5C52]/15 text-[#9B5C52] text-xs font-semibold border-t border-[#9B5C52]/30 flex items-center justify-between">
            <span>{sendError}</span>
            <button onClick={() => setSendError(null)} className="underline hover:text-[#3B2A22]">
              Dismiss
            </button>
          </div>
        )}

        {/* Message Composer */}
        <form onSubmit={handleSendMessage} className="p-4 bg-[#E7DED1] border-t border-[#D6C8B8] flex items-center gap-3">
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Type your inquiry or campus meetup details…"
            className="input-editorial flex-1 text-xs"
            maxLength={2000}
            disabled={isSending}
          />

          <button
            type="submit"
            disabled={isSending || !newMessageText.trim()}
            className="btn-primary text-xs font-semibold uppercase py-3.5 px-7 rounded-2xl disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            {isSending ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Sending…
              </>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>

      {/* Reporting Modal */}
      {reportingMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2A22]/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] p-8 shadow-2xl space-y-4">
            <h3 className="font-heading text-2xl font-normal text-[#3B2A22]">Report Message</h3>
            <p className="font-sans text-xs text-[#6E5948]">
              Report inappropriate content, off-platform solicitation, or policy violations for campus moderation.
            </p>

            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the reason for reporting this message…"
              className="input-editorial w-full text-xs"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReportingMessageId(null)}
                className="btn-secondary text-xs !py-2 !px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportMessage}
                className="btn-primary text-xs !py-2 !px-4"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
