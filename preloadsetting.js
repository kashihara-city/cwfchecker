// sandboxのpreloadではrequireのみ動作
// このrequireはnodejsのrequireに類似したelectron独自のものでipcRenderer等に限って使用できる
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  Settingupdate: (param) => {
    ipcRenderer.send("ipc_setting_update", param);
    console.log(param);
  },
});

ipcRenderer.on("imano_settei_ha_koredesu", (event, st1) => {
  document.querySelector("#input1").value = st1.id;
  document.querySelector("#input2").value = st1.pw;
  document.querySelector("#input3").value = st1.ad;
  document.querySelector("#input4").value = st1.cwfaddress;
  document.querySelector("#input5").value = st1.interval;
});
