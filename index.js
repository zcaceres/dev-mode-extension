import extensionHelpers from 'extension-helpers';
const { extensions, localStorage } = extensionHelpers;
console.log(extensions, localStorage, extensionHelpers);

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
      createStateRecord(results);
      disableEverything();
      setDisabledState(true);
  });
}

function enableRoutine() {
  return extensions.getAll()
    .then(results => {
      restoreInitialState();
      setDisabledState(false);
  });
}

function restoreInitialState() {
  return localStorage.get('initialState')
    .then(initialStateObj => {
      const { initialState } = initialStateObj;
      const extensionIds = Object.keys(initialState);
      extensionIds.forEach(extensionId => {
        const enabled = initialState[extensionId];
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

function createStateRecord(extensions) {
  const initialState = {};
  extensions.forEach(extension => {
    if (chrome.runtime.id === extension.id) return;
    initialState[extension.id] = extension.enabled
  });
  localStorage.set('initialState', initialState);
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
