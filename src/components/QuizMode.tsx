import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Award,
  Zap,
  Volume2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import type { VocabularyWord, TestFilterMode } from '../data/types';
import { parseGermanWord, speakGerman } from '../utils/vocab';
import { getDistractors, getGermanDistractors } from '../data/vocabData';

interface QuizModeProps {
  vocabList: VocabularyWord[];
  masteredIds: Set<string>;
  isReverse?: boolean;
  onRemember: (itemId: string) => void;
  onUnremember?: (itemId: string) => void;
  onRecordResult?: (wordId: string, passed: boolean) => void;
}

// Pure deterministic shuffle
function pureShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = Math.imul(seed + 42, 1103515245) + 12345;
  for (let i = result.length - 1; i > 0; i--) {
    s = Math.imul(s, 1103515245) + 12345;
    const j = Math.abs(s) % (i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

function wordSeed(wordId: string): number {
  let h = 0;
  for (let i = 0; i < wordId.length; i++) {
    h = Math.imul(h, 31) + wordId.charCodeAt(i);
  }
  return Math.abs(h);
}

export const QuizMode: React.FC<QuizModeProps> = ({
  vocabList,
  masteredIds,
  isReverse = false,
  onRemember,
  onUnremember,
  onRecordResult,
}) => {
  const [testMode, setTestMode] = useState<TestFilterMode>('all');
  const [sessionSeed, setSessionSeed] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // When direction switches mid-quiz (DE ➔ EN / EN ➔ DE), reset the current question answer state
  const prevIsReverseRef = useRef(isReverse);
  useEffect(() => {
    if (prevIsReverseRef.current !== isReverse) {
      prevIsReverseRef.current = isReverse;
      setIsAnswered(false);
      setSelectedOption(null);
    }
  }, [isReverse]);

  // Build the list of words to test based on active filter
  const quizQueue = useMemo(() => {
    let list = vocabList;
    if (testMode === 'remembered') {
      list = vocabList.filter(w => masteredIds.has(w.id));
    } else if (testMode === 'unlearned') {
      list = vocabList.filter(w => !masteredIds.has(w.id));
    }
    return pureShuffle(list, sessionSeed);
  }, [vocabList, testMode, sessionSeed, masteredIds]);

  // Safely clamp index so it never points past the end
  const safeIndex = Math.max(0, Math.min(currentIndex, Math.max(0, quizQueue.length - 1)));
  const currentWord: VocabularyWord | undefined = quizQueue[safeIndex];

  // Options for the current question
  const options = useMemo(() => {
    if (!currentWord) return [];
    const correctAnswer = isReverse ? currentWord.de : currentWord.en;
    const distractors = isReverse
      ? getGermanDistractors(currentWord, 3)
      : getDistractors(currentWord, 3);

    return pureShuffle([correctAnswer, ...distractors], wordSeed(currentWord.id) + (isReverse ? 777 : 0));
  }, [currentWord, isReverse]);

  const handleModeChange = (mode: TestFilterMode) => {
    setTestMode(mode);
    setSessionSeed(s => s + 1);
    setCurrentIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleSelectOption = (choice: string) => {
    if (isAnswered || !currentWord) return;
    setSelectedOption(choice);
    setIsAnswered(true);

    const correctAnswer = isReverse ? currentWord.de : currentWord.en;
    const isCorrect = choice.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      speakGerman(currentWord.de);
      onRemember(currentWord.id);
      onRecordResult?.(currentWord.id, true);
    } else {
      setStreak(0);
      onRecordResult?.(currentWord.id, false);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    setSessionSeed(s => s + 1);
    setCurrentIndex(0);
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const rememberedCount = vocabList.filter(w => masteredIds.has(w.id)).length;

  // Empty state (e.g. retention test when no words remembered yet)
  if (quizQueue.length === 0) {
    return (
      <div className="quiz-empty-state">
        <AlertTriangle size={44} />
        {testMode === 'remembered' ? (
          <>
            <h3>No remembered words in this topic yet!</h3>
            <p>
              Retention tests help you remember previously learned words.
              Mark words as remembered in "Learn by Topic" or "Flashcards", or choose an option below:
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="mode-btn active"
                onClick={() => handleModeChange('all')}
              >
                Test All Words in Topic ({vocabList.length})
              </button>
              <button
                type="button"
                className="mode-btn"
                onClick={() => handleModeChange('unlearned')}
              >
                Test Unlearned ({vocabList.length - rememberedCount})
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>No words available for this test</h3>
            <p>Select another topic or switch filter mode to begin.</p>
            <button
              type="button"
              className="mode-btn active"
              onClick={() => handleModeChange('all')}
            >
              Test All Words ({vocabList.length})
            </button>
          </>
        )}
      </div>
    );
  }

  // Quiz completed summary screen
  const isFinished = currentIndex >= quizQueue.length;
  if (isFinished) {
    const percentage = Math.round((score / Math.max(1, totalAnswered)) * 100) || 0;
    return (
      <div className="quiz-result-container">
        <div className="quiz-result-card">
          <div className="quiz-result-icon">
            {percentage >= 80 ? <Award size={52} color="#10b981" /> : <Sparkles size={52} color="#6366f1" />}
          </div>
          <h2 className="quiz-result-title">
            {percentage >= 80 ? 'Outstanding Retention!' : 'Practice Makes Perfect!'}
          </h2>
          <p className="quiz-result-sub">
            {testMode === 'remembered'
              ? 'Retention review finished! Regular testing keeps vocabulary sharp in long-term memory.'
              : 'Test session finished! Keep practicing regularly to solidify your vocabulary.'}
          </p>

          <div className="quiz-stats-grid">
            <div className="quiz-stat-box">
              <span className="quiz-stat-label">Score</span>
              <span className="quiz-stat-value">{score} / {totalAnswered}</span>
            </div>
            <div className="quiz-stat-box">
              <span className="quiz-stat-label">Accuracy</span>
              <span className="quiz-stat-value">{percentage}%</span>
            </div>
            <div className="quiz-stat-box">
              <span className="quiz-stat-label">Best Streak</span>
              <span className="quiz-stat-value">{bestStreak} 🔥</span>
            </div>
          </div>

          <div className="quiz-result-actions">
            <button
              type="button"
              className="quiz-action-btn primary"
              onClick={handleRestart}
            >
              <RotateCcw size={18} /> Test Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return null;
  }

  const correctAnswer = isReverse ? currentWord.de : currentWord.en;
  const { article, rest, gender } = parseGermanWord(currentWord.de, currentWord.pos);

  return (
    <div className="quiz-container">
      {/* Test Filter Mode Bar */}
      <div className="quiz-mode-selector-bar">
        <button
          type="button"
          className={`quiz-tab-btn ${testMode === 'remembered' ? 'active' : ''}`}
          onClick={() => handleModeChange('remembered')}
          title="Test only words you previously remembered to prevent forgetting"
        >
          <ShieldCheck size={16} />
          <span>Retention Test (Remembered: {rememberedCount})</span>
        </button>
        <button
          type="button"
          className={`quiz-tab-btn ${testMode === 'all' ? 'active' : ''}`}
          onClick={() => handleModeChange('all')}
        >
          <span>All Words ({vocabList.length})</span>
        </button>
        <button
          type="button"
          className={`quiz-tab-btn ${testMode === 'unlearned' ? 'active' : ''}`}
          onClick={() => handleModeChange('unlearned')}
        >
          <span>Unlearned Only ({vocabList.length - rememberedCount})</span>
        </button>
      </div>

      {/* Progress & Streak Bar */}
      <div className="quiz-header-bar">
        <div className="quiz-counter">
          Question {safeIndex + 1} of {quizQueue.length}
        </div>
        <div className="quiz-streak-badge">
          <Zap size={16} /> Streak: <strong>{streak}</strong>
        </div>
        <div className="quiz-score-badge">
          Score: {score} / {totalAnswered}
        </div>
      </div>

      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((safeIndex) / quizQueue.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="quiz-question-card">
        <div className="quiz-question-meta">
          <span className={`pos-tag pos-${currentWord.pos}`}>{currentWord.pos}</span>
          <span className="quiz-topic-chip">{currentWord.topicName}</span>
        </div>

        <div className="quiz-prompt-area">
          <span className="quiz-prompt-lang">
            {isReverse ? 'Translate into German:' : 'Translate into English:'}
          </span>
          <div className="quiz-prompt-word-row">
            <h2 className="quiz-prompt-word">
              {isReverse ? (
                currentWord.en
              ) : (
                <>
                  {article && <span className={`article-prefix ${gender}`}>{article} </span>}
                  {rest}
                </>
              )}
            </h2>
            {!isReverse && (
              <button
                type="button"
                className="quiz-audio-btn"
                onClick={() => speakGerman(currentWord.de)}
                title="Pronounce"
              >
                <Volume2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div className="quiz-options-grid">
          {options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isThisCorrect = opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

            let optClass = 'quiz-option-btn';
            if (isAnswered) {
              if (isThisCorrect) {
                optClass += ' correct';
              } else if (isSelected) {
                optClass += ' wrong';
              } else {
                optClass += ' dimmed';
              }
            }

            return (
              <button
                key={`${opt}_${idx}`}
                type="button"
                className={optClass}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
              >
                <span className="option-index-badge">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{opt}</span>
                {isAnswered && isThisCorrect && <CheckCircle2 size={18} className="option-feedback-icon" />}
                {isAnswered && isSelected && !isThisCorrect && <XCircle size={18} className="option-feedback-icon" />}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation / Feedback on Answer */}
        {isAnswered && (
          <div className={`quiz-feedback-box ${selectedOption?.trim().toLowerCase() === correctAnswer.trim().toLowerCase() ? 'correct' : 'wrong'}`}>
            <div className="feedback-header">
              {selectedOption?.trim().toLowerCase() === correctAnswer.trim().toLowerCase() ? (
                <>
                  <CheckCircle2 size={20} color="#10b981" />
                  <span className="feedback-title">Correct! Excellent recall!</span>
                </>
              ) : (
                <>
                  <XCircle size={20} color="#ef4444" />
                  <span className="feedback-title">
                    Not quite. Correct answer: <strong>{correctAnswer}</strong>
                  </span>
                </>
              )}
            </div>

            <div className="feedback-details">
              <p className="feedback-sentence">
                <strong>Example:</strong> "{currentWord.sentence}"
              </p>
              {currentWord.pos === 'verb' && currentWord.perfekt && (
                <p className="feedback-perfekt">
                  <strong>Perfekt:</strong> {currentWord.perfekt} — "{currentWord.sentence_perfekt}"
                </p>
              )}
            </div>

            <div className="feedback-actions">
              {testMode === 'remembered' && selectedOption?.trim().toLowerCase() !== correctAnswer.trim().toLowerCase() && onUnremember && (
                <button
                  type="button"
                  className="unremember-warning-btn"
                  onClick={() => onUnremember(currentWord.id)}
                  title="Move back to learning list"
                >
                  Unmark as Remembered
                </button>
              )}

              <button
                type="button"
                className="next-question-btn"
                onClick={handleNextQuestion}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
