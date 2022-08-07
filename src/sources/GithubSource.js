import Source from './Source';
import { fetchJsonCached } from '../utils/Fetch';

class GithubSource extends Source {
  async getRemoteVersionsList(repo, blacklist = []) {
    const githubReleases = await fetchJsonCached(`https://api.github.com/repos/${repo}/releases`);
    const releasesWithAssets = githubReleases.filter(
      (release) => release.assets.length && !blacklist.includes(release.tag_name)
    );

    const validReleases = releasesWithAssets.map((release) => ({
      name: release.name || release.tag_name.replace(/^v/, ''),
      key: release.tag_name,
      url: `https://github.com/${repo}/releases/download/${release.tag_name}/`,
      prerelease: release.prerelease,
      published_at: release.published_at,
    }));

    return validReleases;
  }
}

export default GithubSource;
