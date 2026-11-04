import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Toolbox } from '@shared/toolbox/toolbox';

@Component({
  selector: 'app-pending-lexicon-navigation-toolbox',
  imports: [Toolbox],
  templateUrl: './pending-lexicon-navigation-toolbox.html',
  styleUrl: './pending-lexicon-navigation-toolbox.scss'
})
export class PendingLexiconNavigationToolbox {

  @Input() visible = false;
  @Input() pendingCount = 0;
  @Input() focusedNumber = 0;
  @Output() navigate = new EventEmitter<-1 | 1>();
}
