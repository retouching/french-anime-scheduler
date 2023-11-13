import type IEnvironment from '../interfaces/IEnvironment';
import { type IMovie, type IEpisode } from '../interfaces/IItems';
import { type IRequest } from 'itty-router';

export default async function rss(
  request: IRequest, env: IEnvironment, ctx: ExecutionContext
): Promise<Response> {
  const { DB } = env;

  let episodesAnnounced: Array<IMovie | IEpisode> = await DB.get('announced', 'json');
  if (!episodesAnnounced) episodesAnnounced = [];

  episodesAnnounced.sort((a: any, b: any) => new Date(b.outDate).getTime() - new Date(a.outDate).getTime());

  const currentUrl = new URL(request.url);

  const rssHeader = `<rss xmlns:fas="${currentUrl.origin}/xmlns" version="2.0">` +
                    '<channel>' +
                    '<title>French Anime Scheduler RSS</title>' +
                    `<link>${currentUrl.origin}/rss</link>` +
                    '<description>Latest episodes from ADN and Crunchyroll</description>';
  const rssItems: any[] = [];
  const rssFooter = '</channel></rss>';

  for (const item of episodesAnnounced) {
    let itemRSS = '<item>' +
                  `<title>${item.anime} - ` +
                  `${item.type === 'MOVIE' ? item.animeYear : String(item.episode).padStart(2, '0')}` +
                  '</title>' +
                  `<description>${item.animeDescription}</description>` +
                  `<category>${item.type}</category>` +
                  `<guid isPermalink="true">${item.episodeUrl}</guid>` +
                  `<link>${item.episodeUrl}</link>` +
                  `<enclosure url="${item.animeImage}" type="image/jpeg"/>`;

    for (const key in item) {
      if (['anime', 'episode', 'animeYear', 'animeDescription', 'type', 'episodeUrl'].includes(key)) continue;
      itemRSS += `<fas:${key}>${(item as unknown as Record<string, string | number>)[key] || ''}</fas:${key}>`;
    }

    itemRSS += '</item>';

    rssItems.push(itemRSS);
  }

  return new Response(`${rssHeader}${rssItems.join('')}${rssFooter}`, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/xml;charset=UTF-8'
    }
  });
}
