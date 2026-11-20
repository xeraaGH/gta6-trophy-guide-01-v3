// The roadmap to the Platinum: five stages in order, the 100% Completion
// checklist in full, and the eight collectible counters with steppers,
// saved in localStorage so the tracker survives a reload.
import { state, setCounter, COUNTERS } from './storage.js';

const STAGES = [
  { n: 1, title: 'Play the story, part 1', text: 'Chapters 1 to 3 and the first story trophies. Nothing here is missable — just play. Keep a manual save at the start and end of each chapter (15 manual save slots): there is no mission replay.' },
  { n: 2, title: 'Finish the story, start the side content', text: 'Chapters 4 and 5, the final mission Starting From Zero, and the first activities, crime and partner trophies. Do the Chapter 1 meditation for Positive Mental Attitude to be safe — it may be missable.' },
  { n: 3, title: 'Strangers and the ranges', text: 'All 8 stranger mission strands, the 42 Shooting Range gold medals and the 14 Top Fun drone races. Stranger strands can be done any time, including after the story.' },
  { n: 4, title: 'The long clean-up', text: 'Collectibles, crime sprees and the open-world grinds: 250 stunts, 100 vehicles, 9 gang operations, the card sets and the unconfirmed trophies. Check the Missables tab before you start this stage.' },
  { n: 5, title: '100% and the Platinum', text: 'Finish the 100% Completion checklist below, then A Long Road pops and the Platinum, Vice Got a Price!, follows automatically.' },
];

const CHECKLIST_100 = [
  'All robberies: 8 bank vaults and 39 gang operations',
  'All Shooting Range gold medals (42)',
  'All Top Fun drone races (14 locations)',
  "Bret's 15 Target Decks",
  'Any 100 Optional Missions',
  '300 stunts',
  'Any 70 of 80 Challenges',
];

export function renderRoadmap(container, trophies, onChange) {
  container.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'roadmap-intro';
  intro.textContent = 'About 200 hours to the Platinum, difficulty 4/10. All 55 trophies are earned offline, in a single playthrough, and free-roam continues after the story. Cheats disable trophies and saving, so leave them off.';
  container.append(intro);
  for (const s of STAGES) {
    const card = document.createElement('section');
    card.className = 'stage-card';
    const head = document.createElement('h3');
    const earned = trophies.filter((t) => t.stage === s.n && state.earned.has(t.name)).length;
    const total = trophies.filter((t) => t.stage === s.n).length;
    head.textContent = `Stage ${s.n}: ${s.title} — ${earned}/${total} earned`;
    const text = document.createElement('p');
    text.textContent = s.text;
    const list = document.createElement('ul');
    list.className = 'stage-trophies';
    for (const t of trophies.filter((t) => t.stage === s.n)) {
      const li = document.createElement('li');
      li.textContent = `${state.earned.has(t.name) ? '✓ ' : '○ '}${t.name} (${t.grade})`;
      list.append(li);
    }
    card.append(head, text, list);
    container.append(card);
  }
  const checkSection = document.createElement('section');
  checkSection.id = 'checklist100';
  const checkTitle = document.createElement('h3');
  checkTitle.textContent = 'The 100% Completion checklist (A Long Road)';
  const checkNote = document.createElement('p');
  checkNote.textContent = 'The checklist is lenient — roughly 60% true completion. Progress made during the story already counts, and nothing on the list is missable.';
  const checkList = document.createElement('ul');
  for (const item of CHECKLIST_100) {
    const li = document.createElement('li');
    li.textContent = item;
    checkList.append(li);
  }
  checkSection.append(checkTitle, checkNote, checkList);
  container.append(checkSection);
  const countersSection = document.createElement('section');
  countersSection.id = 'counters';
  const countersTitle = document.createElement('h3');
  countersTitle.textContent = 'Collectible counters';
  const countersNote = document.createElement('p');
  countersNote.textContent = 'Tap + or − as you go; the counts are saved in this browser.';
  countersSection.append(countersTitle, countersNote);
  for (const c of COUNTERS) {
    const row = document.createElement('div');
    row.className = 'counter-row';
    const label = document.createElement('span');
    label.className = 'counter-label';
    label.textContent = c.label;
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', `One fewer ${c.label}`);
    const value = document.createElement('span');
    value.className = 'counter-value';
    const current = state.counters[c.key] ?? 0;
    value.textContent = `${current} / ${c.target}${c.of ? ` (of ${c.of})` : ''}`;
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', `One more ${c.label}`);
    minus.addEventListener('click', () => {
      setCounter(c.key, (state.counters[c.key] ?? 0) - 1, c.target);
      onChange();
    });
    plus.addEventListener('click', () => {
      setCounter(c.key, (state.counters[c.key] ?? 0) + 1, c.target);
      onChange();
    });
    row.append(label, minus, value, plus);
    countersSection.append(row);
  }
  container.append(countersSection);
}
