import React, { useState } from 'react';
import { Volume2, Check } from 'lucide-react';
import type { VocabularyItem } from '../data/vocabulary';

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

  // Helper to parse noun article
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

  const { article, rest, gender } = parseGermanWord(item.w, item.c);

  // Speak German word
  const speakGerman = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from flipping
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Speak the clean German word without parentheses or slash info if any
      const textToSpeak = item.w;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'de-DE';
      
      const voices = window.speechSynthesis.getVoices();
      const deVoice = voices.find(v => v.lang.toLowerCase().includes('de'));
      if (deVoice) {
        utterance.voice = deVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="card-perspective" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        
        {/* FRONT FACE */}
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
                {article && (
                  <span className={`gender-highlight ${gender}`}>
                    {article}
                  </span>
                )}
                {rest}
              </div>
            )}
          </div>

          <div className="card-footer-row">
            {isReverse ? (
              <>
                <div style={{ width: '28px' }} /> {/* Spacer */}
                <span className="card-hint">Click to flip</span>
                <button
                  className={`audio-btn ${isMastered ? 'mastered' : ''}`}
                  onClick={(e) => onToggleMaster(item.id, e)}
                  style={{
                    background: isMastered ? 'rgba(16, 185, 129, 0.2)' : undefined,
                    borderColor: isMastered ? 'var(--accent-success)' : undefined,
                    color: isMastered ? 'var(--accent-success)' : undefined
                  }}
                  title={isMastered ? "Mastered! Click to reset" : "Mark as mastered"}
                >
                  <Check size={16} />
                </button>
              </>
            ) : (
              <>
                <button 
                  className="audio-btn" 
                  onClick={speakGerman}
                  title="Listen pronunciation"
                >
                  <Volume2 size={16} />
                </button>
                <button
                  className={`audio-btn ${isMastered ? 'mastered' : ''}`}
                  onClick={(e) => onToggleMaster(item.id, e)}
                  style={{
                    background: isMastered ? 'rgba(16, 185, 129, 0.2)' : undefined,
                    borderColor: isMastered ? 'var(--accent-success)' : undefined,
                    color: isMastered ? 'var(--accent-success)' : undefined
                  }}
                  title={isMastered ? "Mastered! Click to reset" : "Mark as mastered"}
                >
                  <Check size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* BACK FACE */}
        <div className={`card-face back ${isReverse ? (gender || '') : ''}`}>
          <div className="card-header-row">
            <span className="level-badge">{item.l}</span>
            <span className={`category-badge ${item.c}`}>{item.c}</span>
          </div>

          <div className="card-body">
            {isReverse ? (
              <div className="german-word">
                {article && (
                  <span className={`gender-highlight ${gender}`}>
                    {article}
                  </span>
                )}
                {rest}
              </div>
            ) : (
              <div className="english-word">{item.e}</div>
            )}
          </div>

          <div className="card-footer-row">
            {isReverse ? (
              <>
                <button 
                  className="audio-btn" 
                  onClick={speakGerman}
                  title="Listen pronunciation"
                >
                  <Volume2 size={16} />
                </button>
                <button
                  className={`audio-btn ${isMastered ? 'mastered' : ''}`}
                  onClick={(e) => onToggleMaster(item.id, e)}
                  style={{
                    background: isMastered ? 'rgba(16, 185, 129, 0.2)' : undefined,
                    borderColor: isMastered ? 'var(--accent-success)' : undefined,
                    color: isMastered ? 'var(--accent-success)' : undefined
                  }}
                  title={isMastered ? "Mastered! Click to reset" : "Mark as mastered"}
                >
                  <Check size={16} />
                </button>
              </>
            ) : (
              <>
                <div style={{ width: '28px' }} /> {/* Spacer */}
                <span className="card-hint">Click to flip</span>
                <div style={{ width: '28px' }} /> {/* Spacer */}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default VocabularyCard;
