import { useState, useEffect } from 'react';
import { Book, HelpCircle, Layers, Search, RotateCcw, Sparkles } from 'lucide-react';
import { 
  a1Vocabulary, 
  a2Vocabulary, 
  combinedVocabulary
} from './data/vocabulary';
import type { VocabularyItem } from './data/vocabulary';
import { StatsDashboard } from './components/StatsDashboard';
import { VocabularyCard } from './components/VocabularyCard';
import { FlashcardDeck } from './components/FlashcardDeck';
import { QuizMode } from './components/QuizMode';
import './App.css';

function App() {
  // Navigation & Filters state
  const [mode, setMode] = useState<'cards' | 'flashcards' | 'quiz'>('cards');
  const [level, setLevel] = useState<'A1' | 'A2' | 'Combined'>('Combined');
  const [category, setCategory] = useState<'all' | 'noun' | 'verb' | 'adjective' | 'other'>('all');
  const [search, setSearch] = useState('');

  // Study direction: false = DE -> EN, true = EN -> DE (Reverse)
  const [isReverse, setIsReverse] = useState<boolean>(() => {
    return localStorage.getItem('german_vocab_reverse') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('german_vocab_reverse', String(isReverse));
  }, [isReverse]);

  // Persistent mastered vocabulary set
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('german_mastered_ids');
    if (saved) {
      try {
        return new Set<string>(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    return new Set<string>();
  });

  // Save to localStorage when masteredIds changes
  useEffect(() => {
    localStorage.setItem('german_mastered_ids', JSON.stringify(Array.from(masteredIds)));
  }, [masteredIds]);

  // Determine active vocabulary source
  const getSourceVocab = (): VocabularyItem[] => {
    switch (level) {
      case 'A1': return a1Vocabulary;
      case 'A2': return a2Vocabulary;
      case 'Combined': return combinedVocabulary;
    }
  };

  const sourceVocab = getSourceVocab();

  // Apply Search & Category filters
  const filteredVocab = sourceVocab.filter(item => {
    const matchesCategory = category === 'all' || item.c === category;
    
    const query = search.trim().toLowerCase();
    if (!query) return matchesCategory;

    // Search matches either German word, English translation, or grammatical gender article
    const matchesGerman = item.w.toLowerCase().includes(query);
    const matchesEnglish = item.e.toLowerCase().includes(query);
    
    return matchesCategory && (matchesGerman || matchesEnglish);
  });

  // Calculate mastery totals
  const totalInCurrentLevel = sourceVocab.length;
  const masteredInCurrentLevel = sourceVocab.filter(item => masteredIds.has(item.id)).length;

  const handleToggleMaster = (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset all vocabulary study progress?")) {
      setMasteredIds(new Set<string>());
    }
  };

  return (
    <div className="app-viewport">
      {/* Decorative Glowing spots in the background */}
      <div className="glow-spot glow-spot-1" />
      <div className="glow-spot glow-spot-2" />

      <div className="app-container">
        
        {/* Glassmorphic Header */}
        <header className="app-header">
          <h1 className="app-title">
            <Sparkles size={24} style={{ display: 'inline', marginRight: '8px', color: '#818cf8', verticalAlign: 'middle' }} />
            German Vocab Trainer
          </h1>
          <p className="app-subtitle">
            Consolidated German A1 & A2 Vocabulary Datasets ({combinedVocabulary.length} words total)
          </p>
        </header>

        {/* Dynamic Metrics Stats Dashboard */}
        <StatsDashboard 
          filteredVocab={filteredVocab}
          vocabLevel={level}
          masteredCount={masteredInCurrentLevel}
          totalCount={totalInCurrentLevel}
        />

        {/* Navigation panel */}
        <div className="controls-panel">
          <div className="mode-selectors">
            <button 
              className={`mode-btn ${mode === 'cards' ? 'active' : ''}`}
              onClick={() => setMode('cards')}
            >
              <Layers size={18} />
              Study Cards
            </button>
            <button 
              className={`mode-btn ${mode === 'flashcards' ? 'active' : ''}`}
              onClick={() => setMode('flashcards')}
            >
              <Book size={18} />
              Flashcard Deck
            </button>
            <button 
              className={`mode-btn ${mode === 'quiz' ? 'active' : ''}`}
              onClick={() => setMode('quiz')}
            >
              <HelpCircle size={18} />
              Translation Quiz
            </button>

            {masteredIds.size > 0 && (
              <button 
                className="mode-btn"
                onClick={handleResetProgress}
                style={{ marginLeft: 'auto', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}
              >
                <RotateCcw size={14} />
                Reset Progress
              </button>
            )}
          </div>

          {/* Filters area */}
          <div className="filter-row">
            
            {/* Search Input bar */}
            <div className="search-input-wrapper">
              <Search />
              <input 
                type="text"
                className="search-input"
                placeholder="Search German word or English translation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Study Direction Selector */}
            <div className="level-selector">
              <button 
                className={`level-btn ${!isReverse ? 'active' : ''}`}
                onClick={() => setIsReverse(false)}
                title="German to English study direction"
              >
                DE ➔ EN
              </button>
              <button 
                className={`level-btn ${isReverse ? 'active' : ''}`}
                onClick={() => setIsReverse(true)}
                title="English to German study direction"
              >
                EN ➔ DE
              </button>
            </div>

            {/* Level Toggle Control */}
            <div className="level-selector">
              <button 
                className={`level-btn ${level === 'A1' ? 'active' : ''}`}
                onClick={() => setLevel('A1')}
              >
                A1 Level
              </button>
              <button 
                className={`level-btn ${level === 'A2' ? 'active' : ''}`}
                onClick={() => setLevel('A2')}
              >
                A2 Level
              </button>
              <button 
                className={`level-btn ${level === 'Combined' ? 'active' : ''}`}
                onClick={() => setLevel('Combined')}
              >
                Combined
              </button>
            </div>

          </div>
        </div>

        {/* Category filtering sub-nav */}
        <div className="category-tabs">
          {(['all', 'noun', 'verb', 'adjective', 'other'] as const).map(cat => (
            <button
              key={cat}
              className={`category-tab ${cat} ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Core Study Mode router */}
        <main className="main-content">
          {mode === 'cards' && (
            <div className="cards-grid">
              {filteredVocab.length > 0 ? (
                filteredVocab.map(item => (
                  <VocabularyCard 
                    key={item.id}
                    item={item}
                    isMastered={masteredIds.has(item.id)}
                    onToggleMaster={(id, e) => handleToggleMaster(id, e)}
                    isReverse={isReverse}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <Search size={40} />
                  <h3>No matching vocabulary found.</h3>
                  <p>Try clearing search or changing filters to display words.</p>
                </div>
              )}
            </div>
          )}

          {mode === 'flashcards' && (
            <FlashcardDeck 
              vocabList={filteredVocab}
              masteredIds={masteredIds}
              onToggleMaster={(id) => handleToggleMaster(id)}
              isReverse={isReverse}
            />
          )}

          {mode === 'quiz' && (
            <QuizMode 
              vocabList={filteredVocab}
              isReverse={isReverse}
            />
          )}
        </main>

      </div>
    </div>
  );
}

export default App;
