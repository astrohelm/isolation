'use strict';

module.exports = {
  kCreateRequire: Symbol('Isolation.create.require'),
  kCreateVM: Symbol('Isolation.create.vm.script'),
  kRealmOpts: Symbol('Isolation.realm.options'),
  kRunOpts: Symbol('Isolation.run.options'),
  kNpm: Symbol('Isolation.npm.isolation'),
  kAccess: Symbol('Isolation.access'),
  kName: Symbol('Isolation.filename'),
  kDir: Symbol('Isolation.directory'),
  kCache: Symbol('Isolation.cache'),
  kRealm: Symbol('Isolation.realm'),
  kType: Symbol('Isolation.type'),
  kCtx: Symbol('Isolation.ctx'),
};
