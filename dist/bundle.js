/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// import extensionHelpers from 'extension-helpers';

function init() {
  listenForBrowserAction();
}

function listenForBrowserAction() {
  chrome.browserAction.onClicked.addListener(toggleExtensions);
}

function toggleExtensions() {
  isDisabled().then(function (stateObj) {
    var disabledState = stateObj.disabledState;

    if (disabledState) {
      enableRoutine();
    } else {
      disableRoutine();
    }
  }).catch(function (err) {
    return console.error(err);
  });
}

function disableRoutine() {
  chrome.management.getAll(function (results) {
    createStateRecord(results);
    disableEverything();
    console.log('disabling');
    setDisabledState(true);
  });
}

function enableRoutine() {
  chrome.management.getAll(function (results) {
    restoreInitialState();
    console.log('reenabling');
    setDisabledState(false);
  });
}

function restoreInitialState() {
  return get('initialState').then(function (initialStateObj) {
    var initialState = initialStateObj.initialState;

    var extensionIds = Object.keys(initialState);
    extensionIds.forEach(function (extensionId) {
      console.log('setting', extensionId, 'to state', initialState[extensionId]);
      chrome.management.setEnabled(extensionId, initialState[extensionId]);
    });
  }).catch(function (err) {
    return console.error(err);
  });
}

function setDisabledState(state) {
  chrome.storage.local.set({ disabledState: state });
}

function isDisabled() {
  return get('disabledState');
}

function createStateRecord(extensions) {
  var initialState = {};
  extensions.forEach(function (extension) {
    if (chrome.runtime.id === extension.id) return;
    initialState[extension.id] = extension.enabled;
  });
  chrome.storage.local.set({ initialState: initialState });
}

function disableEverything() {
  chrome.management.getAll(function (results) {
    results.forEach(function (extension) {
      if (chrome.runtime.id === extension.id) return;
      chrome.management.setEnabled(extension.id, false);
    });
  });
}

function get(key) {
  if (chrome) {
    return new Promise(function (resolve, reject) {
      chrome.storage.local.get(key, function (itemsObject) {
        var err = chrome.runtime.lastError;
        if (err) return reject(err);
        resolve(itemsObject);
      });
    });
  } else {
    return browser.storage.local.get(key);
  }
}

init();

// set flag as disabled

// on toolbarbutton clicked
// if flag is disabled
// iterate through hash table
// restore all extensions to original state from hash table

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);
module.exports = __webpack_require__(0);


/***/ })
/******/ ]);