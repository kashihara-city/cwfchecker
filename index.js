//分割代入。electron.appをappに、electron.BrowserwindowをBrowserwindowに代入する。
//分割代入は、{a,b,c}=obj;の様に記述し、aにobj.aを、bにobj.bを、cにobj.cを代入する。
const {
  app,
  Menu,
  BrowserWindow,
  Tray,
  globalShortcut,
  shell,
  ipcMain,
} = require("electron");
const path = require("path");
const store = require("electron-store");
const fs = require("fs");

console.log("hoge"); //コマンドプロンプトに出力される

//-------------------------------アプリケーション設定-------------------
//二重起動の防止
const doubleboot = app.requestSingleInstanceLock();
if (!doubleboot) {
  app.quit();
}

//-------------------------------グローバル変数又は変更可能性の高い設定-------------------------------
//-------------------------------ポートレットから検索する文字列設定----------------------
//決裁がある場合に登場する文字列
const SearchWord = "anchor anchor-primary";
//ポートレット表示が正常に表示された場合に必ずある文字列（エラー判定用）
const SearchWordb = "<!-- 認証成功 -->";
//添付ファイルなどのダウンロード先
const Downloadfolder = app.getPath("documents") + "\\cwf_downloads";
//-------------------------------フラグ類----------------------------------------------
//メインウィンドウのwebcontents.DOMready回数カウンター
//メインウィンドウを描写した回数
let counter_DOMreadycounter = 0;
//メインウィンドウのCloseを止めない（通常はcloseをpreventしてhideするが、メニューからアプリ終了を選んだ場合などに1を立てる）
let flag_DontPreventClose = 0;
//設定画面が開かれた
let flag_SettingWindowOpened = 0;
//決裁画面が開かれた
let flag_KessaiWindowOpened = 0;
//現在決裁を求められている件数（searchwordの数）
let counter_kessaikensu = 0;
//ポートレットへの認証が成功したかどうか(searchwordbの数)
let flag_portletauthsuccess = 0;

//メインウィンドウ操作用
let window_main;
//ポートレットアクセス先
let portleturl;
//設定画面で設定する更新間隔
let timeinterval;
//トレイ
let tray;
let userfunction_SetTrayIcon1 = {};
let userfunction_SetTrayIcon2 = {};
//-----------------------------グローバル変数終わり----------------------------------------

//------------------------------主処理----------------------------------------

//whenreadyはelectronアプリケーションを起動し、初期化される際に実行される非同期処理(promise)。
app.whenReady().then(() => {
  //初期処理
  userfunction_initial();
  //メニュー作成
  userfunction_createMenu();
  //メインウィンドウオープン
  userfunction_createWindow();
  //トレイアイコンを作る
  userfunction_createTrayIcon();
});

//appのwill-quit等のイベントを捕まえて、アプリケーションを終了する
//（）=>はjavascriptのアロー関数。=>で関数リテラルを記述する。
//（引数）=>｛処理本体｝
app.on("will-quit", () => {
  // すべてのショートカットを登録解除
  globalShortcut.unregisterAll();
});

//プロセスをちゃんと終わらせる
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//アプリケーションの初期化が完了したことを意味するwill-finish-launchingのイベント
//通常はここに初期化イベントを書く
app.on("will-finish-launching", () => {
  console.log("will-finish-launching");
});

//ウィンドウがフォーカスされたイベント
//eventを引数にしてウィンドウの番号を表示
app.on("browser-window-focus", (event) => {
  console.log("browser-window-focus" + event.sender.id);
});

//---------------------------主処理終わり--------------------------------------

//------------------------------初期処理関数------------------------------
const userfunction_initial = () => {
  //storeから読み出し
  const storedata = new store();

  //browserwindow用のURLを組み立てる
  portleturl =
    storedata.get("cwfaddress") +
    "?view=recv&loginid=" +
    encodeURIComponent(storedata.get("id")) +
    "&pwd=" +
    encodeURIComponent(storedata.get("pw")) +
    "&ldapsvr=" +
    encodeURIComponent(storedata.get("ad"));
  console.log(portleturl);

  //intervalが設定されてないか、15分以下の場合は場合は15分にする
  timeinterval = storedata.get("interval");
  if (isNaN(timeinterval) || timeinterval < 15) {
    timeinterval = 15;
  }
  console.log("timeinterval=" + timeinterval);
};
//--------------------------初期処理関数終わり---------------------------

