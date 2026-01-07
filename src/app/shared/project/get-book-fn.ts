import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { SourceBook } from '@domain/source-book-model';

export async function getBookFn(source: string, book: string): Promise<SourceBook> {
const http = inject(HttpClient);
}
