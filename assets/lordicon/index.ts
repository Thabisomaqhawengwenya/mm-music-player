/**
 * Bundled Lordicon animated Lottie assets for offline-first performance
 */
export const LordiconAssets = {
  search: require('./search.json'),
  settings: require('./settings.json'),
  music: require('./music.json'),
  playlist: require('./playlist.json'),
  sparkles: require('./sparkles.json'),
  heart: require('./heart.json'),
  play: require('./play.json'),
};

export type LordiconIconName = keyof typeof LordiconAssets;
