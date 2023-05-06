import type IEnvironment from '../interfaces/IEnvironment';
import { type IEpisode, type IMovie } from '../interfaces/IItems';
import ADN from '../services/adn';
import Crunchyroll from '../services/crunchyroll';
import webhook from '../utils/webhook';

export default async function episodes(
  _controller: ScheduledController,
  env: IEnvironment,
  _ctx: ExecutionContext
): Promise<void> {
  const { DB, WEBHOOK_URL, MENTIONS } = env;

  let episodesAnnounced: Array<IMovie | IEpisode> = await DB.get('announced', 'json');
  if (!episodesAnnounced) episodesAnnounced = [];

  episodesAnnounced = episodesAnnounced.filter((v) =>
    new Date().getTime() < (new Date(v.outDate).getTime() + 1000 * 60 * 60 * 24)
  );

  const episodesResult = await Promise.allSettled([
    ADN.getEpisodesOfTheDay(),
    new Crunchyroll(DB).getLatestEpisodes()
  ]);

  const sortedEpisodes: Record<string, any> = {};

  for (const provider of episodesResult) {
    if (provider.status === 'rejected') continue;

    for (const episode of provider.value) {
      if (episodesAnnounced.find((v) => v.id === episode.id)) continue;
      episodesAnnounced.push(episode);

      if (WEBHOOK_URL) {
        if (episode.type === 'EPISODE' || episode.type === 'OAV') {
          if (sortedEpisodes[`${episode.type as string}:${episode.animeId as string}`]) {
            sortedEpisodes[`${episode.type as string}:${episode.animeId as string}`].episodes.push({
              number: episode.episode || 1,
              url: episode.episodeUrl
            });

            continue;
          }
        }

        sortedEpisodes[episode.animeId] = {
          type: episode.type,
          episodes: [{
            number: (episode as IEpisode).episode || 1,
            url: episode.episodeUrl
          }],
          title: episode.anime,
          url: episode.animeUrl,
          description: episode.animeDescription,
          image: episode.animeImage,
          year: episode.animeYear,
          date: episode.outDate
        };
      }
    }
  }

  const sortedEpisodesValues = Object.values(sortedEpisodes);
  sortedEpisodesValues.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

  if (sortedEpisodesValues.length > 0) {
    const webhooks: Array<Record<string, any>> = [];

    for (const sortedEpisode of sortedEpisodesValues) {
      const webhook = {
        title: `${sortedEpisode.title as string} (${sortedEpisode.year as string})`,
        description: sortedEpisode.description,
        url: sortedEpisode.url,
        color: 2393589,
        fields: [] as Array<Record<string, any>>,
        thumbnail: {
          url: sortedEpisode.image
        },
        footer: {
          text: 'Date de sortie'
        },
        timestamp: sortedEpisode.date.toISOString()
      };

      if (sortedEpisode.type === 'MOVIE') {
        const episode = sortedEpisode.episodes[0];

        webhook.fields.push({
          name: '❗ Nouveau film disponible',
          value: `- **[Regarder](${episode.url as string})**`,
          inline: true
        });
      } else {
        const fieldTitle = `❗ ${sortedEpisode.episodes.length > 1 ? 'Nouveaux' : 'Nouvel'} ` +
                           `${sortedEpisode.type === 'EPISODE' ? 'épisode' : 'OAV'}` +
                           `${sortedEpisode.episodes.length > 1 ? 's' : ''} ` +
                           'disponible';
        const fieldValueTitle = sortedEpisode.episodes.length > 1
          ? `Regarder les épisodes ${Math.min(...sortedEpisode.episodes.map((v: any) => v.number))} ` +
            `à ${Math.max(...sortedEpisode.episodes.map((v: any) => v.number))}`
          : `Regarder l'épisode ${sortedEpisode.episodes[0].number as (number | string)}`;

        webhook.fields.push({
          name: fieldTitle,
          value: `- **[${fieldValueTitle}](${(
            sortedEpisode.episodes.length > 1 ? sortedEpisode.url : sortedEpisode.episodes[0].url
            ) as string})**`,
          inline: true
        });
      }

      webhooks.push(webhook);
    }

    let content = '';

    if (MENTIONS && MENTIONS.length > 0) {
      for (const mention of MENTIONS.split(',').map((m) => m.trim())) {
        content += ` <@&${mention}>`;
      }
    }

    const chunkedWebhooks = [].concat.apply([],
      webhooks.map((_, i) => i % 5 ? [] : [webhooks.slice(i, i + 5)]) as any
    );

    for (const chunkedWebhook of chunkedWebhooks) {
      await webhook.send(WEBHOOK_URL, { content, embeds: chunkedWebhook });
    }
  }

  await DB.put('announced', JSON.stringify(episodesAnnounced));
}
