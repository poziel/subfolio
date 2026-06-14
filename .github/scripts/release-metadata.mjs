/* global console, fetch, process */

import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'

const VERSION_LABELS = ['major', 'minor', 'patch']
const SKIP_LABELS = ['no-release']
const RELEASE_NOTES_HEADINGS = new Set(['changelog', 'release notes'])
const releaseNotesPath = process.env.RELEASE_NOTES_PATH ?? '.release-notes.md'

const eventName = process.env.GITHUB_EVENT_NAME
const eventPath = process.env.GITHUB_EVENT_PATH
const repository = process.env.GITHUB_REPOSITORY
const commitSha = process.env.GITHUB_SHA
const githubToken = process.env.GITHUB_TOKEN

function readJson (path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function setOutput (name, value) {
  const output = `${name}=${value ?? ''}\n`

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, output)
    return
  }

  console.log(output.trimEnd())
}

function fail (message) {
  throw new Error(message)
}

function labelsFromPullRequest (pullRequest) {
  return pullRequest.labels.map(label => {
    if (typeof label === 'string') {
      return label.toLowerCase()
    }

    return label.name.toLowerCase()
  })
}

function resolveBump (labels) {
  const selectedLabels = VERSION_LABELS.filter(label => labels.includes(label))

  if (selectedLabels.length !== 1) {
    fail(`Release PRs need exactly one semantic version label: ${VERSION_LABELS.join(', ')}.`)
  }

  return selectedLabels[0]
}

function parseVersion (version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)

  if (!match) {
    fail(`package.json version must be a stable semantic version, got "${version}".`)
  }

  return match.slice(1).map(Number)
}

function bumpVersion (version, bump) {
  const [major, minor, patch] = parseVersion(version)

  if (bump === 'major') {
    return `${major + 1}.0.0`
  }

  if (bump === 'minor') {
    return `${major}.${minor + 1}.0`
  }

  return `${major}.${minor}.${patch + 1}`
}

function extractReleaseNotes (body) {
  const normalizedBody = (body ?? '').replace(/\r\n/g, '\n')
  const headingPattern = /^##\s+(.+?)\s*$/gm
  let match

  while ((match = headingPattern.exec(normalizedBody)) !== null) {
    const heading = match[1].trim().toLowerCase()

    if (!RELEASE_NOTES_HEADINGS.has(heading)) {
      continue
    }

    const sectionStart = headingPattern.lastIndex
    headingPattern.lastIndex = sectionStart
    const nextHeading = headingPattern.exec(normalizedBody)
    const sectionEnd = nextHeading?.index ?? normalizedBody.length
    const section = normalizedBody.slice(sectionStart, sectionEnd).trim()

    if (!section) {
      fail('The PR changelog section is empty.')
    }

    return section
  }

  fail('Release PRs need a "## Changelog" section in the PR body.')
}

async function apiGetJson (path) {
  if (!githubToken) {
    fail('GITHUB_TOKEN is required to resolve the merged pull request from a push event.')
  }

  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (!response.ok) {
    fail(`GitHub API request failed (${response.status}) for ${path}.`)
  }

  return response.json()
}

async function pullRequestFromPush () {
  if (!repository || !commitSha) {
    fail('GITHUB_REPOSITORY and GITHUB_SHA are required for push release events.')
  }

  const pulls = await apiGetJson(`repos/${repository}/commits/${commitSha}/pulls`)
  const pullRequest = pulls.find(pr => pr.merged_at && pr.base?.ref === 'main') ?? pulls.find(pr => pr.merged_at)

  if (!pullRequest) {
    fail(`No merged pull request was found for commit ${commitSha}.`)
  }

  const [fullPullRequest, labels] = await Promise.all([
    apiGetJson(`repos/${repository}/pulls/${pullRequest.number}`),
    apiGetJson(`repos/${repository}/issues/${pullRequest.number}/labels`)
  ])

  return {
    ...fullPullRequest,
    labels
  }
}

const packageJson = readJson('package.json')
const previousVersion = packageJson.version
const release = await resolveRelease()

for (const [name, value] of Object.entries(release)) {
  setOutput(name, value)
}

async function resolveRelease () {
  let bump

  switch (eventName) {
    case 'push': {
      const pullRequest = await pullRequestFromPush()
      const labels = labelsFromPullRequest(pullRequest)

      if (SKIP_LABELS.some(label => labels.includes(label))) {
        return {
          skip: 'true',
          skip_reason: `Pull request #${pullRequest.number} has a no-release label.`
        }
      }

      bump = resolveBump(labels)

      const releaseNotes = extractReleaseNotes(pullRequest.body)

      writeFileSync(releaseNotesPath, `${releaseNotes}\n`)

      break
    }
    case 'pull_request':
    case 'pull_request_target': {
      const event = readJson(eventPath)
      const pullRequest = event.pull_request

      if (!pullRequest?.merged) {
        return {
          skip: 'true',
          skip_reason: 'Pull request was closed without merging.'
        }
      }

      const labels = labelsFromPullRequest(pullRequest)

      if (SKIP_LABELS.some(label => labels.includes(label))) {
        return {
          skip: 'true',
          skip_reason: `Pull request #${pullRequest.number} has a no-release label.`
        }
      }

      bump = resolveBump(labels)

      const releaseNotes = extractReleaseNotes(pullRequest.body)

      writeFileSync(releaseNotesPath, `${releaseNotes}\n`)

      break
    }
    case 'workflow_dispatch': {
      const event = readJson(eventPath)
      const inputs = event.inputs ?? {}

      if (inputs.bump === 'no-release') {
        return {
          skip: 'true',
          skip_reason: 'Manual dispatch requested no release.'
        }
      }

      bump = inputs.bump ?? 'patch'

      const releaseNotes = (inputs.notes ?? '').trim()

      if (!releaseNotes) {
        fail('Manual releases need release/changelog markdown in the notes input.')
      }

      writeFileSync(releaseNotesPath, `${releaseNotes}\n`)

      break
    }
    default: {
      fail(`Unsupported release event: ${eventName}.`)
    }
  }

  return {
    skip: 'false',
    version: bumpVersion(previousVersion, bump),
    previous_version: previousVersion,
    release_notes_path: releaseNotesPath
  }
}
