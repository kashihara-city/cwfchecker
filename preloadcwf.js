// sandboxのpreloadではrequireのみ動作
// このrequireはnodejsのrequireに類似したelectron独自のものでipcRenderer等に限って使用できる
const { ipcRenderer } = require("electron");

// mainjsからwin.webContents.sendで送られてきたものはipcrendereronで処理される
ipcRenderer.on("nakami_okure", (event, st1, st2) => {
  const hontai = document.body.innerHTML;
  ohenji1 = (hontai.match(new RegExp(st1, "g")) || []).length;
  ohenji2 = (hontai.match(new RegExp(st2, "g")) || []).length;

  ipcRenderer.send("nakami_ohenji", ohenji1, ohenji2);
});

// footerとしてランダムな画像（お知らせや操作説明を想定）を表示する
// 画像配置場所はhttp://xx.xx.xx.xx:8080/XFV20/manual/user/_images/以下で固定
// サーバ内の場所は/usr/local/CREATE_HOME/Tomcat/webapps/XFV20/manual/user/_images
window.addEventListener("DOMContentLoaded", () => {
  const baseurl = window.location.href;

  // 画像の候補リストを作成
  const imageCandidates = [
    "cwfchecker_footer01.jpg",
    "cwfchecker_footer02.jpg",
    "cwfchecker_footer03.jpg",
    "cwfchecker_footer04.jpg",
    "cwfchecker_footer05.jpg",
  ];

  const availableImages = []; // サーバー上に存在する画像を保存するリスト

  let checkCount = 0; // チェック済みの画像数

  // 各画像がサーバーに存在するかどうか確認

  imageCandidates.forEach((imageName) => {
    const img = new Image();
    const imgurl =
      baseurl.substring(0, baseurl.indexOf("XFV20")) +
      "XFV20/manual/user/_images/" +
      imageName;

    img.onload = () => {
      availableImages.push(imgurl); // 存在する画像をリストに追加
      checkCount++;
      if (checkCount === imageCandidates.length) {
        showRandomImage(availableImages);
      }
    };

    img.onerror = () => {
      checkCount++;
      if (checkCount === imageCandidates.length) {
        showRandomImage(availableImages);
      }
    };

    img.src = imgurl;
  });

  // 存在する画像の中からランダムで1つを表示
  function showRandomImage(availableImages) {
    if (availableImages.length > 0) {
      const randomImage =
        availableImages[Math.floor(Math.random() * availableImages.length)];
      const footer = document.createElement("div");
      footer.className = "footer";

      const imgElement = document.createElement("img");
      imgElement.src = randomImage;

      footer.appendChild(imgElement);

      const contents = document.querySelector("div.contents");
      if (contents) {
        contents.insertAdjacentElement("afterend", footer);
      } else {
        footer.textContent = "div.contents not found";
      }
    } else {
      console.log("No available images found on the server.");
    }
  }
});
