import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { useAuthStore } from '../stores/authStore';
import { formatINR } from '../lib/formatters';

export interface ConversationSummary {
  id: string;
  productId?: string | null;
  unreadCount: number;
  updatedAt: string;
  buyer?: { id: string; firstName: string; lastName: string; avatarUrl?: string | null } | null;
  seller?: { id: string; storeName: string; sellerType: string; rating?: number | null; userId?: string } | null;
  product?: { id: string; title: string; price: string | number; images?: Array<{ imageUrl: string }> } | null;
  lastMessage?: { id: string; messageText: string; createdAt: string } | null;
}

export const ConversationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sellerIdParam = searchParams.get('sellerId');
  const productIdParam = searchParams.get('productId');

  // Handle URL query parameters to auto-create or open conversation
  useEffect(() => {
    if (sellerIdParam) {
      async function initializeConversationFromQuery() {
        try {
          setIsInitializing(true);
          setError(null);
          const res: any = await apiClient.post('/conversations', {
            sellerId: sellerIdParam,
            productId: productIdParam || undefined,
          });

          const conversationId = res.data?.conversation?.id;
          if (conversationId) {
            navigate(`/messages/${conversationId}`, { replace: true });
            return;
          }
        } catch (err: any) {
          if (err.code === 'SELF_MESSAGING_NOT_ALLOWED') {
            setError('You cannot start a conversation with yourself.');
          } else {
            setError(err.message || 'Couldn\'t start conversation. Please try again.');
          }
        } finally {
          setIsInitializing(false);
        }
      }
      initializeConversationFromQuery();
    }
  }, [sellerIdParam, productIdParam, navigate]);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      const res: any = await apiClient.get('/conversations');
      setConversations(res.data.conversations || []);
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Couldn\'t load your messages. Please try again.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();

    // Auto-poll every 5 seconds for new messages and unread counts
    const interval = setInterval(() => {
      loadConversations(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-normal text-[#3B2A22] mb-1">Opening Conversation…</h2>
        <p className="font-sans text-xs text-[#8B7562]">Connecting you with the campus seller</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Direct Messages</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Campus Messaging</h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">
            Direct campus messaging for item inquiries, condition checks, and meetup handshakes
          </p>
        </div>

        {!isLoading && (
          <div className="px-4 py-2 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-xs font-sans font-semibold text-[#3B2A22] shrink-0 self-start sm:self-auto">
            {conversations.length} Active {conversations.length === 1 ? 'Conversation' : 'Conversations'}
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadConversations()} className="underline hover:text-[#3B2A22]">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-20 bg-[#EDE5D9] rounded-[32px] border border-[#D6C8B8]">
          <div className="w-10 h-10 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="font-sans text-xs text-[#8B7562]">Loading messages…</p>
        </div>
      ) : conversations.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8]">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-2">No Active Messages</h2>
          <p className="text-xs text-[#6E5948] max-w-md mx-auto mb-6 leading-relaxed">
            Inquire about course textbooks, lab calculators, or study gear directly from any product detail page.
          </p>
          <Link to="/products" className="btn-primary">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        /* Conversations list */
        <div className="space-y-3">
          {conversations.map((conv) => {
            const hasUnread = conv.unreadCount > 0;
            const isMeBuyer = conv.buyer?.id === user?.id;
            const counterpartTitle = isMeBuyer
              ? conv.seller?.storeName || 'Campus Seller'
              : `${conv.buyer?.firstName || 'Student'} ${conv.buyer?.lastName ? `${conv.buyer.lastName.charAt(0)}.` : ''}`;

            const counterpartSubtitle = isMeBuyer ? 'Storefront Seller' : 'Student Buyer';
            const productImg =
              conv.product?.images?.[0]?.imageUrl ||
              '/images/chemistry_textbook_cover_1786457575258.png';

            return (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className={`p-6 rounded-[28px] border transition-all flex items-center gap-5 group ${
                  hasUnread
                    ? 'bg-[#EDE5D9] border-[#C8A46A] shadow-warm-subtle'
                    : 'bg-[#EDE5D9]/70 border-[#D6C8B8] hover:bg-[#EDE5D9] hover:border-[#C8A46A]'
                }`}
              >
                {conv.product ? (
                  <img
                    src={productImg}
                    alt="Product thumbnail"
                    className="w-14 h-14 object-cover rounded-2xl border border-[#D6C8B8] shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/chemistry_textbook_cover_1786457575258.png';
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] flex items-center justify-center text-[#3B2A22] font-heading font-semibold text-lg shrink-0">
                    {counterpartTitle.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <h3 className="font-heading text-xl font-normal text-[#3B2A22] truncate group-hover:text-[#8B6A4F] transition-colors">
                        {counterpartTitle}
                      </h3>
                      <span className="text-[10px] font-sans font-semibold uppercase px-2 py-0.5 rounded-full bg-[#E7DED1] text-[#8B7562] border border-[#D6C8B8]">
                        {counterpartSubtitle}
                      </span>
                    </div>
                    <span className="font-sans text-[10px] text-[#8B7562] shrink-0">
                      {new Date(conv.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {conv.product && (
                    <p className="text-xs font-sans font-medium text-[#C8A46A] truncate mb-1">
                      Item: {conv.product.title} ({formatINR(conv.product.price)})
                    </p>
                  )}

                  {conv.lastMessage ? (
                    <p className="text-xs font-sans text-[#6E5948] truncate">
                      {conv.lastMessage.messageText}
                    </p>
                  ) : (
                    <p className="text-xs font-sans italic text-[#8B7562]">No messages sent yet</p>
                  )}
                </div>

                {hasUnread && (
                  <span className="px-2.5 py-1 rounded-full bg-[#C8A46A] text-[#F4EFE7] text-[10px] font-sans font-bold shrink-0">
                    {conv.unreadCount} NEW
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
