function importProp (fromModule, prop) {
  return {
    get ()    { return this.$store.state[fromModule][prop]       },
    set (val) {        this.$store.state[fromModule][prop] = val }
  }
}
function compImport (component, fromModule, props) {
  for (const prop of props)
    component.computed[prop] = importProp.bind(component)(fromModule, prop)
}

function importSaveProp (prop) {
  return {
    get ()    { return this.$store.state.Settings[prop] },
    set (val) {
      this.$store.state.Settings[prop] = val
      this.$store.commit('SAVE_TRIGGER')
    }
  }
}
function compSaveImport (component, props) {
  for (const prop of props)
    component.computed[prop] = importSaveProp.bind(component)(prop)
}

export { compImport, compSaveImport }
