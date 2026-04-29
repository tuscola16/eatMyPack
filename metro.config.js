const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

// Remove deprecated Metro watcher option set by older Sentry versions
if (config.watcher) {
  delete config.watcher.unstable_workerThreads;
}

// Use react-native-svg-transformer for .svg files
config.resolver.sourceExts.push('svg');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');

module.exports = config;