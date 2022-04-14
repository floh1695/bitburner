/**
 * @template A
 */
export class TreeNode {
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