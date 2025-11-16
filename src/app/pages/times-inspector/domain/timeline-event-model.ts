import { TimelineDimension } from "./timeline-dimension-enum";
import { TimelineEventTime } from "./timeline-event-time-model";
import { TimelinePlace } from "./timeline-place-model";
import { TimelineType } from "./timeline-type-enum";

export interface TimelineEvent {
  id: string;
  title: string;
  time: TimelineEventTime;
  timeline: string;
  type: TimelineType;
  dimension: TimelineDimension;
  place: TimelinePlace;

// -> data de inicio;
// -> data de termino (opcional);
// -> posição ou área geográfica (opcional);
// -> referências internas (aponta para outro evento registrado): consumação de profecia em nível do povo, consumação de profecia em nível do Messias;
// -> referências externas (historiograficas ou proféticas);
}
