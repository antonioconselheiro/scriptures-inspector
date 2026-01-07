import { BookVerse } from './book-verse-model';
import { CodexRecord } from './codex-record';

export type CustomTranslation = CodexRecord<object, BookVerse<{ text: string, metadata?: string[] }>>;
