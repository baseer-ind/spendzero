// Installs a global JS error handler BEFORE any other module loads, so a
// crash during bundle evaluation (import chain) is logged instead of
// silently freezing the app on the splash screen. React's ErrorBoundary
// can only catch errors during render — this catches everything else.
declare const ErrorUtils: {
  getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

if (typeof ErrorUtils !== "undefined") {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(`[GlobalError] isFatal=${isFatal}`, error?.message, error?.stack);
    defaultHandler(error, isFatal);
  });
}

console.log(`[Init] index.ts start @ ${Date.now()}`);

import "expo-router/entry";

console.log(`[Init] expo-router/entry imported @ ${Date.now()}`);
