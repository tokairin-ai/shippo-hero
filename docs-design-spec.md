## 1. Visual Theme & Atmosphere

### ドロワーメニュー

- メニューボタン押下で、画面全体を覆うドロワーメニューを表示する。
- メニューは日本語＋英字の2段構成とし、日本語の直下に英字を配置する。
- メニュー文字サイズ：日本語 16px、英字 14px。
- 英字は日本語より視認性を抑え、opacity: 0.7 とする。
- メニュー項目は縦方向に配置し、各項目間に十分な余白を確保する。
- メニュー下部に会社名・住所・電話番号等の企業情報を配置する。文字サイズは13px とする。
- 最下部にSNSアイコンを横並びで配置する。アイコンサイズは 24px、gap: 16px。
- メニュー上部にはロゴと閉じるボタンを配置する。
- 閉じるボタンは右上に配置し、メニュー表示中も常に操作できる状態にする。
- 開閉時は即時切り替えではなく、滑らかなアニメーションを入れる。
- メニュー表示中は背景コンテンツを固定し、スクロールさせない。
- 閉じるボタンはメニューボタンと同位置に配置し、状態変化が分かるデザインにする。
- ホバー可能な端末では、各リンクに控えめなホバーアニメーションを設定する。
- SPでも基本構造を維持しつつ、1〜2カラム程度に再配置して可読性を確保する。 


## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。
> ISSEY MIYAKE の UI は装飾色を持たず、**無彩色 + 一点のオレンジ**だけで構築されている。

### Surface

- **Page Background** (`#ffffff`): ページ全体の純白
- **Section Alt** (`#eceeef`): 検索バー・補助セクション背景
- **Notice Bar** (`#464d59`): 「【重要なお知らせ】REALITY LAB...」等のお知らせバー背景（slate gray）

### Text

- **Text Primary** (`#333333`): 本文・見出し・ナビ・リンクのデフォルトテキスト色（rgb(51, 51, 51)）
- **Text Date** (`#222222`): 日付テキスト（rgb(34, 34, 34)、少し濃い）
- **Text Muted** (`#767676`): 補足・カテゴリラベル（rgb(118, 118, 118)）
- **Text on Dark** (`#ffffff`): 黒帯バー・CTA 内テキスト

### CTA / Action

- **Black Bar** (`#333333`): 「すべて同意」「拒否」「コンテンツに進む」等の CTA 背景
- **Black Bar Text** (`#ffffff`): 上記 CTA 内テキスト
- **Wishlist BG** (`#ff4500`): EC ウィッシュリスト CTA

## 3. Typography Rules

### 3.1 和文フォント

Web フォントは読み込まず、**OS のフォントに任せる**。

- **ゴシック体（既定）**: **ヒラギノ角ゴシック（Hiragino Sans）** → **游ゴシック Medium** → **メイリオ**
- **明朝体（ヒーロー見出し専用）**: **游明朝** → **ヒラギノ明朝 Pro**
- **教科書体（`--tcd-font-type3`。トップでは未使用）**: **游教科書体** → **UD デジタル 教科書体 N**
- **ロゴ用**: **Noto Sans JP**（`--tcd-font-type-logo`。ロゴ画像のフォールバックのみ）

### 3.2 欧文フォント

- **サンセリフ**: **Arial**（**スタックの先頭**）
- **セリフ**: **Times New Roman** → Times（明朝スタックの先頭）
- **等幅**: 指定なし
### 3.3 font-family 指定

**欧文優先のスタック**。和文フォント内の欧文グリフより Arial / Times を先に当てる方針。

```css
/* --tcd-font-type1 : 本文・セクション見出し・ナビ（サイトの既定） */
font-family: Arial, "Hiragino Sans", "Yu Gothic Medium", "Meiryo", sans-serif;

/* --tcd-font-type2 : ヒーロー見出し（ブランドを語る大見出し） */
font-family: "Times New Roman", Times, "Yu Mincho", "游明朝", "游明朝体",
             "Hiragino Mincho Pro", serif;

/* --tcd-font-type3 : 教科書体（引用・詩的なコピー用に用意されている） */
font-family: Palatino, "Yu Kyokasho", "游教科書体", "UD デジタル 教科書体 N",
             "游明朝", "游明朝体", "Hiragino Mincho Pro", "Meiryo", serif;

/* --tcd-font-type-logo */
font-family: "Noto Sans JP", sans-serif;
```

**フォールバックの考え方**:
- **欧文を先頭に置く**ので、`Shippo` などのブランド名は Arial の字形で出る
- 和文は **ヒラギノ → 游ゴシック Medium → メイリオ** の順。Windows で游ゴシックの Regular が細く出る問題は **Medium を明示**して回避している
- **明朝スタックには ProN が入っていない**（`Hiragino Mincho Pro`）。約物の字形が ProN と異なる点に注意

