import React, { useMemo, useState } from 'react';
import {
  Volume2,
  CheckCircle2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import type { VocabularyWord } from '../data/types';
import { parseGermanWord, speakGerman } from '../utils/vocab';

interface FlashcardDeckProps {
  vocabList: VocabularyWord[];
  masteredIds: Set<string>;
  onToggleMaster: (itemId: string, e: React.MouseEvent) => void;
  isReverse?: boolean;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  vocabList,
  masteredIds,
  onToggleMaster,
  isReverse = false,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unlearned' | 'remembered'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);

  const filteredList = useMemo(() => {
    if (filterMode === 'remembered') {
      return vocabList.filter(w => masteredIds.has(w.id));
    }
    if (filterMode === 'unlearned') {
      return vocabList.filter(w => !masteredIds.has(w.id));
    }
    return vocabList;
  }, [vocabList, filterMode, masteredIds]);

  const deck = useMemo(() => {
    if (shuffledOrder && shuffledOrder.length === filteredList.length) {
      return shuffledOrder.map(idx => filteredList[idx]).filter(Boolean);
    }
    return filteredList;
  }, [filteredList, shuffledOrder]);

  const handleFilterChange = (mode: 'all' | 'unlearned' | 'remembered') => {
    setFilterMode(mode);
    setShuffledOrder(null);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    const indices = filteredList.map((_, i) => i).sort(() => 0.5 - Math.random());
    setShuffledOrder(indices);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (deck.length === 0) {
    return (
      <div className="flashcard-empty-state">
        <AlertTriangle size={44} />
        <h3>No flashcards for this filter</h3>
        <p>
          {filterMode === 'remembered'
            ? 'You have not marked any words as remembered in this selection yet.'
            : 'No matching vocabulary found.'}
        </p>
        <button
          type="button"
          className="mode-btn active"
          onClick={() => handleFilterChange('all')}
        >
          Show All Flashcards ({vocabList.length})
        </button>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, deck.length - 1);
  const currentItem = deck[safeIndex] || deck[0];
  const isMastered = masteredIds.has(currentItem.id);
  const { article, rest, gender } = parseGermanWord(currentItem.de);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    }, 150);
  };

  const handleRememberClick = (e: React.MouseEvent) => {
    onToggleMaster(currentItem.id, e);
  };

  return (
    <div className="flashcard-wrapper">
      {/* Controls & Mode Bar */}
      <div className="flashcard-toolbar">
        <div className="flashcard-filter-group">
          <button
            type="button"
            className={`fc-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All ({vocabList.length})
          </button>
          <button
            type="button"
            className={`fc-filter-btn ${filterMode === 'unlearned' ? 'active' : ''}`}
            onClick={() => handleFilterChange('unlearned')}
          >
            To Learn ({vocabList.filter(w => !masteredIds.has(w.id)).length})
          </button>
          <button
            type="button"
            className={`fc-filter-btn ${filterMode === 'remembered' ? 'active' : ''}`}
            onClick={() => handleFilterChange('remembered')}
          >
            Remembered ({vocabList.filter(w => masteredIds.has(w.id)).length})
          </button>
        </div>

        <button
          type="button"
          className="fc-shuffle-btn"
          onClick={handleShuffle}
          title="Shuffle cards"
        >
          <Shuffle size={16} /> Shuffle
        </button>
      </div>

      {/* Counter bar */}
      <div className="flashcard-progress-indicator">
        <span>Card {safeIndex + 1} of {deck.length}</span>
        <div className="flashcard-progress-track">
          <div
            className="flashcard-progress-bar"
            style={{ width: `${((safeIndex + 1) / deck.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card */}
      <div className="flashcard-stage" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-3d-box ${isFlipped ? 'is-flipped' : ''}`}>
          {/* FRONT */}
          <div className={`flashcard-face flashcard-front ${gender || ''}`}>
            <div className="fc-header-row">
              <span className={`pos-tag pos-${currentItem.pos}`}>{currentItem.pos}</span>
              <span className="fc-topic-label">{currentItem.topicName}</span>
              {isMastered && (
                <span className="fc-mastered-tag">
                  <Sparkles size={12} /> Remembered
                </span>
              )}
            </div>

            <div className="fc-center-content">
              {isReverse ? (
                <>
                  <div className="fc-prompt-label">English</div>
                  <h2 className="fc-main-word">{currentItem.en}</h2>
                </>
              ) : (
                <>
                  <div className="fc-prompt-label">German</div>
                  <h2 className="fc-main-word">
                    {article && <span className={`article-prefix ${gender}`}>{article} </span>}
                    {rest}
                  </h2>
                  <button
                    type="button"
                    className="fc-audio-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakGerman(currentItem.de);
                    }}
                    title="Pronounce"
                  >
                    <Volume2 size={20} />
                  </button>
                </>
              )}
              <div className="fc-click-hint">Click card to reveal answer & examples</div>
            </div>

            <div className="fc-footer-row">
              <span className="fc-level-badge">{currentItem.level.toUpperCase()}</span>
            </div>
          </div>

          {/* BACK */}
          <div className={`flashcard-face flashcard-back ${gender || ''}`}>
            <div className="fc-header-row">
              <span className={`pos-tag pos-${currentItem.pos}`}>{currentItem.pos}</span>
              <span className="fc-topic-label">{currentItem.topicName}</span>
            </div>

            <div className="fc-back-content">
              <div className="fc-reveal-word-row">
                <h3 className="fc-reveal-title">
                  {article && <span className={`article-prefix ${gender}`}>{article} </span>}
                  {rest}
                </h3>
                <button
                  type="button"
                  className="fc-audio-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakGerman(currentItem.de);
                  }}
                  title="Pronounce"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <p className="fc-reveal-meaning">{currentItem.en}</p>

              <div className="fc-reveal-sentence-box">
                <div className="sentence-label-row">
                  <span className="sentence-label">Beispielsatz</span>
                  <button
                    type="button"
                    className="sentence-audio-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakGerman(currentItem.sentence);
                    }}
                    title="Listen to sentence"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>
                <p className="sentence-text">{currentItem.sentence}</p>
              </div>

              {currentItem.pos === 'verb' && currentItem.perfekt && (
                <div className="fc-perfekt-box">
                  <div className="perfekt-header">
                    <span className="perfekt-badge">Perfekt</span>
                    <span className="perfekt-form">{currentItem.perfekt}</span>
                    <button
                      type="button"
                      className="sentence-audio-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakGerman(currentItem.perfekt || '');
                      }}
                      title="Listen"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                  {currentItem.sentence_perfekt && (
                    <div className="perfekt-sentence-row">
                      <p className="perfekt-sentence-text">{currentItem.sentence_perfekt}</p>
                      <button
                        type="button"
                        className="sentence-audio-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakGerman(currentItem.sentence_perfekt || '');
                        }}
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Action Buttons */}
      <div className="flashcard-actions">
        <button
          type="button"
          className="fc-nav-btn prev-btn"
          onClick={handlePrev}
          title="Previous card"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          type="button"
          className={`fc-action-remember-btn ${isMastered ? 'mastered' : ''}`}
          onClick={handleRememberClick}
          title={isMastered ? 'Word is remembered' : 'Mark as remembered'}
        >
          <CheckCircle2 size={18} />
          <span>{isMastered ? 'Remembered (Click to Unmark)' : 'Mark as Remembered'}</span>
        </button>

        <button
          type="button"
          className="fc-nav-btn next-btn"
          onClick={handleNext}
          title="Next card"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};
