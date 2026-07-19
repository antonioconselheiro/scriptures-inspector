const books = [
  {"html":"gen","name":"Genesis"},
  {"html":"exo","name":"Exodus"},
  {"html":"lev","name":"Leviticus"},
  {"html":"num","name":"Numbers"},
  {"html":"deu","name":"Deuteronomy"},
  {"html":"jsb","name":"Joshua B"},
  {"html":"jsa","name":"Joshua A"},
  {"html":"jdb","name":"Judges B"},
  {"html":"jda","name":"Judges A"},
  {"html":"rut","name":"Ruth"},
  {"html":"sa1","name":"1 Samuel"},
  {"html":"sa2","name":"2 Samuel"},
  {"html":"kg1","name":"1 Kings"},
  {"html":"kg2","name":"2 Kings"},
  {"html":"ch1","name":"1 Chronicles"},
  {"html":"ch2","name":"2 Chronicles"},
  {"html":"es1","name":"1 Esdras"},
  {"html":"es2","name":"2 Esdras"},
  {"html":"est","name":"Esther"},
  {"html":"jdt","name":"Judith"},
  {"html":"toa","name":"Tobit BA"},
  {"html":"tos","name":"Tobit S"},
  {"html":"ma1","name":"1 Macabees"},
  {"html":"ma2","name":"2 Macabees"},
  {"html":"ma3","name":"3 Macabees"},
  {"html":"ma4","name":"4 Macabees"},
  {"html":"psa","name":"Psalms"},
  {"html":"ode","name":"Odes"},
  {"html":"pro","name":"Proverbs"},
  {"html":"ecc","name":"Ecclesiastes"},
  {"html":"sol","name":"Song of Solomon"},
  {"html":"job","name":"Job"},
  {"html":"wis","name":"Wisdom"},
  {"html":"sir","name":"Sirach"},
  {"html":"pss","name":"Psalms of Solomon"},
  {"html":"hos","name":"Hosea"},
  {"html":"mic","name":"Micah"},
  {"html":"amo","name":"Amos"},
  {"html":"joe","name":"Joel"},
  {"html":"jon","name":"Jonah"},
  {"html":"oba","name":"Obadiah"},
  {"html":"nah","name":"Nahum"},
  {"html":"hab","name":"Habakkuk"},
  {"html":"zep","name":"Zephaniah"},
  {"html":"hag","name":"Haggai"},
  {"html":"zac","name":"Zechariah"},
  {"html":"mal","name":"Malachi"},
  {"html":"isa","name":"Isaiah"},
  {"html":"jer","name":"Jeremiah"},
  {"html":"bar","name":"Baruch"},
  {"html":"epj","name":"Epistle of Jeremiah"},
  {"html":"lam","name":"Lamentations"},
  {"html":"eze","name":"Ezekiel"},
  {"html":"bel","name":"Bel and the Dragon"},
  {"html":"bet","name":"Bel and the Dragon Th"},
  {"html":"dan","name":"Daniel"},
  {"html":"dat","name":"Daniel Th"},
  {"html":"sus","name":"Susanna"},
  {"html":"sut","name":"Susanna Th"}
];

const baseUrl = "https://www.sacred-texts.com/bib/sep/";
books.forEach(book => {
  fetch(`${baseUrl}${book.html}.htm`)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const links = [...doc.querySelectorAll('p > a:nth-child(1)')].filter(a => /\d{1,4}/.test(a.getAttribute('href')));
      const sections = links.map(link => {
        const regex = new RegExp(`^${book.html}|\.htm$`, 'g');
        const chapter = link.getAttribute('href').replace(regex, '');
        const verses = link.parentElement.querySelectorAll('a');
        const lastVerse = verses[verses.length - 1].innerText;
        const chapterNumber = parseFloat(chapter);
        const lastVerseNumber = parseFloat(lastVerse);

        return `${chapterNumber} (${lastVerseNumber})`;
      });
      console.log(`Book: ${book.name}, Sections: ${sections.join(', ')}`);
    })
    .catch(error => console.error(`Error fetching ${book.name}:`, error));
});

