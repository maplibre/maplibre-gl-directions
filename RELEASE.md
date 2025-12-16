# Release Process

This project uses **automated GitHub workflows** to manage versioning, releases, and publishing. Releases should **not** be performed manually.

## Overview

There are three main workflows involved:

1. **Pull Request Checks** – validates changes before merge
2. **Create Version Bump PR** – prepares a release by updating versions and changelog
3. **Release on Merge to `main`** – publishes the release automatically

---

## 1. Pull Request Checks

On every pull request, a workflow runs to ensure:

- The project builds successfully
- Code is correctly formatted and linted
- All checks pass before merging

This workflow does **not** perform any versioning or releasing.

---

## 2. Creating a Release (Version Bump PR)

Versions must **not** be updated manually.

To prepare a new release:

1. Go to the **Actions** tab in GitHub
2. Run the **“Create version bump PR”** workflow
3. Select the release type:

- `patch`
- `minor`
- `major`

This workflow automatically:

- Bumps the version in `package.json` and the lockfile
- Updates the changelog based on changes since the previous release
- Opens a pull request with these changes

The generated pull request should be reviewed and merged like any other PR. Note, however, that by default no pull request checks are run for it. To trigger the CI, a manual change is required (even adding a blank line to `CHANGELOG.md` is sufficient). In practice, the auto-generated changelog usually needs some manual adjustment anyway, so the CI will naturally be triggered as part of that process.

---

## 3. Releasing on Merge to `main`

When changes are merged into the `main` branch:

- A release workflow runs automatically
- If the version was **not** changed, the workflow exits early
- If the version **was** updated:
  - A new npm package version is published
  - A new tag and a GitHub Release are created
  - Release artifacts and documentation are generated as needed

No additional manual steps are required.

---

## Release Checklist

Before merging a version bump PR, ensure that:

- [ ] The correct release type (`patch`, `minor`, or `major`) was selected
- [ ] The changelog entries are accurate and complete
- [ ] All CI checks are passing
- [ ] The PR only contains release-related changes (version + changelog)

After merging to `main`:

- [ ] The release workflow completes successfully
- [ ] The new version is published to npm
- [ ] A GitHub Release is created with the correct version and notes
