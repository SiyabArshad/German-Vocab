import React, { useState } from 'react';
import { Volume2, Check, Sparkles } from 'lucide-react';
import type { VocabularyWord } from '../data/types';
import { parseGermanWord, speakGerman } from '../utils/vocab';

interface VocabularyCardProps {
  item: VocabularyWord;
  isMastered: boolean;
  onToggleMaster: (itemId: string, e: React.MouseEvent) => void;
  isReverse?: boolean;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  isMastered,
  onToggleMaster,
  isReverse = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { article, rest, gender } = parseGermanWord(item.de, item.pos);

  return (
    <div
      className={`vocab-card ${isMastered ? 'mastered' : ''} ${gender || ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="card-top-bar">
        <div className="card-badge-group">
          <span className={`pos-tag pos-${item.pos}`}>{item.pos}</span>
          {gender && <span className={`gender-tag ${gender}`}>{gender}</span>}
        </div>

        <button
          type="button"
          className={`master-btn ${isMastered ? 'is-mastered' : ''}`}
          onClick={(e) => onToggleMaster(item.id, e)}
          title={isMastered ? 'Remembered! Click to reset' : 'Mark as remembered'}
          aria-label={isMastered ? 'Remembered' : 'Mark as remembered'}
        >
          <Check size={16} />
          {isMastered && <span className="master-btn-label">Remembered</span>}
        </button>
      </div>

      <div className="card-primary-content">
        {isReverse ? (
          <div className="word-heading">
            <h3 className="word-text english-primary">{item.en}</h3>
            <span className="word-subtext-hint">Click card to reveal German</span>
          </div>
        ) : (
          <div className="word-heading">
            <div className="german-word-row">
              <h3 className="word-text german-primary">
                {article && <span className={`article-prefix ${gender}`}>{article} </span>}
                {rest}
              </h3>
              <button
                type="button"
                className="inline-audio-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  speakGerman(item.de);
                }}
                title="Listen to German pronunciation"
              >
                <Volume2 size={16} />
              </button>
            </div>
            <p className="word-translation-sub">{item.en}</p>
          </div>
        )}
      </div>

      {/* Examples & Verb details section */}
      <div className="card-details-section">
        <div className="sentence-box">
          <div className="sentence-label-row">
            <span className="sentence-label">Beispielsatz</span>
            <button
              type="button"
              className="sentence-audio-btn"
              onClick={(e) => {
                e.stopPropagation();
                speakGerman(item.sentence);
              }}
              title="Listen to example sentence"
            >
              <Volume2 size={13} />
            </button>
          </div>
          <p className="sentence-text">{item.sentence}</p>
        </div>

        {/* Verb Perfekt form & sentence */}
        {item.pos === 'verb' && item.perfekt && (
          <div className="perfekt-box">
            <div className="perfekt-header">
              <span className="perfekt-badge">Perfekt</span>
              <span className="perfekt-form">{item.perfekt}</span>
              <button
                type="button"
                className="sentence-audio-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  speakGerman(item.perfekt || '');
                }}
                title="Listen to Perfekt form"
              >
                <Volume2 size={13} />
              </button>
            </div>
            {item.sentence_perfekt && (
              <div className="perfekt-sentence-row">
                <p className="perfekt-sentence-text">{item.sentence_perfekt}</p>
                <button
                  type="button"
                  className="sentence-audio-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakGerman(item.sentence_perfekt || '');
                  }}
                  title="Listen to Perfekt example"
                >
                  <Volume2 size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="card-footer-mini">
        <span className="topic-indicator">{item.topicName}</span>
        {isMastered && (
          <span className="mastered-pill">
            <Sparkles size={12} /> Learned
          </span>
        )}
      </div>
    </div>
  );
};
