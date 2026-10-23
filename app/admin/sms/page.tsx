'use client';

import { useState } from 'react';
import SmsSendModal from '@/components/admin/SmsSendModal';
import SmsGroupSend from '@/components/admin/SmsGroupSend';
import SmsHistoryTable from '@/components/admin/SmsHistoryTable';

type Tab = 'one' | 'same' | 'personalized' | 'history';

/**
 * Sending SMS by hand. Automatic messages (renewal reminders, welcome, absent and
 * inactive members) are switched on and off in the desktop app's Settings.
 */
export default function SmsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('one');

  const tabs: { id: Tab; label: string; icon: string; hint: string }[] = [
    { id: 'one', label: 'One person', icon: 'person', hint: 'Text one member or any Ethio Telecom number.' },
    { id: 'same', label: 'Many, same message', icon: 'campaign', hint: 'Everyone you pick gets the same text.' },
    {
      id: 'personalized',
      label: 'Many, personalized',
      icon: 'badge',
      hint: "Each member gets their own message with their name, plan or expiry date filled in.",
    },
    { id: 'history', label: 'History', icon: 'history', hint: 'Everything sent, with delivery and failure reasons.' },
  ];
  const current = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">SMS</h1>
          <p className="text-white/60">
            Send messages by hand. Automatic messages are set up in the desktop app, under Settings → SMS.
          </p>
        </div>

        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden mb-6">
          <div className="border-b border-surface-dark-lighter">
            <div className="flex overflow-x-auto" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
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
            <p className="text-white/50 text-sm mb-6">{current.hint}</p>
            {activeTab === 'one' && <SmsSendModal inline isOpen onClose={() => {}} />}
            {activeTab === 'same' && <SmsGroupSend key="same" personalized={false} />}
            {activeTab === 'personalized' && <SmsGroupSend key="personalized" personalized />}
            {activeTab === 'history' && <SmsHistoryTable />}
          </div>
        </div>
      </div>
    </div>
  );
}
