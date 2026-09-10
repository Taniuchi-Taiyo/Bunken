# Bunken: A Lightweight Reference Manager for Researchers

Bunken is a lightweight reference manager designed for researchers.

**Use at your own risk.**

## Features

- Fetch bibliographic data from DOI or arXiv
- Import one or more BibTeX entries (UTF-8)
- Extract metadata from PDFs
- Automatically organize and store PDFs and supplementary files
- Organize papers with tags and collections
- Assign one paper to multiple collections
- Track reading status
- Save notes
- Export LaTeX-friendly BibTeX (abstract omitted by default)
- Manage your library and files in a user-selected storage folder
- Use the same library across multiple devices by choosing a folder synced with services like Dropbox or Google Drive

## Quick Start

1. Open `bunken.html` in your browser
2. Optionally choose a storage folder
3. Add papers via DOI, arXiv, BibTeX, or PDF

## BibTeX and LaTeX

Bunken is intentionally focused on a lightweight LaTeX workflow. BibTeX import and export use UTF-8 and support common fields such as `author`, `title`, `journal`, `booktitle`, `year`, `volume`, `number`, `pages`, `publisher`, `doi`, `url`, and arXiv `eprint`. Common entry types include `article`, `inproceedings`, `book`, `preprint`, `misc`, `phdthesis`, and `mastersthesis`.

Exports omit `abstract` by default to keep `.bib` files compact; abstracts remain available inside Bunken. Bunken does not provide Word or Word-compatible export.

## Notes

- Data is stored locally in your browser or in a selected local folder
- No server is required
- If you choose a folder synced by Dropbox, Google Drive, or a similar service, you can access the same library from multiple devices (avoid simultaneous edits on multiple devices)
- Supported browsers: recent Chrome and Microsoft Edge versions

## Development check

Run the dependency-free BibTeX smoke test with `node tests/bibtex-smoke.mjs`.

## Community and support

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

Please use [GitHub Issues](https://github.com/Taniuchi-Taiyo/Bunken/issues) for bug reports and feature requests. For security vulnerabilities, please follow the [Security Policy](SECURITY.md) instead of opening a public issue.

## License

MIT License
