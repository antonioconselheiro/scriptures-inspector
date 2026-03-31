import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingObservable {
  static loading$ = new Subject<boolean>();

  static startLoading(): void {
    this.loading$.next(true);
  }

  static stopLoading(): void {
    this.loading$.next(false);
  }

  static waitThenStopLoading(callback?: Function): void {
    const waitTime = 0;
    setTimeout(() => {
      this.stopLoading();
      callback && callback();
    }, waitTime);
  }
}
