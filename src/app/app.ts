import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { LoadingObservable } from '@shared/loading/loading-service';
import { Subscription } from 'rxjs';
import { MainDialogComponent } from './shared/main-dialog/main-dialog';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AsyncModalModule,
    MainDialogComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  loading = false;

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscribeLoading();
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
}
