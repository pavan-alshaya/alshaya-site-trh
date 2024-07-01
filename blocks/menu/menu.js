export default async function decorate(block) {
  const menuDataLink = block.querySelector('a[href$=".json"]');
  if (!menuDataLink) return;
  await createMenuData(menuDataLink.href);

  async function createMenuData(formHref) {
    const { pathname } = new URL(formHref);
    const resp = await fetch(pathname);
    const json = await resp.json();
    const data = json.data;
    const restructuredData = [];
    for (const item of data) {
      const productName = item['PRODUCTNAME'];
      const productImage = item['PRODUCTIMAGE'];
      const sideMeal = item['SIDEMEAL'];
      const allergyInfo = item['ALLERGYINFO'];
      const nutritionalInfo = item['NUTRITIONALINFORMATION'];
      const kuwait_cur = item['KWD'];
      const bahrain_cur = item['BHD'];
      const qatar_cur = item['QAR'];
      const saudi_cur = item['SAR'];
      const uae_cur = item['AED'];
      const section_name = item['SECTION_NAME'];
      const productObj = {
        'PRODUCTNAME': productName,
        'PRODUCTIMAGE': productImage,
        'SIDEMEAL': [sideMeal],
        'ALLERGYINFO': [allergyInfo],
        'NUTRITIONALINFORMATION': [nutritionalInfo],
        'KWD': kuwait_cur,
        'BHD': bahrain_cur,
        'QAR': qatar_cur,
        'SAR': saudi_cur,
        'AED': uae_cur,
        'SECTION_NAME': section_name,
      };
      const existingProduct = restructuredData.find(p => p['PRODUCTNAME'] === productName);
      if (existingProduct) {
        existingProduct['SIDEMEAL'].push(sideMeal);
        existingProduct['ALLERGYINFO'].push(allergyInfo);
        existingProduct['NUTRITIONALINFORMATION'].push(nutritionalInfo);
      } else {
        restructuredData.push(productObj);
      }
    }

    console.log(restructuredData);

    function createAccordionItem(item) {
     
      const accordionContainer = document.createElement('div');
      accordionContainer.classList.add('accordion');

      const box = document.createElement('div');
      box.classList.add('accordion__box', 'accordion__box--tertiary');
      
      const topSection = document.createElement('div');
      topSection.classList.add('accordion__top');
      
      const title = document.createElement('h6');
      title.classList.add('accordion__title');
      title.textContent = item.PRODUCTNAME;
      
      const content = document.createElement('div');
      content.classList.add('accordion__content');
      
      const innerContent = document.createElement('div');
      innerContent.classList.add('accordion__content__inner');

      const productImage = document.createElement('img');
      productImage.classList.add('product__image');
      productImage.src = item.PRODUCTIMAGE;

      const innerProductImage = document.createElement('img');
      innerProductImage.classList.add('product__image');
      innerProductImage.src = item.PRODUCTIMAGE;
      innerContent.appendChild(innerProductImage);
      
      const sideMealDropdown = document.createElement('select');
      sideMealDropdown.id = 'sidemealDropdown';
      
      item.SIDEMEAL.forEach((meal, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = meal;
        sideMealDropdown.appendChild(option);
      });
      
      innerContent.appendChild(sideMealDropdown);
      
      const allergyInfoDisplayEl = document.createElement('p');
      allergyInfoDisplayEl.id = 'allergyInfoDisplay';
      
      const nutritionalInfoDisplayEL = document.createElement('p');
      nutritionalInfoDisplayEL.id = 'nutritionalInfoDisplay';
      
      innerContent.append(allergyInfoDisplayEl, nutritionalInfoDisplayEL);
      
      sideMealDropdown.addEventListener('change', (event) => {
        const selectedIndex = parseInt(event.target.value);
        if (!isNaN(selectedIndex)) {
          allergyInfoDisplayEl.textContent = item.ALLERGYINFO[selectedIndex];
          nutritionalInfoDisplayEL.textContent = item.NUTRITIONALINFORMATION[selectedIndex];
        } else {
          allergyInfoDisplayEl.textContent = '';
          nutritionalInfoDisplayEL.textContent = '';
        }
      });

      topSection.appendChild(productImage);
      topSection.appendChild(title);
      topSection.addEventListener('click', () => {
        const isActive = content.classList.contains('accordion__content--active');
        document.querySelectorAll('.accordion__content').forEach(c => c.classList.remove('accordion__content--active'));
        if (!isActive) {
          content.classList.add('accordion__content--active');
        }
      });
      
      box.appendChild(topSection);
      box.appendChild(content);
      content.appendChild(innerContent);
      accordionContainer.appendChild(box);

      return accordionContainer;
    }

    function createSectionContainer(sectionName) {
      const existingSectionContainer = document.getElementById(sectionName.replace(/\s+/g, ''));
      if (existingSectionContainer) {
          return existingSectionContainer;
      }
  
      const sectionContainer = document.createElement('div');
      sectionContainer.classList.add('section__container');
  
      const sectionTitle = document.createElement('h2');
      sectionTitle.classList.add('section__title');
      sectionTitle.textContent = sectionName;
  
      sectionContainer.id = sectionName.replace(/\s+/g, '');
      sectionContainer.append(sectionTitle);
  
      return sectionContainer;
    }
    
    restructuredData.forEach(item => {
      // const accordionWrapper = document.createElement('div');
      // accordionWrapper.classList.add('accordion_wrapper');
     
        const accordionItem = createAccordionItem(item);
        const sectionName = item.SECTION_NAME;
    
        const sectionAccordionContainer = createSectionContainer(sectionName);
        sectionAccordionContainer.appendChild(accordionItem);
        block.append(sectionAccordionContainer);
    });
  }
}