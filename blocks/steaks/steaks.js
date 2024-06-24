export default async function decorate() {
  const topSection = document.querySelector('.instructions .default-content-wrapper');
  const topSectionChildEls = topSection.querySelectorAll('li');
  topSectionChildEls.forEach((a, i) => {
    a.classList.add(`col-level-${i}`);
    a.setAttribute('data-step-index', i + 1);
  });

  const secondSection = document.querySelector('.instructions .three-columns div');
  const secondSectionChildEls = secondSection.querySelectorAll('div');
  secondSectionChildEls.forEach((a, i) => {
    a.classList.add(`col-level-${i}`);
    const ulectionChildEls = a.querySelectorAll('li');
    ulectionChildEls.forEach((b, j) => {
      b.classList.add(`col-level-${j}`);
      b.setAttribute('data-step-index', j + 1);
    });
  });

  const menuSection = document.querySelector('.menu-nav-section');
  menuSection.setAttribute('id', 'menuNav');

  document.addEventListener('scroll', () => {
    const left = document.getElementById('menuNav');
    if (left.scrollTop > 560 || window.pageYOffset > 560) {
      left.style.position = 'fixed';
      left.style.top = '0px';
      left.style.width = '100%';
    } else {
      left.style.position = 'relative';
      left.style.top = '0px';
      left.style.width = '100%';
    }
  });

  const seasoning = document.getElementById('seasoning');
  const seasoningContent = document.querySelectorAll(
    '.instructions .default-content-wrapper ul',
  );
  function seasoningToggleExpanded() {
    seasoningContent.forEach((ul) => {
      ul.classList.toggle('collapsed');
      ul.classList.toggle('expanded');
    });
    seasoning.classList.toggle('expanded');
  }
  seasoning.addEventListener('click', seasoningToggleExpanded);

  const grilling = document.getElementById('grilling');
  const grillingContent = document.querySelectorAll(
    '.three-columns .col-level-0 ul',
  );
  function grillingToggleExpanded() {
    grillingContent.forEach((ul) => {
      ul.classList.toggle('collapsed');
      ul.classList.toggle('expanded');
    });
    grilling.classList.toggle('expanded');
  }
  grilling.addEventListener('click', grillingToggleExpanded);

  const stovetop = document.getElementById('stovetop');
  const stovetopContent = document.querySelectorAll(
    '.three-columns .col-level-2 ul',
  );
  function stovetopToggleExpanded() {
    stovetopContent.forEach((ul) => {
      ul.classList.toggle('collapsed');
      ul.classList.toggle('expanded');
    });
    stovetop.classList.toggle('expanded');
  }
  stovetop.addEventListener('click', stovetopToggleExpanded);
}
