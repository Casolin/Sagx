export {};

declare global {
  interface Window {
    electronAPI?: {
      getScreenStream: () => Promise<MediaStream>;
    };
  }
}
