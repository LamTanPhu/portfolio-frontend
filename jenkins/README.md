# Local Jenkins lab

An optional second CI that mirrors `.github/workflows/ci.yml`. **GitHub Actions
stays the official CI** (it gates merges). Jenkins runs only while this
container is up and never affects the repo, Vercel or the PR checks.

The pipeline (`../Jenkinsfile`): install, type check + lint (parallel), unit
tests, e2e (mock API build + Playwright), then a prod-dependency audit that
marks the build *unstable* instead of failing it.

## Start

```bash
cd jenkins
cp .env.example .env        # then set JENKINS_ADMIN_PASSWORD
docker compose up -d --build
```

The first build is slow (plugins and Chromium libraries). Open
http://localhost:8080 and sign in as `admin`. It listens on loopback only.

## Create the pipeline job (once)

1. **Credentials.** Create a fine-grained GitHub token with read-only
   *Contents* and *Metadata* on this repo. In Jenkins: *Manage Jenkins >
   Credentials > System > Global > Add* (Username with password: your GitHub
   username and the token).
2. **New Item > Multibranch Pipeline.** Branch source: *GitHub*, pick the
   credentials, enter the repo URL.
3. **Scan Multibranch Pipeline Triggers:** tick *Periodically if not otherwise
   run* and choose 5 minutes. Jenkins polls GitHub, so no public tunnel or
   webhook is needed.
4. Save. It scans, finds the `Jenkinsfile` and builds each branch and PR.

The first e2e run downloads Chromium into the volume; later runs reuse it.

## Stop and remove

```bash
docker compose down        # stop, keep data
docker compose down -v     # stop and delete all Jenkins data
```

To drop Jenkins from the project entirely, delete this `jenkins/` folder and
the root `Jenkinsfile`. Nothing else references them.

## If something fails

- **Image build fails at `install-deps`:** Playwright doesn't support the OS of
  the current `jenkins/jenkins:lts-jdk21` base yet. Pin an older base tag in
  the Dockerfile.
- **E2E can't launch Chromium:** check `shm_size` in the compose file and that
  the `Install` stage's `PLAYWRIGHT_BROWSERS_PATH` is writable.
- **Out of memory:** raise `mem_limit` and `-Xmx` in the compose file.
