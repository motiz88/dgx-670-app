module.exports = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    config.module.rules.push({ test: /\.wav$/i, type: 'asset/resource' });
    config.output.assetModuleFilename = 'assets/[name][ext]';
    return config;
  },
};
