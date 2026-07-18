// Curated word pairs, grouped by topic and niche tier.
// Each pair is [civilianWord, imposterWord] — related but NOT a near-synonym,
// so the imposter has to actually think to bluff instead of reciting
// a word that basically means the same thing.
export const TOPICS = {
  "Movies & Shows": {
    lessNiche: [
      ["Star Wars", "Harry Potter"],
      ["The Office", "Brooklyn Nine-Nine"],
      ["Batman", "Spider-Man"],
      ["Titanic", "The Notebook"],
      ["Stranger Things", "Dark"],
      ["Friends", "How I Met Your Mother"],
      ["Breaking Bad", "Better Call Saul"],
      ["The Avengers", "Justice League"],
    ],
    niche: [
      ["Twin Peaks", "The Leftovers"],
      ["Whiplash", "Birdman"],
      ["The Wire", "The Shield"],
      ["Chernobyl", "Band of Brothers"],
      ["Arrested Development", "Community"],
      ["Fargo", "No Country for Old Men"],
      ["Severance", "Mr. Robot"],
      ["Cowboy Bebop", "Samurai Champloo"],
    ],
  },
  "Famous People": {
    lessNiche: [
      ["Taylor Swift", "Ariana Grande"],
      ["LeBron James", "Steph Curry"],
      ["Elon Musk", "Mark Zuckerberg"],
      ["Barack Obama", "Joe Biden"],
      ["Tom Cruise", "Brad Pitt"],
      ["Cristiano Ronaldo", "Neymar"],
      ["Rihanna", "Beyoncé"],
      ["Dwayne Johnson", "Vin Diesel"],
    ],
    niche: [
      ["Nikola Tesla", "Thomas Edison"],
      ["Frida Kahlo", "Diego Rivera"],
      ["Hunter S. Thompson", "Charles Bukowski"],
      ["Marie Curie", "Ada Lovelace"],
      ["Bobby Fischer", "Garry Kasparov"],
      ["Hayao Miyazaki", "Satoshi Kon"],
      ["Nikola Jokić", "Giannis Antetokounmpo"],
      ["Simone de Beauvoir", "Jean-Paul Sartre"],
    ],
  },
  "Countries & Places": {
    lessNiche: [
      ["Paris", "Rome"],
      ["Japan", "South Korea"],
      ["Grand Canyon", "Yellowstone"],
      ["Hawaii", "Bahamas"],
      ["Mount Everest", "Kilimanjaro"],
      ["New York City", "Los Angeles"],
      ["Egypt", "Morocco"],
      ["The Great Wall of China", "Machu Picchu"],
    ],
    niche: [
      ["Bhutan", "Nepal"],
      ["Faroe Islands", "Iceland"],
      ["Socotra", "Madagascar"],
      ["Svalbard", "Greenland"],
      ["Salar de Uyuni", "Atacama Desert"],
      ["Transnistria", "Kaliningrad"],
      ["Zanzibar", "Seychelles"],
      ["Uzbekistan", "Kazakhstan"],
    ],
  },
  "Food": {
    lessNiche: [
      ["Pizza", "Tacos"],
      ["Sushi", "Fried Rice"],
      ["Burger", "Hot Dog"],
      ["Pancakes", "Cereal"],
      ["Ice Cream", "Cake"],
      ["Spaghetti", "Mac and Cheese"],
      ["Fries", "Chips"],
      ["Donut", "Cookie"],
    ],
    niche: [
      ["Ceviche", "Poke"],
      ["Ramen", "Pho"],
      ["Dim Sum", "Tapas"],
      ["Baklava", "Tiramisu"],
      ["Kimchi", "Sauerkraut"],
      ["Paella", "Risotto"],
      ["Gnocchi", "Dumplings"],
      ["Shakshuka", "Huevos Rancheros"],
    ],
  },
  "Clash Royale Characters": {
    lessNiche: [
      ["Knight", "Mini P.E.K.K.A"],
      ["Wizard", "Ice Wizard"],
      ["Giant", "Golem"],
      ["Archer Queen", "Royal Ghost"],
      ["Skeleton King", "Skeleton Army"],
      ["Hog Rider", "Ram Rider"],
      ["Baby Dragon", "Inferno Dragon"],
      ["Princess", "Dart Goblin"],
    ],
    niche: [
      ["Mega Knight", "Electro Giant"],
      ["Goblin Machine", "Goblin Demolisher"],
      ["Mother Witch", "Night Witch"],
      ["Fisherman", "Magic Archer"],
      ["Little Prince", "Royal Chef"],
      ["Phoenix", "Firecracker"],
      ["Suspicious Bush", "Goblin Curse"],
      ["Elixir Golem", "Electro Dragon"],
    ],
  },
  "Soccer Players": {
    lessNiche: [
      ["Lionel Messi", "Cristiano Ronaldo"],
      ["Kylian Mbappé", "Erling Haaland"],
      ["Neymar", "Vinícius Júnior"],
      ["Kevin De Bruyne", "Bruno Fernandes"],
      ["Mohamed Salah", "Son Heung-min"],
      ["Robert Lewandowski", "Harry Kane"],
      ["Luka Modrić", "Toni Kroos"],
      ["Virgil van Dijk", "Sergio Ramos"],
    ],
    niche: [
      ["Pedri", "Gavi"],
      ["Jude Bellingham", "Federico Valverde"],
      ["Rodrygo", "Rafael Leão"],
      ["Declan Rice", "Rodri"],
      ["Alphonso Davies", "Theo Hernández"],
      ["Khvicha Kvaratskhelia", "Ademola Lookman"],
      ["Xavi Simons", "Jamal Musiala"],
      ["Florian Wirtz", "Bukayo Saka"],
    ],
  },
};

export function randomPairForTopic(topic, tier = "lessNiche") {
  const group = TOPICS[topic];
  if (!group) return null;
  const list = group[tier] || group.lessNiche;
  if (!list || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

export function topicList() {
  return Object.keys(TOPICS);
}
