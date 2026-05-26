import { registerPlugin } from "@capacitor/core";

export interface ScreenCapturePlugin {
  start(): Promise<{ granted: boolean }>;
}

export const ScreenCapture =
  registerPlugin<ScreenCapturePlugin>("ScreenCapture");
