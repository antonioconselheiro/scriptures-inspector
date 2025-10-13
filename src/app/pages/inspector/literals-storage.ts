import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LiteralsStorage {
  literals: Record<string, string> = {};

  constructor() {
    try {
      this.literals = JSON.parse(localStorage.getItem('literals') || '{}');
    } catch {

    }
  }

  getLiteral(): Record<string, string> {
    return this.literals;
  }

  addLiteral(hebrew: string, literal: string) {
    this.literals[hebrew] = literal;
    localStorage.setItem('literals', JSON.stringify(this.literals))
  }
}
