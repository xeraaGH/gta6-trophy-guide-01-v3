// The Missables view: the one trophy that may be missable, the four whose
// unlock method is still unconfirmed, and the reassurance that the other
// 50 trophies cannot be missed — all of them can be earned in free-roam
// after the story.
import { MISSABLE_LABELS } from './checklist.js';

export function renderMissables(container, trophies, onSelect) {
  container.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'missables-intro';
  intro.textContent = 'Only 1 of the 55 trophies may be missable, and 4 more have no confirmed unlock method yet. The other 50 cannot be missed — free-roam continues after the story, so there is always a way back.';
  container.append(intro);
  const risky = trophies.filter((t) => t.missable === 'possibly');
  const unknown = trophies.filter((t) => t.missable === 'unconfirmed');
  for (const t of [...risky, ...unknown]) {
    const card = document.createElement('article');
    card.className = `miss-card miss-${t.missable}`;
    const title = document.createElement('h3');
    title.textContent = t.name;
    const verdict = document.createElement('p');
    verdict.className = 'miss-verdict';
    verdict.textContent = `Can it be missed? ${MISSABLE_LABELS[t.missable]}.`;
    const desc = document.createElement('p');
    desc.className = 'miss-desc';
    desc.textContent = t.description;
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    const sources = document.createElement('p');
    sources.className = 'miss-sources';
    sources.textContent = `Sources: ${t.sources.map((s) => s.name).join(', ')}`;
    card.append(title, verdict, desc, guide, sources);
    card.addEventListener('click', () => onSelect(t.name));
    container.append(card);
  }
  const safe = document.createElement('p');
  safe.className = 'miss-safe';
  safe.textContent = 'The other 50 trophies are not missable. Every story trophy unlocks automatically, and every side trophy can be earned in free-roam after the story ends.';
  container.append(safe);
}
