import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { Project } from '@domain/project-model';
import { LoadingObservable, LoadingState } from '@shared/loading/loading-observable';
import { setProjectFn } from '@shared/project/set-project-fn';
import { getProjectFn } from '@shared/project/get-project-fn';
import { selectPngFilesFn } from '@shared/project/select-png-files-fn';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { SystemService } from '@shared/system/system-service';
import { Subscription } from 'rxjs';
import { MainDialogComponent } from './shared/main-dialog/main-dialog';
import { FindInPage } from './shared/find-in-page/find-in-page';
import { ToolboxVisibilityService } from './shared/toolbox/toolbox-visibility-service';
import { TextSizeControllerToolbox } from './shared/text-size-controller-toolbox/text-size-controller-toolbox';
import { AddArtifactCollectionDialog } from './shared/add-artifact-collection-dialog/add-artifact-collection-dialog';
import { EditArtifactsInCollectionDialog } from './shared/edit-artifacts-in-collection-dialog/edit-artifacts-in-collection-dialog';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AsyncModalModule,
    MainDialogComponent,
    FindInPage,
    TextSizeControllerToolbox
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  private removeToolboxListener: (() => void) | null = null;
  private removeProjectMenuListener: (() => void) | null = null;
  loading: LoadingState = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalService: ModalService,
    private systemService: SystemService,
    private collectionsStatefull: CollectionsStatefull,
    private toolboxVisibility: ToolboxVisibilityService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.subscribeLoading();
    void window.api.getToolboxVisibility()
      .then(visibility => this.ngZone.run(() => this.toolboxVisibility.setAll(visibility)))
      .catch(error => console.error('Unable to load toolbox visibility:', error));
    this.removeToolboxListener = window.api.onToggleToolbox((toolbox, visible) => {
      this.ngZone.run(() => this.toolboxVisibility.setVisible(toolbox, visible));
    });
    this.removeProjectMenuListener = window.api.onOpenProjectMenuAction(action => {
      if (action === 'save-project') {
        this.ngZone.run(() => {
          void this.systemService.saveCurrentPageImmediately().catch(error => {
            console.error('Unable to save the project:', error);
          });
        });
      } else if (action === 'artifact-collections' || action === 'import-artifact-images') {
        this.ngZone.run(() => {
          void this.openArtifactMenuAction(action);
        });
      }
    });
    window.api.onProjectFileOpened(filePath => {
      void this.openProjectFile(filePath);
    });
    void this.initializeStartup();
  }

  private async openArtifactMenuAction(action: 'artifact-collections' | 'import-artifact-images'): Promise<void> {
    const project = getProjectFn();
    if (!project || !/^\/(translator|transcriptor)\//.test(this.router.url)) {
      alert('Open a project before managing artifact collections.');
      return;
    }

    if (action === 'artifact-collections') {
      this.collectionsStatefull.update(project);
      this.modalService.createModal(AddArtifactCollectionDialog)
        .setBindToRoute(this.router)
        .setOutletName('main')
        .setData({ title: 'Artifact Collections', project })
        .build();
      return;
    }

    try {
      const fromFiles = await selectPngFilesFn();
      if (!fromFiles?.length) {
        return;
      }
      if (getProjectFn()?.path !== project.path || !/^\/(translator|transcriptor)\//.test(this.router.url)) {
        alert('The project changed while selecting images. Please try again.');
        return;
      }
      this.modalService.createModal(EditArtifactsInCollectionDialog)
        .setBindToRoute(this.router)
        .setOutletName('main')
        .setData({ title: 'Import Artifact Images', fromFiles, project })
        .build();
    } catch (error) {
      console.error('Unable to select artifact images:', error);
      alert('Unable to select artifact images. Check the console for details.');
    }
  }

  ngOnDestroy(): void {
    this.removeToolboxListener?.();
    this.removeProjectMenuListener?.();
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
        maximizeWindow = true;
        await this.loadProjectAndNavigate(filePath);
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
    const maximizeWindow = true;
    try {
      await this.loadProjectAndNavigate(filePath);
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
    window.api.applicationStartupReady(maximizeWindow);
  }

  private async loadProjectAndNavigate(filePath: string): Promise<void> {
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
  }

  private async navigateToWelcome(): Promise<void> {
    const navigated = await this.router.navigateByUrl('/welcome');
    if (!navigated) {
      throw new Error('The welcome route was not activated');
    }
  }
}
