import {createRequire} from "node:module";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, {webpack}) => {
    /*
     * wagmi's Base Account connector pulls in @coinbase/cdp-sdk, which imports the optional
     * @x402/* payment packages. They are not published as dependencies and Twilight never
     * registers that connector (see lib/wagmiConfig.ts), so the whole subtree is redirected to a
     * stub. Without this, `next build` fails on modules that are never executed.
     */
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^@x402\//, (resource) => {
        resource.request = require.resolve("./stubs/x402-unused.js");
      }),
    );
    return config;
  },
};

export default nextConfig;
