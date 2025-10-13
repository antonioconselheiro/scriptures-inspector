import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GematriaService {

  private readonly weight: {
    [char: string]: number
  } = {
		' ': 0,
		'א': 1,
		'ב': 2,
		'ג': 3,
		'ד': 4,
		'ה': 5,
		'ו': 6,
		'ז': 7,
		'ח': 8,
		'ט': 9,
		'י': 10,
		'כ': 20,
		'ל': 30,
		'מ': 40,
		'נ': 50,
		'ס': 60,
		'ע': 70,
		'פ': 80,
		'צ': 90,
		'ק': 100,
		'ר': 200,
		'ש': 300,
		'ת': 400,
		'ך': 420,
		'ם': 440,
		'ן': 450,
		'ף': 480,
		'ץ': 490,
	}

  toNumbers(hebrew: string): number {
		var letter = hebrew.replace(/\s/g, '').split('');
		var totalWeight = 0;
		for (let l in letter) {
			totalWeight += this.getLetterWeight(letter[l]);
		}

		return totalWeight;
	}

	private getLetterWeight(letter: string) {
		var weight = this.weight[letter] || 0;
		if (weight > 400) {
			weight = weight - 400;
		}
		return weight;
	}

}
