export type MOVIE_TYPE = 'MOVIE';
export type EPISODE_TYPE = 'EPISODE' | 'OAV';
export type ITEM_TYPE = MOVIE_TYPE | EPISODE_TYPE;

export interface IMovie {
  id: string;
  type: MOVIE_TYPE;
  anime: string;
  animeId: string;
  animeDescription: string | null;
  animeYear: number;
  episodeUrl: string;
  animeUrl: string;
  animeImage: string | null;
  outDate: string | Date;
};

export interface IEpisode {
  id: string;
  type: EPISODE_TYPE;
  anime: string;
  animeId: string;
  animeYear: number;
  episode: number | string | null;
  episodeUrl: string;
  animeUrl: string;
  animeDescription: string | null;
  animeImage: string | null;
  outDate: string | Date;
};
