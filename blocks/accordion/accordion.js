/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = `<p>${summary.innerHTML}</p>`;
    }
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      body.innerHTML = `<p>${body.innerHTML}</p>`;
    }
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);

    // Wrappering the Accordion inside another accordion
    const accordionItems = document.querySelectorAll('.accordion-wrapper');
    const accordionBodyItem = document.querySelector('.accordion-item .accordion-item-body');
    accordionItems.forEach((accordion) => {
      const accordionItemChildren = accordion.querySelectorAll('.accordion .accordion-item');
      if (accordionItemChildren.length > 1) {
        let i = 1;
        while (i < accordionItemChildren.length) {
          accordionBodyItem.append(accordionItemChildren[i]);
          i += 1;
        }
      }
    });

    // Wrapp the accordion wrapper elemenets to new accordion wrapper container element
    // const accordionContainerEl = document.querySelector('.accordion-container');
    // const accordionContainerWrapperEl = document.createElement('div');
    // accordionContainerWrapperEl.className = 'accordion-wrapper-container';
    // accordionContainerEl.appendChild(accordionContainerWrapperEl);
    // const childElements = accordionContainerEl.querySelectorAll('.accordion-wrapper');
    // childElements.forEach(child => {
    //   accordionContainerWrapperEl.appendChild(child);
    // });

    // Wrap the child accordion details elements in to the div
    const detailsElements = document.querySelectorAll('.accordion-item .accordion-item');
    const wrapper = document.createElement('div');
    wrapper.classList.add('child-accordion-wrapper');
    detailsElements.forEach((detailsElement) => {
      detailsElement.parentNode.removeChild(detailsElement);
      wrapper.appendChild(detailsElement);
    });
    // remmove empty child-accordion-wrapper elements
    const els = document.querySelectorAll('.child-accordion-wrapper');
    els.forEach((el) => {
      const childElements = el.children;
      if (childElements.length === 0) {
        el.parentNode.removeChild(el);
      }
    });
    const parentElement = document.querySelector('.accordion-item .accordion-item-body');
    parentElement.appendChild(wrapper);
  });
}
