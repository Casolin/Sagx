type Listener = (value: string) => void;

let listeners: Listener[] = [];

export const searchBus = {
  set(value: string) {
    listeners.forEach((l) => l(value));
  },

  subscribe(listener: Listener) {
    listeners.push(listener);

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
