import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '@domain/project-model';
import { LoadingObservable } from '@shared/loading/loading-service';
import { getProjectFn } from '@shared/project/get-project-fn';
import { setProjectFn } from '@shared/project/set-project-fn';
import { SystemService } from '@shared/system/system-service';

@Component({
  selector: 'app-open-component',
  imports: [],
  templateUrl: './open-component.html',
  styleUrl: './open-component.scss',
})
export class OpenComponent implements OnInit {

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private systemService: SystemService
  ) { }

  ngOnInit(): void {
    const project = getProjectFn();
    if (project) {
      this.redirect(project);
    }
  }

  openProject(): void {
    this.systemService
      .loadProject()
      .then(project => {
        if (project) {
          setProjectFn(project);
          this.redirect(project);
        }
      });
  }

  redirect(project: Project): void {
    const [book] = Object.keys(project.target.books);
    if (book) {
      const path = [ 'editor', 'book', book, 'chapter', 1 ];
      console.log(`[navigate]`, path.join('/'));

      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(e => console.error(e))
        .finally(() => LoadingObservable.waitThenStopLoading(() => this.cdr.markForCheck()));
    }
  }
}
