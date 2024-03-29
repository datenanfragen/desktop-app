# The Datenanfragen.de desktop app

> This repository contains the source code for the Datenanfragen.de desktop app.

Datenanfragen.de is an open source project by [Datenanfragen.de e.&nbsp;V.](https://www.datarequests.org/verein), a registered non-profit from Germany. We have made it our mission to help you exercise your right to privacy. We offer a generator for GDPR requests, a database with the privacy contact details of companies, and comprehensive articles on the GDPR and data protection in general, among other things.

<!-- TODO: Screenshot -->

We are currently working on building a desktop app to complement the website. Through the app, you will finally be able to use our tools entirely offline without a need to contact our servers at all. In addition, we will also leverage native operating system features that we cannot access through a website to make the request process even easier. If you want to follow along with our progress, check out our [dev log on Mastodon](https://chaos.social/@dev_at_datarequestsORG).

**Note that the desktop app is still a work in progress and not ready for use yet.**

## Development

The Datenanfragen.de desktop app uses [Electron](https://www.electronjs.org/).

To build the project locally for development, follow these steps:

1. Install [Yarn 1](https://classic.yarnpkg.com/en/docs/install) (Classic).
2. Clone the repo and run `yarn` in the root directory of the repo to fetch all required dependencies.
3. Run `yarn watch` to build the source code. This will continuously watch for changes and rebuild if necessary.
4. Run `yarn start-dev` to start the app. It will automatically reload or restart if you change something.

## Contributing

First of all, thank you very much for taking the time to contribute! Contributions are incredibly valuable for a project like ours.

We warmly welcome issues and pull requests through GitHub. You can also chat with us through our [Matrix space](https://matrix.to/#/#datenanfragen:matrix.altpeter.me). Feel free to ask questions, pitch your ideas, or just talk with the community.

Please be aware that by contributing, you agree for your work to be released under the MIT license, as specified in the `LICENSE` file.

If you are interested in contributing in other ways besides coding, we can also really use your help. Have a look at our [contribute page](https://www.datarequests.org/contribute) for more details.

## Acknowledgements

The German Federal Ministry of Education and Research sponsored the work of the Lorenz Sieben und Benjamin Altpeter GbR on this app between March 2022 and August 2022 through the Prototype Fund (grant number 01IS22S20).

<p align="center">
  <img width="350" alt="Sponsored by the German Federal Ministry of Education and Research through the Prototype Fund." src="https://static.dacdn.de/other/bmbf-ptf-logo.svg">
</p>
