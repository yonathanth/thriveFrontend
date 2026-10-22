'use client';

import { useState, useEffect } from 'react';
import { smsApi, membersApi, Member } from '@/lib/api';

interface SmsSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhone?: string;
  initialMemberId?: number;
  onSuccess?: () => void;
}

export default function SmsSendModal({
  isOpen,
  onClose,
  initialPhone = '',
  initialMemberId,
  onSuccess,
}: SmsSendModalProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState('');
  const [memberId, setMemberId] = useState<number | undefined>(initialMemberId);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPhone(initialPhone);
    setMemberId(initialMemberId);
  }, [initialPhone, initialMemberId]);

  useEffect(() => {
    if (memberSearch.length > 2) {
      const timeoutId = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await membersApi.search(memberSearch, 5);
          setMemberResults(results);
        } catch (err) {
          console.error('Member search failed:', err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setMemberResults([]);
    }
  }, [memberSearch]);

  const handleMemberSelect = (member: Member) => {
    setPhone(member.phone);
    setMemberId(member.id);
    setMemberSearch('');
    setMemberResults([]);
  };

  const calculateSmsCount = (text: string): number => {
    // Standard SMS: 160 characters per message
    // For messages longer than 160, each 153 characters = 1 message (due to concatenation)
    if (text.length <= 160) return 1;
    return Math.ceil(text.length / 153);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setIsSending(true);
    try {
      await smsApi.sendSingle(phone.trim(), message.trim(), memberId);
      setMessage('');
      setPhone('');
      setMemberId(undefined);
      onSuccess?.();
      onClose();
    } catch (err) {
      let errorMessage = 'Failed to send SMS';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      // Provide helpful context for common errors
      if (errorMessage.includes('unverified contact') || errorMessage.includes('verify')) {
        errorMessage = 'This phone number is not verified. During beta testing, you need to verify contacts in the AfroMessage dashboard before sending SMS.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const smsCount = calculateSmsCount(message);
  const charCount = message.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Send SMS</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white"
              disabled={isSending}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member Search */}
            <div className="relative">
              <label className="block text-white/80 text-sm mb-2">
                Search Member (optional)
              </label>
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full px-4 py-2 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                disabled={isSending}
              />
              {memberResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-surface-dark border border-surface-dark-lighter rounded-lg overflow-hidden">
                  {memberResults.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleMemberSelect(member)}
                      className="w-full text-left px-4 py-2 hover:bg-surface-dark-lighter text-white"
                    >
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-sm text-white/60">{member.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251912345678"
                required
                className="w-full px-4 py-2 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                disabled={isSending}
              />
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
                  {charCount} characters • {smsCount} SMS
                </div>
                <div className="text-white/60 text-xs">
                  {1600 - charCount} remaining
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="flex-1 px-4 py-2 bg-surface-dark-lighter text-white rounded-lg hover:bg-surface-dark-lighter/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || !phone.trim() || !message.trim()}
                className="flex-1 px-4 py-2 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send SMS'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

