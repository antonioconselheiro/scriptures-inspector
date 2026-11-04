import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { Project } from '@domain/project-model';
import { LoadingObservable } from '@shared/loading/loading-observable';
import { setProjectFn } from '@shared/project/set-project-fn';
import { SystemService } from '@shared/system/system-service';
import { Subscription } from 'rxjs';
import { MainDialogComponent } from './shared/main-dialog/main-dialog';
import { FindInPage } from './shared/find-in-page/find-in-page';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AsyncModalModule,
    MainDialogComponent,
    FindInPage
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  loading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.subscribeLoading();
    window.api.onProjectFileOpened(filePath => {
      void this.openProjectFile(filePath);
    });
    void this.initializeStartup();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeLoading(): void {
    this.subscriptions.add(
      LoadingObservable.loading$
        .subscribe(loading => {
          this.loading = loading;
          this.cdr.markForCheck();
        })
    );
  }

  private async initializeStartup(): Promise<void> {
    let maximizeWindow = false;
    try {
      const filePath = await window.api.initializeProjectOpening();
      if (filePath) {
        maximizeWindow = await this.loadProjectAndNavigate(filePath);
      } else {
        await this.navigateToWelcome();
      }
    } catch (error) {
      console.error('Unable to initialize the application:', error);
      try {
        await this.navigateToWelcome();
      } catch (navigationError) {
        console.error('Unable to display the welcome screen:', navigationError);
      }
    } finally {
      await this.notifyStartupCompleteAfterRender(maximizeWindow);
    }
  }

  private async openProjectFile(filePath: string): Promise<void> {
    let maximizeWindow = false;
    try {
      maximizeWindow = await this.loadProjectAndNavigate(filePath);
    } catch (error) {
      console.error('Unable to open project passed to the running application:', error);
      try {
        await this.navigateToWelcome();
      } catch (navigationError) {
        console.error('Unable to display the welcome screen:', navigationError);
      }
    } finally {
      await this.notifyStartupCompleteAfterRender(maximizeWindow);
    }
  }

  private async notifyStartupCompleteAfterRender(maximizeWindow: boolean): Promise<void> {
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    window.api.applicationStartupComplete(maximizeWindow);
  }

  private async loadProjectAndNavigate(filePath: string): Promise<boolean> {
    const project: Project | null = await this.systemService.loadProjectFromPath(filePath);
    if (!project) {
      throw new Error(`No project data found in "${filePath}"`);
    }

    setProjectFn(project);
    const [book] = Object.keys(project.target.books || {});
    const route = book
      ? `/translator/book/${encodeURIComponent(book)}/chapter/1`
      : '/welcome';
    const navigated = await this.router.navigateByUrl(route);
    if (!navigated) {
      throw new Error(`Unable to navigate to "${route}"`);
    }
    return Boolean(book);
  }

  private async navigateToWelcome(): Promise<void> {
    const navigated = await this.router.navigateByUrl('/welcome');
    if (!navigated) {
      throw new Error('The welcome route was not activated');
    }
  }
}
