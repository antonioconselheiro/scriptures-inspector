import { Component, HostListener, Input } from '@angular/core';
import { ToolboxCorner } from './toolbox-corner-type';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.html',
  styleUrl: './toolbox.scss'
})
export class Toolbox {

  @Input() title = '';
  @Input() visible = true;
  @Input() corner: ToolboxCorner = 'top-right';

  position: { left: number; top: number } | null = null;
  private activePointerId: number | null = null;
  private dragOffset = { x: 0, y: 0 };
  private draggedElement: HTMLElement | null = null;

  startDragging(event: PointerEvent): void {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) {
      return;
    }

    const element = (event.currentTarget as HTMLElement).parentElement;
    if (!element) {
      return;
    }
    const bounds = element.getBoundingClientRect();

    this.position = { left: bounds.left, top: bounds.top };
    this.dragOffset = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    this.activePointerId = event.pointerId;
    this.draggedElement = element;
    event.preventDefault();
  }

  @HostListener('document:pointermove', ['$event'])
  move(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    const bounds = this.draggedElement?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    this.position = {
      left: Math.max(0, Math.min(event.clientX - this.dragOffset.x, window.innerWidth - bounds.width)),
      top: Math.max(0, Math.min(event.clientY - this.dragOffset.y, window.innerHeight - bounds.height))
    };
  }

  @HostListener('document:pointerup', ['$event'])
  stopDragging(event: PointerEvent): void {
    if (event.pointerId === this.activePointerId) {
      this.activePointerId = null;
      this.draggedElement = null;
    }
  }

  @HostListener('document:pointercancel', ['$event'])
  cancelDragging(event: PointerEvent): void {
    this.stopDragging(event);
  }
}
