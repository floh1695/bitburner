/** @param {NS} ns **/
export const main = async (ns) => {
    try {
        await work(ns, 0.6);
    }
    catch (e) {
        ns.tprint('Error: ', e.message);
    }
};

/** @param {NS} ns
 *  @param {number} targetMoneyRatio **/
const work = async (ns, targetMoneyRatio) => {
    const hostname = ns.getHostname();
    while (true) {
        const moneyPercentage = await getServerPercentageOfMoneyAvailable(ns, hostname);
        if (moneyPercentage < targetMoneyRatio) {
            await ns.grow(hostname);
        }
        await ns.hack(hostname);
        await ns.weaken(hostname);
    }
};

/** @param {NS} ns
 *  @param {string} hostname **/
const getServerPercentageOfMoneyAvailable = async (ns, hostname) => {
    const available = await ns.getServerMoneyAvailable(hostname);
    const max = await ns.getServerMaxMoney(hostname);

    return available / max;
};