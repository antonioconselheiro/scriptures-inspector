import { Pipe, PipeTransform } from '@angular/core';
import { GematriaService } from './gematria.service';

@Pipe({
  name: 'gematrics'
})
export class GematricsPipe implements PipeTransform {

  constructor(
    private gematriaService: GematriaService
  ) {}

  transform(value: string): number {
    return this.gematriaService.toNumbers(value);
  }

}
