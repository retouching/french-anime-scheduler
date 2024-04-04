import { type IEpisode } from '../interfaces/IItems';

export default class Crunchyroll {
  private static readonly APP_USER_AGENT = 'Crunchyroll/3.32.3 Android/11 okhttp/4.9.2';
  private static readonly APP_BASIC_AUTH = 'Basic Y3Jfd2ViOg==';
  private static readonly API_BASE_URL = 'https://beta-api.crunchyroll.com';
  private static readonly FRONT_BASE_URL = 'https://www.crunchyroll.com';
  private static readonly FRENCH_LANG_CODE = 'fr-FR';
  private readonly db: KVNamespace;

  public constructor(db: KVNamespace) {
    this.db = db;
  }

  private async getSessionToken(): Promise<string> {
    const sessionToken = await this.db.get('cr:session');

    if (sessionToken) return sessionToken;

    const req: Response = await fetch(`${Crunchyroll.API_BASE_URL}/auth/v1/token`, {
      body: 'grant_type=client_id',
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Crunchyroll.APP_BASIC_AUTH,
        'User-Agent': Crunchyroll.APP_USER_AGENT
      })
    }).catch(() => null);

    if (!req || req.status !== 200) throw new Error('Unable to get session');

    const data: Record<string, any> = await req.json();

    await this.db.put('cr:session', data.access_token, {
      expirationTtl: data.expires_in - 200
    });

    return data.access_token;
  }

  public async getObjectInfos(...ids: string[]): Promise<Array<Record<string, any>>> {
    const session = await this.getSessionToken();

    const req = await fetch(
      `${Crunchyroll.API_BASE_URL}/content/v2/cms/objects/${ids.join(',')}?locale=${Crunchyroll.FRENCH_LANG_CODE}`, {
        headers: new Headers({
          Authorization: `Bearer ${session}`,
          'User-Agent': Crunchyroll.APP_USER_AGENT
        })
      }
    ).catch(() => null);

    if (!req || req.status !== 200) throw new Error('Unable to get objects');

    const { data } = await req.json();

    return data;
  }

  public async getLatestEpisodes(): Promise<any> {
    const session = await this.getSessionToken();
    const req = await fetch(
      `${Crunchyroll.API_BASE_URL}/content/v2/discover/` +
      `browse?n=100&sort_by=newly_added&locale=${Crunchyroll.FRENCH_LANG_CODE}&type=episode`, {
        headers: new Headers({
          Authorization: `Bearer ${session}`,
          'User-Agent': Crunchyroll.APP_USER_AGENT
        })
      }
    ).catch(() => null);

    if (!req || req.status !== 200) throw new Error('Unable to get new episodes');

    const episodes: IEpisode[] = [];

    let { data: episodesData } = await req.json();
    episodesData = episodesData.filter((e: any) => {
      if (!e.new) return false;
      if (new Date().getTime() > (new Date(e.last_public).getTime() + 1000 * 60 * 60 * 24)) return false;
      if (
        e.episode_metadata.audio_locale !== Crunchyroll.FRENCH_LANG_CODE &&
        !e.episode_metadata.subtitle_locales.includes(Crunchyroll.FRENCH_LANG_CODE)
      ) return false;
      return true;
    });

    if (episodesData.length > 0) {
      const objects = await this.getObjectInfos(
        ...([
          ...new Set(episodesData.map((e: any) => e.episode_metadata.series_id)),
          ...new Set(episodesData.map((e: any) => e.episode_metadata.season_id))
        ] as string[])
      );

      for (const episodeData of episodesData) {
        const anime = objects.find((a: any) => a.id === episodeData.episode_metadata.series_id);
        const season = objects.find((a: any) => a.id === episodeData.episode_metadata.season_id);

        if (!anime || !season) continue;

        let image = anime.images.poster_tall.pop();
        if (image) {
          image.sort((a: any, b: any) => a.height - b.height);
          image = image.map((i: any) => i.source).pop();
        }

        episodes.push({
          id: `cr:${episodeData.id as string}`,
          anime: season.title,
          animeId: season.id,
          episodeUrl: `${Crunchyroll.FRONT_BASE_URL}/watch/${episodeData.id as string}`,
          animeUrl: `${Crunchyroll.FRONT_BASE_URL}/series/${anime.id as string}`,
          animeDescription: anime.description || 'Aucune description disponible pour le moment',
          animeImage: image || null,
          outDate: new Date(episodeData.last_public),
          animeYear: anime.series_metadata.series_launch_year || new Date().getFullYear(),
          type: 'EPISODE',
          episode: episodeData.episode_metadata.episode
        } as any);
      }
    }

    return episodes;
  }
}
