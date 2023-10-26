# Changelog

## [Unreleased][unreleased]

## [1.4.0][] - 2023-10-26

- JSDoc enhancements
- Renamed require -> from
- Support latest:21 nodejs version
- Renamed Access types from [sandbox, internal] -> [realm, reader]

## [1.3.0][] - 2023-10-26

- Renamed from Astroctx -> isolation
- Inhanced documentation

## [1.2.0][] - 2023-10-25

- Fix type definitions
- New default global variables
- Tests

## [1.1.0][] - 2023-10-01

### Major updates

- Removed astro syntax with type option, now only supports common js syntax.
- Context updates
  1. Renamed to sandbox, example: <code>Astroctx.sandbox</code>
  2. To create new contexts you should use <code>Astroctx.sandbox({ myCtxVariable: 'test' })</code>
  3. All presets still should be working properly with <code>Astroctx.sandbox[preset-key]</code>
- Reader updates
  1. Joined with require, now require works as reader, examples:
     ```js
     Astroctx.require('./my-path/to/script.js');
     Astroctx.require.script('./my-path/to/script.js');
     Astroctx.require.dir('./my-path/to');
     ```
  2. New access controll feature, see access updates
- Access updates, now this option work for both sandbox and reader, you need to provide function
  ```js
  const option = { access: pathOrModule => pathOrModule === 'fs' || pathOrModule.endsWith('.js') };
  Astroctx.execute('module.exports = require("fs")');
  Astroctx.read('./path/to/script.js');
  // But you still can controll them by each own function
  const option = {
    access: {
      internal: path => true, // Reader controll
      sandbox: module => {}, // Sandbox require controll
    },
  };
  ```
  > Sandbox function can return object or boolean value, in case of object it will be used as stub
  > content

### Minor updates

- Created new tests, new tests coverage ~85%
- NPM Isolation fix, now it should work properly

  ```js
  const script = Astroctx.execute(`module.exports = require('chalk')`, {
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

[unreleased]: https://github.com/astrohelm/astroctx/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/astrohelm/astroctx/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/astrohelm/astroctx/releases/tag/v1.0.0
