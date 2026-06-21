import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'functionProxy'
})
export class FunctionProxyPipe implements PipeTransform {

  transform(value: string, fn: (v: string) => any): string {
    return String(fn(value));
  }

}
