import React, { useState } from 'react';
import { CheckCircle2, Volume2, Award, RotateCcw, AlertTriangle } from 'lucide-react';
import type { VocabularyItem } from '../data/vocabulary';

interface FlashcardDeckProps {
  vocabList: VocabularyItem[];
  masteredIds: Set<string>;
  onToggleMaster: (itemId: string) => void;
  isReverse?: boolean;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  vocabList,
  masteredIds,
  onToggleMaster,
  isReverse = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionMastered, setSessionMastered] = useState<string[]>([]);
  const [sessionPracticed, setSessionPracticed] = useState<string[]>([]);

  // Filter out already mastered words or keep them?
  // Spaced practice: Let's study all active filtered list, but let users see their status!
  // To make it fun, we will study the active filtered list.
  
  if (vocabList.length === 0) {
    return (
      <div className="empty-state">
        <AlertTriangle size={48} />
        <h3>No vocabulary matches the current search filters.</h3>
        <p>Try resetting filters or search query to load words into the deck.</p>
      </div>
    );
  }

  const isCompleted = currentIndex >= vocabList.length;
  const currentItem = vocabList[currentIndex];

  const handleNext = (status: 'master' | 'practice') => {
    if (currentItem) {
      if (status === 'master') {
        setSessionMastered(prev => [...prev, currentItem.id]);
        if (!masteredIds.has(currentItem.id)) {
          onToggleMaster(currentItem.id);
        }
      } else {
        setSessionPracticed(prev => [...prev, currentItem.id]);
      }
    }
    
    setIsFlipped(false);
    // Smooth transition delay
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 200);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionMastered([]);
    setSessionPracticed([]);
  };

  const speakGerman = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window && currentItem) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentItem.w);
      utterance.lang = 'de-DE';
      const voices = window.speechSynthesis.getVoices();
      const deVoice = voices.find(v => v.lang.toLowerCase().includes('de'));
      if (deVoice) utterance.voice = deVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const parseGermanWord = (word: string, category: string) => {
    if (category === 'noun') {
      const parts = word.split(' ');
      if (parts.length > 1 && ['der', 'die', 'das'].includes(parts[0].toLowerCase())) {
        return {
          article: parts[0],
          rest: parts.slice(1).join(' '),
          gender: parts[0].toLowerCase() as 'der' | 'die' | 'das'
        };
      }
    }
    return { article: null, rest: word, gender: null };
  };

  if (isCompleted) {
    return (
      <div className="quiz-container" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', marginBottom: '18px' }}>
          <Award size={48} />
        </div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', marginBottom: '8px' }}>Deck Completed!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
          Amazing work. You reviewed all {vocabList.length} vocabulary words in this deck.
        </p>

        <div className="stats-dashboard" style={{ marginBottom: '24px' }}>
          <div className="stat-box total" style={{ padding: '10px' }}>
            <div className="stat-val">{vocabList.length}</div>
            <div className="stat-lbl">Reviewed</div>
          </div>
          <div className="stat-box noun" style={{ padding: '10px' }}>
            <div className="stat-val" style={{ color: 'var(--accent-success)' }}>{sessionMastered.length}</div>
            <div className="stat-lbl">Mastered</div>
          </div>
          <div className="stat-box adjective" style={{ padding: '10px' }}>
            <div className="stat-val" style={{ color: '#f87171' }}>{sessionPracticed.length}</div>
            <div className="stat-lbl">Practice</div>
          </div>
        </div>

        <button className="quiz-next-btn" onClick={handleRestart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={16} />
          Restart Study Deck
        </button>
      </div>
    );
  }

  const { article, rest, gender } = parseGermanWord(currentItem.w, currentItem.c);

  return (
    <div className="flashcards-container">
      <div className="deck-stats">
        Card {currentIndex + 1} of {vocabList.length}
      </div>

      {/* 3D flip card card deck viewport */}
      <div className="flashcard-main-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-main-inner ${isFlipped ? 'flipped' : ''}`}>
          
          {/* FRONT */}
          <div className={`flashcard-face front ${isReverse ? '' : (gender || '')}`} style={{
            borderColor: !isReverse && gender === 'der' ? 'rgba(59, 130, 246, 0.4)' : !isReverse && gender === 'die' ? 'rgba(236, 72, 153, 0.4)' : !isReverse && gender === 'das' ? 'rgba(16, 185, 129, 0.4)' : undefined
          }}>
            <div className="card-header-row">
              <span className="level-badge">{currentItem.l}</span>
              <span className={`category-badge ${currentItem.c}`}>{currentItem.c}</span>
            </div>

            <div className="card-body">
              {isReverse ? (
                <div className="english-word">{currentItem.e}</div>
              ) : (
                <div className="german-word">
                  {article && <span className={`gender-highlight ${gender}`} style={{ fontSize: '2rem' }}>{article} </span>}
                  {rest}
                </div>
              )}
              <span className="card-hint">Click card to reveal translation</span>
            </div>

            <div className="card-footer-row">
              {isReverse ? (
                <div style={{ width: '24px' }} />
              ) : (
                <button className="audio-btn" onClick={speakGerman} title="Listen Pronunciation">
                  <Volume2 size={20} />
                </button>
              )}
              {masteredIds.has(currentItem.id) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Mastered
                </span>
              )}
            </div>
          </div>

          {/* BACK */}
          <div className={`flashcard-face back ${isReverse ? (gender || '') : ''}`} style={{
            borderColor: isReverse && gender === 'der' ? 'rgba(59, 130, 246, 0.4)' : isReverse && gender === 'die' ? 'rgba(236, 72, 153, 0.4)' : isReverse && gender === 'das' ? 'rgba(16, 185, 129, 0.4)' : undefined
          }}>
            <div className="card-header-row">
              <span className="level-badge">{currentItem.l}</span>
              <span className={`category-badge ${currentItem.c}`}>{currentItem.c}</span>
            </div>

            <div className="card-body">
              {isReverse ? (
                <div className="german-word">
                  {article && <span className={`gender-highlight ${gender}`} style={{ fontSize: '2rem' }}>{article} </span>}
                  {rest}
                </div>
              ) : (
                <div className="english-word">{currentItem.e}</div>
              )}
              <span className="card-hint">Click to flip card</span>
            </div>

            <div className="card-footer-row">
              {isReverse ? (
                <button className="audio-btn" onClick={speakGerman} title="Listen Pronunciation">
                  <Volume2 size={20} />
                </button>
              ) : (
                <div style={{ width: '24px' }} />
              )}
              <div style={{ width: '24px' }} />
            </div>
          </div>

        </div>
      </div>

      {/* Swipe Actions buttons */}
      <div className="flashcard-actions">
        <button className="action-btn needs-practice" onClick={() => handleNext('practice')}>
          Needs Practice
        </button>
        <button className="action-btn master" onClick={() => handleNext('master')}>
          Mark Mastered
        </button>
      </div>
    </div>
  );
};
export default FlashcardDeck;
