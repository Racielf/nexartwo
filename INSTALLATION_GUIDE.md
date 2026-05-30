# INSTALLATION_GUIDE — NexArtWO Project Control Pack v2

## Where to install

Copy the contents of this ZIP into the root of your local NexArtWO repo.

Example:

```txt
D:\My Bussines\Strategy\NexArtWO
```

Your repo root should contain:

```txt
index.html
projects.html
js/
css/
docs/
memory/
AGENTS.md
CLAUDE.md
```

## Safe install process

1. Backup your current repo.
2. Create branch:

```bash
git checkout -b docs/project-control-pack-v2
```

3. Copy this pack into the repo root.
4. Do not overwrite existing important docs blindly.
5. Review conflicts.
6. Commit docs/config only:

```bash
git add AGENTS.md CLAUDE.md .claude .github .cursor .codex .cursorrules docs memory templates skills README.md INSTALLATION_GUIDE.md
git commit -m "docs: add NexArtWO project control pack v2"
```

7. Do not change code in this commit.
8. Push branch and review.
