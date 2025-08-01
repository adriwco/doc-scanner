// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { hermes: 'hermes' }], 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
