import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

// BotID serves its challenge through rewrites on this domain, so ad
// blockers and third-party script blockers do not strip it.
export default withBotId(nextConfig);
