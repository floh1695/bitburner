/** 
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export const main = async (ns) => {
    const homeNode = getHomeNode();
    const hacks = getPortHacks(ns);
    const hackingLevel = ns.getHackingLevel();
    const commands = buildCommands(homeNode, hacks, hackingLevel);
    const singleLineCommand = commands.join('; ');

    ns.tprint(singleLineCommand);
};

/** 
 * @param {NS} ns
 * @returns {string[]}
 */
const getPortHacks = (ns) => {
    const hacks = [
        'BruteSSH.exe',
        'FTPCrack.exe',
        'relaySMTP.exe',
        'HTTPWorm.exe',
        'SQLInject.exe'
    ];

    const avaialableHacks = hacks.filter(h => ns.fileExists(h));

    return avaialableHacks;
};

/** @returns {ServerNode} */
const getHomeNode = () => {
    const records = getServerRecords();
    const homeNode = ServerNode.fromRecords(records)
        .filter(n => n.name === 'home')[0];

    return homeNode;
};

/**
 * @param {ServerNode} rootNode
 * @param {string[]} hacks
 * @param {number} hackingLevel
 * @returns {string[]}
 */
const buildCommands = (rootNode, hacks, hackingLevel) => {
    const hackCommands = hacks.map(h => `run ${h}`);

    /**
     * @param {ServerNode} child
     * @param {ServerNode} parent
     * @param {boolean} canHack
     * @param {boolean} canNuke
     * @param {boolean} sshAccess
     * @returns {string[]}
     */
    const createHackWork = (child, parent, canHack, canNuke, sshAccess) => {
        if (!canHack) return [];

        const hackCommands_ = canHack
            ? hackCommands
            : [];

        const nukeCommands = canNuke
            ? ['run NUKE.exe']
            : [];

        const standardScript = 'standard.js';
        const standardScriptRamInGb = 2.25;
        const copyCommands = sshAccess
            ? [
                `connect ${parent.name}`,
                `scp ${standardScript} ${child.name}`,
                `connect ${child.name}`,
            ]
            : [];

        const scriptInstances = Math.floor(child.ramInGb / standardScriptRamInGb);
        const runScriptCommands = [...Array(scriptInstances).keys()]
            .map(i => `run ${standardScript} ${i}`);
        const runCommands = canNuke && sshAccess
            ? [
                'killall',
                ...runScriptCommands,
            ]
            : [];

        const commands = [
            ...hackCommands_,
            ...nukeCommands,
            ...copyCommands,
            ...runCommands,
        ];

        return commands;
    };

    const totalHacks = hacks.length;
    /**
     * @param {ServerNode} node
     * @param {boolean} hadSshAccess
     * @returns {string[]}
     */
    const loop = (node, hadSshAccess) => {
        const commands = node.children
            .flatMap(c => {
                const canHack = hackingLevel >= c.hackingLevel;
                const canNuke = canHack && totalHacks >= c.portsRequired;
                const sshAccess = hadSshAccess && canHack;
                const commands = [
                    `connect ${c.name}`,
                    ...createHackWork(c, node, canHack, canNuke, sshAccess),
                    ...loop(c),
                    `connect ${node.name}`
                ];

                return commands;
            });

        return commands;
    };

    const hasSshHack = hacks.some(h => h === 'BruteSSH.exe');
    const commands = loop(rootNode, hasSshHack);

    return commands;
};



/* Generic code below */



/**
 * @typedef ServerNode
 * @property {string} name
 * @property {ServerNode | null} parent
 * @property {ServerNode[]} children
 * @property {number} hackingLevel
 * @property {number} portsRequired
 * @property {number} ramInGb
 * @property {(child: ServerNode) => void} addChild
 */
const ServerNode = {
    /**
     * @param {string} name
     * @param {ServerNode | null} parent
     * @param {ServerNode[]} children
     * @param {number} hackingLevel
     * @param {number} portsRequired
     * @param {number} ramInGb
     * @returns {ServerNode}
     */
    new: (name, parent, children, hackingLevel, portsRequired, ramInGb) => {
        const node = {
            name,
            parent,
            children,
            hackingLevel,
            portsRequired,
            ramInGb,
            addChild: (child) => {
                if (child.parent !== null) {
                    throw `Cannot add child "${child.name}" to parent "${node.name}" since the child already has the parent "${child.parent.name}"`;
                }
                
                node.children.push(child);
                child.parent = node;
            },
        };

        return node;
    },
    /**
     * @param {ServerRecord} record
     * @returns {ServerNode}
     */
    fromRecord: (record) => ServerNode.new(
        record.name,
        null,
        [],
        record.hackingLevel,
        record.portsRequired,
        record.ramInGb
    ),
    /**
     * @param {ServerRecord[]} records
     * @returns {ServerNode[]}
     */
    fromRecords: (records) => {
        const rootRecords = records.filter(r => r.parent === null);
        const rootNodes = rootRecords.map(ServerNode.fromRecord);
        
        rootNodes.forEach(n => ServerNode.buildServerTree(n, records));

        return rootNodes;
    },
    /**
     * @param {ServerNode} current
     * @param {ServerRecord[]} records
     */
    buildServerTree: (current, records) => {
        const isChildRecord = r => r.parent === current.name;
        const children = records
            .filter(isChildRecord)
            .map(ServerNode.fromRecord);

        const nextRecords = records.filter(r => !isChildRecord(r));
        children
            .forEach(n => {
                current.addChild(n)
                ServerNode.buildServerTree(n, nextRecords);
            });
    },
};

/**
 * @typedef ServerRecord
 * @property {string} name
 * @property {string | null} parent
 * @property {number} hackingLevel
 * @property {number} portsRequired
 * @property {number} ramInGb
 */
const ServerRecord = {
    /**
     * @param {string} name
     * @param {string | null} parent
     * @param {number} hackingLevel
     * @param {number} portsRequired
     * @param {number} ramInGb
     * @returns {ServerRecord}
     */
    new: (name, parent, hackingLevel, portsRequired, ramInGb) => ({
        name,
        parent,
        hackingLevel,
        portsRequired,
        ramInGb,
    }),
};

/** @returns {ServerRecord[]} */
const getServerRecords = () => {
    const records = [
        ServerRecord.new('home', null, 1, 0, 0),
        ServerRecord.new('n00dles', 'home', 1, 0, 4),
        ServerRecord.new('foodnstuff', 'home', 1, 0, 16),
        ServerRecord.new('sigma-cosmetics', 'home', 5, 0, 16),
        ServerRecord.new('joesguns', 'home', 10, 0, 16),
        ServerRecord.new('hong-fang-tea', 'home', 30, 0, 16),
        ServerRecord.new('harakiri-sushi', 'home', 40, 0, 16),
        ServerRecord.new('iron-gym', 'home', 100, 1, 32),

        ServerRecord.new('zer0', 'sigma-cosmetics', 75, 1, 32),
        ServerRecord.new('nectar-net', 'joesguns', 20, 0, 16),
        ServerRecord.new('max-hardware', 'hong-fang-tea', 80, 1, 32),
        ServerRecord.new('CSEC', 'harakiri-sushi', 54, 1, 8),

        ServerRecord.new('silver-helix', 'zer0', 150, 2, 64),
        ServerRecord.new('neo-net', 'nectar-net', 50, 1, 32),
        ServerRecord.new('omega-net', 'max-hardware', 186, 2, 32),
        ServerRecord.new('phantasy', 'CSEC', 100, 2, 32),
    ];

    return records;
};