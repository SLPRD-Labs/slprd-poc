import type { MatrixEvent } from "matrix-js-sdk";

export const getChildOrder = (e: MatrixEvent): [string | undefined, number, string] => {
    return [sanitizeOrder(e), e.getTs(), e.getStateKey() ?? ""];
};

export const sanitizeOrder = (e: MatrixEvent): string | undefined => {
    const order: unknown = e.getContent().order;

    if (typeof order !== "string" || order.length > 50) {
        return undefined;
    }

    for (const c of order) {
        const charCode = c.charCodeAt(0);
        if (charCode < 0x20 || charCode > 0x7e) {
            return undefined;
        }
    }

    return order;
};
