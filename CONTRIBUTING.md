# Working on InternConnect

## Branches

| Branch | Owner | What goes there |
| --- | --- | --- |
| `main` | Musa | Shared foundation, guest + auth screens. Only Musa merges into `main`. |
| `asim` | Asim | Student screens |
| `bahaa` | Bahaa | Company screens |
| `raed` | Raed | Shortlist tables / assistant and admin screens |

Each member branch adds its own file in `docs/responsibilities/` (`asim.md`, `bahaa.md`, `raed.md`) with the exact list of files, screens and checks for that member. Read yours before you start. (Different file names on purpose, so merging the three branches never conflicts.)

## Rules that keep us free of merge conflicts

1. **Only edit files inside your own folder** (listed in your `docs/responsibilities/<name>.md`). Your pages are already registered in `src/routes/AppRoutes.jsx`, so you never need to touch it.
2. **Never edit shared files**: `src/components/**`, `src/store/**`, `src/context/**`, `src/lib/**`, `src/hooks/**`, `src/routes/**`, `src/data/**`, `src/index.css`, `package.json`, `package-lock.json`. If you need a change there, message Musa and he will make it on `main`, then you pull it.
3. Need a small helper or component? Create it inside your own feature folder (for example `src/features/student/components/`).
4. Need to store new data? Use `insert('yourCollectionName', row)` from `useStore()`: new collections are created automatically, no store edits needed.
5. Don't run `npm install <package>`. Every package we need is already installed. Ask Musa if something is missing.

## Daily workflow

```bash
# first time
git clone <repository-url>
cd SWE363_Project_Phase4_Frontend
git checkout <your-branch>      # asim / bahaa / raed
npm install

# every time you start working
git pull origin main            # get the latest shared code from main
npm run dev

# when a piece of work is done
npm run lint                    # must show no errors
git add src/features/<your-folder>
git commit -m "add saved listings page"
git push origin <your-branch>
```

Commit small pieces often (one screen or one feature per commit) with your **own GitHub account**. Check `git config user.name` and `git config user.email` show your name before your first commit.

## Pull requests

1. On GitHub open **Pull requests → New pull request**, base `main`, compare `<your-branch>`.
2. Title: what the PR adds, e.g. `Student screens: saved listings and tracker`.
3. In the description, tick the checklist from your `docs/responsibilities/<name>.md`.
4. Musa reviews and merges. If he asks for changes, push more commits to the same branch and the PR updates by itself.
