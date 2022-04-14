let testMode = false;
let firstRun = true;
let recentUpgrade = false;
let quietMode = false;

/** @param {NS} ns
 *  @param {any[]} args **/
const tprint = (ns, ...args) => {
    if (!quietMode) {
        ns.tprint('Hacknet: ', ...args);
    }
}

/** @param {NS} ns **/
export const main = async (ns) => {
    testMode = ns.args.some(a => ['-d', '--debug'].includes(a));
    quietMode = ns.args.some(a => ['-q', '--quiet'].includes(a));

    tprint(ns, 'Starting process');

    if (testMode) {
        await work(ns);
    }
    else {
        await loop(ns);
    }

    tprint(ns, 'Ending process');
};

const second = 1000;
const minute = 60 * second;
const timeToNextRun = () => firstRun || recentUpgrade
    ? second
    : minute;

/** @param {NS} ns **/
const loop = async (ns) => {
    while (true) {
        work(ns);
        
        await ns.sleep(timeToNextRun());
    }
};

const targets = {
    total: 24,
    level: 200,
    ram: 64,
    // cores: 100
};

/** @param {NS} ns **/
const work = (ns) => {
    if (!recentUpgrade) tprint(ns, 'Start work');

    firstRun = false;
    recentUpgrade = false;

    const disposable = getDisposableMoney(ns, 60 * 30);
    tprint(ns, 'Disposable money: $', disposable);

    if (disposable > 0) {
        const nodes = getHacknetNodes(ns);
        const nodeCount = nodes.length;
        
        nodes.forEach(n => nodeLoop(ns, n, nodeCount));
    }

    if (!recentUpgrade) tprint(ns, 'End work');
};

/** @param {NS} ns 
 *  @param {NodeStats} node 
 *  @param {number} nodeCount **/
const nodeLoop = (ns, node, nodeCount) => {
    const index = node.index;

    let money = 0;
    const updateMoney = () =>
        money = getDisposableMoney(ns, 60 * 30);
    updateMoney();

    /** @param {string} banner
     *  @param {() => number} currentF
     *  @param {() => number} targetF
     *  @param {() => number} costF
     *  @param {() => void} purchaseF **/
    const handlePurchase = (banner, currentF, targetF, costF, purchaseF) => {
        if (currentF() < targetF() && money >= costF()) {
            purchaseF();
            tprint(ns, banner);

            updateMoney();
            recentUpgrade = true;
        }
    }

    handlePurchase(
        `Leveling ${node.name}`,
        () => node.level,
        () => targets.level,
        () => ns.hacknet.getLevelUpgradeCost(index, 1),
        () => ns.hacknet.upgradeLevel(index, 1)
    );

    handlePurchase(
        `Adding more ram to ${node.name}`,
        () => node.ram,
        () => targets.ram,
        () => ns.hacknet.getRamUpgradeCost(index, 1),
        () => ns.hacknet.upgradeRam(index, 1)
    )

    handlePurchase(
        `Adding more cores to ${node.name}`,
        () => node.cores,
        () => targets.cores,
        () => ns.hacknet.getCoreUpgradeCost(index, 1),
        () => ns.hacknet.upgradeCore(index, 1)
    );

    handlePurchase(
        'Buying new nodes',
        () => nodeCount,
        () => ns.hacknet.maxNumNodes(),
        () => ns.hacknet.getPurchaseNodeCost(),
        () => ns.hacknet.purchaseNode(),
    );
};

/** @param {NS} ns
 *  @param {number} seconds **/
const getDisposableMoney = (ns, seconds) => {
    const allMoney = ns.getServerMoneyAvailable('home');

    // 1/2 hours income
    const emergencyFunds = getCurrentHacknetIncome(ns) * seconds;
    
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