import { Codex } from "../../../domain/codex-model";
import { CodexBookChapterVerse } from "../../../domain/codex-book-chapter-verse-model";

export type OldTestmentScriptures<Data extends object = {}> = Codex<CodexBookChapterVerse<{ text: string } & Data>>;
