# kakuyasu_auto_order
カクヤスに酒を発注するスクリプトです。そのうち非公開にします。

## 事前準備
1. node.js をインストール
2. `npm install puppeteer`
3. `npm install readline-sync`
4. 下記の事前設定を完了させる

## 事前設定
### サイト側
1. カクヤスのアカウントを作成します。
2. 定番注文のところから発注したい酒などをセットしておきます。

### JSON
1. `account_sample.json` を `account.json` にコピー
2. カクヤスのサイトで作成したメールアドレスとパスワードを入力
3. `order_setting_sample.json` を `order_setting.json` にコピー
4. 各フィールドを埋める

- `debug` : 開発中は1
- `demo_mode` : 誰かに見せたい場合は `true`
- `real_order` : 実際に発注させたい場合は `true`
- `age` : 年齢。20歳以上でないと発注できないようです。
- `delivery_time` : 配達時間帯。19:00ごろの場合 `"1900"` という文字列です。分指定はできないっぽい。
- `receipt_name` : 領収書の宛名。

## 実行
1. `node sake.js`
2. 酒を受け取る（代引き）

## TODO
- [] 実際に注文する
- [] 配達可能時間帯の取得
- [] 実行時にコマンドラインから入力できるようにする
- [] いい感じの注文商品決定アルゴリズム