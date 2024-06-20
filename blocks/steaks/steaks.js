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
      b.setAttribute('data-step-index', j + 1);
    });
  });

  const instructionsSection = document.querySelector('.instructions');
  instructionsSection.setAttribute('id', 'instructionsSection');

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

  document.querySelector('.instructions .default-content-wrapper').addEventListener('click', () => {
    const showSection = document.querySelector('.instructions .default-content-wrapper');
    const showectionChildEls = showSection.querySelectorAll('ul');
    showectionChildEls.forEach((a) => {
      if (a.getAttribute('style') === 'display:block') {
        a.setAttribute('style', 'display:none');
      } else {
        a.setAttribute('style', 'display:block');
      }
    });
  });

  document.querySelector('.instructions .columns-wrapper .col-level-2').addEventListener('click', () => {
    const showSection = document.querySelector('.instructions .columns-wrapper .col-level-2');
    const showectionChildEls = showSection.querySelectorAll('ul');
    showectionChildEls.forEach((a) => {
      if (a.getAttribute('style') === 'display:block') {
        a.setAttribute('style', 'display:none');
      } else {
        a.setAttribute('style', 'display:block');
      }
    });
  });

  document.querySelector('.instructions .columns-wrapper .col-level-0').addEventListener('click', () => {
    const showSection = document.querySelector('.instructions .columns-wrapper .col-level-0');
    const showectionChildEls = showSection.querySelectorAll('ul');
    showectionChildEls.forEach((a) => {
      if (a.getAttribute('style') === 'display:block') {
        a.setAttribute('style', 'display:none');
      } else {
        a.setAttribute('style', 'display:block');
      }
    });
  });
}
