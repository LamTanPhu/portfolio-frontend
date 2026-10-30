// Local CI lab. GitHub Actions (.github/workflows/ci.yml) stays the official
// CI that gates merges; this mirrors it so the two can be compared.
// Setup and removal: jenkins/README.md
pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        // The e2e stage binds fixed ports (3000 mock-served app, 3001 mock API).
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        // CI=true switches Playwright to CI mode (forbidOnly, one retry, HTML report).
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
        PLAYWRIGHT_HTML_OPEN = 'never'
        // Caches live in the Jenkins volume, so they survive workspace cleanup
        // and make repeat builds much faster.
        npm_config_cache = "${env.JENKINS_HOME}/.npm"
        PLAYWRIGHT_BROWSERS_PATH = "${env.JENKINS_HOME}/.cache/ms-playwright"
    }

    stages {
        stage('Install') {
            steps {
                sh 'node --version && npm --version'
                sh 'npm ci --no-audit --no-fund'
            }
        }

        stage('Static checks') {
            parallel {
                stage('Type check') {
                    steps { sh 'npx tsc --noEmit' }
                }
                stage('Lint') {
                    steps { sh 'npm run lint' }
                }
            }
        }

        stage('Unit tests') {
            steps { sh 'npm test' }
        }

        stage('E2E') {
            steps {
                // System libraries are baked into the Jenkins image; the browser
                // itself is downloaded once into the cached volume.
                sh 'npx playwright install chromium'
                // Builds against the mock API, then runs Playwright.
                sh 'npm run test:e2e -- --reporter=list,html'
            }
        }

        stage('Dependency audit') {
            steps {
                // Production dependencies only. A newly published advisory
                // should flag the build, not fail an unrelated change.
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    sh 'npm audit --omit=dev --audit-level=high'
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
        }
        cleanup {
            cleanWs()
        }
    }
}
