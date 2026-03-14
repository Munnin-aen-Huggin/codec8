# Codec8 Auto Docs — GitHub Action

Automatically regenerate your documentation every time you push code. Powered by [Codec8](https://codec8.com).

## Setup

### 1. Connect your repo to Codec8
Sign in at [codec8.com](https://codec8.com) and connect the repository you want to document.

### 2. Get your credentials
From your [Codec8 dashboard](https://codec8.com/dashboard):
- **API Token**: Your GitHub personal access token (the one you connected with)
- **User ID**: Found in dashboard settings

### 3. Add secrets to your GitHub repo
Go to your repo → **Settings → Secrets and variables → Actions** → New repository secret:

| Secret name | Value |
|---|---|
| `CODEC8_API_TOKEN` | Your GitHub token from Codec8 |
| `CODEC8_USER_ID` | Your Codec8 user ID |

### 4. Add the workflow file
Create `.github/workflows/docs.yml` in your repo:

```yaml
name: Auto-generate Documentation

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Documentation with Codec8
        uses: codec8/auto-docs-action@v1
        with:
          api-token: ${{ secrets.CODEC8_API_TOKEN }}
          user-id: ${{ secrets.CODEC8_USER_ID }}
```

That's it. Every push to main will now regenerate your docs automatically.

## Options

| Input | Required | Default | Description |
|---|---|---|---|
| `api-token` | Yes | — | Your Codec8 API token |
| `user-id` | Yes | — | Your Codec8 user ID |
| `doc-types` | No | `readme,api,architecture,setup` | Comma-separated doc types to generate |

## Outputs

| Output | Description |
|---|---|
| `docs-generated` | Number of documentation files generated |

## Plans

- **Free**: README only
- **Pro/Team/Enterprise**: All 4 doc types (README, API, Architecture, Setup)

[Upgrade at codec8.com →](https://codec8.com/#pricing)
