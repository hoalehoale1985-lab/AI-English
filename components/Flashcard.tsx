'use client';
import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface Vocab {
  word: string;
  meaning: string;
  phonetic: string;
  emoji: string;
}

interface FlashcardProps {
  vocab: Vocab;
  onSpeak: (text: string) => void;
}

export default function Flashcard({ vocab, onSpeak }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="relative w-full h-44 cursor-pointer perspective" onClick={() => setFlipped(!flipped)}>
      <div 
        className="relative w-full h-full duration-500 preserve-3d transition-transform"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}
      >
        <div className="absolute inset-0 w-full h-full bg-white border-4 border-amber-200 rounded-3xl flex flex-col items-center justify-center p-4 shadow-md hover:shadow-lg transition backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
          <span className="text-4xl mb-2">{vocab.emoji}</span>
          <span className="text-lg font-black text-amber-950 tracking-wide">{vocab.word}</span>
          <span className="text-xs text-indigo-600 font-bold">{vocab.phonetic}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onSpeak(vocab.word); }}
            className="absolute top-3 right-3 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition"
          >
            <Volume2 size={16} />
          </button>
        </div>
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500 to-sky-600 text-white rounded-3xl flex flex-col items-center justify-center p-4 shadow-lg backface-hidden text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1.5">Nghĩa tiếng Việt</span>
          <span className="text-xl font-black">{vocab.meaning}</span>
          <span className="text-[10px] text-sky-100 mt-3 font-medium">Bấm để lật lại thẻ</span>
        </div>
      </div>
    </div>
  );
}