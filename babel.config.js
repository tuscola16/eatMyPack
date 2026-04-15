module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Transform import.meta.env references for web compatibility.
      // Zustand uses import.meta.env.MODE which fails in non-module script contexts.
      function importMetaEnvPlugin() {
        return {
          visitor: {
            MetaProperty(path) {
              // Transform import.meta.env.X → process.env.X
              const { parent } = path;
              if (
                parent.type === 'MemberExpression' &&
                parent.property.type === 'Identifier' &&
                parent.property.name === 'env'
              ) {
                path.replaceWithSourceString('process');
              }
            },
          },
        };
      },
      // Must be last — processes Reanimated worklets and shared values
      'react-native-reanimated/plugin',
    ],
  };
};
