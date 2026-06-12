export {};

declare global {
  interface Window {
    electronAPI: {
      getScreenSources: () => Promise<{ id: string; name: string }[]>;
      createScreenStream: (id: string) => Promise<MediaStream>;
    };
  }
}
