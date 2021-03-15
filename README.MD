# cwfchecker について

## 概要

インフォテック社のワークフローシステムである[Create!web フロー](https://www.createwebflow.jp/)の処理まち案件がないかチェックするデスクトップアプリケーションです。

## 動作要件

- ポートレット表示オプションが使用可能であること。
- パスワードに「￥」、「"」を使用していないこと。
- 動作確認は windows10 でしかしていません。

## 機能

- 指定した間隔で、処理待ち案件がないかチェックし、案件がある場合はポップアップします。
- タスクトレイに常駐します。
- 案件確認・決裁までアプリ内で完結します。

## 依存ライブラリ

- electron
- electron-store
- keytar

## ライセンス等

- 無保証です。

## 動作・ビルド方法

1. node.js をインストールします。
1. mkdir hogehoge
1. hogehoge にソースコードをコピーします
1. cd hogehoge
1. npm install
1. npx electron .
1. パッケージ化・組織内で配布する場合は、electron-builder 等を使用します。
