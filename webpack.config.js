// webpack.config.js
const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./src/server.js",
  output: {
    filename: "bundle.js", // Output bundle file
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  target: "node", // Building for Node.js environment
  mode: "production", // Use 'production' for optimized output or 'development' for debugging
  externals: [nodeExternals()], // Exclude node_modules from bundling
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ["html-loader"], // Load HTML files
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
      net: false,
      tls: false,
      crypto: false, // Ignore server-side modules not needed in the bundle
    },
  },
  stats: {
    errorDetails: true, // Show detailed error messages
  },
  ignoreWarnings: [/node_modules/], // Ignore warnings from node_modules
};
