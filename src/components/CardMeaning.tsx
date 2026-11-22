import { Volume2 } from 'lucide-react';
import type { VocabularyWord } from '../data/types';
import { parseGermanWord, speakGerman } from '../utils/vocab';

interface CardMeaningProps {
  item: VocabularyWord;
  showGermanWord?: boolean;
  compact?: boolean;
}

export function CardMeaning({ item, showGermanWord = false, compact = false }: CardMeaningProps) {
  const { article, rest, gender } = parseGermanWord(item.de, item.pos);

  return (
    <div className={`card-meaning ${compact ? 'compact' : ''}`}>
      {showGermanWord && (
        <div className="german-word">
          {article && <span className={`gender-highlight ${gender}`}>{article} </span>}
          {rest}
        </div>
      )}
      <div className="english-word">{item.en}</div>
      <div className="example-block">
        <div className="example-label">Beispielsatz</div>
        <p className="example-sentence">{item.sentence}</p>
        <button
          type="button"
          className="audio-btn example-audio"
          onClick={(e) => {
            e.stopPropagation();
            speakGerman(item.sentence);
          }}
          title="Listen to example"
        >
          <Volume2 size={14} />
        </button>
      </div>

      {item.pos === 'verb' && item.perfekt && (
        <div className="perfekt-block">
          <div className="perfekt-label">Perfekt: <strong>{item.perfekt}</strong></div>
          {item.sentence_perfekt && (
            <p className="perfekt-sentence">{item.sentence_perfekt}</p>
          )}
        </div>
      )}
    </div>
  );
}
