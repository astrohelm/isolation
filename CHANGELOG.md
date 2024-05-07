# Changelog

## [Unreleased][unreleased]

## [2.2.0][] - 2024-05-07

- Nix-Shell environment for minimal supported node version
- Latest globals support (Depends on node version)
- Documentation update
- Packages update
- Grammar fixes
- Types fixes
- CI Update

## [2.1.1][] - 2024-03-19

- Eslint bug fix
- Removed support of Nodejs v19
- Default export fix

## [2.1.0][] - 2024-01-13 / 2024-03-18

- Updated packages
- Grammar fixes
- Contextify micro task mode fixed
- New timeout test case

## [2.0.0][] - 2023-12-12

- Major release
- Stable API
- Documentation enhancement
- Renamed access property for realm
- Renamed sandbox to contextify
- New flat option for Reader
- Changes access props order
- Sandbox naming removed
- Code refactoring
- New test cases
- New globals

## [1.9.0][] - 2023-12-11

- Symbolic properties
- Now it is more configurable from outside
- Performance improvements
- Readme improvements

## [1.8.0][] - 2023-12-08

- Return of type system
  ```js
  Script.execute('2 + 2', { type: 'iso' });
  Script.execute('module.exports = 2 + 2', { type: 'cjs' });
  ```
- Test coverage enhancement

## [1.7.0][] - 2023-12-03

- Code quality improvements
- Fixed bugs from v1.6.0
- Library exports now support ESM & typescript

## [1.6.0][] - 2023-11-26

- Code quality improvements
- Changelog linking fixes
- Npm published

## [1.5.0][] - 2023-10-30

- Depth field, now you can limit depth
- Method <code>from</code> now allow to pass code and pathname as source
- Renamed default script name "Astro" -> "ISO"
- Code quality improvements
- Performance improvements

## [1.4.0][] - 2023-10-26

- JSDoc enhancements
- Renamed require -> from
- Support latest:21 nodejs version
- Renamed Access types from [sandbox, internal] -> [realm, reader]

## [1.3.0][] - 2023-10-26

- Renamed from isolation -> isolation
- Enhanced documentation

## [1.2.0][] - 2023-10-25

- Fix type definitions
- New default global variables
- Tests

## [1.1.0][] - 2023-10-01

### Major updates

- Removed astro syntax with type option, now only supports common js syntax.
- Context updates
  1. Renamed to sandbox, example: <code>isolation.sandbox</code>
  2. To create new contexts you should use <code>isolation.sandbox({ myCtxVariable: 'test' })</code>
  3. All presets still should be working properly with <code>isolation.sandbox[preset-key]</code>
- Reader updates
  1. Joined with require, now require works as reader, examples:
     ```js
     isolation.require('./my-path/to/script.js');
     isolation.require.script('./my-path/to/script.js');
     isolation.require.dir('./my-path/to');
     ```
  2. New access control feature, see access updates
- Access updates, now this option work for both sandbox and reader, you need to provide function
  ```js
  const option = { access: pathOrModule => pathOrModule === 'fs' || pathOrModule.endsWith('.js') };
  isolation.execute('module.exports = require("fs")');
  isolation.read('./path/to/script.js');
  // But you still can control them by each own function
  const option = {
    access: {
      internal: path => true, // Reader control
      sandbox: module => {}, // Sandbox require control
    },
  };
  ```
  > Sandbox function can return object or boolean value, in case of object it will be used as stub
  > content

### Minor updates

- Created new tests, new tests coverage ~85%
- NPM Isolation fix, now it should work properly

  ```js
  const script = isolation.execute(`module.exports = require('chalk')`, {
    access: { sandbox: () => true },
    npmIsolation: true,
    ctx: sandbox.NODE,
  }); // Output: Chalk function
  ```

## [1.0.0][] - 2023-08-26

- Transferred from leadfisher
- Code quality improved
- Tests updates
- Api updates
- JSDoc
- New <code>prepare</code> option
- Quality of life improvements
- Massive README update, documentation improvement

[unreleased]: https://github.com/astrohelm/isolation/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/astrohelm/isolation/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/astrohelm/isolation/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/astrohelm/isolation/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/astrohelm/isolation/compare/v1.0.0...v2.0.0
[1.9.0]: https://github.com/astrohelm/isolation/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/astrohelm/isolation/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/astrohelm/isolation/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/astrohelm/isolation/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/astrohelm/isolation/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/astrohelm/isolation/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/astrohelm/isolation/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/astrohelm/isolation/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/astrohelm/isolation/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/astrohelm/isolation/releases/tag/v1.0.0
