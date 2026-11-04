import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
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

  private async openProjectFile(filePath: string): Promise<void> {
    LoadingObservable.startLoading();
    try {
      const project = await this.systemService.loadProjectFromPath(filePath);
      if (!project) {
        return;
      }

      setProjectFn(project);
      const [book] = Object.keys(project.target.books || {});
      if (book) {
        await this.router.navigate(['translator', 'book', book, 'chapter', 1]);
      } else {
        await this.router.navigate(['welcome']);
      }
    } catch (error) {
      console.error('Unable to open project passed to the running application:', error);
    } finally {
      LoadingObservable.stopLoading();
    }
  }
}
