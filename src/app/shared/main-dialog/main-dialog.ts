import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AsyncModalModule, ModalBuilder, ModalOutletComponent } from '@belomonte/async-modal-ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-dialog',
  imports: [AsyncModalModule],
  templateUrl: './main-dialog.html',
  styleUrl: './main-dialog.scss'
})
export class MainDialogComponent implements OnInit, OnDestroy {

  @ViewChild(ModalOutletComponent)
  modal!: ModalOutletComponent;

  @ViewChild('dialogPanel')
  dialogPanel!: ElementRef<HTMLElement>;

  title = '';
  dialogPosition: { left: number; top: number } | null = null;

  @HostBinding('class.hidden')
  isClosed = true;

  private subscriptions = new Subscription();
  private activePointerId: number | null = null;
  private dragOffset = { x: 0, y: 0 };

  ngOnInit(): void {
    this.subscribeModalData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeModalData(): void {
    this.subscriptions.add(ModalBuilder.modalInject$.subscribe({
      next: metadata => {
        this.dialogPosition = null;
        //  casting from unknown
        const data = Object(metadata.data);
        if ('title' in data) {
          this.title = data.title;
        }
      }
    }));
  }

  startDragging(event: PointerEvent): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) {
      return;
    }

    const bounds = this.dialogPanel.nativeElement.getBoundingClientRect();
    this.dialogPosition = { left: bounds.left, top: bounds.top };
    this.dragOffset = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    this.activePointerId = event.pointerId;
    event.preventDefault();
  }

  @HostListener('document:pointermove', ['$event'])
  moveDialog(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    const { width, height } = this.dialogPanel.nativeElement.getBoundingClientRect();
    this.dialogPosition = {
      left: Math.max(0, Math.min(event.clientX - this.dragOffset.x, window.innerWidth - width)),
      top: Math.max(0, Math.min(event.clientY - this.dragOffset.y, window.innerHeight - height))
    };
  }

  @HostListener('document:pointerup', ['$event'])
  stopDragging(event: PointerEvent): void {
    if (event.pointerId === this.activePointerId) {
      this.activePointerId = null;
    }
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.modal.closeModal();
  }
}