//---------------------------主画面生成関数-------------------------------------------------------
//newBrowserdindowをwinで宣言し、win.loadfileでファイルを読みこむ関数。
//これでappとbrowserwindowが成立させる
const userfunction_createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 420,
    //        frame:false,
    //        titleBarStyle: 'hidden',
    //決裁画面を開いたときに閉じれなくなるので、フレームレス等はできない
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), "preloadcwf.js"),
    },
  });

  //メインウィンドウを操作するためにここで掴んでおく
  window_main = BrowserWindow.getFocusedWindow();
  console.log(window_main);

  //ローカルのファイルを読み込む場合
  //win.loadFile('index.html');

  //URLを読み込む場合
  win.loadURL(portleturl);
  //"http://54.250.92.171:8080/XFV20/portlet/wfportlet.jsp?view=recv&loginid=A10021&pwd=9999&ldapsvr="

  //テキスト変数（html）を直接読み込む場合
  //win.loadURL('data:text/html;charset=utf-8,' + html);

  //ブラウザのデバッグを表示する場合。webcontntsは表示されているコンテンツを扱うプロパティ
  //win.webContents.openDevTools();

  //ウィンドウを表示したり閉じたりするショートカットキーを登録する
  globalShortcut.register("F3", () => {
    console.log(
      "GSpressed" +
        win.isFocused() +
        win.isVisible() +
        BrowserWindow.getAllWindows().length
    );
    if (
      BrowserWindow.getAllWindows().length === 1 &&
      win.isVisible() === true
    ) {
      console.log("do hide");
      win.hide();
    } else {
      console.log("do show");
      userfunction_ReloadandShowWindow();
    }
  });

  //win関係のイベント
  //主画面のwinはfunctionの中にあるので、このイベントは基本的にはfunctionの中に書かないと動かない
  //ウェブコンテンツのイベントもこのオブジェクトを使う。
  win.webContents.on("dom-ready", () => {
    counter_DOMreadycounter++;
    console.log("dom-ready" + counter_DOMreadycounter);

    //preloadで読んだJSで件数などを問い合わせ
    win.webContents.send("nakami_okure", SearchWord, SearchWordb);
  });

  //ブラウザウィンドウのイベント
  win.on("ready-to-show", () => {
    console.log("ready to show");
  });

  //仮設置
  win.on("show", () => {
    console.log("show");
  });

  // //フォーカスを失ったら非表示
  ////便利だが、フォーカスを失うと、appshowで前に出てこないのでとりあえずコメントアウト
  //   win.on('blur',()=>{
  //     console.log('windowcounter'+BrowserWindow.getAllWindows().length)
  //     //メインウィンドウしかない場合は、フォーカスを失った場合は消える
  //     if(BrowserWindow.getAllWindows().length<2){
  // //      win.setAlwaysOnTop(true);
  // //     win.setAlwaysOnTop(false);
  // //      win.focus();
  //       win.hide();
  //     }
  //   });

  //閉じちゃったらとりあえず隠す
  win.on("close", (event) => {
    //デフォルト動作（flag_DontPreventCloseが0）
    if (flag_DontPreventClose === 0) {
      event.preventDefault();
      console.log("close prevented!!");
      win.hide();
    }
    //メニューから終了が呼び出されたときにはflag_DontPreventCloseは1なのでそのまま終了
  });

  //electronはデフォルトでダウンロードダイアログを開くので、
  //自動的に指定するフォルダにダウンロードしてそれを開くようにする
  win.webContents.session.on(
    "will-download",
    (event, downloadItem, webContents) => {
      const downloaddestintion =
        Downloadfolder +
        "\\" +
        //一つのファイルにwill-downloadが複数発生することが有るので、ランダム文字列をファイル名の頭に
        //付加してファイル存否判定をして、存在するファイルだけを開いていたが、とりあえず解決したのでコメントアウト
        //Math.random().toString(32).substring(2) +
        downloadItem.getFilename();
      console.log(downloaddestintion);
      downloadItem.setSavePath(downloaddestintion);
      console.log("willdownload");
      downloadItem.once("done", (event, state) => {
        if (state === "completed") {
          console.log("Download successfully");

          if (fs.existsSync(downloaddestintion)) {
            shell.openPath(downloaddestintion);
          }
        } else {
          console.log(`Download failed: ${state}`);
        }
      });
    }
  );

  // 開いたときに最大化
  win.webContents.on(
    "new-window",
    (
      event,
      url,
      frameName,
      disposition,
      options,
      additionalFeatures,
      referrer,
      postBody
    ) => {
      event.preventDefault();
      //もしログインウィンドウを開く場合は、規定のブラウザで開く（electronで申請フォームを開くと
      //申請フォーム側のサブフォーム等がうまく動かないので）
      if (url.slice(-12) === "/XFV20/login") {
        shell.openExternal(url);
      } else {
        const win = new BrowserWindow({
          webContents: options.webContents, // あれば既存の webContents を使用する
          webPreferences: {
            worldSafeExecuteJavaScript: true,
            nodeIntegration: false,
            contextIsolation: true,
            show: false,
            //chromiumのデフォルトで開く。これを指定しないと、electronのプロキシオブジェクトになるので、javascriptの機能が制限され
            //て色々不具合が出る
            nativeWindowOpen: true,
          },
        });
        win.once("ready-to-show", () => win.show());
        if (!options.webContents) {
          const loadOptions = {
            httpReferrer: referrer,
          };
          if (postBody != null) {
            const { data, contentType, boundary } = postBody;
            loadOptions.postData = postBody.data;
            loadOptions.extraHeaders = `content-type: ${contentType}; boundary=${boundary}`;
          }
          console.log(url);
          win.loadURL(url, loadOptions); // 自動で既存の webContents をナビゲーションする
          win.maximize();
          event.newGuest = win;
          //win.webContents.openDevTools();
          flag_KessaiWindowOpened = 1;
          //決裁画面など画面が閉じたら実行
          win.on("closed", () => {
            flag_KessaiWindowOpened = 0;
            //メインウィンドウを表示し、更新する
            if (BrowserWindow.getAllWindows().length === 1) {
              userfunction_ReloadandShowWindow();
              //なるべく添付ファイルのダウンロードフォルダのファイルは消す
              if (fs.existsSync(Downloadfolder)) {
                userfunction_deletefilesinfolder(Downloadfolder);
              }
            }
          });
        }
      }
    }
  );

  //画面左上に表示する
  win.setPosition(0, 0, false);

  //定期実行イベント
  setInterval(kessaicount, timeinterval * 1000 * 60);
  //setInterval(kessaicount, 1000 * 15);
  //本番のときは*1000*60にしとくこと
  function kessaicount() {
    //Domreadycounterが1超えかつ設定画面と決裁画面が閉じてないと本体処理を開始しない。
    if (
      counter_DOMreadycounter > 0 &&
      flag_SettingWindowOpened === 0 &&
      flag_KessaiWindowOpened === 0
    ) {
      //非同期関数でもうちょっとまともに書けるはずだが今はこれしかかけない
      //この関数でメインウィンドウをリロードすると、自動的にポートレットの中身をwin.webcontentsのon domreadyで問い合わせる。
      //問い合わせ結果（一番最後のipcmain.on nakami_ohenji）に応じて、ウィンドウの表示するなどを判定する。
      userfunction_reloadWindow();
    }
  }
};

