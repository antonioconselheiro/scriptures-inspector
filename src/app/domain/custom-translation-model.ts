import { CodexBookVerse } from './codex-book-verse-model';
import { Codex } from './codex-model';

export type CustomTranslation = Codex<object, CodexBookVerse<{ text: string, metadata?: string[] }>>;
