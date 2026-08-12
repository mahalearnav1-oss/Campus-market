import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';

export interface ConversationSummary {
  id: string;
  productId?: string | null;
  unreadCount: number;
  updatedAt: string;
  buyer?: { id: string; firstName: string; lastName: string; avatarUrl?: string | null } | null;
  seller?: { id: string; storeName: string; sellerType: string; rating?: number | null } | null;
  product?: { id: string; title: string; price: string | number; images?: Array<{ imageUrl: string }> } | null;
  lastMessage?: { id: string; messageText: string; createdAt: string } | null;
}

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/conversations');
        setConversations(res.data.conversations || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load conversations.');
      } finally {
        setIsLoading(false);
      }
    }
    loadConversations();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">

      {/* Header */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Direct Messages</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">
            Campus Messaging
          </h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">
            Direct campus messaging for item inquiries, condition checks, and meetup details
          </p>
        </div>

        <div className="px-4 py-2 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-xs font-sans font-semibold text-[#3B2A22]">
          {conversations.length} Active Conversations
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading messages…</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8]">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-2">No Active Messages</h2>
          <p className="text-xs text-[#6E5948] max-w-md mx-auto mb-6 leading-relaxed">
            Inquire about course textbooks, calculators, or dorm gear directly from any product detail page.
          </p>
          <Link to="/products" className="btn-primary">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const hasUnread = conv.unreadCount > 0;
            const productImg = conv.product?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

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
                <img
                  src={productImg}
                  alt="Product thumbnail"
                  className="w-14 h-14 object-cover rounded-2xl border border-[#D6C8B8] shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-heading text-xl font-normal text-[#3B2A22] truncate group-hover:text-[#8B6A4F] transition-colors">
                      {conv.seller?.storeName || `User ${conv.buyer?.firstName}`}
                    </h3>
                    <span className="font-sans text-[10px] text-[#8B7562]">
                      {new Date(conv.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {conv.product && (
                    <p className="text-xs font-sans font-medium text-[#C8A46A] truncate mb-1">
                      Item: {conv.product.title} (₹{Number(conv.product.price).toLocaleString('en-IN')})
                    </p>
                  )}

                  {conv.lastMessage && (
                    <p className="text-xs font-sans text-[#6E5948] truncate">
                      {conv.lastMessage.messageText}
                    </p>
                  )}
                </div>

                {hasUnread && (
                  <span className="px-2.5 py-1 rounded-full bg-[#C8A46A] text-[#F4EFE7] text-[10px] font-sans font-bold">
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
