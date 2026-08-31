# Releasing

## One-time repository setup

1. Create the public GitHub repository `Tomyail/react-native-kickstart-exchange`.
2. Create an npm access token with permission to publish this package.
3. Add it as the repository Actions secret `NPM_TOKEN`.
4. Enable npm trusted publishing/provenance for the GitHub Actions workflow when available for the package.

## Release a version

Update `package.json` to the next semver version, review the vendored SDK, and commit the change using Conventional Commits. Then create and push the matching tag:

```sh
npm version 0.1.0 --no-git-tag-version
git add package.json
git commit -m "chore(release): prepare 0.1.0"
git tag v0.1.0
git push origin main --follow-tags
```

The tag workflow will:

1. Verify `v0.1.0` matches `package.json` `0.1.0`.
2. Verify the vendored SDK snapshot.
3. Generate release notes with git-cliff.
4. Publish the package to npm with provenance.
5. Create the GitHub Release using those notes.

## Changelog

For a checked-in full changelog during local release preparation:

```sh
npm run changelog
```

For the current tagged release's notes:

```sh
npm run changelog:release -- v0.1.0
```

`CHANGELOG.md` is generated output; do not hand-edit it. The tag workflow always generates authoritative release notes from the full Git history.
