import extensionHelpers from 'extension-helpers'
const { extensions, localStorage } = extensionHelpers
/* global chrome */

// BROWSER ACTION =========================
function init () {
  listenForBrowserAction()
  setDisabledState(false)
  hotReload()
}

function listenForBrowserAction () {
  chrome.browserAction.onClicked.addListener(toggleExtensions)
}

// MAIN =========================
function toggleExtensions () {
  setTimeout(() => isDisabled()
    .then(stateObj => {
      const { disabledState } = stateObj
      if (disabledState) {
        enableRoutine()
      } else {
        disableRoutine()
      }
    })
    .catch(err => console.error(err))
    , 200)
}

// ROUTINES =========================
function disableRoutine () {
  return extensions.getAll()
    .then(results => {
      createStateRecord(results, 'normalConfig')
      hasConfig('devConfig')
        .then(configExists => {
          if (configExists) {
            restoreFromState('devConfig')
          } else {
            disableEverything()
          }
          chrome.browserAction.setBadgeText({ text: 'D' })
          setDisabledState(true)
        })
    })
}

function enableRoutine () {
  return extensions.getAll()
    .then(results => {
      createStateRecord(results, 'devConfig')
      restoreFromState('normalConfig')
      chrome.browserAction.setBadgeText({ text: '' })
      setDisabledState(false)
    })
}

function hasConfig (configName) {
  return localStorage.get(configName)
    .then(config => {
      return Boolean(Object.keys(config).length)
    })
}

function restoreFromState (configName) {
  return localStorage.get(configName)
    .then(configObj => {
      const config = configObj[configName]
      const extensionIds = Object.keys(config)
      let intervalMs = 0
      extensionIds.forEach(extensionId => {
        const enabled = config[extensionId]
        if (enabled) {
          setTimeout(() => extensions.enable(extensionId).catch(console.error), intervalMs)
          intervalMs += 10
        } else {
          setTimeout(() => extensions.disable(extensionId).catch(console.error), intervalMs)
          intervalMs += 10
        }
      })
    })
    .catch(err => console.error(err))
}

// HOT RELOADING from Github User `xpl` ==================
const filesInDirectory = dir => new Promise(resolve =>
  dir.createReader().readEntries(entries =>
    Promise.all(entries.filter(e => e.name[0] !== '.').map(e =>
      e.isDirectory
        ? filesInDirectory(e)
        : new Promise(resolve => e.file(resolve))
    ))
      .then(files => [].concat(...files))
      .then(resolve)
  )
)

const timestampForFilesInDirectory = dir =>
  filesInDirectory(dir).then(files =>
    files.map(f => f.name + f.lastModifiedDate).join())

const reload = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) { chrome.tabs.reload(tabs[0].id) } // Reload current page
    chrome.runtime.reload() // Reload background page
  })
}

const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then(timestamp => {
    if (!lastTimestamp || (lastTimestamp === timestamp)) {
      setTimeout(() => watchChanges(dir, timestamp), 1000) // retry after 1s
    } else {
      reload()
    }
  })
}

const hotReload = () => {
  chrome.management.getSelf(self => {
    if (self.installType === 'development') {
      chrome.runtime.getPackageDirectoryEntry(dir => {
        watchChanges(dir)
      })
    }
  })
}

// UTILS =========================
function setDisabledState (state) {
  return localStorage.set('disabledState', state)
}

function isDisabled () {
  return localStorage.get('disabledState')
}

function createStateRecord (extensions, nameOfRecord) {
  const state = {}
  extensions.forEach(extension => {
    if (chrome.runtime.id === extension.id) return
    state[extension.id] = extension.enabled
  })
  localStorage.set(nameOfRecord, state)
}

function disableEverything () {
  chrome.management.getAll(function (results) {
    results.forEach(extension => {
      if (chrome.runtime.id === extension.id) return
      extensions.disable(extension.id).catch(console.error)
    })
  })
}

init()
