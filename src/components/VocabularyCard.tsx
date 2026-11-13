import React, { useState } from 'react';
import { Volume2, Check } from 'lucide-react';
import type { VocabularyItem } from '../data/types';
import { topicById } from '../data/topics';
import { parseGermanWord, speakGerman } from '../utils/vocab';
import { CardMeaning } from './CardMeaning';

interface VocabularyCardProps {
  item: VocabularyItem;
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
  const { article, rest, gender } = parseGermanWord(item.w, item.c);
  const topicName = topicById.get(item.t)?.name;

  return (
    <div className="card-perspective" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        <div className={`card-face front ${isReverse ? '' : (gender || '')}`}>
          <div className="card-header-row">
            <span className="level-badge">{item.l}</span>
            <span className={`category-badge ${item.c}`}>{item.c}</span>
          </div>

          <div className="card-body">
            {isReverse ? (
              <div className="english-word">{item.e}</div>
            ) : (
              <div className="german-word">
                {article && <span className={`gender-highlight ${gender}`}>{article} </span>}
                {rest}
              </div>
            )}
            {topicName && <span className="topic-chip-mini">{topicName}</span>}
          </div>

          <div className="card-footer-row">
            {!isReverse && (
              <button className="audio-btn" onClick={(e) => { e.stopPropagation(); speakGerman(item.w); }} title="Listen pronunciation">
                <Volume2 size={16} />
              </button>
            )}
            {isReverse && <div style={{ width: '28px' }} />}
            <span className="card-hint">Click to flip</span>
            <button
              className={`audio-btn ${isMastered ? 'mastered' : ''}`}
              onClick={(e) => onToggleMaster(item.id, e)}
              style={{
                background: isMastered ? 'rgba(16, 185, 129, 0.2)' : undefined,
                borderColor: isMastered ? 'var(--accent-success)' : undefined,
                color: isMastered ? 'var(--accent-success)' : undefined
              }}
              title={isMastered ? 'Remembered! Click to reset' : 'Mark as remembered'}
            >
              <Check size={16} />
            </button>
          </div>
        </div>

        <div className={`card-face back ${isReverse ? (gender || '') : ''}`}>
          <div className="card-header-row">
            <span className="level-badge">{item.l}</span>
            <span className={`category-badge ${item.c}`}>{item.c}</span>
          </div>
          <div className="card-body">
            <CardMeaning item={item} showGermanWord={isReverse} compact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;
