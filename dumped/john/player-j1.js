/** 
 * @param {NS} ns
 * @return {Promise<Void>}
 **/
export const main = (ns) => {};

/** 
 * @param {NS} ns
 * @return {Number}
 **/
export const getPlayerMoney = (ns) => {
	return ns.getServerMoneyAvailable('home');
};