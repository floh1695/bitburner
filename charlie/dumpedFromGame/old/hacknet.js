import { repeatAsyncMsF } from './repeat';

let testMode = false;
/** @param {() => void} f **/
// const ifTest = (f) => {
//     if (testMode) {
//         f();
//     }
// }

let recentUpgrade = true;

/** @param {NS} ns **/
export const main = async (ns) => {
    testMode = ns.args.some(a => ['-d', '--debug'].includes(a));

    const tryWork = tryWorkDelay(ns);
    if (testMode) {
        await tryWork();
    }
    else {
        const second = 1000;
        const minute = 60 * second;
        const msF = () => recentUpgrade
            ? second
            : minute;

        repeatAsyncMsF(tryWork, msF);
    }
};

const tryWorkDelay = (ns) =>
    async () => {
        try {
            await work(ns);
        }
        catch (e) {
            ns.tprint('Error: ', e.message);
        }
    }

const targets = {
    level: 100,
    ram: 64,
    cores: 8
};

/** @param {NS} ns **/
const work = async (ns) => {
    // recentUpgrade = false;

    ns.tprint('Start');
    getHacknetNodes(ns)
        .forEach(async (n) => {
            ns.tprint(n);

            // const index = n.index;
            // let money = 0;
            // const updateMoney = async () =>
            //     money = await getDisposableMoney(ns);
            // await updateMoney();

            // if (n.level < targets.level && money >= ns.hacknet.getLevelUpgradeCost(index, 1)) {
            //     ns.hacknet.upgradeLevel(index, 1);

            //     await updateMoney();
            //     recentUpgrade = true;
            // }
        });
    ns.tprint('End');
    ns.tprint();
};

/** @param {NS} ns **/
const getDisposableMoney = async (ns) => {
    const allMoney = await ns.getServerMoneyAvailable('home');

    // 1 hours income
    const emergencyFunds = getCurrentHacknetIncome(ns) * 60 * 60;
    
    return allMoney - emergencyFunds;
};

/** @param {NS} ns
 *  @returns {number} **/
const getCurrentHacknetIncome = (ns) =>
    getHacknetNodes(ns)
        .map(n => n.production)
        .reduce((a, b) => a + b, 0);

/** @param {NS} ns
 *  @returns {NodeStats[]} **/
const getHacknetNodes = (ns) => {
    const nodes = [];

    const nodeCount = ns.hacknet.numNodes();
    for (let n = 0; n < nodeCount; n += 1) {
        const node = ns.hacknet.getNodeStats(n);
        const newNode = { index: n, ...node };

        nodes.push(newNode);
    }

    return nodes;
};