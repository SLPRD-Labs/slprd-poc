import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import jsImport from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";
import viteConfig from "./vite.config.ts";

export default defineConfig([
    globalIgnores([
        "node_modules",
        "dist",
        "src/components/ui/*",
        "!src/components/ui/data-table.tsx",
        "!src/components/ui/data-table-column-header.tsx",
        "!src/components/ui/data-table-actions.tsx",
        "src/routeTree.gen.ts"
    ]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            jsImport.flatConfigs.recommended,
            jsImport.flatConfigs.typescript,
            jsImport.flatConfigs.react,
            ...ts.configs.strictTypeChecked,
            ...ts.configs.stylisticTypeChecked,
            react.configs.flat.recommended,
            react.configs.flat["jsx-runtime"],
            reactHooks.configs.flat["recommended-latest"],
            reactRefresh.configs.vite,
            jsxA11y.flatConfigs.strict,
            eslintConfigPrettier
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                projectService: true
            }
        },
        settings: {
            react: {
                version: "detect"
            },
            "import/resolver": {
                typescript: {},
                vite: {
                    viteConfig
                }
            }
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": ["error"],
            "@typescript-eslint/no-import-type-side-effects": ["error"],
            "@typescript-eslint/consistent-type-exports": [
                "error",
                {
                    fixMixedExportsWithInlineTypeSpecifier: false
                }
            ],
            "import/consistent-type-specifier-style": ["error", "prefer-top-level"]
        }
    }
]);
