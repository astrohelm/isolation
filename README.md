<h1 align="center">

**Isolation**

</h1>

**Why should i use it ?** How often do you see libraries which mutates global variables Or how often
do you check libraries actions ? Library provides script isolation in custom contexts to solve this
kind of issues. Also, isolation prevents global scope and prototypes pollution.

> [!TIP]
>
> ## **Possible use case**
>
> May be useful as routing loader, if some loaded route makes an error while runtime, you may
> recreate it - to prevent memory leaks. Another worlds, with this library you can create
> multi-tenant applications;

<h2 align="center">

**Installation**

</h2>

```bash
npm i isolation --save
```

<h2 align="center">

**Basic Usage**

</h2>

- **Prevent intentionally damage**

  It will stop tricky users code, while you don't allow it.

  ```javascript
  // unchecked-dangerous-library index.js
  const fs = require('fs');
  fs.rm(process.cwd(), { recursive: true }); // Ha ha, no-code developer
  ```

  ```javascript
  // routes/route/get.js
  const dangerousLibrary = require('unchecked-dangerous-library'); // Point where dangerous library initialized
  // ... other logic
  ```

  ```javascript
  // index.js
  const Isolation = require('isolation');
  const routes = Isolation.read('./routes');
  // ⚠️ Will throw an error because fs doesn't allowed
  ```

- **Prevent unintentionally damage**

  This solves problem where libraries used to mutate global variables.

  ```javascript
  // unchecked-dangerous-library index.js
  var console = msg => process.stdout.write(msg); // Someone just want different implementation for console
  global.console = console;
  console('Here it works fine');
  String.prototype = {}; // Or just mutating prototypes
  ```

  ```javascript
  // routes/route/get.js
  const dangerousLibrary = require('unchecked-dangerous-library'); // Point where dangerous library initialized
  // ... other logic
  ```

  ```javascript
  // index.js
  const Isolation = require('isolation');
  Isolation.read('./routes');
  console.log('All works fine');
  console('Here it not works'); // Will throw an error
  String.prototype; // Will be as default
  ```

<h2 id="module-types" align="center">

**Module types / Script syntax**

</h2>

> [!CAUTION]
>
> You can run any script from string, just like eval, but in custom VM container. But you
> **shouldn't use** it for unknown script evaluation, it may create **security issues**.

### **Commonjs**

By default Isolation will use Standard Nodejs syntax. With this type of syntax it will provide to
your realms global variables such as:

- **require** function, which is almost same as nodejs require, but with extra cup of isolation;
- **module** & **exports** variables provided to manipulate with exports between modules;
- **\_\_filename** & **\_\_dirname** are same as with default nodejs realm;

> [!IMPORTANT]
>
> You always should use module.exports to export, otherwise you will see undefined as the result of
> realm execution.

```javascript
const Isolation = require('isolation');
console.log(new Isolation(`module.exports = { field: 'value' };`).execute()); // Output: { field: 'value' }
console.log(Isolation.execute(`module.exports = (a, b) => a + b;`)(2 + 2)); // Output: 4
console.log(Isolation.execute(`(a, b) => a + b;`)(2 + 2)); // Output: undefined
Isolation.execute(`module.exports = async (a, b) => a + b;`)(2 + 2).then(console.log); // Output: 4
```

### **ISO**

This type of syntax will stand your script alone without any of extra global variables. That means
that you would not see <code>module</code> or <code>exports</code> in your environment. But your
context variables will still work well.

> [!IMPORTANT]
>
> In this mode, your realms will export result of the last expression, that means that you should
> put a reference to your variable or expression at the end of the file / row;

```javascript
const Isolation = require('isolation');
const options = { type: 'iso' };
console.log(new Isolation(`{ field: 'value' };`, options).execute()); // Output: { field: 'value' }
console.log(Isolation.execute(`(a, b) => a + b;`, options)(2 + 2)); // Output: 4
Isolation.execute(`async (a, b) => a + b;`, options)(2 + 2).then(console.log); // Output: 4
```

### **ESM**

Isolation doesn't yet support esm syntax. That's because currently <code>node.vm</code> ESM modules
are experimental.

<h2 id="context-api" align="center">

**Context API**

</h2>

You can create custom context or use default presets with **context api**. This will allow you to
provide your custom variables to the context without requiring any module.

> [!TIP]
>
> Remember to reuse your contexts. This will increase performance of your application. To help you
> with this we have default contexts:

### **Context example**

```javascript
const { contextify, execute } = require('isolation');
const custom = contextify({ console }); // ⚠️ Object will be mutated
execute(`console.log(123);`, { ctx: custom }); // STD Output: 123
execute(`console.log(123);`); // No STD output, because different stdout stream
```

Also its allow you to change program behavior with something like:

```js
const ctx = Isolation.contextify({ a: 1000, b: 10 });
const realm = new Isolation(`module.exports = a - b`, { ctx });
realm.execute(); // Output: 990
realm.execute({ ...ctx, a: 0 }); // Output: -10
realm.execute({ ...ctx, b: 7 }); // Output: 993
```

### **Default contexts**

Default contexts are accessible from Isolation.contextify, there you can find:

