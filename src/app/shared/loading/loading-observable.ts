import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LoadingMode } from '@domain/loading-mode-type';
import { LoadingState } from '@domain/loading-state-type';
export type { LoadingMode } from '@domain/loading-mode-type';
export type { LoadingState } from '@domain/loading-state-type';

@Injectable({
  providedIn: 'root',
})
export class LoadingObservable {
  private static readonly minimumSaveAnimationDuration = 1500;
  private static loadingGeneration = 0;
  private static loadingStartedAt: number | null = null;
  private static loadingMode: LoadingMode | null = null;

  static loading$ = new Subject<LoadingState>();

  static startLoading(mode: LoadingMode = 'normal'): void {
    this.loadingGeneration++;
    this.loadingMode = mode;
    this.loadingStartedAt = Date.now();
    this.loading$.next(mode);
  }

  static async stopLoading(): Promise<void> {
    const generation = this.loadingGeneration;
    const startedAt = this.loadingStartedAt;
    const mode = this.loadingMode;

    if (mode === 'save' && startedAt !== null) {
      const remainingDuration = this.minimumSaveAnimationDuration - (Date.now() - startedAt);
      if (remainingDuration > 0) {
        await new Promise<void>(resolve => setTimeout(resolve, remainingDuration));
      }
    }

    if (generation !== this.loadingGeneration) {
      return;
    }

    this.loadingMode = null;
    this.loadingStartedAt = null;
    this.loading$.next(false);
  }
}
