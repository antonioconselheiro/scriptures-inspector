  const charWeight: {
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
	};

function getLetterWeight(letter: string) {
  var weight = charWeight[letter] || 0;
  if (weight > 400) {
    weight = weight - 400;
  }
  return weight;
}

export function hebrewGematriaFn(text: string): number {
  const letter = text.replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\s]/g, "").split('');
  let totalWeight = 0;
  for (let l in letter) {
    totalWeight += getLetterWeight(letter[l]);
  }

  return totalWeight;
}
