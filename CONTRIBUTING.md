# Contributing to Bunken

Thank you for your interest in improving Bunken. Contributions, bug reports, documentation improvements, and carefully scoped feature requests are welcome.

## Before you start

- Check existing issues and pull requests to avoid duplicate work.
- For large changes, open an issue first to discuss the proposed direction.
- Do not include API keys, private data, PDFs, browser storage exports, or other sensitive information in a contribution.

## Reporting bugs

Please use the bug report issue template and include:

- the Bunken version or commit;
- browser and operating system;
- clear reproduction steps;
- expected and actual behavior; and
- relevant console errors or screenshots, after removing sensitive information.

## Requesting features

Use the feature request template. Describe the problem to solve, the proposed behavior, and any alternatives considered.

## Pull requests

1. Create a focused branch from `main`.
2. Keep changes small and explain the user-facing impact.
3. Update documentation or release notes when behavior changes.
4. Test `bunken.html` manually in a supported browser, including the affected workflow.
5. Run `git diff --check` before submitting.
6. Complete the pull request template and explain any known limitations.

Because Bunken is a lightweight browser application, there may not be a build step. Please describe the manual verification you performed in the pull request.

## Review expectations

Reviews focus on correctness, usability, privacy, compatibility with existing library data, and keeping the implementation understandable. Maintainers may request changes or adjust scope before merging.

By contributing, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
