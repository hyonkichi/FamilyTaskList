# 家族タスク管理アプリ

夫婦2人（奈・旦）が戸建購入・車購入などの人生イベントに伴う手続きの抜け漏れを防ぐためのPWAタスク管理アプリ。

## セットアップ手順

### 1. Firebase プロジェクトを作成する

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `family-task`）→ 作成
4. 左メニューから **Firestore Database** を選択
5. 「データベースの作成」→ **本番環境モードで開始** → リージョン `asia-northeast1`（東京）を選択
6. 「ルール」タブを開き、`firestore.rules` の内容を貼り付けて保存
7. 左メニューから **プロジェクトの設定**（歯車アイコン）→「全般」タブ
8. 「マイアプリ」セクションで `</>` (Web) をクリックしてアプリを登録
9. SDK設定と構成の値をコピーする

### 2. 環境変数を設定する

```bash
cp .env.local.example .env.local
```

`.env.local` を開き、Firebase の値を貼り付ける：

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. 開発サーバーを起動する

```bash
cd family-task
npm run dev
```

ブラウザで http://localhost:3000 を開くと自動的に家族IDが生成されます。

### 4. 奈さんと旦さんでリンクを共有する

1. アプリ内「設定」タブを開く
2. 「リンクをコピー」または「共有」でURLを送る
3. 受け取った方がURLを開くと同じデータが見られる

---

## Vercel へのデプロイ（スマホからアクセスできるようにする）

### Vercel とは？
GitHubと連携してNext.jsアプリを無料でホスティングするサービスです。スマホからアクセスできるURLが生成されます。

### 手順
1. [Vercel](https://vercel.com) でGitHubアカウントでサインアップ
2. このフォルダをGitHubリポジトリにプッシュ
3. Vercelで「Import Project」→ リポジトリを選択
4. 「Environment Variables」に `.env.local` の値を入力
5. デプロイ完了！ `https://your-app.vercel.app/` のURLが生成される

---

## 使い方

### イベントを作る
1. 「イベント」タブ → 右上の「追加」
2. 例: 「戸建購入」「車購入」「引越し手続き」

### タスクを追加する
- イベント詳細画面から「タスク追加」
- または「マイタスク」画面のセレクトボックスから

### 担当者を切り替える
- 画面右上の「奈 / 旦」ボタンで切り替え

---

## フェーズ別実装状況

| 機能 | 状態 |
|------|------|
| イベント作成・管理 | ✅ Phase 1完了 |
| タスク追加・チェック | ✅ Phase 1完了 |
| URLリンク共有 | ✅ Phase 1完了 |
| PWA対応（ホーム追加） | ✅ Phase 1完了 |
| プッシュ通知（FCM） | 🔜 Phase 2 |
| AIアドバイス（Claude API） | 🔜 Phase 2 |
| Gmail連携 | 🔜 Phase 3 |
