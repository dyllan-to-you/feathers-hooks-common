import type { HookContext } from '@feathersjs/feathers';
import { assert } from 'chai';
import { iff } from '../../src';
import { isPromise } from '../../src/common';

let hook: any;
let hookBefore: any;
let hookAfter: any;
let hookFcnSyncCalls: any;
let hookFcnAsyncCalls: any;
let hookFcnCalls: any;
let predicateHook: any;
let predicateOptions: any;
let predicateValue: any;

const predicateSync = (hook: any) => {
  predicateHook = clone(hook);
  return true;
};

const predicateSync2 = (options: any) => (hook: any) => {
  predicateOptions = clone(options);
  predicateHook = clone(hook);
  return true;
};

const predicateAsync = (hook: any) => {
  predicateHook = clone(hook);
  return new Promise<boolean>(resolve => resolve(true));
};

const predicateAsync2 = (options: any) => (hook: any) => {
  predicateOptions = clone(options);
  predicateHook = clone(hook);
  return new Promise<boolean>(resolve => resolve(true));
};

const predicateAsyncFunny = (hook: any) => {
  predicateHook = clone(hook);
  return new Promise(resolve => {
    predicateValue = 'abc';
    return resolve(predicateValue);
  });
};

const hookFcnSync = (hook: HookContext): HookContext => {
  hookFcnSyncCalls += 1;

  hook.data.first = hook.data.first.toLowerCase();

  return hook;
};

const hookFcnAsync = (hook: HookContext) =>
  new Promise<HookContext>(resolve => {
    hookFcnAsyncCalls += 1;

    hook.data.first = hook.data.first.toLowerCase();

    resolve(hook);
  });

const hookCb = (hook: any) => {
  hookFcnCalls += 1;

  return hook;
};

describe('services iff - sync predicate, sync hook', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
  });

  it('calls sync hook function if truthy non-function', () => {
    return (
      iff(
        // @ts-ignore
        'a',
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.deepEqual(hook, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('does not call sync hook function if falsey non-function', () => {
    // @ts-ignore
    const result: any = iff('', hookFcnSync)(hook);

    if (isPromise(result)) {
      assert.fail(true, false, 'promise unexpectedly returned');
    } else {
      assert.deepEqual(result, hookBefore);
      assert.equal(hookFcnSyncCalls, 0);
      assert.deepEqual(hook, hookBefore);
    }
  });

  it('calls sync hook function if sync predicate truthy', () => {
    return (
      iff(
        // @ts-ignore
        () => 'a',
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.deepEqual(hook, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('does not call sync hook function if sync predicate falsey', () => {
    // @ts-ignore
    const result = iff(() => '', hookFcnSync)(hook);

    if (isPromise(result)) {
      assert.fail(true, false, 'promise unexpectedly returned');
    } else {
      assert.deepEqual(result, hookBefore);
      assert.equal(hookFcnSyncCalls, 0);
      assert.deepEqual(hook, hookBefore);
    }
  });
});

describe('services iff - sync predicate, async hook', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
  });

  it('calls async hook function if sync predicate truthy', () => {
    return (
      iff(
        true,
        hookFcnAsync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(result1, hookAfter);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('does not call async hook function if sync predicate falsey', () => {
    const result = iff(false, hookFcnAsync)(hook);

    if (isPromise(result)) {
      assert.fail(true, false, 'promise unexpectedly returned');
    } else {
      assert.deepEqual(result, hookBefore);
      assert.equal(hookFcnAsyncCalls, 0);
      assert.deepEqual(hook, hookBefore);
    }
  });

  it('calls async hook function if sync predicate returns truthy', () => {
    return (
      iff(
        () => true,
        hookFcnAsync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(result1, hookAfter);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.deepEqual(hook, hookAfter);
        })
    );
  });
});

describe('services iff - async predicate, sync hook', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
  });

  it('calls sync hook function if aync predicate truthy', () => {
    return (
      iff(
        () => new Promise(resolve => resolve(true)),
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(result1, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(result1, hookAfter);
        })
    );
  });

  it('does not call sync hook function if async predicate falsey', () => {
    return (
      iff(
        () => new Promise(resolve => resolve(false)),
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(result1, hookBefore);
          assert.equal(hookFcnSyncCalls, 0);
          assert.deepEqual(hook, hookBefore);
        })
    );
  });
});

describe('services iff - async predicate, async hook', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
  });

  it('calls async hook function if aync predicate truthy', () => {
    return (
      iff(
        () => new Promise(resolve => resolve(true)),
        hookFcnAsync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(result1, hookAfter);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.deepEqual(result1, hookAfter);
        })
    );
  });

  it('does not call async hook function if async predicate falsey', () => {
    return (
      iff(
        () => new Promise(resolve => resolve(false)),
        hookFcnAsync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(result1, hookBefore);
          assert.equal(hookFcnAsyncCalls, 0);
          assert.deepEqual(hook, hookBefore);
        })
    );
  });
});

