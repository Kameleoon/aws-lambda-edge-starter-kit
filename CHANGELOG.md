# Change Log

All notable changes to this AWS Lambda@Edge project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## [2.1.2] - March 25, 2025

### Changed

- Bump @kameleoon/nodejs-sdk version to 5.9.0

## [2.1.1] - July 16, 2024

### Changed

- Bump @kameleoon/nodejs-sdk version to 4.4.3 containing the fix for setting `visitorCode` in `viewer_request` and `origin_request` request cookies

## [2.1.0] - July 12, 2024

### Changed

- `visitorCode` can now be set in `viewer_request` and `origin_request` events cookies if the `request` was used as an `output` parameter for `getVisitorCode`

## [2.0.0] - May 17, 2024

### Changed

- Overhaul of the project structure to make it more modular and easier to maintain.

## [1.0.4] - April 18, 2024

### Changed

- Bump @kameleoon/nodejs-sdk version to 4.0.1

### Fixed

- `package-lock.json` was referencing internal Kameleoon Repository

## [1.0.3] - December 08, 2023

### Changed

- Bump @kameleoon/nodejs-sdk version to 3.2.0
- Change the value of `kameleoon_user_id` to `kameleoonVisitorCode`

## [1.0.2] - September 26, 2023

### Changed

- Bump @kameleoon/nodejs-sdk version to 2.7.0
- Use new `getClientConfigurationUrl` utility

## [1.0.1] - September 07, 2023

### Changed

- Bump @kameleoon/nodejs-sdk version to 2.6.3

## [1.0.0] - July 26, 2023

### Added

- First version of AWS Lambda@Edge Starter Kit.
