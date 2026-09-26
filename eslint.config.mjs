import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jestDom from "eslint-plugin-jest-dom";
import testingLibrary from "eslint-plugin-testing-library";

const eslintConfig = [
  {
    ignores: ["coverage/**", ".next/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    ...testingLibrary.configs["flat/react"],
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    ...jestDom.configs["flat/recommended"],
  },
];

export default eslintConfig;
