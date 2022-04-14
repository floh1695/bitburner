/** 
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export const main = async (ns) => {
    const nameTree = await buildServerTree(ns);
    const dataTree = await nameTree.mapAsync(n => getServerData(ns, n));

    const hackingLevel = ns.getHackingLevel();
    const hackProcesses = getHackingProcesses(ns);
    const hackCount = hackProcesses.length;
    const sshAccess = hackProcesses.some(h => h.file === 'BruteSSH.exe');

    const hackableServers = dataTree
        .breadthFirst()
        .flat()
        .map(n => n.data)
        .filter(sd => sd.name !== 'home')
        .filter(sd => hackingLevel >= sd.hackingRequired);

    const scriptName = 'standard.js';
    const scriptRam = ns.getScriptRam(scriptName);

    for (const server of hackableServers) {
        ns.tprint(`Setting up server ${server.name}`);

        for (const hack of hackProcesses) {
            await hack.process(server.name);
        }

        if (hackCount >= server.portsRequired) {
            await ns.nuke(server.name);
            await ns.killall(server.name);
            
            const threads = Math.floor(server.ramInGb / scriptRam);
            ns.tprint(`Starting ${threads} threads`);
            if (sshAccess && threads > 0) {
                await ns.scp(scriptName, server.name);
                await ns.exec(scriptName, server.name, threads);
            }
        }
    }
};

/**
 * @param {NS} ns
 * @returns {Promise<TreeNode<string>>}
 */
const buildServerTree = async (ns) => {
    const homeName = 'home';
    const tree = TreeNode.new(homeName);

    /**
     * @param {TreeNode<string>} node
     * @returns {Promise<void>}
     */
    const loop = async (node) => {
        const neighbors = await ns.scan(node.data);
        const children = neighbors
            .filter(n => !tree.includes(n))
            .map(TreeNode.new);

        for (const c of children) {
            node.addChild(c)
            await loop(c);
        }
    };

    await loop(tree);

    return tree;
};


/**
 * @typedef ServerData
 * @property {string} name
 * @property {number} hackingRequired
 * @property {number} portsRequired
 * @property {number} ramInGb
 */
const ServerData = {
    /** 
     * @param {string} name
     * @param {number} hackingRequired
     * @param {number} portsRequired
     * @param {number} ramInGb
     * @returns {ServerData}
     */
    new: (name, hackingRequired, portsRequired, ramInGb) => ({
        name,
        hackingRequired,
        portsRequired,
        ramInGb,
    }),
};

/**
 * @param {NS} ns
 * @param {string} name
 * @returns {Promise<ServerData>}
 */
const getServerData = async (ns, name) => {
    const hackingRequired = ns.getServerRequiredHackingLevel(name);
    const portsRequired = ns.getServerNumPortsRequired(name);
    const ramInGb = ns.getServerMaxRam(name);

    const data = ServerData.new(name, hackingRequired, portsRequired, ramInGb);
    
    return data;
}


/**
 * @typedef HackProcess
 * @property {string} file
 * @property {(host: string) => Promise<void>} process
 */
const HackProcess = {
    /** 
     * @param {string} file
     * @param {(host: string) => Promise<void>} process
     * @returns {HackProcess}
     */
    new: (file, process) => ({
        file,
        process,
    }),
};

/** 
 * @param {NS} ns
 * @returns {HackProcess[]}
 */
const getHackingProcesses = (ns) => {
    const hacks = [
        HackProcess.new('BruteSSH.exe', ns.brutessh),
        HackProcess.new('FTPCrack.exe', ns.ftpcrack),
        HackProcess.new('relaySMTP.exe', ns.relaysmtp),
        HackProcess.new('HTTPWorm.exe', ns.httpworm),
        HackProcess.new('SQLInject.exe', ns.sqlinject),
    ];

    const availableHacks = hacks.filter(h => ns.fileExists(h.file));

    return availableHacks;
};



/**
 * TreeNode copied from {import('./shared/tree.js').TreeNode}
 * @template A
 */
class TreeNode {
    /**
     * @param {A} data
     */
    constructor(data) {
        this.data = data;
        /** @type {TreeNode<A> | null} */
        this.parent = null;
        /** @type {TreeNode<A>[]} */
        this.children = [];
    };

    /**
     * @template A
     * @param {A} data
     * @returns {TreeNode<A>}
     */
    static new(data) {
        return new TreeNode(data);
    }

    /**
     * @param {TreeNode<A>} child 
     */
    addChild(child) {
        if (child == null) throw `Child is ${child}`;
        if (child.parent !== null) throw 'Child already has a parent';

        this.children.push(child);
        child.parent = this;
    }

    /**
     * @returns {TreeNode<A>[][]}
     */
    breadthFirst() {
        const levels = [[this]];

        /**
         * @param {TreeNode<A>[]} level
         */
        const loop = (level) => {
            if (level.length === 0) return;

            levels.push(level);
            const nextLevel = level.flatMap(c => c.children);
            loop(nextLevel);
        };

        loop(this.children);

        return levels;
    }

    /**
     * @param {A} needle
     * @param {((a1: A, a2: A) => boolean) | null} [equals=null]
     */
    includes(needle, equals = null) {
        if (equals === null) equals = (a1, a2) => a1 === a2;

        return equals(this.data, needle)
            || this.children.some(c => c.includes(needle, equals));
    }

    /**
     * @template B
     * @param {(a: A) => B} f
     * @returns {TreeNode<B>}
     */
    map(f) {
        const data = f(this.data);
        const node = TreeNode.new(data);
        const children = this.children
            .map(c => c.map(f));

        children.forEach(c => node.addChild(c));

        return node;
    }

    /**
     * @template B
     * @param {(a: A) => Promise<B>} f
     * @returns {Promise<TreeNode<B>>}
     */
    async mapAsync(f) {
        const data = await f(this.data);
        const node = TreeNode.new(data);

        for (const c of this.children) {
            const newChild = await c.mapAsync(f);
            node.addChild(newChild);
        }

        return node;
    }
}