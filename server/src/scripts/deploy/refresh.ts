import * as nsd from "../../../external/NetscriptDefinitions";

export const main = async (ns: nsd.NS) => {
  await ns.killall('home');

  const orchestratorScriptName = 'orchestrator.js';
  await ns.wget('localhost:8088/', orchestratorScriptName);

  await ns.run(orchestratorScriptName);
};
