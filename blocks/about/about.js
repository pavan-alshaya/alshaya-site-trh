export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // Row / Column creation
  [...block.children].forEach((row) => {
    // Adding class row for a each block
    row.classList.add('row');
    [...row.children].forEach((col) => {
      // add col class to columns
      col.classList.add('col');
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
      // Add content class which has only paragraph without pictures
      const paragraphsWithoutPictures = Array.from(col.querySelectorAll('p:not(:has(picture))'));

      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('content-wrapper');

      paragraphsWithoutPictures.forEach((paragraph) => {
        paragraph.classList.add('content');
        contentWrapper.appendChild(paragraph);
      });
      if (!col.classList.contains('columns-img-col')) {
        col.appendChild(contentWrapper);
      }
    });
  });
}

const topSection = document.querySelector('.find-us');
const topSectionChildEls = topSection.querySelectorAll('p');
topSectionChildEls.forEach((a, i) => {
  a.classList.add(`find-us-location-${i}`);
});

const textboxElement = document.getElementsByClassName('find-us-location-0');
for (let i = 0; i < textboxElement.length; i += 1) {
  const textfield = document.createElement('input');
  textfield.type = 'text';
  textfield.value = '';
  textfield.placeholder = 'Enter your search';
  textfield.className = 'search-location';
  textboxElement[i].appendChild(textfield);
}
