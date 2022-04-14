/** @param {() => void} f
 *  @param {number} ms **/
export const repeat = (f, ms) => {
    repeatAsync(async () => f(), ms);
};

/** @param {() => Promise<void>} f
 *  @param {number} ms **/
export const repeatAsync = (f, ms) => {
    repeatAsyncMsF(f, () => ms);
};

/** @param {() => Promise<void>} f
 *  @param {() => number} msF **/
export const repeatAsyncMsF = (f, msF) => {
    const loop = async () => {
        await f();
        setTimeout(loop, msF());
    };
    setTimeout(loop, msF());
};