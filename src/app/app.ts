import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainDialogComponent } from './shared/main-dialog/main-dialog';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';

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