/**
Book: Genesis, Sections: 1 (31), 2 (25), 3 (24), 4 (26), 5 (32), 6 (22), 7 (24), 8 (22), 9 (29), 10 (32), 11 (32), 12 (20), 13 (18), 14 (24), 15 (21), 16 (16), 17 (27), 18 (33), 19 (38), 20 (18), 21 (34), 22 (24), 23 (20), 24 (67), 25 (34), 26 (35), 27 (46), 28 (22), 29 (35), 30 (43), 31 (54), 32 (33), 33 (20), 34 (31), 35 (29), 36 (43), 37 (36), 38 (30), 39 (23), 40 (23), 41 (57), 42 (38), 43 (34), 44 (34), 45 (28), 46 (34), 47 (31), 48 (22), 49 (33), 50 (26)
Book: Exodus, Sections: 1 (22), 2 (25), 3 (22), 4 (31), 5 (23), 6 (30), 7 (29), 8 (28), 9 (35), 10 (29), 11 (10), 12 (51), 13 (22), 14 (31), 15 (27), 16 (36), 17 (16), 18 (27), 19 (25), 20 (26), 21 (37), 22 (30), 23 (33), 24 (18), 25 (40), 26 (37), 27 (21), 28 (43), 29 (46), 30 (38), 31 (18), 32 (35), 33 (23), 34 (35), 35 (35), 36 (38), 37 (21), 38 (27), 39 (23), 40 (38)
Book: Leviticus, Sections: 1 (17), 2 (16), 3 (17), 4 (35), 5 (26), 6 (23), 7 (38), 8 (36), 9 (24), 10 (20), 11 (47), 12 (8), 13 (59), 14 (57), 15 (33), 16 (34), 17 (16), 18 (30), 19 (37), 20 (27), 21 (24), 22 (33), 23 (44), 24 (23), 25 (55), 26 (46), 27 (34)
Book: Deuteronomy, Sections: 1 (46), 2 (37), 3 (29), 4 (49), 5 (33), 6 (25), 7 (26), 8 (20), 9 (29), 10 (22), 11 (32), 12 (31), 13 (19), 14 (29), 15 (23), 16 (22), 17 (20), 18 (22), 19 (21), 20 (20), 21 (23), 22 (29), 23 (26), 24 (22), 25 (19), 26 (19), 27 (26), 28 (69), 29 (28), 30 (20), 31 (30), 32 (52), 33 (29), 34 (12)
Book: Numbers, Sections: 1 (54), 2 (34), 3 (51), 4 (49), 5 (31), 6 (26), 7 (89), 8 (26), 9 (23), 10 (36), 11 (35), 12 (16), 13 (33), 14 (45), 15 (41), 16 (35), 17 (28), 18 (32), 19 (22), 20 (29), 21 (35), 22 (41), 23 (30), 24 (25), 25 (18), 26 (65), 27 (23), 28 (31), 29 (39), 30 (17), 31 (54), 32 (42), 33 (56), 34 (29), 35 (34), 36 (13)
Book: Joshua B, Sections: 1 (18), 2 (24), 3 (17), 4 (24), 5 (15), 6 (27), 7 (26), 8 (29), 9 (27), 10 (42), 11 (23), 12 (24), 13 (32), 14 (15), 15 (63), 16 (10), 17 (18), 18 (28), 19 (51), 20 (9), 21 (45), 22 (34), 23 (16), 24 (33)
Book: Judges B, Sections: 1 (36), 2 (23), 3 (31), 4 (24), 5 (31), 6 (40), 7 (25), 8 (35), 9 (57), 10 (18), 11 (40), 12 (15), 13 (25), 14 (20), 15 (20), 16 (31), 17 (13), 18 (31), 19 (30), 20 (48), 21 (25)
Book: Judges A, Sections: 1 (36), 2 (23), 3 (31), 4 (24), 5 (31), 6 (40), 7 (25), 8 (35), 9 (57), 10 (18), 11 (40), 12 (15), 13 (25), 14 (20), 15 (20), 16 (31), 17 (13), 18 (31), 19 (30), 20 (48), 21 (25)
Book: 2 Esdras, Sections: 1 (11), 2 (70), 3 (13), 4 (24), 5 (17), 6 (22), 7 (28), 8 (36), 9 (15), 10 (44), 11 (11), 12 (20), 13 (37), 14 (17), 15 (19), 16 (19), 17 (73), 18 (18), 19 (37), 20 (40), 21 (36), 22 (47), 23 (31)
Book: Ruth, Sections: 1 (22), 2 (23), 3 (18), 4 (22)
Book: 2 Chronicles, Sections: 1 (18), 2 (17), 3 (17), 4 (22), 5 (14), 6 (42), 7 (22), 8 (18), 9 (31), 10 (19), 11 (23), 12 (16), 13 (23), 14 (14), 15 (19), 16 (14), 17 (19), 18 (34), 19 (11), 20 (37), 21 (20), 22 (12), 23 (21), 24 (27), 25 (28), 26 (23), 27 (9), 28 (27), 29 (36), 30 (27), 31 (21), 32 (33), 33 (25), 34 (33), 35 (27), 36 (23)
Book: 2 Samuel, Sections: 1 (27), 2 (32), 3 (39), 4 (12), 5 (25), 6 (23), 7 (29), 8 (18), 9 (13), 10 (19), 11 (27), 12 (31), 13 (39), 14 (33), 15 (37), 16 (23), 17 (29), 18 (32), 19 (44), 20 (26), 21 (22), 22 (51), 23 (39), 24 (25)
Book: 2 Macabees, Sections: 1 (36), 2 (32), 3 (40), 4 (50), 5 (27), 6 (31), 7 (42), 8 (36), 9 (29), 10 (38), 11 (38), 12 (45), 13 (26), 14 (46), 15 (39)
Book: 1 Samuel, Sections: 1 (28), 2 (36), 3 (21), 4 (22), 5 (12), 6 (21), 7 (17), 8 (22), 9 (27), 10 (27), 11 (15), 12 (25), 13 (23), 14 (52), 15 (35), 16 (23), 17 (54), 18 (29), 19 (24), 20 (42), 21 (16), 22 (23), 23 (28), 24 (23), 25 (44), 26 (25), 27 (12), 28 (25), 29 (11), 30 (31), 31 (13)
Book: 1 Macabees, Sections: 1 (64), 2 (70), 3 (60), 4 (61), 5 (68), 6 (63), 7 (50), 8 (32), 9 (73), 10 (89), 11 (74), 12 (53), 13 (53), 14 (49), 15 (41), 16 (24)
Book: Joshua A, Sections: 15 (62), 18 (28), 19 (45)
Book: 2 Kings, Sections: 1 (18), 2 (25), 3 (27), 4 (44), 5 (27), 6 (33), 7 (20), 8 (29), 9 (37), 10 (36), 11 (20), 12 (22), 13 (25), 14 (29), 15 (38), 16 (20), 17 (41), 18 (37), 19 (37), 20 (21), 21 (26), 22 (20), 23 (37), 24 (20), 25 (30)
Book: 1 Esdras, Sections: 1 (55), 2 (26), 3 (24), 4 (63), 5 (71), 6 (33), 7 (15), 8 (92), 9 (55)
Book: 1 Chronicles, Sections: 1 (54), 2 (55), 3 (24), 4 (43), 5 (41), 6 (66), 7 (40), 8 (40), 9 (44), 10 (14), 11 (47), 12 (41), 13 (14), 14 (17), 15 (29), 16 (43), 17 (27), 18 (17), 19 (19), 20 (8), 21 (30), 22 (19), 23 (32), 24 (31), 25 (31), 26 (32), 27 (34), 28 (21), 29 (30)
Book: Tobit S, Sections: 1 (22), 2 (14), 3 (17), 4 (21), 5 (23), 6 (19), 7 (17), 8 (21), 9 (6), 10 (14), 11 (19), 12 (22), 13 (18), 14 (15)
Book: 1 Kings, Sections: 1 (53), 2 (46), 3 (28), 4 (19), 5 (32), 6 (36), 7 (50), 8 (66), 9 (28), 10 (29), 11 (43), 12 (33), 13 (34), 14 (31), 15 (34), 16 (34), 17 (24), 18 (46), 19 (21), 20 (29), 21 (43), 22 (54)
Book: Esther, Sections: 1 (22), 2 (23), 3 (15), 4 (17), 5 (14), 6 (14), 7 (10), 8 (17), 9 (32), 10 (3)
Book: Judith, Sections: 1 (16), 2 (28), 3 (10), 4 (15), 5 (24), 6 (21), 7 (32), 8 (36), 9 (14), 10 (23), 11 (23), 12 (20), 13 (20), 14 (19), 15 (14), 16 (25)
Book: Tobit BA, Sections: 1 (22), 2 (14), 3 (17), 4 (21), 5 (23), 6 (19), 7 (17), 8 (21), 9 (6), 10 (14), 11 (19), 12 (22), 13 (18), 14 (15)
Book: Proverbs, Sections: 1 (33), 2 (22), 3 (35), 4 (27), 5 (23), 6 (35), 7 (27), 8 (36), 9 (18), 10 (32), 11 (31), 12 (28), 13 (25), 14 (35), 15 (33), 16 (33), 17 (28), 18 (22), 19 (29), 20 (30), 21 (31), 22 (29), 23 (35), 24 (34), 30 (33), 31 (31), 32 (28), 33 (28), 34 (27), 35 (28), 36 (27)
Book: Micah, Sections: 1 (16), 2 (13), 3 (12), 4 (14), 5 (14), 6 (16), 7 (20)
Book: Lamentations, Sections: 0 (0), 1 (22), 2 (22), 3 (66), 4 (22), 5 (22)
Book: Nahum, Sections: 1 (14), 2 (14), 3 (19)
Book: Song of Solomon, Sections: 1 (17), 2 (17), 3 (11), 4 (16), 5 (16), 6 (12), 7 (14), 8 (14)
Book: Haggai, Sections: 1 (15), 2 (23)
Book: Zechariah, Sections: 1 (17), 2 (17), 3 (10), 4 (14), 5 (11), 6 (15), 7 (14), 8 (23), 9 (17), 10 (12), 11 (17), 12 (14), 13 (9), 14 (21)
Book: Ezekiel, Sections: 1 (28), 2 (10), 3 (27), 4 (17), 5 (17), 6 (14), 7 (27), 8 (18), 9 (11), 10 (22), 11 (25), 12 (28), 13 (23), 14 (23), 15 (8), 16 (63), 17 (24), 18 (32), 19 (14), 20 (44), 21 (37), 22 (31), 23 (49), 24 (27), 25 (17), 26 (21), 27 (36), 28 (26), 29 (21), 30 (26), 31 (18), 32 (32), 33 (33), 34 (31), 35 (15), 36 (38), 37 (28), 38 (23), 39 (29), 40 (49), 41 (26), 42 (20), 43 (27), 44 (31), 45 (25), 46 (24), 47 (23), 48 (35)
Book: Bel and the Dragon, Sections: 1 (42)
Book: Daniel, Sections: 1 (21), 2 (49), 3 (97), 4 (40), 5 (30), 6 (29), 7 (28), 8 (27), 9 (27), 10 (21), 11 (45), 12 (13)
Book: 4 Macabees, Sections: 1 (35), 2 (24), 3 (21), 4 (26), 5 (38), 6 (35), 7 (23), 8 (29), 9 (32), 10 (21), 11 (27), 12 (19), 13 (27), 14 (20), 15 (32), 16 (25), 17 (24), 18 (24)
Book: Isaiah, Sections: 1 (31), 2 (21), 3 (26), 4 (6), 5 (30), 6 (13), 7 (25), 8 (23), 9 (20), 10 (34), 11 (16), 12 (6), 13 (22), 14 (32), 15 (9), 16 (14), 17 (14), 18 (7), 19 (25), 20 (6), 21 (17), 22 (25), 23 (18), 24 (23), 25 (12), 26 (21), 27 (13), 28 (29), 29 (24), 30 (33), 31 (9), 32 (20), 33 (24), 34 (17), 35 (10), 36 (22), 37 (38), 38 (22), 39 (8), 40 (31), 41 (29), 42 (25), 43 (28), 44 (28), 45 (25), 46 (13), 47 (15), 48 (22), 49 (26), 50 (11), 51 (23), 52 (15), 53 (12), 54 (17), 55 (13), 56 (11), 57 (21), 58 (14), 59 (21), 60 (22), 61 (11), 62 (12), 63 (19), 64 (11), 65 (25), 66 (24)
Book: Odes, Sections: 1 (19), 2 (43), 3 (10), 4 (19), 5 (20), 6 (10), 7 (45), 8 (88), 9 (79), 10 (9), 11 (20), 12 (15), 13 (32), 14 (46)
Book: Ecclesiastes, Sections: 1 (18), 2 (26), 3 (22), 4 (17), 5 (19), 6 (12), 7 (29), 8 (17), 9 (18), 10 (20), 11 (10), 12 (14)
Book: Job, Sections: 1 (22), 2 (13), 3 (26), 4 (21), 5 (27), 6 (30), 7 (21), 8 (22), 9 (35), 10 (22), 11 (20), 12 (25), 13 (28), 14 (22), 15 (35), 16 (22), 17 (16), 18 (21), 19 (29), 20 (29), 21 (34), 22 (30), 23 (17), 24 (25), 25 (6), 26 (14), 27 (23), 28 (28), 29 (25), 30 (31), 31 (40), 32 (22), 33 (33), 34 (37), 35 (16), 36 (33), 37 (24), 38 (41), 39 (30), 40 (32), 41 (26), 42 (17)
Book: Wisdom, Sections: 1 (16), 2 (24), 3 (19), 4 (20), 5 (23), 6 (25), 7 (30), 8 (21), 9 (18), 10 (21), 11 (26), 12 (27), 13 (19), 14 (31), 15 (19), 16 (29), 17 (20), 18 (25), 19 (22)
Book: Psalms of Solomon, Sections: 1 (8), 2 (37), 3 (12), 4 (25), 5 (19), 6 (6), 7 (10), 8 (34), 9 (11), 10 (8), 11 (9), 12 (6), 13 (12), 14 (10), 15 (13), 16 (15), 17 (46), 18 (12)
Book: Hosea, Sections: 1 (9), 2 (25), 3 (5), 4 (19), 5 (15), 6 (11), 7 (16), 8 (14), 9 (17), 10 (15), 11 (11), 12 (15), 13 (15), 14 (10)
Book: Amos, Sections: 1 (15), 2 (16), 3 (15), 4 (13), 5 (27), 6 (14), 7 (17), 8 (14), 9 (15)
Book: Joel, Sections: 1 (20), 2 (27), 3 (5), 4 (21)
Book: Jonah, Sections: 1 (16), 2 (11), 3 (10), 4 (11)
Book: Obadiah, Sections: 1 (21)
Book: Zephaniah, Sections: 1 (18), 2 (15), 3 (20)
Book: Jeremiah, Sections: 1 (19), 2 (37), 3 (25), 4 (31), 5 (31), 6 (30), 7 (34), 8 (23), 9 (25), 10 (25), 11 (23), 12 (17), 13 (27), 14 (22), 15 (21), 16 (21), 17 (27), 18 (23), 19 (15), 20 (18), 21 (14), 22 (30), 23 (8), 24 (10), 25 (20), 26 (28), 27 (46), 28 (64), 29 (7), 30 (33), 31 (44), 32 (38), 33 (24), 34 (22), 35 (17), 36 (32), 37 (24), 38 (40), 39 (44), 40 (13), 41 (22), 42 (19), 43 (32), 44 (21), 45 (28), 46 (18), 47 (16), 48 (18), 49 (22), 50 (13), 51 (35), 52 (34)
Book: Baruch, Sections: 1 (22), 2 (35), 3 (38), 4 (37), 5 (9)
Book: Bel and the Dragon Th, Sections: 1 (42)
Book: Susanna, Sections: 1 (63)
Book: Habakkuk, Sections: 1 (17), 2 (20), 3 (19)
Book: Epistle of Jeremiah, Sections: 1 (72)
Book: Psalms, Sections: 1 (6), 2 (12), 3 (9), 4 (9), 5 (13), 6 (11), 7 (18), 8 (10), 9 (39), 10 (7), 11 (9), 12 (6), 13 (7), 14 (5), 15 (11), 16 (15), 17 (51), 18 (15), 19 (10), 20 (14), 21 (32), 22 (6), 23 (10), 24 (22), 25 (12), 26 (14), 27 (9), 28 (11), 29 (13), 30 (25), 31 (11), 32 (22), 33 (23), 34 (28), 35 (13), 36 (40), 37 (23), 38 (14), 39 (18), 40 (14), 41 (12), 42 (5), 43 (27), 44 (18), 45 (12), 46 (10), 47 (15), 48 (21), 49 (23), 50 (21), 51 (11), 52 (7), 53 (9), 54 (24), 55 (14), 56 (12), 57 (12), 58 (18), 59 (14), 60 (9), 61 (13), 62 (12), 63 (11), 64 (14), 65 (20), 66 (8), 67 (36), 68 (37), 69 (6), 70 (24), 71 (20), 72 (28), 73 (23), 74 (11), 75 (13), 76 (21), 77 (72), 78 (13), 79 (20), 80 (17), 81 (8), 82 (19), 83 (13), 84 (14), 85 (17), 86 (7), 87 (19), 88 (53), 89 (17), 90 (16), 91 (16), 92 (5), 93 (23), 94 (11), 95 (13), 96 (12), 97 (9), 98 (9), 99 (5), 100 (8), 101 (29), 102 (22), 103 (35), 104 (45), 105 (48), 106 (43), 107 (14), 108 (31), 109 (7), 110 (10), 111 (10), 112 (9), 113 (26), 114 (9), 115 (10), 116 (2), 117 (29), 118 (176), 119 (7), 120 (8), 121 (9), 122 (4), 123 (8), 124 (5), 125 (6), 126 (5), 127 (6), 128 (8), 129 (8), 130 (3), 131 (18), 132 (3), 133 (3), 134 (21), 135 (26), 136 (9), 137 (8), 138 (24), 139 (14), 140 (10), 141 (8), 142 (12), 143 (15), 144 (21), 145 (10), 146 (11), 147 (9), 148 (14), 149 (9), 150 (6), 151 (7)
Book: 3 Macabees, Sections: 1 (29), 2 (33), 3 (30), 4 (21), 5 (51), 6 (41), 7 (23)
Book: Sirach, Sections: 0 (36), 1 (30), 2 (18), 3 (31), 4 (31), 5 (15), 6 (37), 7 (36), 8 (19), 9 (18), 10 (31), 11 (34), 12 (18), 13 (26), 14 (27), 15 (20), 16 (30), 17 (32), 18 (33), 19 (30), 20 (31), 21 (28), 22 (27), 23 (27), 24 (34), 25 (26), 26 (29), 27 (30), 28 (26), 29 (28), 30 (25), 31 (31), 32 (24), 33 (33), 34 (26), 35 (24), 36 (27), 37 (31), 38 (34), 39 (35), 40 (30), 41 (27), 42 (25), 43 (33), 44 (23), 45 (26), 46 (20), 47 (25), 48 (25), 49 (16), 50 (29), 51 (30)
Book: Malachi, Sections: 1 (14), 2 (17), 3 (24)
Book: Daniel Th, Sections: 1 (21), 2 (49), 3 (97), 4 (37), 5 (30), 6 (29), 7 (28), 8 (27), 9 (27), 10 (21), 11 (45), 12 (13)
Book: Susanna Th, Sections: 1 (64)
 */

