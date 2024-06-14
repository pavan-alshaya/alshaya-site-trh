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
}
