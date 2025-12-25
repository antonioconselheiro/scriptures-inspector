import { Injectable } from '@angular/core';

// TODO: integrar com tauri
@Injectable({
  providedIn: 'root'
})
export class SystemService {
  chooseFolder(): Promise<string> {
    return Promise.resolve('~/project');
  }

  saveProject(): Promise<void> {
    return Promise.resolve();
  }
}
