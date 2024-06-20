import {
  fetchPlaceholders,
  decorateIcons,
} from '../../scripts/aem.js';
import { getConfigValue } from '../../scripts/configs.js';

let storeData = [];
const placeholders = await fetchPlaceholders(`/${document.documentElement.lang}`);
const locationMap = {};
let defaultZoom;
let defaultSelectionZoom;
let defaultCenterLat;
let defaultCenterLng;
let map;
let mapOptions;
const allMarkers = {};
let google;
let googleMapKey;
let googleMapRegional;
let AdvancedMarkerElement;
let PinElement;
let Autocomplete;

function initLocationMap() {
  storeData.forEach((store) => {
    const {
      latitude, longitude, store_name: name, store_code: code,
    } = store;
    locationMap[code] = {
      lat: latitude,
      lng: longitude,
      name,
    };
  });
}

async function initGoogleMapsMarker() {
  let i = 1;
  Object.keys(locationMap).forEach((key) => {
    const { lat, lng, name } = locationMap[key];
    const marker = new AdvancedMarkerElement({
      position: { lat: parseFloat(lat), lng: parseFloat(lng) },
      content: new PinElement({
        background: '#444444',
        borderColor: '#444444',
        glyph: i.toString(),
        glyphColor: 'white',
      }).element,
      title: name,
    });
    marker.addListener('click', () => {
      document.querySelector(`.sf-store-block[data-store-code='${key}']`).click();
    });
    allMarkers[key] = marker;
    i += 1;
  });
}

function initCurrentLocationMarker(doNavigate = false) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const marker = new AdvancedMarkerElement({
        position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        title: 'You are Here',
        content: new PinElement({
          background: '#444444',
          borderColor: '#444444',
          glyphColor: 'white',
        }).element,
      });
      marker.content.classList.add('bounce');
      allMarkers.current = marker;
      if (doNavigate) {
        marker.setMap(map);
        map.panTo(marker.position);
      }
    });
  }
}

async function initData(srcOrigin) {
  await fetch(srcOrigin)
    .then((response) => response.json())
    .then((data) => {
      // extract store data
      storeData = data.items;
      storeData.sort((a, b) => a.store_name.localeCompare(b.store_name));

      // initialise location map coordinates for each store
      initLocationMap();

      // create markers for each store
      initGoogleMapsMarker();

      // initialise the marker for current position
      initCurrentLocationMarker();
    });
}

/**
 *
 * @param {string} type HTML element type
 * @param {string} classList list of classes to be added to the element
 * @param {HTMLElement} parent parent element to which the new element will be appended
 * @param {string} innerText text content of the new element
 * @returns {HTMLElement} the newly created element
 */
function createMarkupAndAppendToParent(type = 'div', classList = [], parent = null, innerText = '') {
  const element = document.createElement(type);
  classList.forEach((className) => element.classList.add(className));
  element.innerText = innerText;
  if (parent !== null) parent.appendChild(element);
  return element;
}

function decorateSFTitle(block) {
  const title = createMarkupAndAppendToParent('div', ['sf-title'], block);
  const headBackNav = createMarkupAndAppendToParent('span', ['icon', 'icon-arrow-left', 'head-back-nav'], title);
  createMarkupAndAppendToParent('h5', ['sf-heading'], title, placeholders.sfTitle);
  decorateIcons(title);

  headBackNav.addEventListener('click', () => {
    map.setZoom(Number(defaultZoom));
    map.panTo({
      lat: Number(defaultCenterLat),
      lng: Number(defaultCenterLng),
    });
    if (allMarkers.search) allMarkers.search.setMap(null);
    document.querySelector('.sf-content-left-detail').style.display = 'none';
    document.querySelector('.sf-content-left-list').style.display = 'block';
  });
}

