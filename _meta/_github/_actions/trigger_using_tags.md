##### NOTE: force pusing the tags triggers the github action even without a commit

```
git add . -A
git commit -m "wayf0000: upd. words component"

# push as usual, github action will not yet run
git push

# tag the current HEAD (the one we just committed)
git tag -a release-web HEAD -m "release-web" --force

# push the updated tag, this _will_ trigger the github action
git push --tags --force
``` 