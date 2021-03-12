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
      try {
        const response = await fetch(url);
        if(!response.ok) {
          return new Error(response.statusText);
        }

        return response.json();
      } catch(e) {
        return new Error(e);
      }
    };
  }

  getName() {
    return this.name;
  }

  getPwm() {
    return this.pwm;
  }

  async getVersions() {
    if(navigator.online) {
      try {
        return this.fetchJson(this.versions);
      } catch(e) {
        // No neet to catch - returl local versions anyway
      }
    }

    return this.localVersions;
  }

  async getEscs() {
    if(navigator.online) {
      try {
        return this.fetchJson(this.escs);
      } catch(e) {
        // No neet to catch - returl local escs anyway
      }
    }

    return this.localEscs;
  }
}

export default Source;
