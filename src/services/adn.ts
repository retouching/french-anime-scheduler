import { type IMovie, type IEpisode } from '../interfaces/IItems';

export default class ADN {
  private static readonly API_BASE_URL = 'https://gw.api.animationdigitalnetwork.fr';
  private static readonly EPISODE_TYPES = ['EPS', 'OAV'];
  private static readonly MOVIE_TYPES = ['MOVIE'];

  public static async getEpisodesOfTheDay(): Promise<Array<IMovie | IEpisode>> {
    const currentDate = new Date();

    const req: Response | null = await fetch(
      `${ADN.API_BASE_URL}/video/calendar?date=` +
      `${currentDate.getFullYear()}-` +
      `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-` +
      `${currentDate.getDate().toString().padStart(2, '0')}`
    )
      .catch(() => null);

    if (!req || req.status !== 200) throw new Error('Unable to get new episodes');

    const data: Record<string, any> = await req.json();

    const episodes: Array<IMovie | IEpisode> = [];

    for (const episodeData of data.videos) {
      if (new Date(episodeData.releaseDate) > new Date()) continue;
      if (![...this.EPISODE_TYPES, ...this.MOVIE_TYPES].includes(episodeData.type)) continue;

      let shortNumber = episodeData.shortNumber;
      if (shortNumber) {
        shortNumber = shortNumber.replace(/[^ 0-9]/g, '').split(' ').pop();
      }
      if (!shortNumber) shortNumber = null;
      else shortNumber = (shortNumber.includes('.') ? parseFloat : parseInt)(shortNumber);

      episodes.push({
        id: `adn:${episodeData.id as string}`,
        anime: episodeData.show.title,
        animeId: episodeData.show.id,
        episodeUrl: episodeData.url,
        animeUrl: episodeData.show.url,
        animeDescription: episodeData.show.summary || 'Aucune description disponible pour le moment',
        animeImage: episodeData.show.image2x || episodeData.show.image || null,
        outDate: new Date(episodeData.releaseDate),
        animeYear: parseInt(episodeData.show.firstReleaseYear, 10) || currentDate.getFullYear(),
        ...(this.EPISODE_TYPES.includes(episodeData.type)
          ? {
              type: episodeData.type === 'EPS' ? 'EPISODE' : 'OAV',
              episode: shortNumber
            }
          : {}),
        ...(this.MOVIE_TYPES.includes(episodeData.type)
          ? {
              type: 'MOVIE'
            }
          : {})
      } as any);
    }

    return episodes;
  }
}
