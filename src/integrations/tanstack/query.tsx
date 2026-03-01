import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import type { FC, PropsWithChildren } from "react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000
        }
    }
});

export const TanStackQueryProvider: FC<PropsWithChildren> = ({ children }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export const TanStackQueryDevtoolsPlugin: FC = () => {
    return <ReactQueryDevtoolsPanel client={queryClient} />;
};
