import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToolboxId } from './toolbox-id-type';

@Injectable({
  providedIn: 'root'
})
export class ToolboxVisibilityService {

  readonly pageNavigationVisible$ = new BehaviorSubject(true);
  readonly codexNavigationVisible$ = new BehaviorSubject(true);
  readonly textSizeControllerVisible$ = new BehaviorSubject(false);

  setVisible(toolbox: ToolboxId, visible: boolean): void {
    if (toolbox === 'page-navigation') {
      this.pageNavigationVisible$.next(visible);
    } else if (toolbox === 'codex-navigation') {
      this.codexNavigationVisible$.next(visible);
    } else {
      this.textSizeControllerVisible$.next(visible);
    }
  }

  setAll(visibility: {
    pageNavigation: boolean;
    codexNavigation: boolean;
    textSizeController: boolean;
  }): void {
    this.pageNavigationVisible$.next(visibility.pageNavigation);
    this.codexNavigationVisible$.next(visibility.codexNavigation);
    this.textSizeControllerVisible$.next(visibility.textSizeController);
  }
}
