/** @param {NS} ns */
export async function main(ns) {
	const array = [4, 0, 2, 1, 3, 4, 1, 1, 6, 3, 1, 2, 4, 1, 3, 0];
	ns.tprintf(arrayJumperII(array));

}

export function arrayJumperII(array) {
	let jumps = array[0];
	let index = 0;
	let subset = array.slice(4);
	// get the first jump
	// find the best jump in that subset

}

// Each jump is worth their number + their index.
// ie. [5, 4, 3, 2, 1] are all worth the same amount because they would all get us to the same place
function bestJump(array) {

	let maxIndex = 0;
	let maxJump = array[0];
	for(let i = array.length - 1; i >= 0; i--) {
		if ((array[i] + i) > (maxIndex + maxJump)) {
			maxJump = array[i];
			maxIndex = i;
		}
	}
}
