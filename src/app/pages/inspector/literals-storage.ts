import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LiteralsStorage {

  private literals: Record<string, string> = {};
  private pattern: Record<string, string> = {};

  constructor() {
    try {
      this.literals = JSON.parse(localStorage.getItem('literals') || '{}');
      this.pattern = JSON.parse(localStorage.getItem('pattern') || '{}');
    } catch {

    }
  }

  getLiteral(): Record<string, string> {
    return this.literals;
  }

  addLiteral(hebrew: string, literal: string): void {
    this.literals[hebrew] = literal;
    localStorage.setItem('literals', JSON.stringify(this.literals));
  }

  getPattern(): Record<string, string> {
    return this.pattern;
  }

  addPattern(pattern: string, value: string): void {
    this.pattern[pattern] = value;
    localStorage.setItem('pattern', JSON.stringify(this.pattern));
  }

  deletePattern(pattern: string): void {
    delete this.pattern[pattern];
    localStorage.setItem('pattern', JSON.stringify(this.pattern));
  }
}
