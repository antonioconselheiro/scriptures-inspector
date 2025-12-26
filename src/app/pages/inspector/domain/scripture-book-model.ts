import { CodexBook } from "../../../domain/codex-book-model";
import { CodexBookChapterVerse } from "../../../domain/codex-book-chapter-verse-model";

export type ScriptureBook<Data extends object = {}> = CodexBook<CodexBookChapterVerse<{ text: string } & Data>>