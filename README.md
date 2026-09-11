# Shippo トップページ ヒーロー

スクロール量に同期して映像が進み、終盤でブランドレイアウトが浮かび上がるトップページのヒーロー部分。
ヒーロー（スクロール 0〜400vh）は完成。**その下に続くページ本体は未着手**。

## 起動

`fetch` で `frames/manifest.json` を読むため、`file://` で直接開くと動かない。必ずHTTPで配信する。

Windows（Node / Python 不要）:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1
```

Mac など:

```bash
python3 -m http.server 8793
```

→ http://localhost:8793

## 構成

| パス | 役割 |
|---|---|
| `index.html` | ヒーローのマークアップ |
| `style.css` | レイアウトと出現演出（`--p-*` 変数で駆動） |
| `main.js` | フレーム読み込み・スクロール同期・雪の描画 |
| `frames/frame_0001〜0303.webp` | 映像の連番（1920×1080 / webp q0.92 / 計24.8MB） |
| `frames/manifest.json` | フレーム枚数。枚数を変えたらここを更新 |
| `assets/shippo-logo.png` | ロゴ（単色PNG。CSSマスクで色を差し替えて使用） |
| `videos/hero.mp4` | 連番の元素材（3840×2160 / 60fps / 5.06秒）。ページからは読み込まない |
| `server.ps1` | ローカル確認用の静的サーバー |

## 仕組み

- 400vh のスクロール領域の中に `position: sticky` の stage を置き、画面に固定したまま canvas にフレームを描き替える
- `progress = スクロール量 ÷ (トラック高さ − 画面高さ)` を 0〜1 にし、`frameIndex = round(progress × (枚数 − 1))`
- スクロールに直接追従させず、`displayed` を毎フレーム少しずつ `target` に寄せて慣性を出している（`EASE`）
- 先頭48枚だけ読み終えたらローディングを抜け、残りはバックグラウンドで読む。未着のフレームは直近のフレームで埋める
- 終盤の出現は時間ベースのアニメーションではなく、スクロール量から算出した `--p-*` 変数で駆動。巻き戻せば逆再生される

### 終盤の出現タイミング（スクロール位置）

PC（写真全面の上にロゴが霧から浮き出る）:

| 要素 | 区間 |
|---|---|
| 大ロゴ | 70% → 86% |
| コピー | 76% → 91% |
| 上部（小ロゴ・ナビ） | 81% → 95% |
| 下部（EST. / SCROLL） | 86% → 100% |

スマホ（雪が積もって画面を白く埋め、その上にロゴが浮かぶ）:

| 要素 | 区間 |
|---|---|
| 雪が積もる | 70% → 89% |
| 大ロゴ | 87% → 98% |
| コピー | 90% → 100% |
| ナビ | 93% → 100% |
| 下部 | 95% → 100% |

## 調整ポイント

`main.js` 冒頭:

- `OUTRO_START` — 終盤の演出が始まる位置（0.7 = 70%）
- `REVEAL.wide` / `REVEAL.narrow` — PC / スマホそれぞれの出現区間
- `EASE` — スクロールへの追従の速さ（小さいほど慣性が強い）
- `FOCUS` — 写真のクロップ位置（object-position 相当）
- `PRIORITY_COUNT` — ローディングで待つ枚数

`initSnowfield()` 内: `WIND`（横風）、`resize()` の `130`（粒数）、`spawn()`（粒の大きさ・速さ）

`style.css` の `:root`: `--forest`（ロゴ・文字色 #2D4236）、`--snow-white`（雪面の白）

## フレームの再生成

映像を差し替える場合（要 ffmpeg）:

```bash
ffmpeg -i videos/hero.mp4 -vf "fps=60,scale=1920:-2" -c:v libwebp -quality 92 -compression_level 6 frames/frame_%04d.webp
```

書き出した枚数を `frames/manifest.json` の `count` に反映する。

**解像度は1920が上限。** 2560×1440 ではフレーム1枚のデコードに17.4msかかり、60fps の予算（16.7ms）を超えてカクつく（実測）。容量を減らしたいときは解像度ではなく品質を下げる（q0.85で約16MB、q0.80で約13MB）。

## 実測

- PC: スクロール中の平均フレーム時間 17.7ms、コマ落ち0
- スマホ: 雪が降る区間を含めて平均 16.7ms、コマ落ち0

## 未着手・残課題

- [ ] ヒーローの下に続くページ本体（ABOUT / PRODUCTS / JOURNAL / CONTACT）
- [ ] ローディング画面のデザイン（今は1pxのバーと%表示だけの仮組み）
- [ ] 本番では `.progress`（画面上部の開発用進捗バー）を `display: none` にする
- [ ] ロゴをSVGに差し替える（今は単色PNGをマスクとして使っている）
- [ ] スマホのナビ（今はヒーロー最終画面の下段に並べているだけで、ハンバーガーメニューなし）
- [ ] 24.8MB のプリロードを実際のモバイル回線で計測する
- [ ] React / Next.js への移植。`main.js` は DOM 要素を引数で受け取る作りなので、`useEffect` 内で `initScrollScrubFrames` と `initSnowfield` を呼べばそのまま動く
