import { Codex } from "../../../domain/codex-model";
import { CodexBookVerse } from "../../../domain/codex-book-verse-model";

export type OldTestmentScriptures<Data extends object = {}> = Codex<CodexBookVerse<{ text: string } & Data>>;
