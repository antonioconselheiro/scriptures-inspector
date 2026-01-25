import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '@domain/project-model';
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
      this.router.navigate(['book', book, 'chapter', 1]);
    }
  }
}
