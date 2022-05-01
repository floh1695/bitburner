/** @param {NS} ns */
export async function main(ns) {
	await print_parent_of(ns,'home',ns.args[0]);
}

const print_parent_of = async function(ns,name,current='home')
{
	if(current == name)
	{
		return true;
	}
	var children = await ns.scan(current);
	for(var child of children)
	{
		if(await print_parent_of(ns,name,child))
		{
			await ns.tprint(current);
			return true;
		}
	}
	return false;
}
