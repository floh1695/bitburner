/** @param {NS} ns */
export const main = async (ns) => {
    setupEnvironment(ns);

    environment.print('Hello World!');

    // ns.
};

const environment = {
    /** @param {any[]} args */
    print: (...args) => {},
};

/** @param {NS} ns */
const setupEnvironment = (ns) => {
    const banner = 'Hacknet *new*';
    environment.print = (...args) => ns.tprint(banner, ': ', ...args);
};