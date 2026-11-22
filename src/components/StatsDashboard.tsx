import React from 'react';
import { BookOpen, Cloud } from 'lucide-react';
import type { LevelInfo, TopicData } from '../data/types';
import { useAuth } from '../services/useAuth';

interface StatsDashboardProps {
  currentLevel: LevelInfo;
  currentTopic: TopicData | null;
  masteredCount: number;
  totalCount: number;
  onOpenAuth: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  currentLevel,
  currentTopic,
  masteredCount,
  totalCount,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const percentage = Math.round((masteredCount / (totalCount || 1)) * 100);

  return (
    <div className="stats-dashboard-grid">
      {/* Card 1: Active Level & Progress */}
      <div className="stats-card level-stat-card">
        <div className="stat-card-header">
          <span className="stat-badge-pill">{currentLevel.badge}</span>
          <span className="stat-card-title">{currentLevel.label} Level</span>
        </div>
        <div className="stat-number-row">
          <span className="stat-big-number">{masteredCount}</span>
          <span className="stat-divider">/</span>
          <span className="stat-total-number">{totalCount} words</span>
        </div>
        <div className="stat-progress-bar-wrap">
          <div className="stat-progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <div className="stat-sub-info">
          <span>{percentage}% of {currentLevel.badge} Mastered</span>
          <span>{currentLevel.topicCount} Topics</span>
        </div>
      </div>

      {/* Card 2: Current Focus / Topic */}
      <div className="stats-card topic-stat-card">
        <div className="stat-card-header">
          <span className="stat-icon-wrap">
            <BookOpen size={16} />
          </span>
          <span className="stat-card-title">Current Focus</span>
        </div>
        {currentTopic ? (
          <>
            <h4 className="stat-topic-name">#{currentTopic.id} {currentTopic.topic}</h4>
            <div className="stat-topic-breakdown">
              <span>{currentTopic.words.length} words total</span>
              <span>•</span>
              <span>{currentTopic.nouns.length} N</span>
              <span>•</span>
              <span>{currentTopic.verbs.length} V</span>
              <span>•</span>
              <span>{currentTopic.adjectives.length} A</span>
            </div>
          </>
        ) : (
          <>
            <h4 className="stat-topic-name">All {currentLevel.topicCount} Topics</h4>
            <div className="stat-topic-breakdown">
              <span>Browsing all vocabulary in {currentLevel.badge}</span>
            </div>
          </>
        )}
      </div>

      {/* Card 3: Cloud Sync & Account */}
      <div className="stats-card cloud-stat-card" onClick={!user ? onOpenAuth : undefined}>
        <div className="stat-card-header">
          <span className="stat-icon-wrap cloud">
            <Cloud size={16} />
          </span>
          <span className="stat-card-title">Firebase Cloud Sync</span>
        </div>
        {user ? (
          <div className="cloud-status-user">
            <div className="cloud-sync-active">
              <span className="sync-pulse" />
              <span>Real-time Synced</span>
            </div>
            <p className="cloud-user-email">{user.email || (user.isAnonymous ? 'Guest Account' : 'Logged In User')}</p>
          </div>
        ) : (
          <div className="cloud-status-prompt">
            <span className="cloud-prompt-btn">Sign in to sync progress</span>
            <p className="cloud-prompt-hint">Save your learned words across devices</p>
          </div>
        )}
      </div>
    </div>
  );
};
