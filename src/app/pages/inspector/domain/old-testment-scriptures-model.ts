import { CodexRecord } from "../../../domain/codex-record";
import { BookVerse } from "../../../domain/book-verse-model";

export type OldTestmentScriptures<Data extends object = {}> = CodexRecord<BookVerse<{ text: string } & Data>>;
