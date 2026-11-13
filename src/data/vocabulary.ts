import a1Data from './a1.json';
import a2Data from './a2.json';
import type { VocabularyItem } from './types';

export type { VocabularyItem, VocabCategory, VocabLevel, TopicMeta } from './types';

export const a1Vocabulary = a1Data as VocabularyItem[];
export const a2Vocabulary = a2Data as VocabularyItem[];

export const combinedVocabulary: VocabularyItem[] = [
  ...a1Vocabulary,
  ...a2Vocabulary,
];
