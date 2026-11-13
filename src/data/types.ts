export type VocabCategory = 'noun' | 'verb' | 'adjective' | 'other';
export type VocabLevel = 'A1' | 'A2';

export interface VocabularyItem {
  id: string;
  w: string;
  e: string;
  c: VocabCategory;
  l: VocabLevel;
  t: string;
  x: string;
}

export interface TopicMeta {
  id: string;
  name: string;
  level: VocabLevel;
}
