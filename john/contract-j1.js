import {getServers} from 'scan.js';

const getContracts = (ns, server) => {
	const contracts = ns.ls(server, '.cct')
	const contractData = contracts.map(cct => getContractData(ns, server, cct));

	return contractData;
}

const getContractData = (ns, server, cct) => {
	const data = ns.codingcontract.getData(cct, server);
	const type = ns.codingcontract.getContractType(cct, server);
	// const description = ns.codingcontract.getDescription(cct, server);
	// const tries = ns.codingcontract.getNumTriesRemaining(cct, server);

	return {
		server,
		filename: cct,
		data,
		type,
		// description,
		// tries,
	};
}

// Contract solutions
const largestPrimeFactor = (n) => {
	let largestFactor = 0;
	let target = n;
	for(let i = 2; i <= target; i++) {
		while (target % i == 0) {
			largestFactor = i;
			target = target / i;
		}
	}
	return (largestFactor ? largestFactor : n);
};

const solutions = {
	'Find Largest Prime Factor': largestPrimeFactor,
};

/** @param {NS} ns */
export async function main(ns) {

	const contracts =
		getServers(ns)
			.map(s => s.name)
			.flatMap(name => getContracts(ns, name));
	
	for(const contract of contracts){
		const type = contract.type;
		const data = contract.data;
		const solution = solutions[type];
		ns.tprint(contract);
		if (solutions[contract.type]) {
			const reward = ns.codingcontract.attempt(solution(data), contract.filename, contract.server, {returnReward: true});
			if (reward) {
				ns.tprint(`Solved ${contract.type}. Reward: ${reward}`);
			} else {
				ns.tprint(`Failed to solve ${contract.name}. Solution: ${solution(data)}.`);
			}

		} else {
			ns.tprint(`I don't know how to solve ${contract.type} yet.`);
		}
	}
}