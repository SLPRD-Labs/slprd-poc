import type { MatrixClient } from "matrix-js-sdk";
import { createContext, use } from "react";

export interface IMatrixClientContext {
    client: MatrixClient;
    ready: boolean;
}

export const MatrixClientContext = createContext<IMatrixClientContext | null>(null);

export const useMatrixClientContext = (): IMatrixClientContext => {
    const matrixClientContext = use(MatrixClientContext);
    if (matrixClientContext === null) {
        throw new Error("useMatrixClientContext called without MatrixClientContextProvider");
    }
    return matrixClientContext;
};
