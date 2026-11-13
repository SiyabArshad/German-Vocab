import { Award } from 'lucide-react';
import type { VocabularyItem } from '../data/vocabulary';

interface StatsDashboardProps {
  filteredVocab: VocabularyItem[];
  masteredCount: number;
  totalCount: number;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  filteredVocab,
  masteredCount,
  totalCount
}) => {
  const categoryCounts = filteredVocab.reduce(
    (acc, curr) => {
      acc[curr.c] = (acc[curr.c] || 0) + 1;
      return acc;
    },
    { noun: 0, verb: 0, adjective: 0, other: 0 } as Record<VocabularyItem['c'], number>
  );

  const totalFiltered = filteredVocab.length;
  const masterPercentage = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="stats-section">
      {/* Master Progress Bar */}
      <div className="progress-panel">
        <div className="progress-info">
          <div className="progress-title">
            <Award size={18} style={{ display: 'inline', marginRight: '6px', color: '#10b981', verticalAlign: 'text-bottom' }} />
            Mastery Progress
          </div>
          <div className="progress-desc">
            You mastered {masteredCount} out of {totalCount} words
          </div>
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-fill" style={{ width: `${masterPercentage}%` }} />
        </div>
        <div className="progress-percent">{masterPercentage}%</div>
      </div>

      {/* Grid Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-box total">
          <div className="stat-val">{totalFiltered}</div>
          <div className="stat-lbl">Active Set</div>
        </div>
        <div className="stat-box noun">
          <div className="stat-val">{categoryCounts.noun}</div>
          <div className="stat-lbl">Nouns</div>
        </div>
        <div className="stat-box verb">
          <div className="stat-val">{categoryCounts.verb}</div>
          <div className="stat-lbl">Verbs</div>
        </div>
        <div className="stat-box adjective">
          <div className="stat-val">{categoryCounts.adjective}</div>
          <div className="stat-lbl">Adjectives</div>
        </div>
        <div className="stat-box other">
          <div className="stat-val">{categoryCounts.other}</div>
          <div className="stat-lbl">Other</div>
        </div>
      </div>
    </div>
  );
};
