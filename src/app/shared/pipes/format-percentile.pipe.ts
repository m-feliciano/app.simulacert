import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPercentile',
  standalone: true
})
export class FormatPercentilePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (!value) return '0';

    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  }
}
