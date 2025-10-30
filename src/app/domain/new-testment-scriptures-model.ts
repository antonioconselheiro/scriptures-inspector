import { NewBook } from '../pages/inspector/new-book-enum';
import { ScriptureBook } from './scripture-book-model';

export type NewTestmentScriptures = {
  [newBook in NewBook]: ScriptureBook
}
