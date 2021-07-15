import rawData from './voices.json';
// @ts-ignore
import { Document as DocumentIndex } from 'flexsearch';

const allVoices = rawData.map((voice) => ({
  ...voice,
  voiceNamePretty: prettify(voice.voiceName),
  subCategoryPretty: prettify(voice.subCategory),
  relatedNames: [],
}));

const relatedNamesByGroupMut: { [group: string]: string } = {};
for (const voice of allVoices) {
  relatedNamesByGroupMut[voice.subCategory] =
    relatedNamesByGroupMut[voice.subCategory] ?? '';
  relatedNamesByGroupMut[voice.subCategory] += ' ' + voice.voiceNamePretty;
}

for (const voice of allVoices) {
  // @ts-ignore
  voice.relatedNames = frequentWords(
    relatedNamesByGroupMut[voice.subCategory],
    3
  );
}

export type Voice = typeof allVoices[number];

const voicesBySubCategoryMut: { [subCategory: string]: Array<Voice> } = {};

for (const voice of allVoices) {
  voicesBySubCategoryMut[voice.subCategory] =
    voicesBySubCategoryMut[voice.subCategory] ?? [];
  voicesBySubCategoryMut[voice.subCategory].push(voice);
}
export const voicesBySubCategory: {
  readonly [subcategory: string]: ReadonlyArray<Voice>;
} = voicesBySubCategoryMut;

const voicesIndex = new DocumentIndex({
  tokenize: 'full',
  cache: 100,
  resolution: 9,
  language: 'en',

  document: {
    index: [
      'category',
      'subCategory',
      'subCategoryPretty',
      'voiceNamePretty',
      'voiceName',
      'relatedNames',
    ],
  },
});

allVoices.forEach((voice, id) => {
  voicesIndex.add(id, voice);
});

export { allVoices, voicesIndex };

function tokenize(voiceName: string) {
  return voiceName
    .replace(/_/g, '/')
    .split(/(?<![A-Z])(?=[A-Z])|(?<![0-9/])(?=[0-9])|(?<=[&+])|(?=[&+])| /g);
}

function normalizeToken(tok: string) {
  switch (tok.toLowerCase()) {
    case 'harpsi':
      return 'Harpsichord';
    case 'gtr':
    case 'gt':
      return 'Guitar';
    case 'orch':
    case 'orchestr':
    case 'orchstra':
      return 'Orchestra';
    case 'pno':
      return 'Piano';
    case 'e.':
    case 'e':
    case 'el':
      return 'Electric';
    case 'a.':
    case 'a':
      return 'Acoustic';
    case 'gr':
      return 'Grand';
    case 'tp':
      return 'Trumpet';
    case 'tb':
      return 'Trombone';
    case 'sax':
      return 'Saxophone';
    case 'slw':
      return 'Slow';
    case 'atk':
      return 'Attack';
    case 'ens':
      return 'Ensemble';
    case 'ep':
      return 'Electric Piano';
    case 'clavi':
      return 'Clavinet';
    case 'syn':
    case 'sy':
      return 'Synth';
    case 'chrch':
      return 'Church';
    case 'oct':
      return 'Octave';
    case 'accord':
    case 'acc':
      return 'Accordion';
    case 'glocken':
      return 'Glockenspiel';
    case 'str':
      return 'String';
    case 'strngs':
      return 'Strings';
    case 'trem':
      return 'Tremolo';
    case 'at':
      return 'Attack';
    case 'vxuprght':
      return 'VX Upright';
    case 'bel':
      return 'Bell';
    case 'org':
      return 'Organ';
    case 'telphon':
      return 'Telephone';
    case 'perc.':
      return 'Percussion';
  }
  return tok;
}

function normalizeFull(voiceName: string) {
  if (voiceName.endsWith(' Grand')) {
    return voiceName + ' Piano';
  }
  if (voiceName.endsWith(' String')) {
    return voiceName + 's';
  }
  return voiceName;
}

function prettify(voiceName: string) {
  return normalizeFull(tokenize(voiceName).map(normalizeToken).join(' '));
}

function frequentWords(
  text: string,
  minOccurrences: number = 1
): ReadonlyArray<string> {
  const words = text.split(' ');
  const occurrencesByWord = new Map();
  for (const word of words) {
    occurrencesByWord.set(word, (occurrencesByWord.get(word) ?? 0) + 1);
  }
  return [...occurrencesByWord.entries()]
    .filter(([word, occurrences]) => occurrences >= minOccurrences)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

function getCategoryRank(category: string) {
  switch (category.toLowerCase()) {
    case 'megavoice':
      return 10;
    case 'main':
      return 5;
    case 'legacy':
      return -10;
  }
  return 0;
}

function getVoiceTypeRank(voiceType: string) {
  switch (voiceType.toLowerCase()) {
    case 'vrm':
      return 10;
  }
  return 0;
}

function getCloseMatchRank(actual: string, query: string) {
  if (actual.trim().toLowerCase() === query.trim().toLowerCase()) {
    return 100;
  }
  if (actual.trim().toLowerCase().startsWith(query.trim().toLowerCase())) {
    return 50;
  }
  if (
    actual
      .trim()
      .toLowerCase()
      .includes(' ' + query.trim().toLowerCase())
  ) {
    return 25;
  }
  return 0;
}

export function search(filterQuery: string): ReadonlyArray<{ id: number }> {
  const allResults = voicesIndex.search(filterQuery, {
    field: [
      'voiceNamePretty',
      'voiceName',
      'subCategoryPretty',
      'subCategory',
      'category',
      'relatedNames',
    ],
    suggest: true,
  });

  const unifiedResults: Map<number, { readonly fields: Array<string> }> =
    new Map();
  for (const { field, result: ids } of allResults) {
    for (const id of ids) {
      const matches = unifiedResults.get(id) ?? { fields: [] };
      unifiedResults.set(id, matches);
      matches.fields.push(field);
    }
  }
  return (
    [...unifiedResults]
      // NOTE: sorting criteria appear in reverse order.

      // ↑↑ by ID
      .sort((a, b) => a[0] - b[0])
      // ↑↑ put close matches near the top
      // .sort(
      //   (a, b) =>
      //     getCloseMatchRank(allVoices[b[0]].voiceNamePretty, filterQuery) -
      //     getCloseMatchRank(allVoices[a[0]].voiceNamePretty, filterQuery)
      // )
      // ↑↑ by voice type rank
      .sort(
        (a, b) =>
          getVoiceTypeRank(allVoices[b[0]].voiceType) -
          getVoiceTypeRank(allVoices[a[0]].voiceType)
      )
      // ↑↑ by category rank
      .sort(
        (a, b) =>
          getCategoryRank(allVoices[b[0]].category) -
          getCategoryRank(allVoices[a[0]].category)
      )
      // ↑↑ sort by number of matching fields
      .sort((a, b) => b[1].fields.length - a[1].fields.length)

      .map(([id]) => ({ id }))
  );
}
