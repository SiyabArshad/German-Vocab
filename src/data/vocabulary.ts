import b1Data from './b1_vocab.json';
import type { VocabularyItem } from './types';

export type { VocabularyItem, VocabCategory, VocabLevel, TopicMeta } from './types';

export const b1Vocabulary = b1Data as VocabularyItem[];
