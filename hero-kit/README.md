# Shippo Hero Kit

スクロール量に同期して木の映像が進み、終盤で Shippo のロゴが浮かび上がるトップのヒーロー部分だけを切り出したキット。
**このフォルダをコピーして、ヒーローの直後に自分のセクションを並べるだけで繋がる。**

- 依存ライブラリなし（素の HTML / CSS / JS）
- クラス名はすべて `shippo-hero` で始まり、スタイルはヒーローの中に閉じているので後続セクションと干渉しない
- 映像を最終フレームまで進めたあと、その画面のまま2画面分静止してから次のセクションへ抜ける
- PC は写真の上にロゴが霧から浮かぶ。スマホ（767px以下）は雪が積もって白く埋まり、その上にロゴが浮かぶ

デモ: `demo.html`（後続セクション付きの最小構成）

## 中身

| パス | 役割 |
|---|---|
| `shippo-hero.css` | スタイル |
| `shippo-hero.js` | フレーム読み込み・スクロール同期・雪・出現演出 |
| `snippet.html` | 貼り付ける HTML |
| `demo.html` | 組み込み例 |
| `frames/` | 映像の連番 303枚（1920×1080 / webp / 計24.8MB）と `manifest.json` |
| `assets/shippo-logo.png` | ロゴ（単色PNG。CSSマスクで色を差し替えて使う） |

## 組み込み方

1. `hero-kit/` フォルダを丸ごとプロジェクトに置く
2. `<head>` に読み込む

   ```html
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;600&display=swap" />
   <link rel="stylesheet" href="./hero-kit/shippo-hero.css" />
   <script defer src="./hero-kit/shippo-hero.js"></script>
   ```

3. `snippet.html` の中身を `<body>` の先頭（固定ヘッダーがあればその後）に貼る
4. その直後に後続のセクションを並べる。`SCROLL` ボタンの `href="#next"` は後続セクションの id に変える

`data-shippo-hero` 属性の付いた要素は、スクリプトが読み込まれた時点で自動で起動する。

## 守ること

- **HTTP で配信する。** `frames/manifest.json` を `fetch` するので、`file://` で直接開くと動かない
  （確認用: `python3 -m http.server` など）
- **ヒーローの祖先に `overflow: hidden` / `auto` を付けない。** `position: sticky` が効かなくなる。
  横はみ出しを防ぎたいときは `body { overflow-x: clip; }` を使う
- **ヒーローの祖先に `transform` / `filter` を付けない。** sticky と固定のローディング画面が崩れる
- ヒーローは1ページに1つ。読み込み中は `<html>` に `shippo-hero-loading` が付き、スクロールが止まる
- 読み込み時にページ先頭へ戻す（`history.scrollRestoration = "manual"`）。不要なら `resetScroll: false`

## 調整

### CSS 変数（`.shippo-hero` に上書き）

| 変数 | 既定値 | 内容 |
|---|---|---|
| `--shippo-hero-color` | `#2d4236` | ロゴ・文字の色 |
| `--shippo-hero-snow` | `#f2f4f7` | スマホで画面を埋める雪面の白 |
| `--shippo-hero-top-offset` | `var(--header-height, 70px)` | 固定ヘッダーの高さぶんの上余白 |

### data 属性 / オプション

`<div class="shippo-hero" data-shippo-hero data-hold-screens="1">` のように属性で上書きできる。

| オプション | 属性 | 既定値 | 内容 |
|---|---|---|---|
| `holdScreens` | `data-hold-screens` | `2` | 組み上がったあと静止させる画面数 |
| `scrubScreens` | `data-scrub-screens` | `3` | 映像を進めるのに使う画面数 |
| `outroStart` | `data-outro-start` | `0.7` | ロゴが出始めるスクロール位置（0〜1） |
| `ease` | `data-ease` | `0.14` | スクロールへの追従の速さ（小さいほど慣性が強い） |
| `priorityCount` | `data-priority-count` | `48` | ローディングで待つ枚数 |
| `base` | `data-base` | このJSの場所 | `frames/` を含むフォルダ |
| `focus` | — | `{ x: 0.5, y: 0.5 }` | 写真のクロップ位置（object-position 相当） |
| `resetScroll` | — | `true` | 読み込み時に先頭へ戻す |

ヒーローの全長は `(1 + scrubScreens + holdScreens) × 100vh`（既定で 600vh）。CSS と JS で自動的に揃う。

### 手動で起動する

React / Next.js などで自分のタイミングで起動したいときは `data-shippo-hero="manual"` にして:

```js
const hero = window.ShippoHero.mount(element, { holdScreens: 1 });
// アンマウント時
hero.destroy();
```

## イベント

ヒーロー要素から発火し、`document` まで伝わる。ヘッダーの色の切り替えなどに使える。

| イベント | detail | タイミング |
|---|---|---|
| `shippo-hero:ready` | `{ frames }` | ローディングが終わった |
| `shippo-hero:progress` | `{ progress }` | 進み具合（0〜1）が変わるたび |
| `shippo-hero:complete` | `{ progress }` | 最終画面まで来た（静止区間に入った） |

最終画面まで来ている間は、ヒーロー要素に `is-complete` クラスが付く。

```js
document.addEventListener("shippo-hero:progress", (e) => {
  header.classList.toggle("is-light", e.detail.progress > 0.7);
});
```

## 映像を差し替える

```bash
ffmpeg -i hero.mp4 -vf "fps=60,scale=1920:-2" -c:v libwebp -quality 92 -compression_level 6 frames/frame_%04d.webp
```

書き出した枚数を `frames/manifest.json` の `count` に入れる。

**解像度は1920が上限。** 2560×1440 ではフレーム1枚のデコードに17.4msかかり、60fps の予算（16.7ms）を超えてカクつく（実測）。
容量を減らしたいときは解像度ではなく品質を下げる（q0.85で約16MB、q0.80で約13MB）。

## 配信

- `frames/` は中身が変わらないので長期キャッシュ推奨（例: `Cache-Control: public, max-age=31536000, immutable`）
- 本番に必要なのは `shippo-hero.css` / `shippo-hero.js` / `assets/` / `frames/` だけ。README・デモ・スニペットは配信しなくてよい
