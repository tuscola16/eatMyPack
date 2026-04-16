// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Use react-native-svg-transformer for .svg files
config.resolver.sourceExts.push('svg');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');

module.exports = config;
