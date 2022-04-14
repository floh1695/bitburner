/** @param {NS} ns */
export async function main(ns) {
    const options = parseArgs(ns.args);

    const connectCommands = options.servers
        .map(s => `connect ${s}`);
    const connectCommandsReverse = connectCommands
        .map(x => x)
        .reverse()
        .concat('connect home')
        .filter((_, i) => i > 0);

    const scriptName = 'standard.js';
    const scpConnectChain = options.servers
        .flatMap(s => [
            `scp ${scriptName} ${s}`,
            `connect ${s}`,
        ]);

    const commands = [
        [
            ...connectCommands,
            'run BruteSSH.exe',
            'run NUKE.exe',
            'backdoor',
        ],
        [
            ...connectCommandsReverse,
            ...scpConnectChain,
            `run ${scriptName}`,
            ...connectCommandsReverse,
        ],
    ];

    const lines = commands.map(x => x.join('; '));
    lines.forEach(l => ns.tprint('Command: ', l));

    const asOne = commands[0]
        .slice(0, -1)
        .concat(commands[1])
        .join('; ');
    ns.tprint('*Command*: ', asOne);
};

/** @param {string[]} args */
const parseArgs = (args) => {
    const options = {
        servers: []
    };

    let flag = '';
    args.forEach(arg => {
        if (flag == '') {
            if (['-s', '--server'].includes(arg)) {
                flag = 'server';
            }
        }
        else {
            if (flag === 'server') {
                options.servers.push(arg);
            }

            flag = '';
        }
    });

    return options;
};