function initSearchInput(inputBlock) {
  if (!storeData[0]) {
    return;
  }

  // Create a bounding box with sides ~10km away from the center point
  const center = { lat: storeData[0].latitude, lng: storeData[0].longitude };
  const defaultBounds = {
    north: parseFloat(center.lat) + 0.1,
    south: parseFloat(center.lat) - 0.1,
    east: parseFloat(center.lng) + 0.1,
    west: parseFloat(center.lng) - 0.1,
  };
  const countryRegional = googleMapRegional || placeholders.sfGoogleMapsRegional;
  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: countryRegional },
    fields: ['address_components', 'geometry', 'icon', 'name'],
    strictBounds: false,
  };
  const autocomplete = new Autocomplete(inputBlock, options);
  autocomplete.setFields(['place_id', 'geometry', 'name']);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }
    const { lat, lng } = place.geometry.location;
    const marker = new AdvancedMarkerElement({
      position: { lat: lat(), lng: lng() },
      title: place.name,
      content: new PinElement({
        background: '#444444',
        borderColor: '#444444',
        glyphColor: 'white',
      }).element,
    });
    marker.setMap(map);
    marker.content.classList.add('bounce');
    allMarkers.search = marker;
    map.setZoom(Number(defaultSelectionZoom));
    map.panTo(marker.position);
  });
}

function decorateSearchInput(block) {
  const searchInputContainer = createMarkupAndAppendToParent('div', ['sf-search-input-container'], block);
  createMarkupAndAppendToParent('span', ['icon', 'search-icon'], searchInputContainer);
  const searchInput = createMarkupAndAppendToParent('input', ['sf-search-input'], searchInputContainer);
  searchInput.setAttribute('placeholder', placeholders.sfSearchPlaceholder);
  initSearchInput(searchInput);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.value === '') {
      allMarkers.search.setMap(null);
      map.setZoom(Number(defaultZoom));
      map.panTo({
        lat: Number(defaultCenterLat),
        lng: Number(defaultCenterLng),
      });
    }
  });
  return searchInputContainer;
}

function normaliseStoreDetail(store) {
  const storeItem = {};
  storeItem.name = store.store_name;
  storeItem.latitude = store.latitude;
  storeItem.longitude = store.longitude;
  storeItem.address = store.address.reduce((acc, { code, value }) => {
    acc[code] = value;
    return acc;
  }, {});
  storeItem.id = store.store_id;
  storeItem.code = store.store_code;
  storeItem.email = store.store_email;
  storeItem.phone = store.store_phone;
  storeItem.hours = store.store_hours.reduce((acc, { label, value }) => {
    acc[label] = value;
    return acc;
  }, {});
  return storeItem;
}

