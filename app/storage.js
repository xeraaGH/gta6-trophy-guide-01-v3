// Progress state for the Leonida Trophy Guide: earned trophies, collectible
// counters and the spoiler setting, all saved in localStorage. Export and
// import move the same JSON. The demo seed (13 trophies) is memory-only:
// it is used for screenshots and never written to localStorage.
const KEY = 'leonida-trophy-guide-v1';

export const COUNTERS = [
  { key: 'vaults', label: 'Bank vaults robbed', target: 8 },
  { key: 'gangops', label: 'Gang operations robbed', target: 39 },
  { key: 'range', label: 'Shooting Range gold medals', target: 42 },
  { key: 'drones', label: 'Top Fun drone races won', target: 14 },
  { key: 'decks', label: "Bret's Target Decks", target: 15 },
  { key: 'missions', label: 'Optional Missions done', target: 100 },
  { key: 'stunts', label: 'Stunts completed', target: 300 },
  { key: 'challenges', label: 'Challenges completed', target: 70, of: 80 },
];

export const DEMO_EARNED = [
  'Just Like Paradise',
  'Paradise Lost',
  'T**s Ass Drug Money',
  'Trust',
  'Break the Bank',
  'Vice City, Baby!',
  'Family Matters',
  'DWNFALL',
  'Hi-Jacked',
  'Top Fun',
  'Earn Cash, Not Kudos',
  'Baited My Tackle',
  'Strangers & Freaks',
];

export const state = {
  earned: new Set(),
  counters: {},
  spoilers: true,
  demo: false,
};

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    state.earned = new Set(Array.isArray(raw.earned) ? raw.earned : []);
    state.counters = raw.counters && typeof raw.counters === 'object' ? raw.counters : {};
    state.spoilers = raw.spoilers !== false;
  } catch {
    state.earned = new Set();
    state.counters = {};
    state.spoilers = true;
  }
}

export function saveState() {
  if (state.demo) return;
  localStorage.setItem(KEY, JSON.stringify({
    earned: [...state.earned],
    counters: state.counters,
    spoilers: state.spoilers,
  }));
}

export function applyDemo() {
  state.demo = true;
  state.earned = new Set(DEMO_EARNED);
}

export function toggleEarned(name) {
  if (state.earned.has(name)) state.earned.delete(name);
  else state.earned.add(name);
  saveState();
}

export function setCounter(key, value, target) {
  state.counters[key] = Math.max(0, Math.min(target, value));
  saveState();
}

export function exportProgress() {
  const blob = new Blob([JSON.stringify({
    earned: [...state.earned],
    counters: state.counters,
    spoilers: state.spoilers,
  }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importProgress(file) {
  const raw = JSON.parse(await file.text());
  if (Array.isArray(raw.earned)) state.earned = new Set(raw.earned);
  if (raw.counters && typeof raw.counters === 'object') state.counters = raw.counters;
  if (typeof raw.spoilers === 'boolean') state.spoilers = raw.spoilers;
  saveState();
}
