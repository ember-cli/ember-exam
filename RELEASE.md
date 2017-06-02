# Release Process

The following details how to perform a release for `ember-exam`.

## Update Changelog

First, we need to update the changelog using [`git-extras`](https://github.com/tj/git-extras).

```bash
git changelog
```

Be sure to cleanup the changelog by removing merge commits or any commits that don't provide meaningful information. Then, commit the changes with the following message:

```bash
git commit -am "Update changelog for vx.x.x"
```

## Tag A New Version

Next, we need to tag the new version. We do this using the built in `npm` command:

```bash
npm version x.x.x
```

Then, we push the new commits and tag to the repo:

```
git push origin master --tags
```

## Publish The New Version

Almost there! We now publish the new version using:

```bash
npm publish
```

## Update release notes

Finally, publish the [release on GitHub](https://github.com/trentmwillis/ember-exam/releases) by drafting a new release. Use the changelog to populate the entry.

And that's it! Congratulations!