describe('services iff - sync predicate', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
    predicateHook = null;
    predicateOptions = null;
  });

  it('does not need to access hook', () => {
    return (
      iff(
        // @ts-ignore
        () => 'a',
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.deepEqual(hook, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('is passed hook as param', () => {
    return (
      iff(
        predicateSync,
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.deepEqual(predicateHook, hookBefore);
          assert.deepEqual(hook, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('a higher order predicate can pass more options', () => {
    return (
      iff(
        predicateSync2({ z: 'z' }),
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.deepEqual(predicateOptions, { z: 'z' });
          assert.deepEqual(predicateHook, hookBefore);
          assert.deepEqual(hook, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(hook, hookAfter);
        })
    );
  });
});

describe('services iff - async predicate', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
    predicateHook = null;
    predicateOptions = null;
    predicateValue = null;
  });

  it('is passed hook as param', () => {
    return (
      iff(
        predicateAsync,
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(predicateHook, hookBefore);
          assert.deepEqual(result1, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(result1, hookAfter);
        })
    );
  });

  it('is resolved', () => {
    return (
      iff(
        // @ts-ignore
        predicateAsyncFunny,
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(predicateHook, hookBefore);
          assert.deepEqual(result1, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(result1, hookAfter);

          assert.equal(predicateValue, 'abc');
        })
    );
  });

  it('a higher order predicate can pass more options', () => {
    return (
      iff(
        predicateAsync2({ y: 'y' }),
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((result1: any) => {
          assert.deepEqual(predicateOptions, { y: 'y' });
          assert.deepEqual(predicateHook, hookBefore);
          assert.deepEqual(result1, hookAfter);
          assert.equal(hookFcnSyncCalls, 1);
          assert.deepEqual(result1, hookAfter);
        })
    );
  });
});

describe('services iff - runs .else()', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
    hookFcnCalls = 0;
  });

  it('using iff(true, ...)', () => {
    return (
      iff(
        true,
        hookFcnSync,
        hookFcnSync,
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 3);
          assert.equal(hookFcnAsyncCalls, 0);
          assert.equal(hookFcnCalls, 0);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('using iff(true, ...).else(...)', () => {
    return (
      iff(true, hookFcnSync, hookFcnSync, hookFcnSync)
        .else(hookFcnSync)(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 3);
          assert.equal(hookFcnAsyncCalls, 0);
          assert.equal(hookFcnCalls, 0);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('using if(false).else(...)', () => {
    return (
      iff(false, hookFcnSync)
        .else(
          hookFcnSync,
          hookFcnSync,
          hookFcnSync
        )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 3);
          assert.equal(hookFcnAsyncCalls, 0);
          assert.equal(hookFcnCalls, 0);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });
});

describe('services iff - runs iff(true, iff(true, ...)', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
    hookFcnCalls = 0;
  });

  it('using iff(true, iff(true, hookFcnSync))', () => {
    return (
      iff(
        true,
        hookFcnAsync,
        iff(true, hookFcnSync),
        hookCb
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 1);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCalls, 1);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('using iff(true, iff(true, hookFcnAsync))', () => {
    return (
      iff(
        true,
        hookFcnSync,
        iff(true, hookFcnAsync),
        hookCb
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 1);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCalls, 1);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('runs iff(true, iff(true, hookFcnCb))', () => {
    return (
      iff(
        true,
        hookFcnSync,
        iff(true, hookCb),
        hookFcnAsync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 1);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCalls, 1);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });
});

describe('services iff - runs iff(true, iff(false).else(...)', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
    hookFcnCalls = 0;
  });

  it('using iff(true, iff(false).else(hookFcnSync))', () => {
    return (
      iff(
        true,
        hookFcnAsync,
        iff(false, hookCb).else(hookFcnSync),
        hookFcnAsync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 1);
          assert.equal(hookFcnAsyncCalls, 2);
          assert.equal(hookFcnCalls, 0);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('using iff(true, iff(false).else(hookFcnAsync))', () => {
    return (
      iff(
        true,
        hookFcnSync,
        iff(false, hookFcnSync).else(hookFcnAsync),
        hookFcnSync
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 2);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCalls, 0);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });
});

describe('services iff - runs iff(false).else(iff(...).else(...))', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
    hookFcnCalls = 0;
  });

  it('using iff(false).else(iff(true, ...))', () => {
    return (
      iff(false, hookCb)
        .else(
          hookFcnSync,
          iff(true, hookFcnAsync),
          hookFcnSync
        )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 2);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCalls, 0);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('runs iff(false).else(iff(false).else(...))', () => {
    return (
      iff(false, hookCb)
        .else(
          hookFcnSync,
          iff(false, hookFcnSync).else(hookFcnAsync),
          hookFcnSync
        )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 2);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCalls, 0);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });
});

describe('services iff - multiple iff() sequentially', () => {
  beforeEach(() => {
    hookBefore = { type: 'before', method: 'create', data: { first: 'John', last: 'Doe' } };
    hookAfter = { type: 'before', method: 'create', data: { first: 'john', last: 'Doe' } };
    hook = clone(hookBefore);
    hookFcnSyncCalls = 0;
    hookFcnAsyncCalls = 0;
    hookFcnCalls = 0;
  });

  it('runs in iff(true, ...)', () => {
    return (
      iff(
        true,
        hookCb,
        iff(true, hookFcnSync, hookFcnSync, hookFcnSync),
        hookCb,
        iff(true, hookFcnAsync, hookFcnAsync, hookFcnAsync, hookFcnAsync),
        hookCb
      )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 3);
          assert.equal(hookFcnAsyncCalls, 4);
          assert.equal(hookFcnCalls, 3);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });

  it('runs in iff(false).else(...)', () => {
    return (
      iff(false, hookCb)
        .else(
          hookFcnSync,
          iff(true, hookFcnAsync),
          iff(false, hookFcnSync).else(hookCb),
          hookFcnSync
        )(hook)
        // @ts-ignore
        .then((hook: any) => {
          assert.equal(hookFcnSyncCalls, 2);
          assert.equal(hookFcnAsyncCalls, 1);
          assert.equal(hookFcnCalls, 1);

          assert.deepEqual(hook, hookAfter);
        })
    );
  });
});

// Helpers

function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}
