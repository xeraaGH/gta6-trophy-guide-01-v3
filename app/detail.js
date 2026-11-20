// The detail panel: the selected trophy's official description, its guide
// in our own words, the facts behind it with their sources, and the button
// to mark it earned. The missable verdict is one small chip in the chips
// row, never a big box — the guide text stays fully visible.
import { state, toggleEarned } from './storage.js';
import { gradeLabel, MISSABLE_LABELS } from './checklist.js';

const MISSABLE_NOTE = {
  possibly: 'Possibly missable — do the Chapter 1 meditation at Jason\u2019s house to be safe.',
  unconfirmed: 'Method not yet confirmed by any reliable guide — see the best lead below.',
};

export function renderDetail(panelEl, trophy, onChange) {
  panelEl.replaceChildren();
  if (!trophy) {
    const hint = document.createElement('p');
    hint.className = 'detail-hint';
    hint.textContent = 'Pick a trophy on the left to read its guide.';
    panelEl.append(hint);
    return;
  }
  const title = document.createElement('h2');
  title.textContent = trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official description: \u201c${trophy.description}\u201d`;
  const chips = document.createElement('div');
  chips.className = 'chips';
  const gradeChip = document.createElement('span');
  gradeChip.className = `chip grade-${trophy.grade}`;
  gradeChip.textContent = gradeLabel(trophy.grade);
  chips.append(gradeChip);
  const kindChip = document.createElement('span');
  kindChip.className = 'chip';
  kindChip.textContent = trophy.kind[0].toUpperCase() + trophy.kind.slice(1);
  chips.append(kindChip);
  const stageChip = document.createElement('span');
  stageChip.className = 'chip stage';
  stageChip.textContent = `Roadmap stage ${trophy.stage}`;
  chips.append(stageChip);
  const missChip = document.createElement('span');
  missChip.className = `chip miss-${trophy.missable}`;
  missChip.textContent = MISSABLE_LABELS[trophy.missable];
  chips.append(missChip);
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = trophy.guide;
  panelEl.append(title, official, chips, guide);
  if (MISSABLE_NOTE[trophy.missable]) {
    const note = document.createElement('p');
    note.className = `miss-note miss-${trophy.missable}`;
    note.textContent = MISSABLE_NOTE[trophy.missable];
    panelEl.append(note);
  }
  if (trophy.facts && trophy.facts.length) {
    const factsTitle = document.createElement('h4');
    factsTitle.textContent = 'Facts behind this guide';
    const facts = document.createElement('ul');
    facts.className = 'facts';
    for (const f of trophy.facts.slice(0, 2)) {
      const li = document.createElement('li');
      li.textContent = `${f.text} (${f.source})`;
      facts.append(li);
    }
    panelEl.append(factsTitle, facts);
  }
  const sourcesTitle = document.createElement('h4');
  sourcesTitle.textContent = 'Sources for this guide';
  const sources = document.createElement('ul');
  sources.className = 'sources';
  for (const s of trophy.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.rel = 'noopener';
    li.append(a);
    sources.append(li);
  }
  const mark = document.createElement('button');
  mark.type = 'button';
  mark.className = 'mark';
  mark.textContent = state.earned.has(trophy.name) ? 'Earned — unmark' : 'Mark as earned';
  mark.addEventListener('click', () => {
    toggleEarned(trophy.name);
    onChange();
  });
  panelEl.append(sourcesTitle, sources, mark);
}
