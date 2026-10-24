<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/banner-dark.svg">
    <img src="docs/assets/banner-light.svg" alt="Bunken: 研究者のための軽量な文献管理ツール" width="100%">
  </picture>
</p>

<p align="center">
  <a href="README.md">English</a> · <b>日本語</b>
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2B5797?style=flat-square"></a>
  <img alt="Chrome / Edge で動作" src="https://img.shields.io/badge/browser-Chrome%20%7C%20Edge-2B5797?style=flat-square">
  <img alt="サーバー不要" src="https://img.shields.io/badge/server-not%20required-1E8A5A?style=flat-square">
  <img alt="UTF-8 BibTeX" src="https://img.shields.io/badge/BibTeX-UTF--8-C9820A?style=flat-square">
</p>

Bunken(文献)は、研究者のための軽量な文献管理ツールです。HTMLファイル1つで動作し、ブラウザで開いて論文を追加するだけ。ライブラリとPDFは、自分で選んだフォルダに保存できます。

**自己責任でご利用ください。**

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/screenshot-dark.png">
    <img src="docs/assets/screenshot-light.png" alt="論文リスト・タグ・コレクション・詳細ペインを備えた Bunken のライブラリ画面" width="100%">
  </picture>
  <br>
  <sub>デモデータでのライブラリ画面。システムのライト/ダークテーマに追従します。</sub>
</p>

## ワークフロー

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/workflow-dark.svg">
    <img src="docs/assets/workflow-light.svg" alt="DOI・arXiv・BibTeX・PDF を Bunken に追加し、.bib の書き出し、LaTeX での引用、共有フォルダでの同期に使う流れ" width="100%">
  </picture>
</p>

## 機能

| 項目 | 内容 |
|---|---|
| **追加** | DOI または arXiv から書誌情報を取得、BibTeX(UTF-8)を1件または複数まとめてインポート、PDFからメタデータを抽出 |
| **整理** | タグ、コレクション(1つの論文を複数のコレクションに登録可)、読書ステータス、ノート。コレクション内の重複チェック |
| **ファイル** | PDFや補足資料を自動で整理して保存 |
| **引用** | 論文単位・コレクション単位でLaTeXに適したBibTeXを書き出し(abstractは既定で省略)、`\cite{key}` をワンクリックでコピー |
| **保存** | ライブラリとファイルは任意の保存先フォルダで管理。DropboxやGoogle Driveで同期するフォルダを選べば、複数デバイスで同じライブラリを利用可能 |

## クイックスタート

1. `bunken.html` をダウンロードし、ChromeまたはEdgeで開く
2. 必要に応じて保存先フォルダを選択する
3. DOI・arXiv・BibTeX・PDFから論文を追加する

## BibTeX と LaTeX

Bunken は、軽量な LaTeX ワークフローに意図的に絞っています。BibTeX のインポート/エクスポートは UTF-8 で、`author`、`title`、`journal`、`booktitle`、`year`、`volume`、`number`、`pages`、`publisher`、`doi`、`url`、arXiv の `eprint` などの一般的なフィールドに対応しています。主なエントリタイプは `article`、`inproceedings`、`book`、`preprint`、`misc`、`phdthesis`、`mastersthesis` です。

`.bib` ファイルを小さく保つため、エクスポートでは既定で `abstract` を省略します(abstract は Bunken 内では引き続き参照できます)。Word や Word 互換形式のエクスポートには対応していません。

## 補足

- データはブラウザ内、または選択したローカルフォルダに保存されます
- サーバーは不要です
- DropboxやGoogle Driveなどで同期されるフォルダを選ぶと、複数デバイスから同じライブラリにアクセスできます(複数デバイスでの同時編集は避けてください)
- 対応ブラウザ: 最近のバージョンの Chrome と Microsoft Edge

## 開発用チェック

依存パッケージ不要のBibTeXスモークテストは `node tests/bibtex-smoke.mjs` で実行できます。

## コミュニティとサポート

- [行動規範 (Code of Conduct)](CODE_OF_CONDUCT.md)
- [コントリビューションガイド](CONTRIBUTING.md)
- [セキュリティポリシー](SECURITY.md)

不具合の報告や機能の要望は [GitHub Issues](https://github.com/Taniuchi-Taiyo/Bunken/issues) へお願いします。セキュリティ上の脆弱性は、公開Issueではなく[セキュリティポリシー](SECURITY.md)に従ってご連絡ください。

## 引用

Bunken が研究の役に立った場合は、引用方法を [`CITATION.cff`](CITATION.cff) でご確認ください。

## ライセンス

[MIT License](LICENSE)
