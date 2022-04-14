/** 
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export const main = async (ns) => {
    const options = parseArgs(ns.args);
    const portHacks = getPortHacks(ns);
    const hackingLevel = ns.getHackingLevel();
    const hacksAvailable = portHacks.length;
    const servers = createServerDescriptions(options.includeDarkweb)
        // .filter(s => hackingLevel >= s.hackingLevel)
        // .filter(s => hacksAvailable >= s.portsRequired);
    const serverTree = buildServerTree(servers);
    
    ns.tprint('Nuking servers:');
    servers.forEach(s => ns.tprint('  ', s));

    /**
     * @param {ServerDescription} s
     * @returns {string[]}
     */
    const createHackCommands = (s) => {
        const serverNameToConnectCommand = name => `connect ${name}`;

        const getToServer = s.path
            .concat(s.serverName)
            .map(serverNameToConnectCommand);

        const hackCommands = portHacks.map(hack => `run ${hack}`);

        const nukeCommand = 'run NUKE.exe';

        const getBackHome = s.path
            .map(x => x)
            .reverse()
            .concat('home')
            .map(serverNameToConnectCommand);

        const commands = [
            ...getToServer,
            ...hackCommands,
            nukeCommand,
            ...getBackHome,
        ];

        return commands;
    };

    const commands = servers.flatMap(createHackCommands);
    const formattedCommands = commands.join('; ');

    ns.tprint(formattedCommands);
};

/**
 * @typedef {Object} Options
 * @property {boolean} includeDarkweb
 */
/**
 * @param {string[]} args
 * @returns {Options}
 */
const parseArgs = (args) => {
    const options = {
        includeDarkweb: false,
    };

    const tasks = {
        darkweb: () => options.includeDarkweb = true,
    };

    const flagMap = {
        x: 'darkweb'
    };

    const paramsPerFlag = {
        darkweb: 0,
    };

    const longFlagPattern = /^--(.+)$/;
    const shortFlagPattern = /^-(.+)$/;
    let currentFlag = '';
    let remainingParams = 0;
    let currentParams = [];
    args.forEach(arg => {
        if (currentFlag === '') {
            const longFlagMatch = arg.match(longFlagPattern);
            if (longFlagMatch !== null) {
                currentFlag = longFlagMatch[1];
            }

            if (currentFlag === '') {
                const shortFlagMatch = arg.match(shortFlagPattern);
                if (shortFlagMatch !== null) {
                    const shortFlag = shortFlagMatch[1];
                    currentFlag = flagMap[shortFlag];
                }
            }

            remainingParams = paramsPerFlag[currentFlag];
        }
        else if (remainingParams > 0) {
            currentParams.push(arg);
            remainingParams -= 1;
        }

        if (remainingParams === 0) {
            tasks[currentFlag](...currentParams);

            currentFlag = '';
            currentParams = [];
        }
    });

    return options;
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

/**
 * @param {boolean} includeDarkweb
 * @returns {ServerDescription[]} Yields the descriptions for all servers
 */
const createServerDescriptions = (includeDarkweb) => {
    const servers = [
        ServerDescription.new(
            'n00dles',
            [],
            1,
            0
        ),
        ServerDescription.new(
            'foodnstuff',
            [],
            1,
            0
        ),
        ServerDescription.new(
            'nectar-net',
            ['foodnstuff'],
            20,
            0
        ),
        ServerDescription.new(
            'silver-helix',
            ['foodnstuff', 'nectar-net'],
            150,
            2
        ),
        ServerDescription.new(
            'crush-fitness',
            ['foodnstuff', 'nectar-net', 'silver-helix'],
            236,
            2
        ),
        ServerDescription.new(
            'sigma-cosmetics',
            [],
            5,
            0
        ),
        ServerDescription.new(
            'joesguns',
            [],
            10,
            0
        ),
        ServerDescription.new(
            'zer0',
            ['joesguns'],
            75,
            1
        ),
        ServerDescription.new(
            'neo-net',
            ['joesguns', 'zer0'],
            50,
            1
        ),
        ServerDescription.new(
            'the-hub',
            ['joesguns', 'zer0', 'neo-net'],
            302,
            2
        ),
        ServerDescription.new(
            'rothman-uni',
            ['joesguns', 'zer0', 'neo-net', 'the-hub'],
            377,
            3
        ),
        ServerDescription.new(
            'syscore',
            ['joesguns', 'zer0', 'neo-net', 'the-hub'],
            591,
            4
        ),
        ServerDescription.new(
            'catalyst',
            ['joesguns', 'zer0', 'neo-net', 'the-hub'],
            412,
            3
        ),
        ServerDescription.new(
            'avmnite-02h',
            ['joesguns', 'zer0', 'neo-net'],
            220,
            2
        ),

        // Sweep: Scaning depth 5
        ServerDescription.new(
            'hong-fang-tea',
            [],
            30,
            0
        ),
        ServerDescription.new(
            'harakiri-sushi',
            [],
            40,
            0
        ),
        ServerDescription.new(
            'iron-gym',
            [],
            100,
            1
        ),
        ServerDescription.new(
            'darkweb',
            [],
            1,
            5
        ),
    ];

    const filtered = servers
        .filter(s => true
            && (includeDarkweb || s.serverName != 'darkweb')
        );

    return filtered;
};

/** 
 * @param {ServerDescription} servers
 */
const buildServerTree = (servers) => {
    const homeNode = ServerNode.new(
        'home',
        0,
        0,
        null,
        []
    );
};

/**
 * @param {ServerNode} root
 * @param {ServerDescription} servers
 */
const buildServerTreeRecurse = (root, servers) => {
    const 
};

/**
 * @typedef {Object} ServerNode
 * @property {string} name,
 * @property {number} hackingLevel
 * @property {number} portsRequired
 * @property {ServerNode | null} parent
 * @property {ServerNode[]} children
 */
const ServerNode = {
    /**
     * @param {string} name,
     * @param {number} hackingLevel
     * @param {number} portsRequired
     * @param {ServerNode | null} parent
     * @param {ServerNode[]} children
     * @returns {ServerNode}
     */
    new: (name, hackingLevel, portsRequired, parent, children) => ({
        name,
        hackingLevel,
        portsRequired,
        parent,
        children,
    }),
};

/**
 * @typedef {Object} ServerDescription
 * @property {string} serverName
 * @property {string[]} path
 * @property {number} portsRequired
 * @property {number} hackingLevel
 */
const ServerDescription = {
    /** 
     * @param {string} serverName
     * @param {string[]} path
     * @param {number} hackingLevel
     * @param {number} portsRequired
     * @returns {ServerDescription} Holds data about a particular server
     */
    new: (serverName, path, hackingLevel, portsRequired) => ({
        serverName,
        path,
        hackingLevel,
        portsRequired,
    }),
};