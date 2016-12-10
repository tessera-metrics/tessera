declare var ts

window.onbeforeunload = (e) => {
  if (ts.manager.current && ts.manager.current.dashboard.dirty) {
    let msg = 'Dashboard has unsaved changes. Are you sure you want to leave?'
    e.returnValue = msg
    return msg
  }
  return null
}
