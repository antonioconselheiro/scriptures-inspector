import { Component } from '@angular/core';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { NewProjectDialog } from './new-project-dialog/new-project-dialog';

@Component({
  imports: [
    AsyncModalModule
  ],
  selector: 'app-projects-component',
  templateUrl: './projects-component.html',
  styleUrl: './projects-component.scss'
})
export class ProjectsComponent {

  constructor(
    private modalService: ModalService
  ) { }

  onClickNewProject(): void {
    this.modalService
      .createModal(NewProjectDialog)
      .setOutletName('main')
      .setData({ })
      .build()
      .subscribe({
        next: () => {}
      });
  }
}
