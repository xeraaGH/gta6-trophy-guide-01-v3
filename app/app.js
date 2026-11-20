// Leonida Trophy Guide — bootstrap, hash routing and the shared header.
// The URL hash is the whole state: #view=checklist|roadmap|missables,
// #trophy=<name>, #filter=<kind>, #grade=<grade>, #earned=all|earned|not,
// #spoilers=on|off, #demo=progress (seeds 13 trophies in memory only, for
// screenshots). Every control writes the hash; a hashchange re-renders.
import { state, loadState, applyDemo, saveState, exportProgress, importProgress } from './storage.js';
import { renderChecklist, KIND_LABELS } from './checklist.js';
import { renderDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';
import { renderMissables } from './missables.js';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

const filters = {
  view: 'checklist',
  kind: 'all',
  grade: 'all',
  earned: 'all',
  search: '',
  selected: 'Catch Me If You Can',
};

function parseHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  filters.view = ['checklist', 'roadmap', 'missables'].includes(params.get('view')) ? params.get('view') : 'checklist';
  filters.kind = params.get('filter') ?? 'all';
  filters.grade = params.get('grade') ?? 'all';
  filters.earned = params.get('earned') ?? 'all';
  filters.search = params.get('q') ?? '';
  if (params.get('trophy')) filters.selected = params.get('trophy');
  if (params.get('spoilers') === 'on') state.spoilers = true;
  if (params.get('spoilers') === 'off') state.spoilers = false;
  if (params.get('demo') === 'progress') applyDemo();
  filters.scroll = params.get('scroll') ?? '';
}

function writeHash() {
  const params = new URLSearchParams();
  params.set('view', filters.view);
  if (filters.kind !== 'all') params.set('filter', filters.kind);
  if (filters.grade !== 'all') params.set('grade', filters.grade);
  if (filters.earned !== 'all') params.set('earned', filters.earned);
  if (filters.search) params.set('q', filters.search);
  if (filters.view === 'checklist' && filters.selected) params.set('trophy', filters.selected);
  params.set('spoilers', state.spoilers ? 'on' : 'off');
  if (state.demo) params.set('demo', 'progress');
  if (filters.scroll) params.set('scroll', filters.scroll);
  history.replaceState(null, '', `#${params.toString()}`);
}

function renderHeader() {
  const earned = trophies.filter((t) => state.earned.has(t.name));
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of earned) counts[t.grade]++;
  document.getElementById('progress-count').textContent = `${earned.length} of ${trophies.length} earned`;
  document.getElementById('progress-grades').textContent =
    `Platinum ${counts.platinum}/1 · Gold ${counts.gold}/2 · Silver ${counts.silver}/6 · Bronze ${counts.bronze}/46`;
  document.getElementById('progress-bar').style.width = `${(earned.length / trophies.length) * 100}%`;
}

function render() {
  renderHeader();
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === filters.view);
  });
  document.getElementById('view-checklist').hidden = filters.view !== 'checklist';
  document.getElementById('view-roadmap').hidden = filters.view !== 'roadmap';
  document.getElementById('view-missables').hidden = filters.view !== 'missables';
  document.getElementById('search').value = filters.search;
  document.querySelectorAll('#kind-chips .chip-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.kind === filters.kind);
  });
  document.querySelectorAll('#grade-chips .chip-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === filters.grade);
  });
  document.querySelectorAll('#earned-chips .chip-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.earned === filters.earned);
  });
  document.getElementById('spoilers').checked = state.spoilers;
  if (filters.view === 'checklist') {
    renderChecklist(document.getElementById('list'), trophies, filters, (name) => {
      filters.selected = name;
      writeHash();
      render();
    }, render);
    const selected = trophies.find((t) => t.name === filters.selected);
    renderDetail(document.getElementById('detail'), selected, render);
  } else if (filters.view === 'roadmap') {
    renderRoadmap(document.getElementById('view-roadmap'), trophies, render);
  } else {
    renderMissables(document.getElementById('view-missables'), trophies, (name) => {
      filters.view = 'checklist';
      filters.selected = name;
      writeHash();
      render();
    });
  }
  if (filters.scroll) {
    const target = document.getElementById(filters.scroll);
    if (target) target.scrollIntoView();
  }
  writeHash();
}

function buildChips(container, items, attr, onPick) {
  container.replaceChildren();
  for (const [value, label] of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip-btn';
    b.dataset[attr] = value;
    b.textContent = label;
    b.addEventListener('click', () => onPick(value));
    container.append(b);
  }
}

loadState();
parseHash();
buildChips(document.getElementById('kind-chips'), Object.entries(KIND_LABELS), 'kind', (v) => {
  filters.kind = v;
  filters.view = 'checklist';
  render();
});
buildChips(document.getElementById('grade-chips'), [
  ['all', 'All grades'], ['platinum', 'Platinum'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze'],
], 'grade', (v) => {
  filters.grade = v;
  filters.view = 'checklist';
  render();
});
buildChips(document.getElementById('earned-chips'), [
  ['all', 'All'], ['earned', 'Earned'], ['not', 'Not earned'],
], 'earned', (v) => {
  filters.earned = v;
  filters.view = 'checklist';
  render();
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    filters.view = tab.dataset.view;
    render();
  });
});
document.getElementById('search').addEventListener('input', (e) => {
  filters.search = e.target.value;
  filters.view = 'checklist';
  render();
});
document.getElementById('spoilers').addEventListener('change', (e) => {
  state.spoilers = e.target.checked;
  saveState();
  render();
});
document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await importProgress(file);
  render();
});
window.addEventListener('hashchange', () => {
  parseHash();
  render();
});
render();
