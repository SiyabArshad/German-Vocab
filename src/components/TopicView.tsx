import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Search,
  MessageSquare,
  FileText,
  Mail,
  Layers,
  Sparkles
} from 'lucide-react';
import type { TopicData, VocabularyWord, CategoryFilter } from '../data/types';
import { VocabularyCard } from './VocabularyCard';
import { TopicRealWorldText } from './TopicRealWorldText';

interface TopicViewProps {
  topic: TopicData;
  masteredIds: Set<string>;
  onToggleMaster: (id: string, e: React.MouseEvent) => void;
  isReverse?: boolean;
  onOpenFlashcards: () => void;
  onOpenTest: () => void;
}

export const TopicView: React.FC<TopicViewProps> = ({
  topic,
  masteredIds,
  onToggleMaster,
  isReverse = false,
  onOpenFlashcards,
  onOpenTest,
}) => {
  const [viewTab, setViewTab] = useState<'vocab' | 'context'>('vocab');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [topicSearch, setTopicSearch] = useState('');

  const masteredCount = topic.words.filter(w => masteredIds.has(w.id)).length;
  const progressPercent = Math.round((masteredCount / topic.words.length) * 100) || 0;

  // Filter words by search
  const filterWords = (words: VocabularyWord[]) => {
    const query = topicSearch.trim().toLowerCase();
    if (!query) return words;
    return words.filter(
      w =>
        w.de.toLowerCase().includes(query) ||
        w.en.toLowerCase().includes(query) ||
        w.sentence.toLowerCase().includes(query) ||
        (w.perfekt && w.perfekt.toLowerCase().includes(query)) ||
        (w.sentence_perfekt && w.sentence_perfekt.toLowerCase().includes(query))
    );
  };

  const visibleNouns = filterWords(topic.nouns);
  const visibleVerbs = filterWords(topic.verbs);
  const visibleAdjectives = filterWords(topic.adjectives);
  const visibleOthers = filterWords(topic.others);

  const totalVisibleCount =
    (activeCategory === 'all' || activeCategory === 'noun' ? visibleNouns.length : 0) +
    (activeCategory === 'all' || activeCategory === 'verb' ? visibleVerbs.length : 0) +
    (activeCategory === 'all' || activeCategory === 'adjective' ? visibleAdjectives.length : 0) +
    (activeCategory === 'all' || activeCategory === 'other' ? visibleOthers.length : 0);

  const textType = topic.textType || 'paragraph';

  return (
    <div className="topic-view-container">
      {/* Topic Header Banner */}
      <div className="topic-header-banner">
        <div className="topic-title-area">
          <div className="topic-number-badge">Topic #{topic.id}</div>
          <h2 className="topic-main-title">{topic.topic}</h2>
          <p className="topic-sub-info">
            {topic.words.length} essential words categorized by part of speech
          </p>
        </div>

        <div className="topic-progress-card">
          <div className="topic-progress-header">
            <span className="topic-progress-label">Mastery Progress</span>
            <span className="topic-progress-value">
              {masteredCount} / {topic.words.length} ({progressPercent}%)
            </span>
          </div>
          <div className="topic-progress-bar-track">
            <div
              className="topic-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="topic-action-buttons">
            <button
              type="button"
              className="topic-action-btn flashcards-btn"
              onClick={onOpenFlashcards}
              title="Practice this topic with flashcards"
            >
              <BookOpen size={16} /> Flashcards
            </button>
            <button
              type="button"
              className="topic-action-btn test-btn"
              onClick={onOpenTest}
              title="Test your vocabulary retention in this topic"
            >
              <HelpCircle size={16} /> Test Retention
            </button>
          </div>
        </div>
      </div>

      {/* Primary Section Switcher: Vocabulary Cards vs Real-World Usage */}
      <div className="topic-nav-tabs">
        <button
          type="button"
          className={`topic-nav-tab-btn ${viewTab === 'vocab' ? 'active' : ''}`}
          onClick={() => setViewTab('vocab')}
        >
          <Layers size={18} />
          <span>Categorized Vocabulary ({topic.words.length})</span>
        </button>

        {topic.text && (
          <button
            type="button"
            className={`topic-nav-tab-btn context-tab ${viewTab === 'context' ? 'active' : ''}`}
            onClick={() => setViewTab('context')}
          >
            {textType === 'dialog' && <MessageSquare size={18} />}
            {textType === 'email' && <Mail size={18} />}
            {textType === 'paragraph' && <FileText size={18} />}
            <span>
              Real-World Context: {textType.charAt(0).toUpperCase() + textType.slice(1)}
            </span>
            <span className="tab-pill-sparkle">
              <Sparkles size={12} /> New
            </span>
          </button>
        )}
      </div>

      {/* VIEW 1: Categorized Vocabulary Sections */}
      {viewTab === 'vocab' && (
        <>
          {/* Filter and Search Bar */}
          <div className="topic-filter-toolbar">
            <div className="category-filter-pills">
              <button
                type="button"
                className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Words ({topic.words.length})
              </button>
              {topic.nouns.length > 0 && (
                <button
                  type="button"
                  className={`cat-pill cat-noun ${activeCategory === 'noun' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('noun')}
                >
                  Nouns ({topic.nouns.length})
                </button>
              )}
              {topic.verbs.length > 0 && (
                <button
                  type="button"
                  className={`cat-pill cat-verb ${activeCategory === 'verb' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('verb')}
                >
                  Verbs & Perfekt ({topic.verbs.length})
                </button>
              )}
              {topic.adjectives.length > 0 && (
                <button
                  type="button"
                  className={`cat-pill cat-adjective ${activeCategory === 'adjective' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('adjective')}
                >
                  Adjectives ({topic.adjectives.length})
                </button>
              )}
              {topic.others.length > 0 && (
                <button
                  type="button"
                  className={`cat-pill cat-other ${activeCategory === 'other' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('other')}
                >
                  Phrases & Others ({topic.others.length})
                </button>
              )}
            </div>

            <div className="topic-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search within this topic..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="topic-search-input"
              />
              {topicSearch && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setTopicSearch('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Vocabulary Card Sections */}
          {totalVisibleCount === 0 ? (
            <div className="empty-state">
              <Search size={36} />
              <h3>No matching words found</h3>
              <p>Try searching for a different word or clearing your filter.</p>
            </div>
          ) : (
            <div className="topic-sections-wrapper">
              {/* SECTION 1: NOUNS */}
              {(activeCategory === 'all' || activeCategory === 'noun') && visibleNouns.length > 0 && (
                <div className="pos-section nouns-section">
                  <div className="pos-section-header">
                    <div className="pos-section-title-wrap">
                      <span className="pos-icon-badge noun-badge">N</span>
                      <h3 className="pos-section-title">Nouns & Articles</h3>
                      <span className="pos-count-chip">{visibleNouns.length}</span>
                    </div>
                    <div className="noun-article-legend">
                      <span className="legend-item der"><span className="legend-dot der" /> der (masculine)</span>
                      <span className="legend-item die"><span className="legend-dot die" /> die (feminine)</span>
                      <span className="legend-item das"><span className="legend-dot das" /> das (neuter)</span>
                    </div>
                  </div>
                  <div className="vocab-cards-grid">
                    {visibleNouns.map(w => (
                      <VocabularyCard
                        key={w.id}
                        item={w}
                        isMastered={masteredIds.has(w.id)}
                        onToggleMaster={onToggleMaster}
                        isReverse={isReverse}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: VERBS */}
              {(activeCategory === 'all' || activeCategory === 'verb') && visibleVerbs.length > 0 && (
                <div className="pos-section verbs-section">
                  <div className="pos-section-header">
                    <div className="pos-section-title-wrap">
                      <span className="pos-icon-badge verb-badge">V</span>
                      <h3 className="pos-section-title">Verbs & Perfekt Tense</h3>
                      <span className="pos-count-chip">{visibleVerbs.length}</span>
                    </div>
                    <span className="pos-section-tip">Includes present example + Perfekt auxiliary form & sentence</span>
                  </div>
                  <div className="vocab-cards-grid">
                    {visibleVerbs.map(w => (
                      <VocabularyCard
                        key={w.id}
                        item={w}
                        isMastered={masteredIds.has(w.id)}
                        onToggleMaster={onToggleMaster}
                        isReverse={isReverse}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: ADJECTIVES */}
              {(activeCategory === 'all' || activeCategory === 'adjective') && visibleAdjectives.length > 0 && (
                <div className="pos-section adjectives-section">
                  <div className="pos-section-header">
                    <div className="pos-section-title-wrap">
                      <span className="pos-icon-badge adjective-badge">A</span>
                      <h3 className="pos-section-title">Adjectives</h3>
                      <span className="pos-count-chip">{visibleAdjectives.length}</span>
                    </div>
                  </div>
                  <div className="vocab-cards-grid">
                    {visibleAdjectives.map(w => (
                      <VocabularyCard
                        key={w.id}
                        item={w}
                        isMastered={masteredIds.has(w.id)}
                        onToggleMaster={onToggleMaster}
                        isReverse={isReverse}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: PHRASES & OTHERS */}
              {(activeCategory === 'all' || activeCategory === 'other') && visibleOthers.length > 0 && (
                <div className="pos-section others-section">
                  <div className="pos-section-header">
                    <div className="pos-section-title-wrap">
                      <span className="pos-icon-badge other-badge">...</span>
                      <h3 className="pos-section-title">Phrases, Connectors & Essentials</h3>
                      <span className="pos-count-chip">{visibleOthers.length}</span>
                    </div>
                  </div>
                  <div className="vocab-cards-grid">
                    {visibleOthers.map(w => (
                      <VocabularyCard
                        key={w.id}
                        item={w}
                        isMastered={masteredIds.has(w.id)}
                        onToggleMaster={onToggleMaster}
                        isReverse={isReverse}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Real-World Context Card displayed seamlessly after learning */}
          {topic.text && (
            <div className="topic-context-culmination-section">
              <TopicRealWorldText topic={topic} />
            </div>
          )}
        </>
      )}

      {/* VIEW 2: Dedicated Real-World Reading Context */}
      {viewTab === 'context' && topic.text && (
        <TopicRealWorldText topic={topic} />
      )}
    </div>
  );
};
