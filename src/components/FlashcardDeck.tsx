import React, { useEffect, useState } from 'react';
import { CheckCircle2, Volume2, Award, RotateCcw, AlertTriangle } from 'lucide-react';
import type { VocabularyItem } from '../data/types';
import { topicById } from '../data/topics';
import { parseGermanWord, speakGerman } from '../utils/vocab';
import { CardMeaning } from './CardMeaning';

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

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionMastered([]);
    setSessionPracticed([]);
  }, [vocabList, isReverse]);

  if (vocabList.length === 0) {
    return (
      <div className="empty-state">
        <AlertTriangle size={48} />
        <h3>No vocabulary matches the current search filters.</h3>
        <p>Try resetting filters or pick another topic to load words into the deck.</p>
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

  if (isCompleted) {
    return (
      <div className="quiz-container" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', marginBottom: '18px' }}>
          <Award size={48} />
        </div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', marginBottom: '8px' }}>Topic completed!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
          You reviewed all {vocabList.length} words in this set. Remembered words stay marked for this topic.
        </p>
        <div className="stats-dashboard" style={{ marginBottom: '24px' }}>
          <div className="stat-box total" style={{ padding: '10px' }}>
            <div className="stat-val">{vocabList.length}</div>
            <div className="stat-lbl">Reviewed</div>
          </div>
          <div className="stat-box noun" style={{ padding: '10px' }}>
            <div className="stat-val" style={{ color: 'var(--accent-success)' }}>{sessionMastered.length}</div>
            <div className="stat-lbl">Remembered</div>
          </div>
          <div className="stat-box adjective" style={{ padding: '10px' }}>
            <div className="stat-val" style={{ color: '#f87171' }}>{sessionPracticed.length}</div>
            <div className="stat-lbl">Practice</div>
          </div>
        </div>
        <button className="quiz-next-btn" onClick={handleRestart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RotateCcw size={16} />
          Study this topic again
        </button>
      </div>
    );
  }

  const { article, rest, gender } = parseGermanWord(currentItem.w, currentItem.c);
  const topicName = topicById.get(currentItem.t)?.name;

  return (
    <div className="flashcards-container">
      <div className="deck-stats">
        Card {currentIndex + 1} of {vocabList.length}
        {topicName ? ` · ${topicName}` : ''}
      </div>

      <div className="flashcard-main-wrapper tall" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-main-inner ${isFlipped ? 'flipped' : ''}`}>
          <div className={`flashcard-face front ${isReverse ? '' : (gender || '')}`}>
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
              <span className="card-hint">Click to see meaning and example</span>
            </div>
            <div className="card-footer-row">
              {isReverse ? (
                <div style={{ width: '24px' }} />
              ) : (
                <button className="audio-btn" onClick={(e) => { e.stopPropagation(); speakGerman(currentItem.w); }} title="Listen pronunciation">
                  <Volume2 size={20} />
                </button>
              )}
              {masteredIds.has(currentItem.id) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Remembered
                </span>
              )}
            </div>
          </div>

          <div className={`flashcard-face back ${isReverse ? (gender || '') : ''}`}>
            <div className="card-header-row">
              <span className="level-badge">{currentItem.l}</span>
              <span className={`category-badge ${currentItem.c}`}>{currentItem.c}</span>
            </div>
            <div className="card-body">
              <CardMeaning item={currentItem} showGermanWord={isReverse} />
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-actions">
        <button className="action-btn needs-practice" onClick={() => handleNext('practice')}>
          Still learning
        </button>
        <button className="action-btn master" onClick={() => handleNext('master')}>
          I remember this
        </button>
      </div>
    </div>
  );
};

export default FlashcardDeck;
