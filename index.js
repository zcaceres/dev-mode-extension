// import extensionHelpers from 'extension-helpers';

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
  chrome.management.getAll(function(results) {
    createStateRecord(results);
    disableEverything();
    setDisabledState(true);
  });
}

function enableRoutine() {
  chrome.management.getAll(function(results) {
    restoreInitialState();
    setDisabledState(false);
  });
}

function restoreInitialState() {
  return get('initialState')
    .then(initialStateObj => {
      const { initialState } = initialStateObj;
      const extensionIds = Object.keys(initialState);
      extensionIds.forEach(extensionId => {
        chrome.management.setEnabled(extensionId, initialState[extensionId]);
      })
    })
    .catch(err => console.error(err));
}

// UTILS =========================
function setDisabledState(state) {
  chrome.storage.local.set({ disabledState: state });
}

function isDisabled() {
  return get('disabledState');
}

function createStateRecord(extensions) {
  const initialState = {};
  extensions.forEach(extension => {
    if (chrome.runtime.id === extension.id) return;
    initialState[extension.id] = extension.enabled
  });
  chrome.storage.local.set({ initialState });
}

function disableEverything() {
  chrome.management.getAll(function(results) {
    results.forEach(extension => {
      if (chrome.runtime.id === extension.id) return;
      chrome.management.setEnabled(extension.id, false);
    });
  });
}

function get (key) {
  if (chrome) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, function (itemsObject) {
        const err = chrome.runtime.lastError;
        if (err) return reject(err);
        resolve(itemsObject);
      });
    });
  } else {
    return browser.storage.local.get(key);
  }
}

init();
