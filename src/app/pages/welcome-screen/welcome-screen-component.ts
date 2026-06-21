import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { Project } from '@domain/project-model';
import { LoadingObservable } from '@shared/loading/loading-service';
import { getProjectFn } from '@shared/project/get-project-fn';
import { setProjectFn } from '@shared/project/set-project-fn';
import { SystemService } from '@shared/system/system-service';
import { CreateProjectDialog } from './create-project-dialog/create-project-dialog';

@Component({
  selector: 'welcome-screen-component',
  imports: [
    AsyncModalModule
  ],
  templateUrl: './welcome-screen-component.html',
  styleUrl: './welcome-screen-component.scss',
})
export class WelcomeScreenComponent implements OnInit {

  constructor(
    private router: Router,
    private modalService: ModalService,
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

  createProject(): void {
      this.modalService
        .createModal(CreateProjectDialog)
        .setOutletName('main')
        .build();
        //  TODO: redirecionar para o editor?
  }

  redirect(project: Project): void {
    const [book] = Object.keys(project.target.books);
    if (book) {
      const path = [ 'translator', 'book', book, 'chapter', 1 ];
      console.log(`[navigate]`, path.join('/'));

      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(e => console.error(e))
        .finally(() => LoadingObservable.stopLoading());
    }
  }
}
