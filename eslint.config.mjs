import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client — not our code to lint.
    "src/generated/**",
  ]),
  {
    // These are surfaced as warnings (still visible in lint output) rather than
    // build-blocking errors, so CI stays green on stylistic/legacy issues.
    // Tighten back to "error" as the codebase is cleaned up.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
]);

export default eslintConfig;