### 3.4 文字サイズ・ウェイト階層

| 役割 | サイズ | ウェイト | line-height | 書体 | 
|------|-------|---------|------------|------|-----|
| **ヒーロー見出し** | 36px | **600** | 50.4px (**1.4**) | **明朝** (type2) | 
| セクション見出し（H1） | 40px | 400 | 56px (1.4) | ゴシック | 
| セクション見出し（H2） | 34px | 400 | 51px (1.5) | ゴシック | 
| 中見出し（H2） | 22px | 600 | 33px (1.5) | ゴシック | 
| フッター見出し（H2） | 18px | 400 | 18px (1.0) | ゴシック | 
| 小見出し（H3・アクセント） | 16px | 600 | 20.8px (1.3) | ゴシック | 
| 小見出し（H4 / H5） | 16px | **700** | normal | ゴシック | 
| **本文** | **15px** | 400 | **36px (2.4)** | ゴシック | 
| グローバルナビ | 16px | 400 | 70px | ゴシック | 
| ドロワー内リンク | 16px | 400 | 70px | ゴシック | 
| キャプション | 13px | 400 | 19.5px (1.5) | Arial | 
| フッターナビ | 15px | 400 | 70px | ゴシック | 
| コピーライト | 10px | 400 | 16px (1.6) | ゴシック | 



### 3.5 行間・字間

**行間（CSS 宣言の実出現）**

| 値 |  用途 |
|----|------|------|
| `2` |  汎用の本文 |
| `1.5` |  見出し・カードのタイトル |
| **`2.4`** | **記事本文（15px → 36px）**。このサイトの標準 |
| `1.4` |  大見出し |
| `1.6` | ドロワー内のリンク |
| `1.2` |  数字・英字のみの行 |

- **日本語本文は 2.0〜2.4 を使う**。1.8 以下に詰めると Hacoa の余白感が失われる
- **見出しは 1.4〜1.5**。大きい文字ほど比率を下げる

**字間**

- **原則 `normal`**。CSS 中の `letter-spacing` 宣言は **4 個だけ**
- 効いているのは **グローバルナビの `0.03em`**（14px → 0.42px）のみ
- **見出しにトラッキングを入れない**。明朝の大見出しも `normal`

### 3.6 禁則処理・改行ルール

- 意味のまとまりで折る（例:「木はさまざまな要素を含んだ完成した素材で」／「それぞれの香りや温かい感触があります」）
- `word-break` / `overflow-wrap` の指定は無く、**ブラウザ既定の日本語禁則に任せる**

### 3.7 OpenType 機能

- **`palt` を使わない**。「」（）、。 のアキは詰めない
- 数字も **プロポーショナル指定なし**（`tnum` / `pnum` いずれも未使用）。日付「2026/08/24」は Arial の既定字形で出る


---

## 4. Component Stylings

### Buttons

**① ゴーストピル（写真の上・最頻出）**

```css
background: transparent;
color: #ffffff;
border: 1px solid #ffffff;
border-radius: 60px;
font-size: 16px;
font-weight: 600;
padding: 0 20px;   /* 高さは line-height で作る */
```

写真セクションの「Hacoa の歩み」「商品開発」など、**サイトで最も多く出る CTA**。面を持たないので写真が透ける。

**② アウトラインピル（白地の上）**

```css
background: transparent;
color: #000000;
border: 2px solid #000000;      /* 枠が 2px になる点に注意 */
border-radius: 9999px;          /* 30px の実装も混在 */
font-size: 16px;
font-weight: 700;
padding: 10.672px 21.28px;
```

`#2d2d2d` を枠と文字に使うバリエーションもある。

**③ ソリッドピル（黒）**

```css
background: #000000;
color: #ffffff;
border: none;
border-radius: 9999px;          /* 30px の実装も混在 */
font-size: 16px;
font-weight: 700;
padding: 12.672px 23.328px;     /* ②より上下 2px 大きい＝枠の分を埋めている */
```

**④ 反転ピル（白面・黒枠）**

```css
background: #ffffff;
color: #000000;
border: 2px solid #000000;
border-radius: 30px;
font-size: 16px;
font-weight: 700;
padding: 10.672px 21.28px;
```

**⑤ フラットな矩形ボタン（一覧の「さらに読み込む」）**

```css
background: 
color: #ffffff;
border-radius: 4px;
font-size: 13px;
font-weight: 400;
padding: 7px 14px;
```

### Inputs

**フォームは意図的に素の状態に近い。**

```css
/* テキストエリア（問い合わせ） */
background: #ffffff;
color: #000000;
border: 1px solid 
border-radius: 0;
font-size: 15px;
```

