# 🧰 Useful Git Commands

A quick reference for working on CareTrack.

---

## 📍 Check where you are

```bash
git status                 # What changed, what's staged, current branch
git branch                 # List local branches (* = current)
git branch -a              # List local + remote branches
git log --oneline -10      # Last 10 commits, one line each
git log --oneline --graph --all   # Visual history of all branches
```

## 🔍 See what changed

```bash
git diff                   # Unstaged changes
git diff --staged          # Staged changes (what will be committed)
git diff main..my-branch   # Difference between two branches
git show <commit>          # Details of one commit
git blame <file>           # Who changed each line, and when
```

## 💾 Save your work (commit)

```bash
git add <file>             # Stage one file
git add .                  # Stage everything in the current folder
git add -p                 # Stage pieces of a file, chunk by chunk
git commit -m "Message"    # Commit staged changes
git commit --amend         # Edit the last commit (only if NOT pushed yet)
```

**Good commit messages:** start with a verb, keep it short.
`Fix repeat reminder firing every second` ✅  `changes` ❌

## 🌿 Branches

```bash
git switch -c feature/snooze-options   # Create a new branch and switch to it
git switch main                        # Switch to an existing branch
git merge feature/snooze-options       # Merge a branch into the current one
git branch -d feature/snooze-options   # Delete a merged branch
```

Tip: don't work directly on `main` — create a branch for each feature or fix.

## ☁️ Sync with GitHub

```bash
git pull                   # Get latest changes from GitHub
git push                   # Upload your commits
git push -u origin <branch>   # First push of a new branch
git fetch                  # Download remote changes without merging
git remote -v              # Show the GitHub URL this repo is linked to
```

## ↩️ Undo things

```bash
git restore <file>             # Throw away unstaged changes to a file ⚠️
git restore --staged <file>    # Unstage a file (keeps your changes)
git reset --soft HEAD~1        # Undo last commit, keep changes staged
git revert <commit>            # Make a new commit that undoes an old one (safe after pushing)
```

⚠️ Avoid `git reset --hard` and `git push --force` unless you're sure — they delete work.

## 📦 Stash (put work aside temporarily)

```bash
git stash                  # Save uncommitted changes and clean the folder
git stash list             # See saved stashes
git stash pop              # Bring the latest stash back
```

## 🏷️ Tags (mark releases)

```bash
git tag v1.0.0             # Tag the current commit
git push origin v1.0.0     # Push the tag to GitHub
```

## 🔐 Keep secrets out of Git

- `.env` (your OpenAI key) is listed in `.gitignore` — **never commit it**.
- Check before committing: `git status` should never show `.env`.
- If you accidentally committed a key: remove it, then **rotate the key** on the OpenAI dashboard (removing it from history is not enough once pushed).

---

## 🔁 Typical daily workflow

```bash
git switch main
git pull
git switch -c fix/my-change
# ...edit files...
git status
git add .
git commit -m "Describe the change"
git push -u origin fix/my-change
# Then open a Pull Request on GitHub
```
