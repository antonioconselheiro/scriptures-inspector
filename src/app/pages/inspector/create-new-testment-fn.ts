import { NewTestamentBooksUnion } from "../../domain/new-testament-books-union";

export function createNewTestmentObjectBase(): { [newBook in NewTestamentBooksUnion]: Array<any> } {
  return {
    'MAT': [],
    'MAR': [],
    'LUC': [],
    'JOA': [],
    'ATO': [],
    'ROM': [],
    '1CO': [],
    '2CO': [],
    'GAL': [],
    'EFE': [],
    'FIL': [],
    'COL': [],
    '1TS': [],
    '2TS': [],
    '1TM': [],
    '2TM': [],
    'TIT': [],
    'FLM': [],
    'HEB': [],
    'TIA': [],
    '1PE': [],
    '2PE': [],
    '1JO': [],
    '2JO': [],
    '3JO': [],
    'JUD': [],
    'APO': []
  };
}