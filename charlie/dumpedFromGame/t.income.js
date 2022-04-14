/** 
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export const main = async (ns) => {
    const scriptIncome = ns.getScriptIncome()[0];

    ns.tprint('Income From Scripts: ', scriptIncome);
};