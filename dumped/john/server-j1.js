import {getPlayerMoney} from 'player-j1.js';

/**
 * @param {NS} ns
 * @returns {Promise<void>}
 **/
export const main = async (ns) => {
	const ram = ns.args[0] ? ns.args[0] : 8; // default server size to 8.
	const script = ns.args[1] ? ns.args[1] : 'pwn.js';
	const target = ns.args[2] ? ns.args[2] : '';
	await buyServers(ns, ram, script, target);
};

export const buyServers = async (ns, ramRequested, script, target) => {
	const serverLimit = ns.getPurchasedServerLimit();
	let serverCount = ns.getPurchasedServers().length;
	while (serverCount < serverLimit) {
		ns.print(`Player owns ${serverCount} servers which is under server limit of ${serverLimit}. Buying servers.`)
		const name = buyServer(ns, ramRequested);
		if (script && name) { 
			await runScript(ns, name, script, target);
		}
		serverCount = ns.getPurchasedServers().length;
		await ns.sleep(1000);
	}
	ns.tprint(`Player owns ${serverCount} which is the max amount.`);
};

export const buyServer = (ns, ramRequested) => {
	const ram = sanitizeRam(ns, ramRequested);
	const serverCost = ns.getPurchasedServerCost(ram);
	const playerMoney = getPlayerMoney(ns);
	ns.print(`Player has $${playerMoney}. Server costs $${serverCost}.`);
	if (playerMoney > serverCost) {
		const serverCount= ns.getPurchasedServers().length;
		const name = hostname(serverCount);
		ns.print(`Purchasing server named: ${name}.`);
		ns.purchaseServer(name, ram);
		return name;
	} else {
		ns.print(`Not enough money to purchase server. Money: ${playerMoney}. Server cost: ${serverCost}. Ram size: ${ram}.` )
	}
}

export const sanitizeRam = (ns, ram) => {
	const ramLimit = ns.getPurchasedServerMaxRam();
	const ramRequested = Math.min(ram, ramLimit); // must be smaller than limit
	// TODO: below just checks divisible by two. Should check that it's a power of 2
	return ramRequested - (ramRequested % 2); // must be a factor of 2
}

export const hostname = (serverCount) => {
	return `node-${serverCount}`;
};

export const runScript = async (ns, server, script, target) => {
	const scriptRam = ns.getScriptRam(script);
	const serverRam = ns.getServerMaxRam(server);
	const threads = Math.floor(serverRam / scriptRam);

	ns.print(`Starting ${script} on ${server} with ${threads} threads`);
	await ns.scp(script, server);
	ns.exec(script, server, threads, target);
}