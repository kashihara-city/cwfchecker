const { ipcRenderer } = require("electron");
ipcRenderer.on("nakami_okure", (event, st1, st2) => {
  //
  //  let ohenji = document.getElementsByClassName(st1).length;
  const hontai = document.body.innerHTML;
  ohenji1 = (hontai.match(new RegExp(st1, "g")) || []).length;
  ohenji2 = (hontai.match(new RegExp(st2, "g")) || []).length;
  console.log("hoge");
  //event.reply("nakami_ohenji", ohenji1, ohenji2);
  ipcRenderer.send("nakami_ohenji", ohenji1, ohenji2);
});
