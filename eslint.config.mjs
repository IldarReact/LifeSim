import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // ❌ Полный запрет any
      "@typescript-eslint/no-explicit-any": "error",

      // ❌ Запрет одинаковых имён функций
      "no-func-assign": "error",
      "no-redeclare": "error",

      // ❌ Переменные должны быть уникальными
      "no-shadow": "error",

      // ❌ Запрет функции в блоках типа if — только в корне
      "no-inner-declarations": "error",

      // ❌ Запрет мутировать аргументы функции
      "no-param-reassign": "error",

      // ❌ Запрет var
      "no-var": "error",

      // ❌ Запрет неиспользуемых переменных
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }
      ],

      // ❌ Запрет магических чисел
      "no-magic-numbers": [
        "warn",
        {
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignore: [0, 1, -1, 100],
        }
      ],

      // ❌ Запрет console.log в продакшне
      "no-console": process.env.NODE_ENV === "production"
        ? "error"
        : "warn",

      // ❌ Запрет неиспользуемых импортов
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",

      // ✔ Красивый порядок импортов
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // ✔ Проверка React hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },

    // Плагины
    plugins: {
      "unused-imports": require("eslint-plugin-unused-imports"),
    },
  },
];
