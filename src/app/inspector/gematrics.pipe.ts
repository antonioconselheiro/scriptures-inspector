import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gematrics'
})
export class GematricsPipe implements PipeTransform {

  transform(value: string): number {
    return 1;
  }

}
