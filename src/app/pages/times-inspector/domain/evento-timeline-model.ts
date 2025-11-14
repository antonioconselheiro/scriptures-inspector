import { Dimensao } from "./dimensao-enum";

export interface EventoTimeline {
  titulo: string;

  dataInicioHebraica: {
    ano: number;
    mes: number;
    dia: number;
  };

  dataFimHebraica: {
    ano: number;
    mes: number;
    dia: number;
  };

  dimensao: Dimensao;
  referencias: string[];
}