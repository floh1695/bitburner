/** 
 * @param {NS} ns
 * @return {Promise<Void>}
 **/
export const main = async (ns) => {};

/** 
 * @param {NS} ns
 * @return {Number}
 **/
export const getPlayerMoney = async (ns) => {
	return ns.getServerMoneyAvailable('home');
};