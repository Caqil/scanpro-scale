import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Instead of completely disabling `any`, make it a warning or allow it in certain cases
      "@typescript-eslint/no-explicit-any": ["warn", {
        // Allow `any` when explicitly typing catch clause variables
        "allowExplicitAny": true,
        "fixToUnknown": false,
        "ignoreRestArgs": true
      }]
    }
  }
];

export default eslintConfig;