//---------------------------主画面生成関数終わり------------------------------------------------

//-------------------------メニュー・設定画面関係-------------------------------------------

//メニュー作成
const userfunction_createMenu = () => {
  const menu_temp = [
    {
      label: "   メニュー   ",
      submenu: [
        {
          label: "設定画面",
          click: () => {
            console.log("New menu.");
            //設定画面を開いているときは二重に開かない
            if (flag_SettingWindowOpened < 1) {
              userfunction_createmenupage();
            }
            flag_SettingWindowOpened = 1;
          },
        },
        { type: "separator" },
        {
          label: "アプリ終了",
          click: () => {
            console.log("Quit menu.");
            flag_DontPreventClose = 1;
            app.quit();
          },
        },
      ],
    },
    {
      label: "   更新   ",
      role: "reload",
    },
    {
      label: "   閉じる   ",
      role: "close",
    },
  ];
  const menu = Menu.buildFromTemplate(menu_temp);
  Menu.setApplicationMenu(menu);
};

//メニューから呼び出す設定画面
function userfunction_createmenupage() {
  const win = new BrowserWindow({
    width: 400,
    height: 750,
    webPreferences: {
      //nodeIntegration: true
      worldSafeExecuteJavaScript: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), "preloadsetting.js"),
    },
  });

  //ローカルのファイルを読み込む場合
  win.loadFile("index.html");
  //win.webContents.openDevTools();

  //ウェブコンテンツのイベントもこのオブジェクトを使う。
  win.webContents.on("dom-ready", () => {
    console.log("dom-ready-menu");
    const storedata = new store();
    const sendingdata = {};
    sendingdata.id = storedata.get("id");
    sendingdata.pw = storedata.get("pw");
    sendingdata.ad = storedata.get("ad");
    sendingdata.cwfaddress = storedata.get("cwfaddress");
    sendingdata.interval = storedata.get("interval");
    //    console.log(sendingdata);
    win.webContents.send("imano_settei_ha_koredesu", sendingdata);
  });

  win.on("close", () => {
    flag_SettingWindowOpened = 0;
  });
}

