import React, { useState, useEffect } from 'react';
import { Award, Zap, Volume2, ArrowRight, AlertTriangle } from 'lucide-react';
import type { VocabularyItem } from '../data/vocabulary';

interface QuizModeProps {
  vocabList: VocabularyItem[];
  isReverse?: boolean;
}

export const QuizMode: React.FC<QuizModeProps> = ({ vocabList, isReverse = false }) => {
  const [question, setQuestion] = useState<VocabularyItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Initialize first question
  useEffect(() => {
    generateNewQuestion();
  }, [vocabList, isReverse]);

  const generateNewQuestion = () => {
    if (vocabList.length < 4) {
      setQuestion(null);
      return;
    }

    // Pick random target word
    const targetIndex = Math.floor(Math.random() * vocabList.length);
    const targetWord = vocabList[targetIndex];

    // Pick 3 random distractor translations
    const distractors: string[] = [];

    if (isReverse) {
      // English -> German
      const pool = vocabList.filter(item => item.w !== targetWord.w);
      while (distractors.length < 3 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        const chosen = pool.splice(idx, 1)[0].w;
        if (!distractors.includes(chosen)) {
          distractors.push(chosen);
        }
      }
      const allOptions = [targetWord.w, ...distractors].sort(() => Math.random() - 0.5);
      setQuestion(targetWord);
      setOptions(allOptions);
    } else {
      // German -> English
      const pool = vocabList.filter(item => item.e !== targetWord.e);
      while (distractors.length < 3 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        const chosen = pool.splice(idx, 1)[0].e;
        if (!distractors.includes(chosen)) {
          distractors.push(chosen);
        }
      }
      const allOptions = [targetWord.e, ...distractors].sort(() => Math.random() - 0.5);
      setQuestion(targetWord);
      setOptions(allOptions);
    }

    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleSelect = (option: string) => {
    if (isAnswered || !question) return;

    setSelectedAnswer(option);
    setIsAnswered(true);
    setTotalQuestions(prev => prev + 1);

    const isCorrect = isReverse ? option === question.w : option === question.e;
    if (isCorrect) {
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      // Speak German word on correct answer automatically!
      speakGermanWord(question.w);
    } else {
      setStreak(0);
    }
  };

  const speakGermanWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      const voices = window.speechSynthesis.getVoices();
      const deVoice = voices.find(v => v.lang.toLowerCase().includes('de'));
      if (deVoice) utterance.voice = deVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetQuiz = () => {
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
    setBestStreak(0);
    generateNewQuestion();
  };

  if (vocabList.length < 4) {
    return (
      <div className="empty-state">
        <AlertTriangle size={48} />
        <h3>Insufficient vocabulary.</h3>
        <p>A quiz requires at least 4 active vocabulary words. Please widen your search filters.</p>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="quiz-container">
      {/* Score Header */}
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

      {/* Main Question Display */}
      <div className="quiz-question-box">
        <div className="quiz-label">
          {isReverse ? 'Translate this word to German' : 'Translate this word to English'}
        </div>
        <div className="quiz-prompt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          {isReverse ? question.e : question.w}
          {!isReverse && (
            <button 
              className="audio-btn" 
              onClick={() => speakGermanWord(question.w)}
              style={{ padding: '8px', verticalAlign: 'middle' }}
              title="Listen pronunciation"
            >
              <Volume2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Choices Grid */}
      <div className="quiz-options">
        {options.map((opt, i) => {
          let btnClass = '';
          const correctAns = isReverse ? question.w : question.e;
          if (isAnswered) {
            if (opt === correctAns) {
              btnClass = 'correct';
            } else if (opt === selectedAnswer) {
              btnClass = 'incorrect';
            }
          }

          return (
            <button
              key={i}
              className={`quiz-opt-btn ${btnClass}`}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
            >
              <span>{opt}</span>
              {isAnswered && opt === correctAns && <Zap size={14} style={{ color: 'var(--accent-success)' }} />}
            </button>
          );
        })}
      </div>

      {/* Feedback text */}
      <div className="quiz-feedback-area">
        {isAnswered && (
          <>
            <div className={`quiz-feedback ${selectedAnswer === (isReverse ? question.w : question.e) ? 'correct' : 'incorrect'}`}>
              {selectedAnswer === (isReverse ? question.w : question.e) ? 'Richtig! 🎉' : `Falsch! Correct is: "${isReverse ? question.w : question.e}"`}
            </div>
            <button className="quiz-next-btn" onClick={generateNewQuestion} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Next Question
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>

      {totalQuestions > 0 && (
        <button 
          onClick={resetQuiz} 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            marginTop: '20px',
            textDecoration: 'underline',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          Reset Stats
        </button>
      )}
    </div>
  );
};
export default QuizMode;
