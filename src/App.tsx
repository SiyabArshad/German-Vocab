import { useEffect, useMemo, useState } from 'react';
import { Book, HelpCircle, Layers, Search, RotateCcw, Sparkles } from 'lucide-react';
import { combinedVocabulary } from './data/vocabulary';
import { ALL_TOPICS } from './data/topics';
import { StatsDashboard } from './components/StatsDashboard';
import { VocabularyCard } from './components/VocabularyCard';
import { FlashcardDeck } from './components/FlashcardDeck';
import { QuizMode } from './components/QuizMode';
import './App.css';

function App() {
  const [mode, setMode] = useState<'cards' | 'flashcards' | 'quiz'>('cards');
  const [category, setCategory] = useState<'all' | 'noun' | 'verb' | 'adjective' | 'other'>('all');
  const [topicId, setTopicId] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [isReverse, setIsReverse] = useState<boolean>(() => {
    return localStorage.getItem('german_vocab_reverse') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('german_vocab_reverse', String(isReverse));
  }, [isReverse]);

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

  useEffect(() => {
    localStorage.setItem('german_mastered_ids', JSON.stringify(Array.from(masteredIds)));
  }, [masteredIds]);

  const sourceVocab = combinedVocabulary;
  const visibleTopics = ALL_TOPICS;

  const topicCounts = useMemo(() => {
    const counts = new Map<string, { total: number; mastered: number }>();
    for (const item of sourceVocab) {
      const current = counts.get(item.t) ?? { total: 0, mastered: 0 };
      current.total += 1;
      if (masteredIds.has(item.id)) current.mastered += 1;
      counts.set(item.t, current);
    }
    return counts;
  }, [sourceVocab, masteredIds]);

  const filteredVocab = sourceVocab.filter(item => {
    const matchesCategory = category === 'all' || item.c === category;
    const matchesTopic = topicId === 'all' || item.t === topicId;
    const query = search.trim().toLowerCase();
    if (!query) return matchesCategory && matchesTopic;

    const matchesGerman = item.w.toLowerCase().includes(query);
    const matchesEnglish = item.e.toLowerCase().includes(query);
    const matchesExample = item.x.toLowerCase().includes(query);
    return matchesCategory && matchesTopic && (matchesGerman || matchesEnglish || matchesExample);
  });

  const totalInCurrentLevel = sourceVocab.length;
  const masteredInCurrentLevel = sourceVocab.filter(item => masteredIds.has(item.id)).length;

  const handleToggleMaster = (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleRemember = (itemId: string) => {
    setMasteredIds(prev => {
      if (prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all remembered words for every topic?')) {
      setMasteredIds(new Set<string>());
    }
  };

  return (
    <div className="app-viewport">
      <div className="glow-spot glow-spot-1" />
      <div className="glow-spot glow-spot-2" />

      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">
            <Sparkles size={24} style={{ display: 'inline', marginRight: '8px', color: '#818cf8', verticalAlign: 'middle' }} />
            German Vocab Trainer
          </h1>
          <p className="app-subtitle">
            Kapitel 0.1–0.3 common A1 words, then Kapitel 1–12 ({combinedVocabulary.length} words)
          </p>
        </header>

        <StatsDashboard
          filteredVocab={filteredVocab}
          masteredCount={masteredInCurrentLevel}
          totalCount={totalInCurrentLevel}
        />

        <div className="controls-panel">
          <div className="mode-selectors">
            <button
              className={`mode-btn ${mode === 'cards' ? 'active' : ''}`}
              onClick={() => setMode('cards')}
            >
              <Layers size={18} />
              Learn topic
            </button>
            <button
              className={`mode-btn ${mode === 'flashcards' ? 'active' : ''}`}
              onClick={() => setMode('flashcards')}
            >
              <Book size={18} />
              Flashcards
            </button>
            <button
              className={`mode-btn ${mode === 'quiz' ? 'active' : ''}`}
              onClick={() => setMode('quiz')}
            >
              <HelpCircle size={18} />
              Test
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

          <div className="filter-row">
            <div className="search-input-wrapper">
              <Search />
              <input
                type="text"
                className="search-input"
                placeholder="Search German, English, or example sentence..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="level-selector">
              <button
                className={`level-btn ${!isReverse ? 'active' : ''}`}
                onClick={() => setIsReverse(false)}
                title="German to English"
              >
                DE ➔ EN
              </button>
              <button
                className={`level-btn ${isReverse ? 'active' : ''}`}
                onClick={() => setIsReverse(true)}
                title="English to German"
              >
                EN ➔ DE
              </button>
            </div>

          </div>
        </div>

        <div className="topic-section">
          <div className="topic-section-label">Topics — pick one to learn and remember</div>
          <div className="category-tabs topic-tabs">
            <button
              className={`category-tab all ${topicId === 'all' ? 'active' : ''}`}
              onClick={() => setTopicId('all')}
            >
              All topics ({sourceVocab.length})
            </button>
            {visibleTopics.map(topic => {
              const counts = topicCounts.get(topic.id);
              const total = counts?.total ?? 0;
              const mastered = counts?.mastered ?? 0;
              if (total === 0) return null;
              return (
                <button
                  key={topic.id}
                  className={`category-tab topic ${topicId === topic.id ? 'active' : ''}`}
                  onClick={() => setTopicId(topic.id)}
                >
                  <span>{topic.name}</span>
                  <span className="topic-count">{mastered}/{total}</span>
                </button>
              );
            })}
          </div>
        </div>

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
              onRemember={handleRemember}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
