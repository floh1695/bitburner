import * as nsd from "../../external/NetscriptDefinitions";

const urlBase = 'http://localhost:8088';
const scriptUrlBase = urlBase + '/scripts';
const scriptUrlFor = (script: string): string =>
  `${scriptUrlBase}/${script}`;

const scriptsFile = 'scripts.json.txt';

/**
 * This file cannot depend on other scripts since it will be the first one deployed
 */
export const main = async (ns: nsd.NS) => {
  ns.wget(scriptUrlBase, scriptsFile);

  const scriptsJson = ns.read(scriptsFile);
  const scripts = JSON.parse(scriptsJson);

  for (const script of scripts) {
    const url = scriptUrlFor(script);

    ns.wget(url, script);
  }
};
