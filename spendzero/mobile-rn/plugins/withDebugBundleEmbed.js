const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * React Native's Gradle plugin skips embedding the JS bundle for the
 * `debug` build variant by default (see the `debuggableVariants` doc
 * comment it generates in android/app/build.gradle) — debug builds are
 * meant to load JS from a running Metro/Expo dev server instead.
 *
 * A debug APK built by CI and sideloaded onto a device with no dev server
 * reachable will sit on the splash screen forever: no JS ever runs (no
 * ReactNativeJS logs at all), because there's no bundle to load from and
 * no server to fetch one from. Setting debuggableVariants = [] makes the
 * debug variant embed its own JS bundle like release does, so the APK is
 * fully standalone.
 */
module.exports = function withDebugBundleEmbed(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error("withDebugBundleEmbed only supports Groovy build.gradle files");
    }
    if (!config.modResults.contents.includes("debuggableVariants = []")) {
      config.modResults.contents = config.modResults.contents.replace(
        /autolinkLibrariesWithApp\(\)/,
        `debuggableVariants = []\n    autolinkLibrariesWithApp()`,
      );
    }
    return config;
  });
};
