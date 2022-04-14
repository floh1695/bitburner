import {getPlayerMoney} from 'player-j1.js';

/**
 * @param {NS} ns
 * @returns {Promise<void>}
 **/
export const main = async (ns) => {
	const ram = ns.args[0] ? ns.args[0] : 8; // default server size to 8.
	const script = ns.args[1]
	buyServers(ns, ram, script);
};

export const buyServers = async (ns, ramRequested, script) => {
	const serverLimit = ns.getPurchasedServerLimit();
	let serverCount = ns.getPurchasedServers().length;
	while(serverCount < serverLimit) {
		const name = await buyServer(ns, ramRequested);
		if (script && name) { runScript(ns, name, script); }
		sleep(1000);
	}
};

export const buyServer = async (ns, ramRequested) => {
	const ram = await sanitizeRam(ns, ramRequested);
	const serverCost = ns.getPurchasedServerCost(ram);
	const playerMoney = await getPlayerMoney(ns);
	if (playerMoney > serverCost) {
		const name = hostname(serverCount);
		ns.tprint(`Purchasing server named: ${name}.`);
		ns.purchaseServer(name, ram);
		return name;
	} else {
		ns.tprint(`Not enough money to purchase server. Money: ${playerMoney}. Server cost: ${serverCost}. Ram size: ${ram}.` )
	}
}

export const sanitizeRam = async (ns, ram) => {
	const ramLimit = await ns.getPurchasedServerMaxRam();
	const ramRequested = Math.min(ram, ramLimit); // must be smaller than limit
	return ramRequested - (ramRequested % 2); // must be a factor of 2
}

export const hostname = (serverCount) => {
	return `node-${serverCount}`;
};

export const runScript = (ns, hostname, script) => {
	ns.scp(script, hostname);
	ns.exec(script, hostname);
}