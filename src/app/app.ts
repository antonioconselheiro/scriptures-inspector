import { provideHttpClient, withFetch } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
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
export class App {
}
