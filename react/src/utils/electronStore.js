const { ipcRenderer } = window.require('electron')

module.exports = () => {
  return {
    getItem: (key) => {
      return new Promise((resolve) => {
        const result = ipcRenderer.sendSync('getItem', { key });
        resolve(result)
      })
    },
    setItem: (key, item) => {
      return new Promise((resolve) => {
        const result = ipcRenderer.sendSync('setItem', { key, item });
        resolve(result)
      })
    },
    removeItem: (key) => {
      return new Promise((resolve) => {
        const result = ipcRenderer.sendSync('deleteItem', { key });
        resolve(result)
      })
    }
  }
}