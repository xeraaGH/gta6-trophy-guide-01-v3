// The checklist: one row per trophy, filtered by kind, grade, earned state
// and search text. Story trophies stay hidden while the spoiler setting is
// on and they are not earned yet. Clicking a row opens it in the detail
// panel; the checkbox ticks it off.
import { state, toggleEarned } from './storage.js';

export const KIND_LABELS = {
  all: 'All 55',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  combat: 'Combat',
  crime: 'Crime',
  strangers: 'Strangers',
  exploration: 'Exploration',
  completion: 'Completion',
  online: 'Online',
};

export const MISSABLE_LABELS = {
  'not-missable': 'Not missable',
  possibly: 'Possibly missable',
  unconfirmed: 'Unconfirmed',
};

export function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

export function visibleTrophies(trophies, filters) {
  const q = filters.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.earned === 'earned' && !state.earned.has(t.name)) return false;
    if (filters.earned === 'not' && state.earned.has(t.name)) return false;
    if (filters.kind === 'story' && !t.story) return false;
    if (filters.kind === 'missable' && t.missable === 'not-missable') return false;
    if (filters.kind !== 'all' && filters.kind !== 'story' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (state.spoilers && t.story && !state.earned.has(t.name)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

export function renderChecklist(listEl, trophies, filters, onSelect, onChange) {
  const visible = visibleTrophies(trophies, filters);
  listEl.replaceChildren();
  const countEl = document.getElementById('showing');
  if (countEl) countEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  if (visible.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = state.spoilers && filters.kind === 'story'
      ? 'All 12 story trophies are hidden while spoilers are on. Turn spoilers off, or earn one to reveal it.'
      : 'No trophies match these filters.';
    listEl.append(empty);
    return;
  }
  for (const t of visible) {
    const row = document.createElement('article');
    row.className = 'trophy-row';
    if (filters.selected === t.name) row.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      toggleEarned(t.name);
      onChange();
    });
    const body = document.createElement('div');
    body.className = 'trophy-body';
    const name = document.createElement('h3');
    name.textContent = t.name;
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = t.description;
    const chips = document.createElement('div');
    chips.className = 'chips';
    const gradeChip = document.createElement('span');
    gradeChip.className = `chip grade-${t.grade}`;
    gradeChip.textContent = gradeLabel(t.grade);
    chips.append(gradeChip);
    const kindChip = document.createElement('span');
    kindChip.className = 'chip';
    kindChip.textContent = KIND_LABELS[t.kind] ?? t.kind;
    chips.append(kindChip);
    const stageChip = document.createElement('span');
    stageChip.className = 'chip stage';
    stageChip.textContent = `Roadmap stage ${t.stage}`;
    chips.append(stageChip);
    const missChip = document.createElement('span');
    missChip.className = `chip miss-${t.missable}`;
    missChip.textContent = MISSABLE_LABELS[t.missable];
    chips.append(missChip);
    if (t.target) {
      const targetChip = document.createElement('span');
      targetChip.className = 'chip target';
      targetChip.textContent = t.target;
      chips.append(targetChip);
    }
    body.append(name, desc, chips);
    row.append(box, body);
    row.addEventListener('click', () => onSelect(t.name));
    listEl.append(row);
  }
}
