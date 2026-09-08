import { Injectable } from '@angular/core';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { loadProjectCollectionsFn } from '@shared/project/load-project-collections-fn';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionsStatefull {
  data$ = new Subject<Array<FragmentCollection>>();
  currentValue: Array<FragmentCollection> = [];
  
  update(project: Project): void {
    const oldValue = JSON.stringify(this.currentValue);
    loadProjectCollectionsFn(project)
      .then(collections => {
        this.currentValue = collections || [];
        const newValue = JSON.stringify(this.currentValue);

        if (oldValue !== newValue) {
          this.data$.next(this.currentValue);
        }
      })
      .catch(e => console.error(e));
  }
}
