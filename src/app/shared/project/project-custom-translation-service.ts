import { Injectable } from '@angular/core';
import { SystemService } from '@shared/system/system-service';
import { ProjectService } from './project-service';

@Injectable({
  providedIn: 'root'
})
export class ProjectCustomTranslationService {
  constructor(
    private projectService: ProjectService,
    private systemService: SystemService
  ) { }
}
