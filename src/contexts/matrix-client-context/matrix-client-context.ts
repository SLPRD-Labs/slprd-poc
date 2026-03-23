import type { MatrixSession } from "@/contexts/auth-context/auth-context";
import type { LoginOpts } from "@/contexts/auth-context/auth-context-provider";
import { createContext, use } from "react";

export interface IMatrixClientContext {
    ready: boolean;
    start: (opts: LoginOpts) => Promise<MatrixSession>;
    stop: () => Promise<void>;
}

export const MatrixClientContext = createContext<IMatrixClientContext | null>(null);

export const useMatrixClientContext = (): IMatrixClientContext => {
    const matrixClientContext = use(MatrixClientContext);
    if (matrixClientContext === null) {
        throw new Error("useMatrixClientContext called without MatrixClientContextProvider");
    }
    return matrixClientContext;
};
