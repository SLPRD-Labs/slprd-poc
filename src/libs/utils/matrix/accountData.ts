import type { MatrixEvent } from "matrix-js-sdk";

type MDirectContent = Record<string, string[]>;

export const toMDirectContent = (event?: MatrixEvent): MDirectContent => {
    if (event === undefined) return {};
    const content = event.getContent();
    if (typeof content !== "object") return {};
    return content as MDirectContent;
};
