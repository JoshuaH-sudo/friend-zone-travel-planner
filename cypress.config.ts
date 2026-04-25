import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.ts",
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on) {
      on("task", {
        /**
         * Returns the predefined test fixture data.
         * Use in conjunction with cy.window() to seed the app's IndexedDB
         * via the browser context.
         */
        getTestData() {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require("./cypress/fixtures/test-data.json");
        },

        /** No-op task used as a logging helper in tests. */
        log(message: string) {
          console.log("[Cypress]", message);
          return null;
        },
      });
    },
  },
});
