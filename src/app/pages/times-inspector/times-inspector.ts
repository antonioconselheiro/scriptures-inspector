import { Component } from '@angular/core';
import { Dimensao } from './domain/dimensao-enum';
import { EventoTimeline } from './domain/evento-timeline-model';
import { EventForm } from './event-form/event-form';

@Component({
  selector: 'app-times-inspector',
  imports: [
    EventForm
  ],
  templateUrl: './times-inspector.html',
  styleUrl: './times-inspector.scss'
})
export class TimesInspector {

  dimensoes = Dimensao;

  eventos: EventoTimeline[] = [];

  mostrarForm = false;

  adicionarEvento(evt: EventoTimeline) {
    this.eventos.push(evt);
    this.mostrarForm = false;
  }
}
