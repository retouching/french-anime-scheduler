import type IEpisode from '../interfaces/IEpisode';
import type IMovie from '../interfaces/IMovie';

export default class ADN {
  private static readonly BASE_URL = 'https://gw.api.animationdigitalnetwork.fr';
  private static readonly EPISODE_TYPES = ['EPS', 'OAV'];
  private static readonly MOVIE_TYPES = ['MOVIE'];

  public static async getEpisodesOfTheDay(): Promise<Array<IMovie | IEpisode>> {
    const currentDate = new Date();

    const req: Response | null = await fetch(
      `${ADN.BASE_URL}/video/calendar?date=` +
      `${currentDate.getFullYear()}-` +
      `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-` +
      `${currentDate.getDay().toString().padStart(2, '0')}`
    )
      .catch(() => null);

    if (!req || req.status !== 200) return [];

    const data: Record<string, any> = await req.json();

    const episodes: Array<IMovie | IEpisode> = [];

    for (const episodeData of data.videos) {
      if (new Date(episodeData.releaseDate) > new Date()) continue;

      episodes.push({
        id: `adn:${episodeData.id as string}`,
        anime: episodeData.show.title,
        episodeUrl: episodeData.url,
        animeUrl: episodeData.show.url,
        image: episodeData.image2x || episodeData.image || null,
        ...(this.EPISODE_TYPES.includes(episodeData.type)
          ? {
              episode: episodeData.shortNumber
                ? parseInt(
                  episodeData.shortNumber, 10
                ) || null
                : null
            }
          : {}),
        ...(this.MOVIE_TYPES.includes(episodeData.type)
          ? {
              year: parseInt(episodeData.show.firstReleaseYear, 10) || currentDate.getFullYear()
            }
          : {})
      } as any);
    }

    return episodes;
  }
}
