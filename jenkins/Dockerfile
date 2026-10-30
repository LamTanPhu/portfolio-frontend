# Local Jenkins with everything this project's pipeline needs baked in.
# Nothing here is used by the app, the Vercel deploy or GitHub Actions.
#
# No Docker socket is mounted: it would hand every pipeline root-equivalent
# control of the host. The toolchain lives in this image instead.

# Node comes from the official Debian image (same major as GitHub CI's Node 26).
# Alpine can't be used here: it is musl, and Jenkins' base is Debian (glibc).
ARG NODE_IMAGE=node:26-bookworm-slim
FROM ${NODE_IMAGE} AS node

FROM jenkins/jenkins:lts-jdk21

USER root

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# The Node binary links against libatomic, which the Jenkins base image lacks
# (the Node image ships it, but only the binary is copied across).
RUN apt-get update \
 && apt-get install -y --no-install-recommends libatomic1 \
 && rm -rf /var/lib/apt/lists/*

# System libraries Chromium needs (root-only). Keep the version in line with
# @playwright/test in package.json. The browser binary is NOT installed here;
# the pipeline downloads it into the persistent Jenkins volume.
ARG PLAYWRIGHT_VERSION=1.64.0
RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install-deps chromium \
 && rm -rf /var/lib/apt/lists/* /root/.npm

USER jenkins

COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY --chown=jenkins:jenkins casc.yaml /usr/share/jenkins/ref/casc.yaml
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/casc.yaml \
    JAVA_OPTS="-Djenkins.install.runSetupWizard=false"