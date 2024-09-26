// sandboxのpreloadではrequireのみ動作
// このrequireはnodejsのrequireに類似したelectron独自のものでipcRenderer等に限って使用できる
const { ipcRenderer } = require("electron");

// index.jsからwin.webContents.send("nakami_okure", SearchWord, SearchWordb);で送られてきたものはipcrRnderer.onで処理される
ipcRenderer.on("nakami_okure", (event, st1, st2) => {
  const hontai = document.body.innerHTML;
  // キーワードst1がポートレットに何回登場するかで件数をカウントする
  const ohenji1 = (hontai.match(new RegExp(st1, "g")) || []).length;
  // st2は認証が通っているか
  const ohenji2 = (hontai.match(new RegExp(st2, "g")) || []).length;

  // ポートレットの下に表示する画像候補（説明図などを想定）
  const imageCandidates = [
    "cwfchecker_footer01.jpg",
    "cwfchecker_footer02.jpg",
    "cwfchecker_footer03.jpg",
    "cwfchecker_footer04.jpg",
    "cwfchecker_footer05.jpg",
  ];

  // 画像配置場所はhttp://xx.xx.xx.xx:8080/XFV20/manual/user/_images/以下で固定
  // サーバ内の場所は/usr/local/CREATE_HOME/Tomcat/webapps/XFV20/manual/user/_images
  const baseurl = window.location.href.split("XFV20")[0];

  // 画像存在チェック用の変数
  const availableImages = [];
  let checkCount = 0;

  const checkImage = (imageName) => {
    const img = new Image();
    const imgurl = `${baseurl}XFV20/manual/user/_images/${imageName}`;

    img.onload = img.onerror = () => {
      // img.naturalWidthは画像の幅。画像が読み込まれなかった場合は 0
      if (img.naturalWidth > 0) availableImages.push(imgurl);
      if (++checkCount === imageCandidates.length) {
        // 画像のチェックが終わった段階でプロセス間通信の返信を行う
        const ohenji3 = availableImages.length;
        ipcRenderer.send("nakami_ohenji", ohenji1, ohenji2, ohenji3);
        showRandomImage(availableImages);
      }
    };

    img.src = imgurl;
  };

  imageCandidates.forEach(checkImage);
});

// 存在する画像リストを引数にして、その中からランダムで1つを表示する関数
function showRandomImage(availableImages) {
  if (availableImages.length > 0) {
    const randomImage =
      availableImages[Math.floor(Math.random() * availableImages.length)];
    const footer = document.createElement("div");
    footer.className = "footer";

    const imgElement = document.createElement("img");
    imgElement.src = randomImage;

    footer.appendChild(imgElement);

    // div.contentsはポートレットの受信案件などを表示する部分
    // contentsがあれば、その次にdiv.footerを追加する
    const contents = document.querySelector("div.contents");
    if (contents) {
      contents.insertAdjacentElement("afterend", footer);
    }
  } else {
    console.log("No available images found on the server.");
  }
}
