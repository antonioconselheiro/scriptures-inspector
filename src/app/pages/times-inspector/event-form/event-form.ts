import { Component, EventEmitter, Output } from '@angular/core';
import { Dimensao } from '../domain/dimensao-enum';
import { EventoTimeline } from '../domain/evento-timeline-model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-form',
  imports: [FormsModule],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss'
})
export class EventForm {
  @Output() salvar = new EventEmitter<EventoTimeline>();
  @Output() cancelar = new EventEmitter<void>();

  dimensoes = Object.values(Dimensao);

  modelo = {
    titulo: '',
    dimensao: Dimensao.MATERIAL,
    dataInicio: { ano: 5784, mes: 1, dia: 1 },
    dataFim: { ano: 5784, mes: 1, dia: 1 },
    referencias: ''
  };

  submit() {
    this.salvar.emit({
      titulo: this.modelo.titulo,
      dimensao: this.modelo.dimensao,
      dataInicioHebraica: this.modelo.dataInicio,
      dataFimHebraica: this.modelo.dataFim,
      referencias: this.modelo.referencias.split(',').map(r => r.trim())
    });
  }
}
