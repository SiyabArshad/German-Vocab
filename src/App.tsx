import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  BookOpen,
  HelpCircle,
  Layers,
  RotateCcw,
  LogIn,
  LogOut,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { levels, topicById } from './data/vocabData';
import type { LevelKey, StudyMode, TopicData, VocabularyWord } from './data/types';
import { useAuth } from './services/useAuth';
import {
  getLocalMasteredIds,
  saveLocalMasteredIds,
  subscribeToCloudProgress,
  syncWordRemembered,
  recordQuizResult,
  resetAllUserProgress,
} from './services/progressService';
import { AuthModal } from './components/AuthModal';
import { StatsDashboard } from './components/StatsDashboard';
import { TopicSelector } from './components/TopicSelector';
import { TopicView } from './components/TopicView';
import { FlashcardDeck } from './components/FlashcardDeck';
import { QuizMode } from './components/QuizMode';
import './App.css';

function App() {
  const { user, openAuthModal, logout, pendingWordId, clearPendingWord } = useAuth();

  // Active level: Beginner (A1-A2) or Intermediate (B1-B2)
  const [levelKey, setLevelKey] = useState<LevelKey>(() => {
    const saved = localStorage.getItem('german_level_key');
    return saved === 'b1_b2' ? 'b1_b2' : 'a1_a2';
  });

  const currentLevelInfo = levels[levelKey];

  // Active topic inside the level
  const [selectedTopicId, setSelectedTopicId] = useState<number | 'all'>(() => {
    return currentLevelInfo.topics[0]?.id || 1;
  });

  // Study mode
  const [mode, setMode] = useState<StudyMode>('cards');

  // Translation direction
  const [isReverse, setIsReverse] = useState<boolean>(() => {
    return localStorage.getItem('german_vocab_reverse') === 'true';
  });

  // Mastered words set (isolated per user)
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => getLocalMasteredIds(user?.uid || null));

  // Save level and reverse direction preferences
  useEffect(() => {
    localStorage.setItem('german_level_key', levelKey);
  }, [levelKey]);

  useEffect(() => {
    localStorage.setItem('german_vocab_reverse', String(isReverse));
  }, [isReverse]);

  // Subscribe to Firebase Firestore progress when user is logged in
  useEffect(() => {
    if (!user) {
      // When logged out, reset in-memory state to guest local storage
      setMasteredIds(getLocalMasteredIds(null));
      return;
    }

    // Immediately load this user's local cache
    setMasteredIds(getLocalMasteredIds(user.uid));

    // Subscribe to cloud updates for this specific user
    const unsubscribe = subscribeToCloudProgress(user.uid, (cloudMastered) => {
      setMasteredIds(new Set(cloudMastered));
    });

    return () => unsubscribe();
  }, [user]);

  // Toggle master status (works both offline/guest and logged in)
  const handleToggleMaster = useCallback(async (wordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isCurrentlyRemembered = masteredIds.has(wordId);
    const updated = await syncWordRemembered(
      user ? user.uid : null,
      wordId,
      !isCurrentlyRemembered,
      masteredIds
    );
    setMasteredIds(updated);
  }, [user, masteredIds]);

  // Handle pending action after authentication
  useEffect(() => {
    if (user && pendingWordId) {
      const targetId = pendingWordId;
      clearPendingWord();
      const timer = setTimeout(() => {
        handleToggleMaster(targetId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, pendingWordId, handleToggleMaster, clearPendingWord]);

  // Switch level
  const handleSelectLevel = (newLevel: LevelKey) => {
    setLevelKey(newLevel);
    setSelectedTopicId(levels[newLevel].topics[0]?.id || 'all');
  };

  // Get active topic
  const activeTopic: TopicData | null = useMemo(() => {
    if (selectedTopicId === 'all') return null;
    return topicById.get(selectedTopicId) || currentLevelInfo.topics[0] || null;
  }, [selectedTopicId, currentLevelInfo]);

  // Words list for current selection (topic or whole level)
  const activeVocabList: VocabularyWord[] = useMemo(() => {
    if (activeTopic) return activeTopic.words;
    return currentLevelInfo.words;
  }, [activeTopic, currentLevelInfo]);

  // Mastered count in active level
  const masteredInCurrentLevel = useMemo(() => {
    return currentLevelInfo.words.filter(w => masteredIds.has(w.id)).length;
  }, [currentLevelInfo, masteredIds]);

  // Mark a word as remembered (e.g. from Quiz or Flashcards)
  const handleRememberWord = async (wordId: string) => {
    if (!masteredIds.has(wordId)) {
      const updated = await syncWordRemembered(user ? user.uid : null, wordId, true, masteredIds);
      setMasteredIds(updated);
    }
  };

  // Unmark a word if missed in retention test
  const handleUnrememberWord = async (wordId: string) => {
    if (masteredIds.has(wordId)) {
      const updated = await syncWordRemembered(user ? user.uid : null, wordId, false, masteredIds);
      setMasteredIds(updated);
    }
  };

  // Record quiz test result
  const handleRecordQuizResult = async (wordId: string, passed: boolean) => {
    await recordQuizResult(user ? user.uid : null, wordId, passed);
  };

  // Reset all progress
  const handleResetProgress = async () => {
    if (window.confirm('Reset all remembered words? This will clear your progress across all topics.')) {
      await resetAllUserProgress(user ? user.uid : null);
      setMasteredIds(new Set());
    }
  };

  const handleLogout = async () => {
    if (user) {
      saveLocalMasteredIds(masteredIds, user.uid);
    }
    await logout();
    setMasteredIds(getLocalMasteredIds(null));
  };

  return (
    <div className="app-viewport">
      <div className="glow-spot glow-spot-1" />
      <div className="glow-spot glow-spot-2" />

      {/* Firebase Auth Modal */}
      <AuthModal />

      <div className="app-container">
        {/* App Top Navigation Bar */}
        <header className="app-header-nav">
          <div className="header-brand">
            <div className="brand-icon-wrap">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="brand-title">DeutschPro Vocab</h1>
              <p className="brand-tagline">
                Master 2,425+ German words with topic structures & Perfekt tense
              </p>
            </div>
          </div>

          {/* User Account / Sync status */}
          <div className="header-user-panel">
            {user ? (
              <div className="user-logged-box">
                <div className="user-info-text">
                  <span className="user-email-text">{user.email || 'Guest User'}</span>
                  <span className="user-cloud-badge">
                    <CheckCircle2 size={12} /> Cloud Synced
                  </span>
                </div>
                <button
                  type="button"
                  className="user-logout-btn"
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="header-auth-trigger"
                onClick={() => openAuthModal('Sign in to sync your progress to Firebase Firestore!')}
              >
                <LogIn size={16} />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </header>

        {/* Level Switcher (Beginner A1-A2 vs Intermediate B1-B2) */}
        <div className="level-switcher-bar">
          <div className="level-switcher-pills">
            <button
              type="button"
              className={`level-pill-btn ${levelKey === 'a1_a2' ? 'active' : ''}`}
              onClick={() => handleSelectLevel('a1_a2')}
            >
              <div className="level-pill-title">
                <span className="level-badge-code">A1 – A2</span>
                <span className="level-name">Beginner</span>
              </div>
              <span className="level-pill-count">
                {levels.a1_a2.wordCount} words • 40 topics
              </span>
            </button>

            <button
              type="button"
              className={`level-pill-btn ${levelKey === 'b1_b2' ? 'active' : ''}`}
              onClick={() => handleSelectLevel('b1_b2')}
            >
              <div className="level-pill-title">
                <span className="level-badge-code">B1 – B2</span>
                <span className="level-name">Intermediate</span>
              </div>
              <span className="level-pill-count">
                {levels.b1_b2.wordCount} words • 43 topics
              </span>
            </button>
          </div>

          {/* Translation Direction */}
          <div className="direction-toggle">
            <button
              type="button"
              className={`direction-btn ${!isReverse ? 'active' : ''}`}
              onClick={() => setIsReverse(false)}
              title="German to English"
            >
              DE ➔ EN
            </button>
            <button
              type="button"
              className={`direction-btn ${isReverse ? 'active' : ''}`}
              onClick={() => setIsReverse(true)}
              title="English to German"
            >
              EN ➔ DE
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <StatsDashboard
          currentLevel={currentLevelInfo}
          currentTopic={activeTopic}
          masteredCount={masteredInCurrentLevel}
          totalCount={currentLevelInfo.wordCount}
          onOpenAuth={() => openAuthModal()}
        />

        {/* Study Mode Selector & Controls */}
        <div className="controls-panel">
          <div className="mode-selectors">
            <button
              type="button"
              className={`mode-btn ${mode === 'cards' ? 'active' : ''}`}
              onClick={() => setMode('cards')}
            >
              <Layers size={18} />
              <span>Learn by Topic</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'flashcards' ? 'active' : ''}`}
              onClick={() => setMode('flashcards')}
            >
              <BookOpen size={18} />
              <span>Flashcards</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'quiz' ? 'active' : ''}`}
              onClick={() => setMode('quiz')}
            >
              <HelpCircle size={18} />
              <span>Test & Retention</span>
            </button>

            {masteredIds.size > 0 && (
              <button
                type="button"
                className="mode-btn reset-btn"
                onClick={handleResetProgress}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Topic Selector */}
        <TopicSelector
          topics={currentLevelInfo.topics}
          selectedTopicId={selectedTopicId}
          onSelectTopic={(id) => setSelectedTopicId(id)}
          masteredIds={masteredIds}
        />

        {/* Main Content Area */}
        <main className="main-content">
          {mode === 'cards' && (
            <>
              {activeTopic ? (
                <TopicView
                  key={`topic_${levelKey}_${selectedTopicId}`}
                  topic={activeTopic}
                  masteredIds={masteredIds}
                  onToggleMaster={handleToggleMaster}
                  isReverse={isReverse}
                  onOpenFlashcards={() => setMode('flashcards')}
                  onOpenTest={() => setMode('quiz')}
                />
              ) : (
                <div className="all-topics-view">
                  <div className="all-topics-banner">
                    <h2>All Topics in {currentLevelInfo.badge} ({currentLevelInfo.topics.length} Topics)</h2>
                    <p>Select any topic above to explore its structured vocabulary by part of speech.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {mode === 'flashcards' && (
            <FlashcardDeck
              key={`deck_${levelKey}_${selectedTopicId}`}
              vocabList={activeVocabList}
              masteredIds={masteredIds}
              onToggleMaster={handleToggleMaster}
              isReverse={isReverse}
            />
          )}

          {mode === 'quiz' && (
            <QuizMode
              key={`quiz_${levelKey}_${selectedTopicId}`}
              vocabList={activeVocabList}
              masteredIds={masteredIds}
              isReverse={isReverse}
              onRemember={handleRememberWord}
              onUnremember={handleUnrememberWord}
              onRecordResult={handleRecordQuizResult}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
