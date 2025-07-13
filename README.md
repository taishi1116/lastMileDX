# 野菜配送ルート管理システム

BtoB向けの野菜配送ルート管理Webアプリケーションです。CSVファイルから配送先情報を取り込み、地図上でルート管理を行うことができます。

## 機能一覧

### 1. CSVアップロード機能
- 配送先情報をCSVファイルから一括インポート
- 必須カラム: course_number, customer_name, customer_code, address, sales
- アップロード後、自動的に住所をジオコーディング

### 2. マップ画面
- 配送先をピンで地図上に表示
- コース番号ごとに色分けされたピン
- ピンクリックで詳細情報を表示
  - コース番号（編集可能）
  - お客様名
  - お客様コード
  - 住所
  - 売上
- Shift + ドラッグで範囲選択が可能
- 選択した配送先のコース番号を一括変更

### 3. CSVダウンロード機能
- 全データまたはコース別にCSVファイルをダウンロード
- 編集したコース情報を含むデータをエクスポート

### 4. サマリ確認画面
- コースごとの売上合計と配送件数を表示
- 総売上、総配送件数、平均売上を確認可能

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **バックエンド**: Next.js Server Components
- **データベース**: MySQL
- **地図**: Leaflet, React Leaflet
- **その他**: OpenStreetMap (Nominatim) for geocoding

## セットアップ

### 1. 依存関係のインストール

```bash
cd delivery-route-app
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定してください：

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=delivery_route_db
DB_PORT=3306
```

### 3. データベースの初期化

アプリケーション起動後、以下のURLにアクセスしてデータベースを初期化：

```
http://localhost:3000/api/init-db
```

### 4. アプリケーションの起動

```bash
npm run dev
```

## 使い方

1. CSVファイルを準備（必須カラムを含む）
2. CSVファイルをアップロード
3. マップ画面で配送先を確認・編集
4. 必要に応じてコース番号を編集または一括変更
5. 編集結果をCSVファイルでダウンロード
6. サマリ画面で売上情報を確認

## 注意事項

- ジオコーディングにはOpenStreetMapのNominatim APIを使用しています
- 大量のデータをジオコーディングする際は、API制限に注意してください
- MySQLサーバーが起動していることを確認してください