/* global process */

import { readFileSync, writeFileSync } from 'node:fs'

const releaseVersion = process.env.RELEASE_VERSION
const previousVersion = process.env.RELEASE_PREVIOUS_VERSION
const releaseNotesPath = process.env.RELEASE_NOTES_PATH ?? '.release-notes.md'
const releaseBody = cleanReleaseBody(readFileSync(releaseNotesPath, 'utf8'))
const repository = process.env.GITHUB_REPOSITORY ?? 'poziel/subfolio'
const releaseDate = new Date().toISOString().slice(0, 10)

if (!releaseVersion) {
  throw new Error('RELEASE_VERSION is required.')
}

if (!previousVersion) {
  throw new Error('RELEASE_PREVIOUS_VERSION is required.')
}

if (!releaseBody) {
  throw new Error('Release notes are required.')
}

updatePackageVersion('package.json', releaseVersion)
updatePackageVersion('package-lock.json', releaseVersion)
updateChangelog()

function cleanReleaseBody (body) {
  return (body ?? '')
    .replace(/\r\n/g, '\n')
    .trim()
}

function updatePackageVersion (path, version) {
  const data = JSON.parse(readFileSync(path, 'utf8'))

  data.version = version

  if (data.packages?.['']) {
    data.packages[''].version = version
  }

  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

function updateChangelog () {
  const path = 'CHANGELOG.md'
  const changelog = readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
  const releaseSection = `## [${releaseVersion}] - ${releaseDate}\n\n${releaseBody}\n\n`
  const unreleasedPattern = /## \[Unreleased\]\n\n([\s\S]*?)(?=\n## \[|\n\[Unreleased]:)/
  const match = unreleasedPattern.exec(changelog)

  if (!match) {
    throw new Error('CHANGELOG.md must contain an [Unreleased] section before the first release.')
  }

  const unreleasedBody = match[1].trim()
  const placeholder = 'Upcoming release notes are copied from merged pull request changelog sections.'
  const carriedNotes = unreleasedBody && unreleasedBody !== placeholder ? `${unreleasedBody}\n\n` : ''
  const nextUnreleasedSection = `## [Unreleased]\n\n${placeholder}\n\n${carriedNotes}${releaseSection}`
  let updated = changelog.replace(unreleasedPattern, nextUnreleasedSection)

  updated = updateLinks(updated)
  writeFileSync(path, updated)
}

function updateLinks (changelog) {
  const baseUrl = `https://github.com/${repository}`
  const unreleasedLink = `[Unreleased]: ${baseUrl}/compare/v${releaseVersion}...HEAD`
  const releaseLink = `[${releaseVersion}]: ${baseUrl}/compare/v${previousVersion}...v${releaseVersion}`

  if (!/^\[Unreleased]: .+$/m.test(changelog)) {
    throw new Error('CHANGELOG.md must contain an [Unreleased] link.')
  }

  if (new RegExp(String.raw`^\[${escapeRegExp(releaseVersion)}]: `, 'm').test(changelog)) {
    throw new Error(`CHANGELOG.md already contains a link for ${releaseVersion}.`)
  }

  return changelog.replace(/^\[Unreleased]: .+$/m, `${unreleasedLink}\n${releaseLink}`)
}

function escapeRegExp (value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}
