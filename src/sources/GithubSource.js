import Source from './Source';
import { fetchJsonCached } from '../utils/Fetch';

/**
 * Base class for all sources where releases can be properly feteched from
 * github as is the case for Bluejay and AM32.
 */
class GithubSource extends Source {
  /**
   * Get a list of releases for a source
   *
   * The blacklist can cointain tags that should be ignored when building the
   * list of available firmware, this can be useful for cases when old firmware
   * has been depricated or we simply no longer want to show older those older
   * firmware versions.
   *
   * @param {string} repo
   * @param {object} blacklist
   * @returns
   */
  async getRemoteVersionsList(repo, blacklist = [], amount = 100) {
    const githubReleases = await fetchJsonCached(`https://api.github.com/repos/${repo}/releases?per_page=${amount}&page=1`, this.skipCache);
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