- **`input[type=text]` は UA 既定のまま**（`2px inset`）。検索欄などはブラウザの見た目を上書きしていない
- **フォーカスリングの独自指定は無い**。ブラウザ既定のフォーカス表示に任せている
- 実装時は最低限 `border: 1px solid #c1c1c1` / `border-radius: 0` に揃えると、他の入力欄と印象が一致する

### Cards

```css
background: #fafafa;    /* または #ffffff */
border-radius: 0;       /* 画像カードは角丸なし */
box-shadow: none;       /* 影を持たない */
```

- **商品・記事カードは全幅の写真そのもの**。枠も影も角丸も付けず、写真の矩形をそのまま見せる


---

## 5. Layout Principles

### Content Width（CSS Custom Properties 実測値）

| Token | Value | 用途 |
|-------|-------|------|
| `--global-content-max-width-hero` | 1680px | ヒーローセクション |
| `--global-content-max-width` | 1260px | 通常コンテンツ |

### Breakpoints（実測値）

| Name | Width | 用途 |
|------|-------|------|
| Large | ≥ 1024px | デスクトップ |
| Medium | 834px–1023px | タブレット |
| Small | 320px–833px | モバイル |

### Header

```css
height: 70px;           /* 固定 */
background: transparent;  /* ファーストビューでは透明、スクロールで塗る */
```
---

## 6. Depth & Elevation

**影はほとんど使わない。** 立体感は「写真 ＋ スクリム」で作る。

| 用途 | 値 | 
|------|-----|
| 汎用の浮き | `0 0 10px 0 rgba(0, 0, 0, 0.15)` |
| ヘッダーの下辺 | `0 6px 6px -6px #cccccc` |
| カードの浮き | `1px 1px 3px 0 rgba(2, 2, 2, 0.23)` |
| 入力欄の内側 | `1px 1px 5px 0 rgba(0, 0, 0, 0.1) inset` |
- **カードにもボタンにも既定では影を付けない**
- **`rgba(2, 2, 2, ...)` という純黒より 2 だけ明るい黒**を使う（テーマ由来）


---

## 7. Do's and Don'ts

### Do（推奨）

- **本文の `line-height` は 2.0〜2.4 を使う**。Hacoa の余白感はこの行間で作られている
- **ブランドを語る大見出しは明朝**（`--tcd-font-type2`）、**セクション見出しと本文はゴシック**（`--tcd-font-type1`）に分ける
- **写真の上に文字を置くときは必ずスクリムを敷く**（`rgba(0,0,0,.3)`〜`.5`）。木の写真は明度がまだらなので、スクリムなしでは白文字が読めなくなる
- **CTA は pill にする**。写真の上なら白 1px の枠、白地なら黒 2px の枠か黒塗り
- **リード文は意味のまとまりで手動改行する**（`<br>`）
- **セクション見出しに `letter-spacing` を入れない**（`normal` のまま）
- 和文フォントは **ヒラギノ → 游ゴシック Medium → メイリオ**。Windows 向けに **Medium を明示**する

### Don't（禁止）

- **本文の行間を 1.8 以下にしない**。密度が上がった瞬間にブランドの印象が変わる
- **`palt` / `font-feature-settings` を足さない**。このサイトは約物のアキを詰めない設計
- **見出しにトラッキングを入れない**。効かせているのはグローバルナビの `0.03em` だけ
- **カードに影と角丸を足さない**。写真の矩形をそのまま見せる
- **明朝スタックに `Hiragino Mincho ProN` を混ぜない**（実装は `Pro`）。約物の字形が変わる
- **`--tcd-font-type1` の先頭 Arial を外さない**。欧文が和文フォントの欧文グリフに落ちるとブランド名の字形が変わる
- **radius を 1 種類に統一しない**。pill と小角丸の併存がこのサイトの流儀

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Large | ≥ 1024px | デスクトップ |
| Medium | 834px–1023px | タブレット |
| Small | 320px–833px | モバイル |

### ナビゲーション

- Large: テキストリンクのカテゴリナビ
- Small: ハンバーガーメニュー

### タッチターゲット

- ピル CTA は `padding: 10.672px 21.28px` ＋ 16px の文字で高さ約 44px。**モバイルでもそのまま 44px を確保できる**

### フォントサイズの調整

- **本文 15px はモバイルでも下げない**。行間 2.4 を維持する
- ヒーロー見出しは 36px → 24〜28px、セクション見出しは 40px → 34px / 34px → 24px 程度に落とす。clampを使用し柔軟に縮小・拡大させる。
- ドロワー内のリンクは 14px / `line-height: 1.6` のまま

---

## 9. Agent Prompt Guide
