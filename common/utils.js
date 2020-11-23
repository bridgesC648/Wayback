export function rename(setKey, txt, evt) {
    if (evt.data.key === setKey && evt.data.newValue && fs.existsSync(txt)) {
      let newName = editString(JSON.stringify(evt.data.newValue));
      let jsonData = fs.readFileSync(txt, "cbor");
      jsonData.name = newName;
      fs.writeFileSync(txt, jsonData, "cbor");
      sendMessage();
      let stateJSON = fs.readFileSync("state.txt", "cbor");
      state.restoreState(stateJSON);
      refreshList();
    }
}
  
export function editString(string) { 
    var start = string.indexOf(':')
    var res = string.substring(start + 3, string.length - 4);
    var length = 20;                                           // max number of characters
    var trim = res.substring(0, length);
    return trim;
  }
