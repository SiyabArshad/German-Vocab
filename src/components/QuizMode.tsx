import React, { useEffect, useState } from 'react';
import { Award, Zap, Volume2, AlertTriangle, RotateCcw } from 'lucide-react';
import type { VocabularyItem } from '../data/types';
import { parseGermanWord, speakGerman } from '../utils/vocab';
import { CardMeaning } from './CardMeaning';

interface QuizModeProps {
  vocabList: VocabularyItem[];
  isReverse?: boolean;
  onRemember?: (itemId: string) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ vocabList, isReverse = false, onRemember }) => {
  const [queue, setQueue] = useState<VocabularyItem[]>([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const shuffled = [...vocabList].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setIndex(0);
    setIsFlipped(false);
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
  }, [vocabList, isReverse]);

  if (vocabList.length === 0) {
    return (
      <div className="empty-state">
        <AlertTriangle size={48} />
        <h3>No words in this topic.</h3>
        <p>Pick a topic with at least one word to start a flashcard test.</p>
      </div>
    );
  }

  const question = queue[index];
  const isCompleted = queue.length > 0 && index >= queue.length;

  const markResult = (knewIt: boolean) => {
    if (!question) return;
    setTotalQuestions(prev => prev + 1);
    if (knewIt) {
      setScore(prev => prev + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
      onRemember?.(question.id);
      speakGerman(question.w);
    } else {
      setStreak(0);
    }
    setIsFlipped(false);
    setTimeout(() => setIndex(prev => prev + 1), 180);
  };

  const resetQuiz = () => {
    const shuffled = [...vocabList].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setIndex(0);
    setIsFlipped(false);
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
  };

  if (isCompleted) {
    const percent = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    return (
      <div className="quiz-container" style={{ textAlign: 'center' }}>
        <Award size={48} style={{ color: 'var(--accent-success)', marginBottom: 12 }} />
        <h2 style={{ fontFamily: 'Outfit', marginBottom: 8 }}>Test finished</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          You remembered {score} of {totalQuestions} cards ({percent}%). Best streak: {bestStreak}.
        </p>
        <button className="quiz-next-btn" onClick={resetQuiz} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <RotateCcw size={16} /> Test this topic again
        </button>
      </div>
    );
  }

  if (!question) return null;

  const { article, rest, gender } = parseGermanWord(question.w, question.c);

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-badge">
          <Award size={16} style={{ color: 'var(--accent-success)' }} />
          Score: {score}/{totalQuestions}
        </div>
        <div className="quiz-badge streak">
          <Zap size={16} />
          Streak: {streak} (Best: {bestStreak})
        </div>
      </div>

      <p className="deck-stats" style={{ textAlign: 'center', marginBottom: 12 }}>
        Flashcard {index + 1} of {queue.length}
      </p>

      <div className="flashcard-main-wrapper tall quiz-card" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-main-inner ${isFlipped ? 'flipped' : ''}`}>
          <div className={`flashcard-face front ${isReverse ? '' : (gender || '')}`}>
            <div className="quiz-label">Flip the card when you have an answer</div>
            <div className="card-body">
              {isReverse ? (
                <div className="english-word">{question.e}</div>
              ) : (
                <div className="german-word" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span>
                    {article && <span className={`gender-highlight ${gender}`}>{article} </span>}
                    {rest}
                  </span>
                  <button className="audio-btn" onClick={(e) => { e.stopPropagation(); speakGerman(question.w); }} title="Listen">
                    <Volume2 size={16} />
                  </button>
                </div>
              )}
              <span className="card-hint">Tap to see meaning and example sentence</span>
            </div>
          </div>
          <div className={`flashcard-face back ${isReverse ? (gender || '') : ''}`}>
            <div className="card-body">
              <CardMeaning item={question} showGermanWord={isReverse} />
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-actions" style={{ marginTop: 20 }}>
        <button className="action-btn needs-practice" onClick={() => markResult(false)} disabled={!isFlipped}>
          I didn't know
        </button>
        <button className="action-btn master" onClick={() => markResult(true)} disabled={!isFlipped}>
          I knew it
        </button>
      </div>
      {!isFlipped && (
        <p className="card-hint">Flip the card first, then mark if you remembered it.</p>
      )}
    </div>
  );
};

export default QuizMode;