/**
✅ Estrutura geral
Todos os livros possuem a quantidade esperada de capítulos (exceto os casos especiais já conhecidos).
A maioria das contagens de versículos está dentro da faixa esperada para a LXX.
Livros grandes (Gênesis, Êxodo, Isaías, Jeremias, Ezequiel, Jó, Salmos etc.) não apresentam nenhuma discrepância gritante.
1. Sirach
Sections: 0 (36), 1 ... 51

O capítulo 0 não existe.

É quase certo que houve um deslocamento de índice.

2. Lamentations
0 (0), 1 (22), 2 (22), 3 (66), 4 (22), 5 (22)

Também existe um capítulo 0 inexistente.

Provavelmente é apenas um marcador artificial.

3. Proverbs
Continua estranho.

Você possui

1-24
30-36

Enquanto o livro termina no capítulo 31.

Ou seja:

faltam 25–29;
aparecem 32–36, que não existem.
Isso continua sendo o erro mais evidente do conjunto.

4. Psalms
Agora está muito melhor.

Você possui

1 ... 151

e o Salmo 151 possui 7 versículos, o que é perfeitamente compatível com a LXX.

Nada chama atenção.

5. Daniel
Daniel 3 = 97

Pode parecer enorme, mas está correto para a Septuaginta (e para Teodócio), pois inclui o Cântico dos Três Jovens.

Não é erro.

6. Susanna
63

e

Susanna Th = 64

Essa diferença é plausível.

Existem manuscritos com 63 ou 64 versículos.

7. Bel and the Dragon
42

Também está dentro do esperado.

8. Joel
20
27
5
21

Quatro capítulos.

Corresponde à tradição grega.

9. Malachi
3 capítulos

Também está coerente com a tradição grega.

10. Odes
As Odes variam bastante entre edições.

Os valores não parecem absurdos.

11. 1 Esdras
O capítulo 8 possuir

92 versículos

é grande, mas totalmente plausível.

12. 1 Macabeus
O capítulo 10 possuir

89 versículos

Também é esperado.

13. Jó
O texto grego é consideravelmente menor que o hebraico.

Os números que você possui parecem compatíveis.

Conclusão
Erros reais
❌ Sirach possui capítulo 0.
❌ Lamentations possui capítulo 0.
❌ Proverbs continua claramente incorreto (capítulos faltando e capítulos inexistentes).
Nada parece absurdamente errado
Não encontrei nenhuma contagem como:

Gênesis 1 com 500 versículos;
Salmo 23 com 80 versículos;
Isaías 53 com 2 versículos;
Daniel 6 com 150 versículos.
Ou seja, não há indícios de corrupção massiva dos dados.

Minha estimativa é que mais de 99% das contagens estão plausíveis para alguma tradição da Septuaginta. Os únicos problemas realmente evidentes continuam sendo os capítulos artificiais 0 e a listagem de Provérbios, que parece ter sido gerada incorretamente.
*/