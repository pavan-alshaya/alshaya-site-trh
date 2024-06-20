const ALLOWED_CONFIGS = ['prod', 'stage', 'dev'];
/*
 * Returns the true origin of the current page in the browser.
 * If the page is running in a iframe with srcdoc, the ancestor origin is returned.
 * @returns {String} The true origin
 */
function getOrigin() {
  const { location } = window;
  return location.href === 'about:srcdoc' ? window.parent.location.origin : location.origin;
}

function getLanguageAttr() {
  return document.documentElement.lang || 'en';
}

/**
 * This function calculates the environment in which the site is running based on the URL.
 * It defaults to 'prod'. In non 'prod' environments, the value can be overwritten using
 * the 'environment' key in sessionStorage.
 *
 * @returns {string} - environment identifier (dev, stage or prod'.
 */
export const calcEnvironment = () => {
  const { href } = window.location;
  let environment = 'prod';
  if (href.includes('.hlx.page') || href.includes('.aem.page')) {
    environment = 'stage';
  }
  if (href.includes('localhost')) {
    environment = 'dev';
  }

  const environmentFromConfig = window.sessionStorage.getItem('environment');
  if (environmentFromConfig && ALLOWED_CONFIGS.includes(environmentFromConfig) && environment !== 'prod') {
    return environmentFromConfig;
  }

  return environment;
};

function buildConfigURL(environment, locale) {
  const env = environment || calcEnvironment();
  let fileName = `configs.json?sheet=${env}`;
  if (env !== 'prod') {
    fileName = `configs-${env}.json`;
  }
  const origin = getOrigin();
  const localePath = locale ? `${locale}/` : '';
  const configURL = new URL(`${origin}/${localePath}${fileName}`);
  return configURL;
}

const getConfigForEnvironment = async (environment) => {
  const env = environment || calcEnvironment();
  const language = getLanguageAttr();
  let configJSON = window.sessionStorage.getItem(`config:${env}`);
  let configLocaleJSON = window.sessionStorage.getItem(`config:${env}:${language}`);

  if (!configJSON || !configLocaleJSON) {
    const fetchGlobalConfig = fetch(buildConfigURL(env));
    const fetchLocalConfig = fetch(buildConfigURL(env, language));
    console.log('fetchGlobalConfig'+fetchGlobalConfig);
    console.log('fetchLocalConfig'+fetchLocalConfig);
    try {
      const responses = await Promise.all([fetchGlobalConfig, fetchLocalConfig]);

      // Extract JSON data from responses
      [configJSON, configLocaleJSON] = await Promise.all(responses
        .map((response) => response.text()));

      window.sessionStorage.setItem(`config:${env}`, configJSON);
      window.sessionStorage.setItem(`config:${env}:${language}`, configLocaleJSON);
    } catch (e) {
      console.error('no config loaded', e);
    }
  }

  // merge config and locale config
  const config = JSON.parse(configJSON);

  if (configLocaleJSON) {
    const configLocale = JSON.parse(configLocaleJSON);
    configLocale.data.forEach((localeConfig) => {
      const existing = config.data.find((c) => c.key === localeConfig.key);
      if (existing) {
        existing.value = localeConfig.value;
      } else {
        config.data.push(localeConfig);
      }
    });
  }

  return config;
};

/**
 * This function retrieves a configuration value for a given environment.
 *
 * @param {string} configParam - The configuration parameter to retrieve.
 * @param {string} [environment] - Optional, overwrite the current environment.
 * @returns {Promise<string|undefined>} - The value of the configuration parameter, or undefined.
 */
export const getConfigValue = async (configParam, environment) => {
  const env = environment || calcEnvironment();
  const configJSON = await getConfigForEnvironment(env);
  const configElements = configJSON.data;
  return configElements.find((c) => c.key === configParam)?.value;
};
