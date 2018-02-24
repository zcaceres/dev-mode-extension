import extensionHelpers from 'extension-helpers';
const { extensions, localStorage } = extensionHelpers;

// BROWSER ACTION =========================
function init() {
  listenForBrowserAction();
}

function listenForBrowserAction() {
  chrome.browserAction.onClicked.addListener(toggleExtensions);
}

// MAIN =========================
function toggleExtensions() {
  isDisabled()
    .then(stateObj => {
      const { disabledState } = stateObj;
      if (disabledState) {
        enableRoutine();
      } else {
        disableRoutine();
      }
    })
    .catch(err => console.error(err));
}

// ROUTINES =========================
function disableRoutine() {
  return extensions.getAll()
    .then(results => {
      createStateRecord(results, 'normalConfig');
      hasConfig('devConfig')
        .then(configExists => {
          console.log('does devConfig exist', configExists);
          if(configExists) {
            restoreFromState('devConfig')
          } else {
            disableEverything();
          }
          setDisabledState(true);
        });
  });
}

function enableRoutine() {
  return extensions.getAll()
    .then(results => {
      createStateRecord(results, 'devConfig');
      restoreFromState('normalConfig');
      setDisabledState(false);
  });
}

function hasConfig(configName) {
  return localStorage.get(configName)
    .then(config => {
      console.log('CONFIG', config)
      return Boolean(Object.keys(config).length);
    });
  }

function restoreFromState(configName) {
  console.log('restore state for', configName)
  return localStorage.get(configName)
    .then(configObj => {
      console.log('obj', configObj)
      const config = configObj[configName];
      const extensionIds = Object.keys(config);
      extensionIds.forEach(extensionId => {
        const enabled = config[extensionId];
        if (enabled) extensions.enable(extensionId);
        else extensions.disable(extensionId);
      })
    })
    .catch(err => console.error(err));
}

// UTILS =========================
function setDisabledState(state) {
  return localStorage.set('disabledState', state);
}

function isDisabled() {
  return localStorage.get('disabledState');
}

function createStateRecord(extensions, nameOfRecord) {
  const state = {};
  extensions.forEach(extension => {
    if (chrome.runtime.id === extension.id) return;
    state[extension.id] = extension.enabled
  });
  localStorage.set(nameOfRecord, state);
}

function disableEverything() {
  chrome.management.getAll(function(results) {
    results.forEach(extension => {
      if (chrome.runtime.id === extension.id) return;
      extensions.disable(extension.id);
    });
  });
}

init();
