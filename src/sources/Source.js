class Source {
  constructor(name, versions, escs, localVersions, localEscs, pwm) {
    if(!name || !versions || !escs || !localVersions || !localEscs || !pwm) {
      throw new Error("Parameters required: name, versions, escs, localVersions, localEscs");
    }

    this.name = name;
    this.versions = versions;
    this.escs = escs;
    this.localVersions = localVersions;
    this.localEscs = localEscs;
    this.pwm = pwm;

    this.fetchJson = async (url) => {
      const response = await fetch(url);
      if(!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    };
  }

  getName() {
    return this.name;
  }

  getPwm() {
    return this.pwm;
  }

  async getVersions() {
    try {
      return this.fetchJson(this.versions);
    } catch(e) {
      return this.localVersions;
    }
  }

  async getEscs() {
    try {
      return this.fetchJson(this.escs);
    } catch(e) {
      return this.localEscs;
    }
  }
}

export default Source;
