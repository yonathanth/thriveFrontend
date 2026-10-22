'use client';

import { useState, useEffect } from 'react';
import { smsApi, membersApi } from '@/lib/api';

interface SmsBulkFormProps {
  onSuccess?: () => void;
}

type RecipientGroup = 'all' | 'active' | 'inactive' | 'frozen' | 'pending' | 'manual';

export default function SmsBulkForm({ onSuccess }: SmsBulkFormProps) {
  const [recipientGroup, setRecipientGroup] = useState<RecipientGroup>('manual');
  const [phones, setPhones] = useState('');
  const [message, setMessage] = useState('');
  const [campaign, setCampaign] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch phone numbers based on selected group
  useEffect(() => {
    if (recipientGroup === 'manual') {
      setPhones('');
      setMemberCount(null);
      return;
    }

    const fetchMemberPhones = async () => {
      setIsLoadingMembers(true);
      setError(null);
      try {
        let allPhones: string[] = [];
        let page = 1;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const query: Record<string, unknown> = {
            page,
            limit,
          };

          // Apply filters based on recipient group
          if (recipientGroup === 'active') {
            query.status = 'active';
          } else if (recipientGroup === 'inactive') {
            // For inactive, we need to fetch both 'inactive' and 'expired' status
            // Since API only supports single status, we'll handle this after the loop
            query.status = 'inactive';
          } else if (recipientGroup === 'frozen') {
            query.status = 'frozen';
          } else if (recipientGroup === 'pending') {
            query.status = 'pending';
          }
          // 'all' doesn't need any filter

          const response = await membersApi.getAll(query);
          
          // Extract phone numbers (filter out empty/null phones)
          const validPhones = response.data
            .map((member) => member.phone)
            .filter((phone): phone is string => Boolean(phone && phone.trim()));

          allPhones = [...allPhones, ...validPhones];

          // Check if there are more pages
          hasMore = response.meta.page < response.meta.totalPages;
          page++;
        }

        // If inactive group, also fetch expired members and combine
        // Note: We fetch expired separately since they're legacy records
        if (recipientGroup === 'inactive') {
          let expiredPage = 1;
          let hasMoreExpired = true;
          
          while (hasMoreExpired) {
            try {
              // Try to fetch expired members - backend may accept this even if not in enum
              const expiredResponse = await membersApi.getAll({
                page: expiredPage,
                limit,
                status: 'expired',
              });
              
              const expiredPhones = expiredResponse.data
                .map((member) => member.phone)
                .filter((phone): phone is string => Boolean(phone && phone.trim()));
              
              allPhones = [...allPhones, ...expiredPhones];
              hasMoreExpired = expiredResponse.meta.page < expiredResponse.meta.totalPages;
              expiredPage++;
              
              // If no results, break
              if (expiredResponse.data.length === 0) {
                hasMoreExpired = false;
              }
            } catch (err) {
              // If expired status query fails (validation error), just break
              // The inactive members are already fetched above
              hasMoreExpired = false;
            }
          }
        }

        // Remove duplicates
        const uniquePhones = Array.from(new Set(allPhones));
        setPhones(uniquePhones.join('\n'));
        setMemberCount(uniquePhones.length);
      } catch (err) {
        console.error('Failed to fetch members:', err);
        setError('Failed to load member phone numbers');
        setPhones('');
        setMemberCount(null);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMemberPhones();
  }, [recipientGroup]);

  const parsePhones = (input: string): string[] => {
    return input
      .split(/[,\n]/)
      .map((phone) => phone.trim())
      .filter((phone) => phone.length > 0);
  };

  const calculateSmsCount = (text: string): number => {
    if (text.length <= 160) return 1;
    return Math.ceil(text.length / 153);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const phoneList = parsePhones(phones);
    if (phoneList.length === 0) {
      setError('Please enter at least one phone number');
      return;
    }

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setIsSending(true);
    try {
      const result = await smsApi.sendBulk(
        phoneList,
        message.trim(),
        campaign.trim() || undefined
      );
      setSuccess(
        `Successfully sent SMS to ${result.count} recipient${result.count !== 1 ? 's' : ''}`
      );
      setPhones('');
      setMessage('');
      setCampaign('');
      setRecipientGroup('manual');
      onSuccess?.();
    } catch (err) {
      let errorMessage = 'Failed to send bulk SMS';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      // Provide helpful context for common errors
      if (errorMessage.includes('unverified contact') || errorMessage.includes('verify')) {
        errorMessage = 'One or more phone numbers are not verified. During beta testing, you need to verify contacts in the AfroMessage dashboard before sending SMS.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const phoneList = parsePhones(phones);
  const smsCount = calculateSmsCount(message);
  const charCount = message.length;
  const totalSms = phoneList.length * smsCount;

  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Send Bulk SMS</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Group Selection */}
        <div>
          <label className="block text-white/80 text-sm mb-2">
            Select Recipients <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => setRecipientGroup('all')}
              disabled={isLoadingMembers || isSending}
              className={`px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                recipientGroup === 'all'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface-dark-lighter border-surface-dark-lighter text-white/80 hover:border-primary/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              All Members
            </button>
            <button
              type="button"
              onClick={() => setRecipientGroup('active')}
              disabled={isLoadingMembers || isSending}
              className={`px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                recipientGroup === 'active'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface-dark-lighter border-surface-dark-lighter text-white/80 hover:border-primary/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Active Only
            </button>
            <button
              type="button"
              onClick={() => setRecipientGroup('inactive')}
              disabled={isLoadingMembers || isSending}
              className={`px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                recipientGroup === 'inactive'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface-dark-lighter border-surface-dark-lighter text-white/80 hover:border-primary/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Inactive (includes expired)
            </button>
            <button
              type="button"
              onClick={() => setRecipientGroup('frozen')}
              disabled={isLoadingMembers || isSending}
              className={`px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                recipientGroup === 'frozen'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface-dark-lighter border-surface-dark-lighter text-white/80 hover:border-primary/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Frozen Only
            </button>
            <button
              type="button"
              onClick={() => setRecipientGroup('pending')}
              disabled={isLoadingMembers || isSending}
              className={`px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                recipientGroup === 'pending'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface-dark-lighter border-surface-dark-lighter text-white/80 hover:border-primary/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Pending Only
            </button>
            <button
              type="button"
              onClick={() => setRecipientGroup('manual')}
              disabled={isLoadingMembers || isSending}
              className={`px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                recipientGroup === 'manual'
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface-dark-lighter border-surface-dark-lighter text-white/80 hover:border-primary/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Manual Entry
            </button>
          </div>
          {isLoadingMembers && (
            <p className="text-white/60 text-xs mt-2">
              Loading member phone numbers...
            </p>
          )}
          {memberCount !== null && recipientGroup !== 'manual' && (
            <p className="text-white/60 text-xs mt-2">
              Found {memberCount} member{memberCount !== 1 ? 's' : ''} with phone numbers
            </p>
          )}
        </div>

        {/* Phone Numbers Input */}
        <div>
          <label className="block text-white/80 text-sm mb-2">
            Phone Numbers <span className="text-red-400">*</span>
            <span className="text-white/60 text-xs ml-2">
              {recipientGroup === 'manual' 
                ? '(One per line or comma-separated)'
                : '(Auto-populated based on selection)'}
            </span>
          </label>
          <textarea
            value={phones}
            onChange={(e) => setPhones(e.target.value)}
            placeholder={
              recipientGroup === 'manual'
                ? "+251912345678\n+251987654321\n+251923456789"
                : "Phone numbers will be loaded automatically..."
            }
            required
            rows={6}
            className="w-full px-4 py-2 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none font-mono text-sm"
            disabled={isSending || isLoadingMembers}
          />
          <div className="text-white/60 text-xs mt-1">
            {phoneList.length} recipient{phoneList.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-white/80 text-sm mb-2">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            required
            rows={5}
            maxLength={1600}
            className="w-full px-4 py-2 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
            disabled={isSending}
          />
          <div className="flex items-center justify-between mt-1">
            <div className="text-white/60 text-xs">
              {charCount} characters • {smsCount} SMS per recipient
            </div>
            <div className="text-white/60 text-xs">
              Total: ~{totalSms} SMS ({phoneList.length} × {smsCount})
            </div>
          </div>
        </div>

        {/* Campaign Name */}
        <div>
          <label className="block text-white/80 text-sm mb-2">
            Campaign Name <span className="text-white/60 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="e.g., Monthly Newsletter"
            className="w-full px-4 py-2 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            disabled={isSending}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSending || isLoadingMembers || phoneList.length === 0 || !message.trim()}
          className="w-full px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending 
            ? 'Sending...' 
            : isLoadingMembers
            ? 'Loading...'
            : `Send to ${phoneList.length} Recipient${phoneList.length !== 1 ? 's' : ''}`}
        </button>
      </form>
    </div>
  );
}

