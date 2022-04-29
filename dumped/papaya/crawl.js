/** @param {NS} ns */
export async function main(ns) {
	const hosts = await buildList(ns);
	let hostinfo = [];
	const moneyRam = await ns.getScriptRam('get-money.script','home');
	for(let host of hosts)
	{
		if(host != 'home')
		{
			hostinfo.push(await getinfo(ns,host));
		}
	}
	await ns.tprint(new Error().stack);
	while(true)
	{
		await ns.tprint(new Error().stack);
		let mylevel = await ns.getHackingLevel();
		let myports = 0;
		await ns.tprint(new Error().stack);
		for(let i = 0; i < hostinfo.length; i++)
		{
			await ns.tprint(new Error().stack);
			let compooter = hostinfo[i];
			await ns.tprint(compooter.name);
			await ns.tprint(new Error().stack);
			if(!await ns.hasRootAccess(compooter.name))
			{
				await ns.tprint(new Error().stack);
				if(compooter.level <= mylevel)
				{
					if(compooter.ports <= myports)
					{
						await ns.run('autohack.js',1,compooter.name,compooter.hasMoney);
						for(let i = 0 ; i < compooter.dedotatedWam/moneyRam;i++)
						{
							await ns.exec('get-money.script',compooter.name,1,compooter.hasMoney?compooter.name:'n00dles',i.toString());
						}
					}
				}
			}
		}
		await ns.sleep(1000);
	}
}

const buildList = async function(ns)
{
	let nodequeue = [];
	let seen = [];
	
	nodequeue.push('home');
	while(nodequeue.length>0)
	{
		await ns.sleep(10);
		let current = nodequeue.shift();
		if(!seen.includes(current))
		{
			seen.push(current);
			const nextlist = await ns.scan(current);
			for(const node of nextlist)
			{
				if(!seen.includes(node))
				{
					nodequeue.push(node);
				}
			}
		}
	}
	return seen;
}

const getinfo = async function(ns,name)
{
	let host = { name: name };
	host.level = await ns.getServerRequiredHackingLevel(name);
	host.ports = await ns.getServerNumPortsRequired(name);
	host.hacked = await ns.hasRootAccess(name);
	host.hasMoney = await ns.getServerMaxMoney(name) > 0;
	host.dedotatedWam = await ns.getServerMaxRam(name);
	return host;
}