- Isolation.contextify.**EMPTY**, that just empty context
- Isolation.contextify.**COMMON**, timers, buffer, fetch etc...
- Isolation.contextify.**NODE**, global, console, process & **COMMON** context You should'nt use
  **NODE** context, it may create security issues, otherwise it may road to possible context
  escaping.

<h2 id="reader-api" align="center">

**Reader API**

</h2>

Reader allow you to run scripts from files and extends possible provided options with:

- Option <code>prepare:boolean</code> reader will return non-executed scripts, **default false**
- Option <code>depth:number|boolean</code> nested directories restrictions, **default true**
- Option <code>flat:boolean</code> result with nested scripts will be flat, **default false**

- <code>read</code> Allow you to read source codes from files and directories

  ```javascript
  const Isolation = require('isolation');
  Isolation.read('./path/to/script.js').then(console.log); // Output: result of script execution
  Isolation.read('./path/to').then(console.log); // Output: { script: any }
  Isolation.read('./path/to', { prepare: true }).then(console.log); // Output: { script: Script {} }
  ```

  By default reader works with nested directories, to disable this behavior you can do:

  ```js
  const Isolation = require('isolation');
  Isolation.read('./path/to', { depth: false });
  // Or limit it:
  Isolation.read('./path/to', { depth: 3 });
  ```

- <code>read.file</code> Allow you to execute script from single file

  ```javascript
  const Isolation = require('isolation');
  Isolation.read.file('./path/to/script.js').then(console.log); // Output: result of script execution
  Isolation.read.file('./path/to/script.js', { prepare: true }).then(console.log); // Output: Script {}
  ```

- <code>read.dir</code> Allow you to execute multiple scripts from directory

  ```javascript
  const Isolation = require('isolation');
  Isolation.read.dir('./path/to').then(console.log); // Output: { script: any, deep: { script: any } }
  Isolation.read.dir('./path/to', { prepare: true }).then(console.log); Output: { script: Script {} }
  Isolation.read.dir('./path/to', { depth: false }).then(console.log); // Output: { script: any }
  ```

<h2 id="access-control" align="center">

**Access control**

</h2>

You may control access over realm submodules and reader api;

> [!NOTE]
>
> If access doesn't provided realm submodules would'nt be accessible and reader will read all files
> in directed repository.

```js
const options = { access: pathOrModule => pathOrModule === 'fs' || pathOrModule.endsWith('.js') };
Isolation.execute('module.exports = require("fs")', options);
Isolation.read('./path/to/script.js', options);
// Or
const options2 = {
  access: {
    reader: path => true, // Directory reader
    realm: module => {}, //  Realm submodules
  },
};
```

### **Library substitution**

You can replace result of require for specific libraries with anything what you want;

```js
const Isolation = require('isolation');
const src = `
  const fs = require('fs');
  module.exports = fs.readFile('Isolation.js');
`;

const sub = name => {
  if (name !== 'fs') return true;
  return {
    readFile: filename => filename + ' Works !',
  };
};

const result = Isolation.execute(src, { access: { realm: sub } });
console.log(result); // Output: Isolation.js Works !
```

<h2 id="script-options" align="center">

**Possible script options**

</h2>

| Option           | Possible                                       | Default                          | Description                                                                                           |
| ---------------- | ---------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **type**         | iso&nbsp;\|&nbsp;cjs                           | cjs                              | Type&nbsp;of&nbsp;script&nbsp;handling, see [syntax types](#module-types)                             |
| **ctx**          | object                                         | -                                | Realm&nbsp;context, see [Context API](#context-api)                                                   |
| **filename**     | string                                         | ISO                              | Name&nbsp;of&nbsp;the&nbsp;module&nbsp;, also it is global variable **\_\_filename** for root realm   |
| **dir**          | string                                         | process.cwd()                    | Module&nbsp;directory&nbsp;, also it is global variable **\_\_dirname** and realm require start point |
| **npmIsolation** | boolean                                        | false                            | Controls&nbsp;npm&nbsp;modules&nbsp;isolation                                                         |
| **access**       | [Access](./types/options.d.ts#L51)             | -                                | Isolation&nbsp;restrictions, see [Access API](#reader-api)                                            |
| **prepare**      | boolean                                        | false                            | Reader&nbsp;would'nt&nbsp;execute script for you                                                      |
| **flat**         | boolean                                        | false                            | Reader&nbsp;will&nbsp;flat&nbsp;nested&nbsp;scripts                                                   |
| **depth**        | boolean&nbsp;\|&nbsp;number                    | true                             | Restricts&nbsp;dir&nbsp;reading&nbsp;depth                                                            |
| **script**       | [ScriptOptions](./types/options.d.ts#L63)      | -                                | Configuration&nbsp;for VM.Script initialization                                                       |
| **run**          | [RunningCodeOptions](./types/options.d.ts#L62) | {&nbsp;timeout:&nbsp;1000&nbsp;} | Configuration&nbsp;for VM.Script execution                                                            |

<h2 align="center">Copyright & contributors</h2>

<p align="center">
Copyright © 2023 <a href="https://github.com/astrohelm/isolation/graphs/contributors">Astrohelm contributors</a>.
This library is <a href="./LICENSE">MIT licensed license</a>.<br/>
And it is part of <a href="https://github.com/astrohelm">Astrohelm solutions</a>.
</p>
