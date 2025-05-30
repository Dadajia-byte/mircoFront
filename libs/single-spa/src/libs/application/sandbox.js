export function getWindowSnapshot() {
  return new Set(Object.getOwnPropertyNames(window));
}

export function restoreWindowSnapshot(snapshot) {
  const current = new Set(Object.getOwnPropertyNames(window));
  for (const prop of current) {
    if (!snapshot.has(prop)) {
      delete window[prop];
    }
  }
}