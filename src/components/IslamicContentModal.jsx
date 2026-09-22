import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Calendar,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  DAILY_DUAS,
  ASMA_UL_HUSNA,
  VERSES_COLLECTION,
  HADITHS_COLLECTION,
} from '../data/islamicContent';
import { getUpcomingIslamicEvents } from '../utils/prayerEngine';
import { triggerHaptic } from '../utils/audioHaptics';

export default function IslamicContentModal({ savedItems, onToggleSave, onClose }) {
  const [activeTab, setActiveTab] = useState('duas'); // 'duas' | 'names' | 'calendar' | 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDuaId, setExpandedDuaId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const upcomingEvents = getUpcomingIslamicEvents(new Date());

  const categories = ['All', 'Daily Routine', 'Food & Drink', 'Travel & Movement', 'Worship', 'Hardship & Comfort', 'Forgiveness'];

  // Filtered Duas
  const filteredDuas = DAILY_DUAS.filter((dua) => {
    const matchCat = selectedCategory === 'All' || dua.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.titleBn.includes(searchQuery) ||
      dua.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.arabic.includes(searchQuery);
    return matchCat && matchSearch;
  });

  // Filtered 99 Names
  const filteredNames = ASMA_UL_HUSNA.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.arabic.includes(searchQuery) ||
      n.transliteration.toLowerCase().includes(q) ||
      n.english.toLowerCase().includes(q) ||
      n.bangla.includes(searchQuery) ||
      n.number.toString() === searchQuery
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-tadaruk-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-tadaruk-gold/20 text-tadaruk-gold flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Islamic Knowledge Sanctuary</h2>
              <p className="text-xs text-tadaruk-muted">Fully offline curated treasury</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="px-4 py-2 border-b border-tadaruk-border/60 bg-slate-900/40">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Federated search across duas, 99 names, hadith..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tadaruk-gold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex items-center px-4 pt-2 border-b border-tadaruk-border/70 gap-2 overflow-x-auto">
          {[
            { id: 'duas', label: 'Daily Duas', icon: Sparkles },
            { id: 'names', label: '99 Names (أسماء الله)', icon: BookOpen },
            { id: 'calendar', label: 'Hijri Calendar', icon: Calendar },
            { id: 'saved', label: `Saved (${savedItems.length})`, icon: Bookmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-tadaruk-gold text-tadaruk-gold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: DAILY DUAS */}
          {activeTab === 'duas' && (
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap border transition-all ${
                      selectedCategory === cat
                        ? 'bg-tadaruk-gold text-slate-950 border-tadaruk-gold font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Duas List */}
              {filteredDuas.length === 0 ? (
                <div className="text-center py-10 text-xs text-tadaruk-muted">
                  No supplications match your search.
                </div>
              ) : (
                filteredDuas.map((dua) => {
                  const isExpanded = expandedDuaId === dua.id;
                  const isSaved = savedItems.some((s) => s.id === dua.id);

                  return (
                    <div
                      key={dua.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 transition-all duration-200 hover:border-slate-700"
                    >
                      <div
                        onClick={() => setExpandedDuaId(isExpanded ? null : dua.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-white">{dua.title}</h4>
                            <span className="text-xs text-tadaruk-gold font-bangla">
                              ({dua.titleBn})
                            </span>
                          </div>
                          <span className="text-[11px] text-tadaruk-muted mt-0.5 block">
                            {dua.category} • {dua.reference}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic('light');
                              onToggleSave({
                                id: dua.id,
                                type: 'dua',
                                title: dua.title,
                                arabic: dua.arabic,
                                translation: dua.meaning,
                                bangla: dua.meaningBn,
                                reference: dua.reference,
                              });
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSaved
                                ? 'bg-tadaruk-gold/20 text-tadaruk-gold border-tadaruk-gold/40'
                                : 'text-slate-500 hover:text-slate-300 border-slate-700'
                            }`}
                          >
                            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                          </button>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5 animate-in fade-in-50">
                          <p className="font-arabic text-lg sm:text-xl text-right text-tadaruk-goldLight leading-loose font-medium">
                            {dua.arabic}
                          </p>
                          <p className="text-xs text-amber-300/90 italic font-mono">
                            {dua.transliteration}
                          </p>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            <strong>Meaning:</strong> {dua.meaning}
                          </p>
                          <p className="text-xs text-tadaruk-muted font-bangla leading-relaxed border-t border-slate-800/80 pt-2">
                            <strong>অর্থ:</strong> {dua.meaningBn}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: 99 NAMES OF ALLAH */}
          {activeTab === 'names' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredNames.map((name) => (
                <div
                  key={name.number}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-tadaruk-gold font-mono text-xs font-bold flex items-center justify-center border border-slate-700">
                      {name.number}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-white">{name.transliteration}</h4>
                      <p className="text-[11px] text-slate-300">{name.english}</p>
                      <p className="text-[11px] text-tadaruk-gold font-bangla">{name.bangla}</p>
                    </div>
                  </div>

                  <span className="font-arabic text-lg text-tadaruk-goldLight font-bold">
                    {name.arabic}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: HIJRI CALENDAR EVENTS */}
          {activeTab === 'calendar' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 leading-relaxed">
                ℹ️ Significant Islamic dates calculated from astronomical lunar coordinates. Actual dates may differ by ±1 day depending on local moon sightings.
              </div>

              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">{ev.name}</h4>
                      <span className="text-xs text-tadaruk-gold font-bangla">({ev.nameBn})</span>
                    </div>
                    <p className="text-xs text-tadaruk-muted mt-0.5">{ev.virtue}</p>
                    <span className="inline-block mt-2 text-[11px] font-semibold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {ev.hijriDateStr}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-mono font-extrabold text-tadaruk-gold">
                      {ev.approxDays}
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      days away
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SAVED BOOKMARKS */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              {savedItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-tadaruk-muted">
                  No items saved yet. Tap the bookmark icon on any dua, verse, or hadith to keep it in your personal collection.
                </div>
              ) : (
                savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-tadaruk-gold">
                        {item.type}
                      </span>
                      <button
                        onClick={() => onToggleSave(item)}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="font-arabic text-lg text-right text-tadaruk-goldLight leading-relaxed">
                      {item.arabic}
                    </p>
                    <p className="text-xs text-slate-200">{item.translation}</p>
                    {item.bangla && (
                      <p className="text-xs text-tadaruk-muted font-bangla">{item.bangla}</p>
                    )}
                    <span className="text-[10px] text-slate-500 block">{item.reference}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
