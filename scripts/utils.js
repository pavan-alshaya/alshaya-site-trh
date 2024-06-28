/*
 * Returns the true origin of the current page in the browser.
 * If the page is running in a iframe with srcdoc, the ancestor origin is returned.
 * @returns {String} The true origin
 */
export function getOrigin() {
  const { location } = window;
  return location.href === 'about:srcdoc' ? window.parent.location.origin : location.origin;
}

/**
 * Returns the true of the current page in the browser.mac
 * If the page is running in a iframe with srcdoc,
 * the ancestor origin + the path query param is returned.
 * @returns {String} The href of the current page or the href of the block running in the library
 */
export function getHref() {
  if (window.location.href !== 'about:srcdoc') return window.location.href;

  const { location: parentLocation } = window.parent;
  const urlParams = new URLSearchParams(parentLocation.search);
  return `${parentLocation.origin}${urlParams.get('path')}`;
}

/**
 * Returns the current timestamp used for scheduling content.
 */
export function getTimestamp() {
  if ((window.location.hostname === 'localhost' || window.location.hostname.endsWith('.hlx.page')) && window.sessionStorage.getItem('preview-date')) {
    return Date.parse(window.sessionStorage.getItem('preview-date'));
  }
  return Date.now();
}

export function buildUrlKey() {
  // fetch urlkey from url
  const path = new URL(document.location.href).pathname;

  let urlKeys = path.split('/');
  // check if the first part of the url is a language code
  if (urlKeys.length > 2 && urlKeys[1].match(/^[a-z]{2}$/)) {
    urlKeys = urlKeys.slice(2);
  } else {
    urlKeys = urlKeys.slice(1);
  }

  const urlKey = urlKeys.join('/');
  return urlKey;
}

/**
 * Returns the document language attribute value
 * @returns String language value
 */
export function getLanguageAttr() {
  return document.documentElement?.lang || 'en';
}

/**
 * Check if the current environment is a mobile app by checking the cookie existence
 * @returns {boolean} true if the current environment is a mobile app
 */
export function isMobileApp() {
  return document.cookie.includes('app-view=true');
}
