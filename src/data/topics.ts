import type { TopicMeta } from './types';
import { b1Vocabulary } from './vocabulary';

export const B1_TOPICS: TopicMeta[] = [...new Set(b1Vocabulary.map(item => item.t))].map(id => ({
  id,
  name: id.replace(/^b1-/, '').replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
  level: 'B1',
}));

export const ALL_TOPICS = B1_TOPICS;

export const topicById = new Map(ALL_TOPICS.map(topic => [topic.id, topic]));
