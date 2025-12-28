import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';
import { Codex } from './codex-model';

export type CustomTranslation = Codex<{}, CodexBookChapterVerse<{ text: string, metadata?: string[] }>>;
