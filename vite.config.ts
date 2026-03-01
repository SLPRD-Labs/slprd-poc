import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
    plugins: [
        devtools(),
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true
        }),
        react({
            babel: {
                plugins: ["babel-plugin-react-compiler"]
            }
        }),
        tailwindcss(),
        eslint({
            cache: false
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./src")
        }
    },
    build: {
        sourcemap: true
    }
});
