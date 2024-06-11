export default async function decorate() {
  const topSection = document.querySelector('.benifits-details');
  const topSectionChildEls = topSection.querySelectorAll('p');
  topSectionChildEls.forEach((a, i) => {
    a.classList.add('col-level-' + i);
  });
}

