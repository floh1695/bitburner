/** @param {NS} ns **/
export const main = async (ns) => {
    try {
        await work(ns);
    }
    catch (e) {
        ns.tprint('Error:', e);
    }
};

/** @param {NS} ns **/
const work = async (ns) => {
    const hostname = ns.getHostname();
    const neighbors = await ns.scan(hostname);
    ns.tprint(neighbors);

    if (neighbors.length === 0) return;
    const neighbor = neighbors[0]
    ns.tprint(neighbor);

    await ns.connect(neighbor);
    const newHostname = ns.getHostname();
    ns.tprint(newHostname);
};