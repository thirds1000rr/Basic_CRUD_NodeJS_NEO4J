import type { IAST, Visitor } from "./types";
export declare abstract class AST implements IAST {
    id: any;
    children: IAST[];
    addChildren(node: IAST): void;
    abstract accept(visitor: Visitor): void;
}
//# sourceMappingURL=AST.d.ts.map