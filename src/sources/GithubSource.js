import Source from './Source';
import { fetchJsonCached } from '../utils/Fetch';

class GithubSource extends Source {
  async getRemoteVersionsList(repo) {
    const githubReleases = await fetchJsonCached(`https://api.github.com/repos/${repo}/releases`);

    return githubReleases
      .filter((r) => r.assets.length) // hide releases without assets
      .map((r) => ({
        name: r.name || r.tag_name.replace(/^v/, ''),
        key: r.tag_name,
        url: `https://github.com/${repo}/releases/download/${r.tag_name}/`,
        prerelease: r.prerelease,
        published_at: r.published_at,
      }));
  }
}

export default GithubSource;
