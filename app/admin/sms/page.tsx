'use client';

import { useState } from 'react';
import SmsSendModal from '@/components/admin/SmsSendModal';
import SmsBulkForm from '@/components/admin/SmsBulkForm';
import SmsBalanceCard from '@/components/admin/SmsBalanceCard';
import SmsHistoryTable from '@/components/admin/SmsHistoryTable';
import SmsOutreach from '@/components/admin/SmsOutreach';
import { smsApi } from '@/lib/api';

type Tab = 'send' | 'bulk' | 'outreach' | 'history';

export default function SmsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('send');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'send', label: 'Send SMS', icon: 'send' },
    { id: 'bulk', label: 'Bulk SMS', icon: 'campaign' },
    { id: 'outreach', label: 'Absent & Inactive', icon: 'person_search' },
    { id: 'history', label: 'History', icon: 'history' },
  ];


  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">SMS Management</h1>
          <p className="text-white/60">Send messages, manage templates, and track SMS history</p>
        </div>

        {/* Balance Card */}
        <div className="mb-6">
          <SmsBalanceCard />
        </div>

        {/* Tabs */}
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden mb-6">
          <div className="border-b border-surface-dark-lighter">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-white/60 hover:text-white hover:bg-surface-dark-lighter'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Send SMS Tab */}
            {activeTab === 'send' && (
              <div>
                <button
                  onClick={() => setIsSendModalOpen(true)}
                  className="px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 font-medium"
                >
                  <span className="material-symbols-outlined align-middle mr-2">send</span>
                  Send New SMS
                </button>
              </div>
            )}

            {/* Bulk SMS Tab */}
            {activeTab === 'bulk' && (
              <SmsBulkForm
                onSuccess={() => {
                  // Optionally refresh history tab if user switches to it
                  // The history will refresh when the tab is opened
                }}
              />
            )}

            {activeTab === 'outreach' && <SmsOutreach />}

            {/* History Tab */}
            {activeTab === 'history' && <SmsHistoryTable />}
          </div>
        </div>
      </div>

      {/* Send SMS Modal */}
      <SmsSendModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSuccess={() => {
          if (activeTab === 'history') {
            window.location.reload();
          }
        }}
      />
    </div>
  );
}


