# ScenarioCraft Web

This repository is the React user interface for
[ScenarioCraft](https://github.com/Dvorak/ScenarioCraft-Agent). It is pinned as
the `web/` Git submodule in the main repository. Scenario generation, checks,
repair, and artifact production remain in the Python ScenarioCraft application;
this frontend consumes those workflows through the local HTTP API.

From the parent ScenarioCraft repository, install and start both services:

```bash
.venv/bin/just setup-web
.venv/bin/just web
```

Open <http://localhost:3000>. The Python API runs at
<http://localhost:8000>.

For frontend-only development, first start the Python API and then run:

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 3000
```

Set `VITE_SCENARIOCRAFT_API_URL` when the API is not available at the default
`http://localhost:8000` origin.

This checkout is connected to Lovable through GitHub. Keep commits small and
working, and do not rewrite published history.
