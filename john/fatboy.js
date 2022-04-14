export async function main(ns) {
	let servers = getServers(ns);
	servers
		.filter(server => !ns.hasRootAccess(server))
		.forEach(server => acquireRootAccess(ns, server));
	servers
		.filter(server => ns.hasRootAccess(server))
		.forEach(server => spawnScripts(ns, server));
}

export function spawnScripts(ns, server) {
	let threads = 1;
	ns.exec("pwn.js", server, threads, server);
}


export function acquireRootAccess(ns, server) {
	if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(server); }
	if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(server); }
	if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(server); }
	if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(server); }
	if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(server); }

	ns.nuke(server);
}

export function getServers(ns) {
	let result = [];
	let visited = { 'home': 0 };
	let queue = Object.keys(visited);
	let name;
	while ((name = queue.pop())) {
		let depth = visited[name];
		result.push(name);
		let scanRes = ns.scan(name);
		for (let i = scanRes.length; i >=0; i--) {
			if (visited[scanRes[i]] === undefined) {
				queue.push(scanRes[i]);
				visited[scanRes[i]] = depth + 1;
			}
		}
	}
	return result;
}