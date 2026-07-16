const books = [
  {"html":"gen.htm","name":"Genesis"},
  {"html":"exo.htm","name":"Exodus"},
  {"html":"lev.htm","name":"Leviticus"},
  {"html":"num.htm","name":"Numbers"},
  {"html":"deu.htm","name":"Deuteronomy"},
  {"html":"jsb.htm","name":"Joshua B"},
  {"html":"jsa.htm","name":"Joshua A"},
  {"html":"jdb.htm","name":"Judges B"},
  {"html":"jda.htm","name":"Judges A"},
  {"html":"rut.htm","name":"Ruth"},
  {"html":"sa1.htm","name":"1 Samuel"},
  {"html":"sa2.htm","name":"2 Samuel"},
  {"html":"kg1.htm","name":"1 Kings"},
  {"html":"kg2.htm","name":"2 Kings"},
  {"html":"ch1.htm","name":"1 Chronicles"},
  {"html":"ch2.htm","name":"2 Chronicles"},
  {"html":"es1.htm","name":"1 Esdras"},
  {"html":"es2.htm","name":"2 Esdras"},
  {"html":"est.htm","name":"Esther"},
  {"html":"jdt.htm","name":"Judith"},
  {"html":"toa.htm","name":"Tobit BA"},
  {"html":"tos.htm","name":"Tobit S"},
  {"html":"ma1.htm","name":"1 Macabees"},
  {"html":"ma2.htm","name":"2 Macabees"},
  {"html":"ma3.htm","name":"3 Macabees"},
  {"html":"ma4.htm","name":"4 Macabees"},
  {"html":"psa.htm","name":"Psalms"},
  {"html":"ode.htm","name":"Odes"},
  {"html":"pro.htm","name":"Proverbs"},
  {"html":"ecc.htm","name":"Ecclesiastes"},
  {"html":"sol.htm","name":"Song of Solomon"},
  {"html":"job.htm","name":"Job"},
  {"html":"wis.htm","name":"Wisdom"},
  {"html":"sir.htm","name":"Sirach"},
  {"html":"pss.htm","name":"Psalms of Solomon"},
  {"html":"hos.htm","name":"Hosea"},
  {"html":"mic.htm","name":"Micah"},
  {"html":"amo.htm","name":"Amos"},
  {"html":"joe.htm","name":"Joel"},
  {"html":"jon.htm","name":"Jonah"},
  {"html":"oba.htm","name":"Obadiah"},
  {"html":"nah.htm","name":"Nahum"},
  {"html":"hab.htm","name":"Habakkuk"},
  {"html":"zep.htm","name":"Zephaniah"},
  {"html":"hag.htm","name":"Haggai"},
  {"html":"zac.htm","name":"Zechariah"},
  {"html":"mal.htm","name":"Malachi"},
  {"html":"isa.htm","name":"Isaiah"},
  {"html":"jer.htm","name":"Jeremiah"},
  {"html":"bar.htm","name":"Baruch"},
  {"html":"epj.htm","name":"Epistle of Jeremiah"},
  {"html":"lam.htm","name":"Lamentations"},
  {"html":"eze.htm","name":"Ezekiel"},
  {"html":"bel.htm","name":"Bel and the Dragon"},
  {"html":"bet.htm","name":"Bel and the Dragon Th"},
  {"html":"dan.htm","name":"Daniel"},
  {"html":"dat.htm","name":"Daniel Th"},
  {"html":"sus.htm","name":"Susanna"},
  {"html":"sut.htm","name":"Susanna Th"}
];

const baseUrl = "https://www.sacred-texts.com/bib/sep/";
books.forEach(book => {
  fetch(`${baseUrl}${book.html}`)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const links = [...doc.querySelectorAll('p > a:nth-child(1)')].filter(a => /\d{3}/.test(a.getAttribute('href')));
      const sections = links.map(link => parseInt(link.getAttribute('href').match(/\d{3}/)[0], 10));
      console.log(`Book: ${book.name}, Sections: ${sections.join(', ')}`);
    })
    .catch(error => console.error(`Error fetching ${book.name}:`, error));
});

// TODO: a numeração de capitulos não está correta ainda