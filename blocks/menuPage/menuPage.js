// Make the .menu-nav-section to be fixed on scroll
const defaultContentWrapper = document.querySelector('.menu-nav-section .default-content-wrapper');

window.addEventListener('scroll', () => {
  if (window.scrollY >= 400) {
    defaultContentWrapper.style.position = 'fixed';
    defaultContentWrapper.style.top = '0';
    defaultContentWrapper.style.left = '0';
    defaultContentWrapper.style.width = '100%';
    defaultContentWrapper.style.zIndex = '2';
  } else {
    defaultContentWrapper.style.position = 'static';
  }

  // Reset styles for mobile resolution
  if (window.innerWidth <= 768) {
    defaultContentWrapper.style.position = 'static';
  }
});

// Smooth scroll effect
const anchorLinks = document.querySelectorAll('.menu-nav-section .default-content-wrapper a');
anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Change Country logic
const targetNode = document.body;

// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      const topNavEl = document.querySelector('.top-nav-section .top-nav-el-0');
      const changeCountryEl = document.querySelectorAll('.top-navlist-item1 li');

      changeCountryEl.forEach((liElement) => {
        liElement.addEventListener('click', () => {
          const clickedText = liElement.textContent.trim();
          topNavEl.textContent = clickedText;

          // Store the selected item in local storage
          localStorage.setItem('selectedCountry', clickedText);

          // Reload the page
          window.location.reload();
        });
      });

      const selectedCountry = localStorage.getItem('selectedCountry');

      if (selectedCountry) {
        topNavEl.textContent = selectedCountry;
        const showElement = (selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element) => {
            element.style.display = 'block';
          });
        };
        const hideElement = (selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element) => {
            element.style.display = 'none';
          });
        };
        switch (selectedCountry) {
          case 'Kuwait':
            showElement('.kuwait');
            hideElement('.behrain');
            break;
          case 'Bahrain':
            showElement('.behrain');
            hideElement('.kuwait');
            break;
          default:
            showElement('.kuwait');
            showElement('.behrain');
            break;
        }

        observer.disconnect();
      }

      const accordionContainerEl = document.querySelector('.lunch-value-offers.kuwait');
      const accordionContainerWrapperEl = document.createElement('div');
      accordionContainerWrapperEl.className = 'accordion-wrapper-container';
      accordionContainerEl.appendChild(accordionContainerWrapperEl);
      const childElements = accordionContainerEl.querySelectorAll('.accordion-wrapper');
      childElements.forEach((child) => {
        accordionContainerWrapperEl.appendChild(child);
      });

      const accordionContainerEl1 = document.querySelector('.lunch-value-offers.behrain');
      const accordionContainerWrapperEl1 = document.createElement('div');
      accordionContainerWrapperEl1.className = 'accordion-wrapper-container';
      accordionContainerEl1.appendChild(accordionContainerWrapperEl1);
      const childElements1 = accordionContainerEl1.querySelectorAll('.accordion-wrapper');
      childElements1.forEach((child) => {
        accordionContainerWrapperEl1.appendChild(child);
      });
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);
