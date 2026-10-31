(function visitCounter() {
  'use strict';
  const footer = document.querySelector('.site-footer');
  if (!footer || footer.querySelector('.visit-counter')) return;

  const copy = {
    nl: { label: 'Paginaweergaven', loading: 'Laden…', failed: 'Tijdelijk niet beschikbaar', detail: 'Totaal aantal paginaweergaven sinds de start van deze teller.' },
    en: { label: 'Page views', loading: 'Loading…', failed: 'Temporarily unavailable', detail: 'Total page views since this counter was enabled.' },
    pl: { label: 'Odsłony strony', loading: 'Wczytywanie…', failed: 'Chwilowo niedostępny', detail: 'Łączna liczba odsłon od uruchomienia licznika.' }
  };
  const counter = document.createElement('div');
  counter.className = 'visit-counter';
  const label = document.createElement('span');
  const badge = document.createElement('img');
  badge.className = 'visit-counter-badge';
  badge.height = 24;
  badge.hidden = true;
  badge.loading = 'eager';
  badge.decoding = 'async';
  badge.referrerPolicy = 'no-referrer';
  const status = document.createElement('span');
  status.className = 'visit-counter-status';
  status.setAttribute('role', 'status');
  let failed = false;

  function translate() {
    const text = copy[document.documentElement.lang] || copy.en;
    label.textContent = text.label;
    badge.alt = text.label;
    counter.title = text.detail;
    status.textContent = failed ? text.failed : text.loading;
  }

  counter.append(label, badge, status);
  footer.classList.add('has-visit-counter');
  footer.append(counter);
  translate();
  new MutationObserver(translate).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang']
  });

  const timeout = setTimeout(showFailure, 12000);
  function showFailure() {
    failed = true;
    badge.hidden = true;
    status.hidden = false;
    translate();
  }
  badge.addEventListener('load', () => {
    clearTimeout(timeout);
    badge.hidden = false;
    status.hidden = true;
  }, { once: true });
  badge.addEventListener('error', () => {
    clearTimeout(timeout);
    showFailure();
  }, { once: true });

  // All portfolio pages and languages share one server-stored total.
  // Preview requests use a separate counter. Language changes never reload the badge.
  const production = ['fotodisogno.com', 'www.fotodisogno.com'].includes(location.hostname);
  const key = production ? 'fotodisogno.com/visits' : 'fotodisogno.com/preview';
  badge.src = 'https://hits.sh/' + key + '.svg?label=%E2%86%97&style=flat&color=2e5065&labelColor=18232d';
})();
