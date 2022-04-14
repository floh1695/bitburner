/**
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export const main = async (ns) => {
    while(true) {
        const playerMoney = ns.getServerMoneyAvailable('home');
        const upgrades = await hacknetUpgrades(ns);

        const newNode = upgrades.newNode;
        const minLevelUpgrade = Math.min(...upgrades.levelUpgrades);
        const minRamUpgrade = Math.min(...upgrades.ramUpgrades);
        const minCoreUpgrade = Math.min(...upgrades.coreUpgrades);
        ns.print(`Upgrade costs: ${upgrades}`);
        ns.print(`Player's money: ${playerMoney}`);
        if (playerMoney > newNode) {
            ns.print(`Purchasing new node.`);
            ns.hacknet.purchaseNode();
        } else if (playerMoney > minRamUpgrade) {
            const node = upgrades.ramUpgrades.indexOf(minRamUpgrade);
            ns.print(`Purchasing ram upgrade.`);
            ns.hacknet.upgradeRam(node);
        } else if (playerMoney > minCoreUpgrade) {
            const node = upgrades.coreUpgrades.indexOf(minCoreUpgrade);
            ns.print(`Purchasing core upgrade.`);
            ns.hacknet.upgradeCore(node);
        } else if (playerMoney > minLevelUpgrade) {
            const node = upgrades.levelUpgrades.indexOf(minLevelUpgrade);
            ns.print(`Purchasing level upgrade.`);
            ns.hacknet.upgradeLevel(node);
        } else {
            ns.print(`Not enough money. Sleeping until payday.`);
        }
        await ns.sleep(1000);
    }
};

export const hacknetUpgrades = async (ns) => {
    const levelUpgrades = [];
    const ramUpgrades = [];
    const coreUpgrades = [];

    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        levelUpgrades.push(ns.hacknet.getLevelUpgradeCost(i));
        ramUpgrades.push(ns.hacknet.getRamUpgradeCost(i));
        coreUpgrades.push(ns.hacknet.getCoreUpgradeCost(i));
    }

    return {
        newNode: ns.hacknet.getPurchaseNodeCost(),
        levelUpgrades: levelUpgrades,
        ramUpgrades: ramUpgrades,
        coreUpgrades: coreUpgrades,
    };
};