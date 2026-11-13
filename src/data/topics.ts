import type { TopicMeta } from './types';

export const A1_TOPICS: TopicMeta[] = [
  { id: 'a1-k0-1', name: 'Kapitel 0.1: Hallo & Familie', level: 'A1' },
  { id: 'a1-k0-2', name: 'Kapitel 0.2: Zahlen & Alltag', level: 'A1' },
  { id: 'a1-k0-3', name: 'Kapitel 0.3: Sprechen', level: 'A1' },
];

export const A2_TOPICS: TopicMeta[] = [
  { id: 'a2-k1', name: 'Kapitel 1: Und was machst du?', level: 'A2' },
  { id: 'a2-k2', name: 'Kapitel 2: Nach der Schulzeit', level: 'A2' },
  { id: 'a2-k3', name: 'Kapitel 3: Immer online?', level: 'A2' },
  { id: 'a2-k4', name: 'Kapitel 4: Große und kleine Gefühle', level: 'A2' },
  { id: 'a2-k5', name: 'Kapitel 5: Leben in der Stadt', level: 'A2' },
  { id: 'a2-k6', name: 'Kapitel 6: Arbeitswelten', level: 'A2' },
  { id: 'a2-k7', name: 'Kapitel 7: Ganz schön mobil', level: 'A2' },
  { id: 'a2-k8', name: 'Kapitel 8: Gelernt ist gelernt!', level: 'A2' },
  { id: 'a2-k9', name: 'Kapitel 9: Sportlich, sportlich', level: 'A2' },
  { id: 'a2-k10', name: 'Kapitel 10: Zusammen leben', level: 'A2' },
  { id: 'a2-k11', name: 'Kapitel 11: Wie die Zeit vergeht!', level: 'A2' },
  { id: 'a2-k12', name: 'Kapitel 12: Gute Unterhaltung!', level: 'A2' },
];

export const ALL_TOPICS: TopicMeta[] = [...A1_TOPICS, ...A2_TOPICS];

export const topicById = new Map(ALL_TOPICS.map(topic => [topic.id, topic]));
