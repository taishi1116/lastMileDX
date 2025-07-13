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
- **データベース**: MySQL (Docker)
- **地図**: Leaflet, React Leaflet
- **その他**: OpenStreetMap (Nominatim) for geocoding

## セットアップ

### 1. Dockerを使用したセットアップ（推奨）

```bash
# プロジェクトのセットアップ（初回のみ）
make setup

# 依存関係のインストール
npm install

# アプリケーションの起動
npm run dev
```

これで以下が自動的に行われます：
- MySQLコンテナの起動
- データベースとテーブルの作成
- 環境変数ファイル（.env.local）の作成

### 2. Docker操作用コマンド

```bash
# コンテナの起動
make up

# コンテナの停止
make down

# コンテナの再起動
make restart

# ログの確認
make logs

# MySQLシェルへのアクセス
make db-shell

# クリーンアップ（データも削除）
make clean
```

### 3. 手動セットアップ（Dockerを使用しない場合）

MySQLを別途インストールし、`.env.local`ファイルを作成：

```
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=delivery_route_db
DB_PORT=3306
```

その後、以下を実行：

```bash
npm install
npm run dev
```

アプリケーション起動後、データベースを初期化：
```
http://localhost:3000/api/init-db
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
- Dockerを使用する場合は、Docker DesktopまたはDocker Engineがインストールされている必要があります