import React, { useState } from 'react';
import { Search, BookOpen, CheckCircle } from 'lucide-react';
import type { TopicData } from '../data/types';

interface TopicSelectorProps {
  topics: TopicData[];
  selectedTopicId: number | 'all';
  onSelectTopic: (id: number | 'all') => void;
  masteredIds: Set<string>;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic,
  masteredIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = topics.filter(t =>
    t.topic.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    String(t.id).includes(searchQuery.trim())
  );

  return (
    <div className="topic-selector-container">
      <div className="topic-selector-header">
        <div className="topic-search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search topics (e.g. Familie, Reise, Beruf)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="topic-filter-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className={`all-topics-btn ${selectedTopicId === 'all' ? 'active' : ''}`}
          onClick={() => onSelectTopic('all')}
        >
          <BookOpen size={16} />
          <span>All Topics ({topics.length})</span>
        </button>
      </div>

      <div className="topic-cards-scroller">
        {filteredTopics.map(topic => {
          const masteredCount = topic.words.filter(w => masteredIds.has(w.id)).length;
          const percent = Math.round((masteredCount / topic.words.length) * 100) || 0;
          const isSelected = selectedTopicId === topic.id;
          const isComplete = masteredCount === topic.words.length && topic.words.length > 0;

          return (
            <div
              key={topic.id}
              className={`topic-tile ${isSelected ? 'selected' : ''} ${isComplete ? 'completed' : ''}`}
              onClick={() => onSelectTopic(topic.id)}
            >
              <div className="topic-tile-top">
                <span className="topic-tile-id">#{topic.id}</span>
                {isComplete ? (
                  <span className="topic-tile-done" title="Topic 100% Mastered!">
                    <CheckCircle size={14} /> Mastered
                  </span>
                ) : (
                  <span className="topic-tile-stats">
                    {masteredCount}/{topic.words.length}
                  </span>
                )}
              </div>

              <h4 className="topic-tile-title">{topic.topic}</h4>

              <div className="topic-tile-meta">
                <span>{topic.nouns.length} N</span>
                <span>•</span>
                <span>{topic.verbs.length} V</span>
                <span>•</span>
                <span>{topic.adjectives.length} A</span>
              </div>

              <div className="topic-tile-progress-track">
                <div
                  className="topic-tile-progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
