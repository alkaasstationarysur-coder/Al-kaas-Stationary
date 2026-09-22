import React, { useState } from 'react';
import { BookOpen, Bookmark, BookmarkCheck, Share2, Sparkles } from 'lucide-react';
import { VERSES_COLLECTION, HADITHS_COLLECTION } from '../data/islamicContent';
import { triggerHaptic } from '../utils/audioHaptics';

export default function DailyContentCard({ savedItems, onToggleSave }) {
  const [activeType, setActiveType] = useState('verse'); // 'verse' | 'hadith'

  // Pick item based on day of year
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );

  const verse = VERSES_COLLECTION[dayOfYear % VERSES_COLLECTION.length];
  const hadith = HADITHS_COLLECTION[dayOfYear % HADITHS_COLLECTION.length];

  const currentItem = activeType === 'verse' ? verse : hadith;
  const isSaved = savedItems.some((item) => item.id === currentItem.id);

  const handleSave = () => {
    triggerHaptic('light');
    onToggleSave({
      id: currentItem.id,
      type: activeType,
      arabic: currentItem.arabic,
      translation: currentItem.english,
      bangla: currentItem.bangla,
      reference: currentItem.reference,
    });
  };

  return (
    <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-5 relative overflow-hidden">
      {/* Header Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-tadaruk-border/70">
        <div className="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveType('verse')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeType === 'verse'
                ? 'bg-tadaruk-gold text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verse of the Day
          </button>
          <button
            onClick={() => setActiveType('hadith')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeType === 'hadith'
                ? 'bg-tadaruk-gold text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hadith of the Day
          </button>
        </div>

        {/* Save / Bookmark Button */}
        <button
          onClick={handleSave}
          title={isSaved ? 'Remove from Saved' : 'Save to Favorites'}
          className={`p-2 rounded-xl border transition-colors ${
            isSaved
              ? 'bg-tadaruk-gold/15 text-tadaruk-gold border-tadaruk-gold/40'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* Content */}
      <div className="pt-4 space-y-3">
        {/* Arabic */}
        <p className="font-arabic text-lg sm:text-xl text-right leading-loose text-tadaruk-goldLight font-medium">
          {currentItem.arabic}
        </p>

        {/* English Translation */}
        <p className="text-sm text-slate-200 leading-relaxed italic">
          "{currentItem.english}"
        </p>

        {/* Bangla Translation */}
        <p className="text-xs text-tadaruk-muted font-bangla leading-relaxed border-t border-tadaruk-border/50 pt-2">
          {currentItem.bangla}
        </p>

        {/* Source Reference */}
        <div className="pt-1 flex items-center justify-between text-xs text-tadaruk-gold/80 font-medium">
          <span>{currentItem.reference}</span>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider">
            Daily Reflection
          </span>
        </div>
      </div>
    </div>
  );
}
