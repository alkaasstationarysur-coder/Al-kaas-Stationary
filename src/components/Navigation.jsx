import React from 'react';
import { Clock, RefreshCw, Calendar, Sparkles, MoreHorizontal } from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'today', label: 'Today', arabic: 'الصلاة', icon: Clock },
    { id: 'qaza', label: 'Qaza', arabic: 'القضاء', icon: RefreshCw },
    { id: 'fasting', label: 'Fasting', arabic: 'الصيام', icon: Calendar },
    { id: 'dhikr', label: 'Dhikr', arabic: 'الذكر', icon: Sparkles },
    { id: 'more', label: 'More', arabic: 'المزيد', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080E21]/95 backdrop-blur-lg border-t border-tadaruk-border/80 px-2 py-2 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive ? 'text-tadaruk-gold font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-tadaruk-gold rounded-full shadow-sm shadow-tadaruk-gold/40"></span>
              )}
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110 bg-tadaruk-gold/10' : ''
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              <span className="text-[9px] font-arabic opacity-75 leading-none">{tab.arabic}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
