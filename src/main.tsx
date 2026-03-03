import { AuthContextProvider } from "@/contexts/auth-context/auth-context-provider";
import { TanStackQueryDevtoolsPlugin, TanStackQueryProvider } from "@/integrations/tanstack/query";
import {
    TanStackRouterDevtoolsPlugin,
    TanStackRouterProvider
} from "@/integrations/tanstack/router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";

const rootElement = document.querySelector("#root");
if (!rootElement) {
    throw new Error("Root element not found");
}

const root = createRoot(rootElement);

const t
	= "";

root.render(
    <StrictMode>
        <AuthContextProvider>
            <TanStackQueryProvider>
                <TanStackRouterProvider />
                <TanStackDevtools
                    plugins={[
                        {
                            name: "TanStack Query",
                            render: <TanStackQueryDevtoolsPlugin />,
                            defaultOpen: true
                        },
                        {
                            name: "TanStack Router",
                            render: <TanStackRouterDevtoolsPlugin />,
                            defaultOpen: true
                        }
                    ]}
                />
            </TanStackQueryProvider>
        </AuthContextProvider>
    </StrictMode>
);