async function calculateDistanceFromStore(store) {
  let from = new google.maps.LatLng(storeData[0].latitude, storeData[0].longitude);
  if (allMarkers.current) {
    from = new google.maps.LatLng(allMarkers.current.position.lat, allMarkers.current.position.lng);
  }
  const to = new google.maps.LatLng(store.latitude, store.longitude);
  const service = new google.maps.DistanceMatrixService();

  try {
    const resp = await new Promise((resolve, reject) => {
      service.getDistanceMatrix({
        origins: [from],
        destinations: [to],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, (response, status) => {
        if (status === 'OK') {
          resolve(response);
        } else {
          reject(new Error(`Distance matrix request failed with status: ${status}`));
        }
      });
    });

    const distanceMeters = resp.rows[0].elements[0].distance.value;
    const distanceKm = distanceMeters / 1000;
    try {
      storeData.find((storeL) => storeL.store_code === store.code).storeDistance = distanceKm;
    } catch {
      store.storeDistance = distanceKm;
    }
    return distanceKm;
  } catch (error) {
    console.debug(error);
    return null;
  }
}

function decorateDistanceFromStore(block, store) {
  const storeX = storeData.find((storeL) => storeL.store_code === store.code);
  if (!storeX.storeDistance && storeX.storeDistance !== 0) {
    calculateDistanceFromStore(store);
  }
  const storeDistance = createMarkupAndAppendToParent('div', ['store-distance'], block, `${storeX.storeDistance.toFixed(1)} KM`);
  createMarkupAndAppendToParent('span', ['icon', 'icon-distance'], storeDistance);
}

function initStoreDetailData(store) {
  // add the store detail page
  map.panTo(allMarkers[store.code].position);
  document.querySelector('.sd-name').innerText = store.name;
  document.querySelector('.sd-address').innerText = store.address.street;
  const phoneContact = document.querySelector('.sd-phone');
  phoneContact.innerHTML = '';
  store.phone.split('/').forEach((phone) => {
    createMarkupAndAppendToParent('span', ['contact'], phoneContact, phone);
  });
  const openingHours = document.querySelector('.sd-hours');
  openingHours.innerHTML = '';
  Object.keys(store.hours).map((key) => {
    const opsHours = createMarkupAndAppendToParent('div', ['operating-hours'], openingHours);
    createMarkupAndAppendToParent('span', ['operating-hours-label'], opsHours, key);
    createMarkupAndAppendToParent('span', ['operating-hours-value'], opsHours, store.hours[key]);
    return opsHours;
  });
  document.querySelector('.sd-navigation').addEventListener('click', () => {
    window.open(`https://www.google.com/maps/dir/Current+Location/${store.latitude},${store.longitude}`, '_blank');
  });
}

async function decorateStoreItem(block, store) {
  const storeX = normaliseStoreDetail(store);
  const storeBlock = createMarkupAndAppendToParent('div', ['sf-store-block'], block);
  storeBlock.setAttribute('data-store-code', storeX.code);
  const storeItem = createMarkupAndAppendToParent('div', ['sf-store-block-item'], storeBlock);
  const storeItemEntry = createMarkupAndAppendToParent('div', ['sf-store-block-item-entry'], storeItem);
  const storeItemDist = createMarkupAndAppendToParent('div', ['sf-store-block-item-dist'], storeItem);
  createMarkupAndAppendToParent('a', ['sf-store-name'], storeItemEntry, storeX.name);
  createMarkupAndAppendToParent('div', ['sf-store-address'], storeItemEntry, storeX.address.street);
  createMarkupAndAppendToParent('div', ['sf-store-phone'], storeItemEntry, storeX.phone.replaceAll('/', ', ').trim());
  createMarkupAndAppendToParent('hr', [], storeBlock);

  // check distance between current location and store
  Promise.all([
    decorateDistanceFromStore(storeItemDist, storeX),
  ]).then(() => {
    // Code to execute after all function calls are completed
  }).catch((error) => {
    console.debug(error);
  });

  // add event listener to store block on click to show store detail
  storeBlock.addEventListener('click', () => {
    map.setZoom(Number(defaultSelectionZoom));
    initStoreDetailData(storeX);
    document.querySelector('.sf-content-left-detail').style.display = 'block';
    document.querySelector('.sf-content-left-list').style.display = 'none';
  });
}

function decorateStoreList(block) {
  const storeList = createMarkupAndAppendToParent('div', ['sf-store-list-container'], block);
  storeData.forEach((store) => {
    Promise.all([
      decorateStoreItem(storeList, store),
    ]).then(() => {
      // Code to execute after all function calls are completed
    }).catch((error) => {
      console.debug(error);
    });
  });
  return storeList;
}

function decorateLocateMe(block) {
  const locateMeContainer = createMarkupAndAppendToParent('div', ['locate-me-container'], block);
  createMarkupAndAppendToParent('span', ['icon', 'sf-locate'], locateMeContainer);
  createMarkupAndAppendToParent('a', ['near-me'], locateMeContainer, placeholders.sfNearMe);

  // add event listener to locate me button on click
  locateMeContainer.addEventListener('click', () => {
    if (!allMarkers.current) {
      initCurrentLocationMarker(true);
    } else if (allMarkers.current) {
      allMarkers.current.setMap(map);
      map.panTo(allMarkers.current.position);
    } else {
      console.debug('Geolocation is either not supported or blocked by this browser.');
    }
  });

  return locateMeContainer;
}

function decorateStoreContentNavigation(block) {
  const leftNav = createMarkupAndAppendToParent('div', ['sf-content-left-list'], block);
  decorateSearchInput(leftNav);
  decorateLocateMe(leftNav);
  decorateStoreList(leftNav);
}

function decorateStoreDetail(block) {
  const leftNav = createMarkupAndAppendToParent('div', ['sf-content-left-detail'], block);
  createMarkupAndAppendToParent('span', ['icon', 'icon-arrow-left', 'details-back-nav'], leftNav);
  const backNavigation = createMarkupAndAppendToParent('a', ['sf-back'], leftNav, placeholders.sfBack);
  createMarkupAndAppendToParent('h5', ['sd-name'], leftNav);
  createMarkupAndAppendToParent('div', ['sd-address'], leftNav);
  createMarkupAndAppendToParent('div', ['sd-phone'], leftNav);
  createMarkupAndAppendToParent('div', ['sd-opening-hours'], leftNav, placeholders.sfOpeningHours);
  createMarkupAndAppendToParent('div', ['sd-hours'], leftNav);

  const getDir = createMarkupAndAppendToParent('div', ['sd-navigation'], leftNav);
  createMarkupAndAppendToParent('a', ['sd-navigation-text'], getDir, placeholders.sfGetDirections);
  createMarkupAndAppendToParent('span', ['icon', 'icon-get-directions'], getDir);

  // add event listener to back navigation on click
  backNavigation.addEventListener('click', () => {
    map.setZoom(Number(defaultZoom));
    map.panTo({
      lat: Number(defaultCenterLat),
      lng: Number(defaultCenterLng),
    });
    if (allMarkers.search) allMarkers.search.setMap(null);
    document.querySelector('.sf-content-left-detail').style.display = 'none';
    document.querySelector('.sf-content-left-list').style.display = 'block';
  });

  // decorate icons
  decorateIcons(leftNav);
}

async function initiateGoogleMap(block) {
  const mapBlock = document.createElement('div');
  mapBlock.classList.add('sf-content-map-view');
  block.appendChild(mapBlock);

  if (!google) {
    return;
  }

  // set the map default options
  mapOptions = {
    zoom: Number(defaultZoom),
    center: new google.maps.LatLng(Number(defaultCenterLat), Number(defaultCenterLng)),
    mapId: 'ALSHAYA_MAP_ID',
  };
  map = new google.maps.Map(mapBlock, mapOptions);
  Object.values(allMarkers).forEach((marker) => marker.setMap(map));
}

function decorateStoreContentMaps(block) {
  const rightNav = createMarkupAndAppendToParent('div', ['sf-content-right'], block);
  initiateGoogleMap(createMarkupAndAppendToParent('div', ['sf-content-map-container'], rightNav));
}

function decorateSFContent(block) {
  createMarkupAndAppendToParent('hr', [], block);
  const content = createMarkupAndAppendToParent('div', ['sf-content'], block);
  decorateStoreContentNavigation(content);
  decorateStoreDetail(content);
  decorateStoreContentMaps(content);
  return content;
}

function decorateStoreFinder(block) {
  decorateSFTitle(block);
  decorateSFContent(block);
}

async function loadConfigs(srcOrigin) {
  defaultCenterLat = '' || await getConfigValue('sf-maps-center-lat');
  defaultCenterLng = '' || await getConfigValue('sf-maps-center-lng');
  defaultZoom = '' || await getConfigValue('sf-maps-default-zoom-preference');
  defaultSelectionZoom = '' || await getConfigValue('sf-maps-selection-zoom-preference');
  googleMapKey = '' || await getConfigValue('sf-google-maps-key');
  googleMapRegional = '' || await getConfigValue('sf-maps-regional-preference');
  await import(`https://maps.googleapis.com/maps/api/js?key=${googleMapKey}&async=true`);
  google = await window.google;
  const markerLibrary = await google.maps.importLibrary('marker');
  AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
  PinElement = markerLibrary.PinElement;
  const placesLibrary = await google.maps.importLibrary('places');
  Autocomplete = placesLibrary.Autocomplete;
  await initData(srcOrigin);
  await Promise.all(storeData.map(calculateDistanceFromStore));
}

function decorateBlockSkeleton(block) {
  decorateStoreFinder(block);
  const listContainer = block.querySelector('.sf-store-list-container');
  const mapContainer = block.querySelector('.sf-content-map-view');
  for (let i = 0; i < 10; i += 1) {
    const storeItem = createMarkupAndAppendToParent('div', ['sf-store-block', 'item-skeleton'], listContainer);
    createMarkupAndAppendToParent('div', ['sf-store-block-item'], storeItem);
    createMarkupAndAppendToParent('div', ['sf-store-block-item'], storeItem);
    createMarkupAndAppendToParent('hr', [], storeItem);
  }
  createMarkupAndAppendToParent('div', ['sf-store-map-item', 'map-skeleton'], mapContainer);
}

export default async function decorate(block) {
  let srcOrigin;
  if (block.querySelector('a') && block.querySelector('a').href) {
    srcOrigin = block.querySelector('a').href;
  } else {
    srcOrigin = await getConfigValue('sf-endpoint');
  }

  block.parentElement.parentElement.classList.add('full-width');

  while (block.firstChild) block.removeChild(block.firstChild);
  decorateBlockSkeleton(block);

  window.addEventListener('delayed-loaded', () => {
    loadConfigs(srcOrigin).then(() => {
      while (block.firstChild) block.removeChild(block.firstChild);
      decorateStoreFinder(block);
    });
  });
}
