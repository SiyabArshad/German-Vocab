import { Volume2 } from 'lucide-react';
import type { VocabularyItem } from '../data/types';
import { parseGermanWord, speakGerman } from '../utils/vocab';

interface CardMeaningProps {
  item: VocabularyItem;
  showGermanWord?: boolean;
  compact?: boolean;
}

export function CardMeaning({ item, showGermanWord = false, compact = false }: CardMeaningProps) {
  const { article, rest, gender } = parseGermanWord(item.w, item.c);

  return (
    <div className={`card-meaning ${compact ? 'compact' : ''}`}>
      {showGermanWord && (
        <div className="german-word">
          {article && <span className={`gender-highlight ${gender}`}>{article} </span>}
          {rest}
        </div>
      )}
      <div className="english-word">{item.e}</div>
      <div className="example-block">
        <div className="example-label">Beispielsatz</div>
        <p className="example-sentence">{item.x}</p>
        <button
          type="button"
          className="audio-btn example-audio"
          onClick={(e) => {
            e.stopPropagation();
            speakGerman(item.x);
          }}
          title="Listen to example"
        >
          <Volume2 size={14} />
        </button>
      </div>
    </div>
  );
}