//トレイアイコンの作成
const userfunction_createTrayIcon = () => {
  const imgFilePath = path.join(app.getAppPath(), "/build/favicon.ico");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "表示",
      click: () => {
        console.log("winshow");
        userfunction_ReloadandShowWindow();
      },
    },
    {
      label: "電子決裁確認アプリ終了",
      click: () => {
        console.log("Quit menu.");
        flag_DontPreventClose = 1;
        app.quit();
      },
    },
  ]);
  tray = new Tray(imgFilePath);
  tray.setToolTip(app.name);
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    console.log("tray click");
    userfunction_ReloadandShowWindow();
  });
};

//-------------------------メニュー・設定画面関係終わり-------------------------------------------

//----------------------ウインドウ操作関係---------------------------------------------
//メインウィンドウをリロードして表示(更新はdomreadyになったことがある場合のみ)
const userfunction_ReloadandShowWindow = () => {
  userfunction_reloadWindow();
  userfunction_ShowWindow();
};

//ウィンドウをリロード
//DOMreadyになったことがない場合は設定画面に入力するパラメータがおかしいのでリロードしない
const userfunction_reloadWindow = () => {
  if (counter_DOMreadycounter > 0) {
    window_main.loadURL(portleturl);
    console.log("reloaded");
  }
};

//メインウィンドウを表示
const userfunction_ShowWindow = () => {
  window_main.show();
  window_main.focus();
};

//----------------------ウインドウ操作関係終わり-----------------------------------------

//---------------------------------メイン・レンダラープロセス間通信------------------------

//メインウィンドウのIPC待受（preloadcwf.jsからの返信）
ipcMain.on("nakami_ohenji", (event, ohenji_sono1, ohenji_sono2) => {
  console.log("kessaikensuha" + ohenji_sono1);
  console.log("ninsyokensuha" + ohenji_sono2);
  counter_kessaikensu = ohenji_sono1;
  flag_portletauthsuccess = ohenji_sono2;

  if (counter_kessaikensu > 0) {
    //ここに決裁待ちが１件以上有る場合の処理を書く
    console.log("kessai ari" + counter_kessaikensu + "ken");
    userfunction_ShowWindow();
  } else {
    //ここに決裁待ちがない場合の処理
    console.log("kessai nashi");
    //ここに決裁待ちが認証が成功した場合
    if (flag_portletauthsuccess > 0) {
      //ここに決裁待ちはないが認証が成功した場合の処理
      console.log("portlet success");
      //win.hide();
    } else {
      //ここに認証が失敗しているか、全然違うページを表示してるときの処理
      console.log("portlet failure");
      userfunction_ShowWindow();
    }
  }
});

//メインウィンドウのIPC待受（preloadsetting.jsからの返信）
ipcMain.on("ipc_setting_update", (event, param) => {
  console.log(param.id);
  const storedata = new store();
  storedata.set("id", param.id);
  storedata.set("pw", param.pw);
  storedata.set("ad", param.ad);
  storedata.set("cwfaddress", param.cwfadress);
  storedata.set("interval", param.interval);
  console.log(storedata.get("id"));
  console.log(storedata.get("pw"));
  console.log(storedata.get("ad"));
  console.log(storedata.get("cwfaddress"));
  console.log(storedata.get("interval"));
  app.relaunch();
  app.exit();
});

//-------------------メイン・レンダラープロセス間通信関係　終わり------------------------

//----------------------その他一般関数---------------------------------------------

//フォルダにあるファイルを削除する
const userfunction_deletefilesinfolder = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log(err);
    }
    files.forEach((file) => {
      fs.unlink(`${dir}/${file}`, (err) => {
        if (err) {
          console.log(err);
        }
        console.log(`deleted ${file}`);
      });
    });
  });
};
