import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "sagx.app",
  appName: "SagX",
  webDir: "dist", // not important if using server url
  server: {
    url: "https://sagx.vercel.app",
    cleartext: false,
  },
};

export default config;
