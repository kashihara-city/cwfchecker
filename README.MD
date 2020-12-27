# cwfchecker について

## 概要

インフォテック社のワークフローシステムである[Create!web フロー](https://www.createwebflow.jp/)の処理まち案件がないかチェックするデスクトップアプリケーションです。

## 動作要件

- ポートレット表示オプションが使用可能であること。
- パスワードに「￥」、「"」を使用していないこと。
- 動作確認は windows でしかしていません。

## 機能

- 指定した間隔で、処理待ち案件がないかチェックし、案件がある場合はポップアップします。
- タスクトレイに常駐します。

## 依存ライブラリ

- electron
- electron-store

## ライセンス等

- 無保証です。

## 動作方法

1. node.js をインストールします。
1. mkdir hogehoge
1. cd hogehoge
1. npm i -D electron
1. npm i -D electron-store
1. npx electron .
1. パッケージ化する場合は、electron-builder 等を使用します。
