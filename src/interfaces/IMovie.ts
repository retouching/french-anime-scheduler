export default interface IMovie {
  id: string;
  type: string;
  anime: string;
  year: number | null;
  episodeUrl: string;
  animeUrl: string;
  image: string | null;
}
