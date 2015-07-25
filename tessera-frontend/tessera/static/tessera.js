(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator/runtime");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":91,"regenerator/runtime":92}],3:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = $.toObject($this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(fromIndex, length)
      , value;
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./$":24}],4:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that){
    var O      = Object($.assertDefined($this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$":24,"./$.ctx":12}],5:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":24}],6:[function(require,module,exports){
var $        = require('./$')
  , enumKeys = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/* eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = enumKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":24,"./$.enum-keys":15}],7:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":24,"./$.wks":42}],8:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , safe     = require('./$.uid').safe
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , step     = require('./$.iter').step
  , $has     = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , isExtensible = Object.isExtensible || isObject
  , ID       = safe('id')
  , O1       = safe('O1')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , id       = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!$has(it, ID)){
    // can't set id to frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      assert.inst(that, C, NAME);
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that[FIRST] == entry)that[FIRST] = next;
          if(that[LAST] == entry)that[LAST] = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this[FIRST]){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if($.DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that[O1][index] = entry;
    } return that;
  },
  getEntry: getEntry,
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  setIter: function(C, NAME, IS_MAP){
    require('./$.iter-define')(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);
  }
};
},{"./$":24,"./$.assert":5,"./$.ctx":12,"./$.for-of":16,"./$.iter":23,"./$.iter-define":21,"./$.mix":26,"./$.uid":40}],9:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def')
  , forOf = require('./$.for-of');
module.exports = function(NAME){
  $def($def.P, NAME, {
    toJSON: function toJSON(){
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    }
  });
};
},{"./$.def":13,"./$.for-of":16}],10:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , forOf     = require('./$.for-of')
  , $has      = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isExtensible = Object.isExtensible || isObject
  , id        = 0
  , ID        = safe('id')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findFrozen(store, key){
  return find(store.array, function(it){
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findFrozen(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findFrozen(this, key);
    },
    set: function(key, value){
      var entry = findFrozen(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      $.set(assert.inst(that, C, NAME), ID, id++);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return leakStore(this)['delete'](key);
        return $has(key, WEAK) && $has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return leakStore(this).has(key);
        return $has(key, WEAK) && $has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(!isExtensible(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      $has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};
},{"./$":24,"./$.array-methods":4,"./$.assert":5,"./$.for-of":16,"./$.mix":26,"./$.uid":40}],11:[function(require,module,exports){
'use strict';
var $     = require('./$')
  , $def  = require('./$.def')
  , BUGGY = require('./$.iter').BUGGY
  , forOf = require('./$.for-of')
  , species = require('./$.species')
  , assertInstance = require('./$.assert').inst;

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function fixMethod(KEY){
    var fn = proto[KEY];
    require('./$.redef')(proto, KEY,
      KEY == 'delete' ? function(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'has' ? function has(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'get' ? function get(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
      : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  }
  if(!$.isFunction(C) || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    require('./$.mix')(C.prototype, methods);
  } else {
    var inst  = new C
      , chain = inst[ADDER](IS_WEAK ? {} : -0, 1)
      , buggyZero;
    // wrap for init collections from iterable
    if(!require('./$.iter-detect')(function(iter){ new C(iter); })){ // eslint-disable-line no-new
      C = wrapper(function(target, iterable){
        assertInstance(target, C, NAME);
        var that = new Base;
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    IS_WEAK || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixMethod(ADDER);
  }

  require('./$.cof').set(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  species(C);
  species($.core[NAME]); // for wrapper

  if(!IS_WEAK)common.setIter(C, NAME, IS_MAP);

  return C;
};
},{"./$":24,"./$.assert":5,"./$.cof":7,"./$.def":13,"./$.for-of":16,"./$.iter":23,"./$.iter-detect":22,"./$.mix":26,"./$.redef":29,"./$.species":34}],12:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":5}],13:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction
  , $redef     = require('./$.redef');
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
global.core = core;
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & $def.B && own)exp = ctx(out, global);
    else exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own)$redef(target, key, out);
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
    if(isProto)(exports.prototype || (exports.prototype = {}))[key] = out;
  }
}
module.exports = $def;
},{"./$":24,"./$.redef":29}],14:[function(require,module,exports){
var $        = require('./$')
  , document = $.g.document
  , isObject = $.isObject
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$":24}],15:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getDesc    = $.getDesc
    , getSymbols = $.getSymbols;
  if(getSymbols)$.each.call(getSymbols(it), function(key){
    if(getDesc(it, key).enumerable)keys.push(key);
  });
  return keys;
};
},{"./$":24}],16:[function(require,module,exports){
var ctx  = require('./$.ctx')
  , get  = require('./$.iter').get
  , call = require('./$.iter-call');
module.exports = function(iterable, entries, fn, that){
  var iterator = get(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done){
    if(call(iterator, f, step.value, entries) === false){
      return call.close(iterator);
    }
  }
};
},{"./$.ctx":12,"./$.iter":23,"./$.iter-call":20}],17:[function(require,module,exports){
module.exports = function($){
  $.FW   = true;
  $.path = $.g;
  return $;
};
},{}],18:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var $ = require('./$')
  , toString = {}.toString
  , getNames = $.getNames;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

function getWindowNames(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
}

module.exports.get = function getOwnPropertyNames(it){
  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
  return getNames($.toObject(it));
};
},{"./$":24}],19:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],20:[function(require,module,exports){
var assertObject = require('./$.assert').obj;
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function call(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;
},{"./$.assert":5}],21:[function(require,module,exports){
var $def            = require('./$.def')
  , $redef          = require('./$.redef')
  , $               = require('./$')
  , cof             = require('./$.cof')
  , $iter           = require('./$.iter')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values'
  , Iterators       = $iter.Iterators;
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  $iter.create(Constructor, NAME, next);
  function createMethod(kind){
    function $$(that){
      return new Constructor(that, kind);
    }
    switch(kind){
      case KEYS: return function keys(){ return $$(this); };
      case VALUES: return function values(){ return $$(this); };
    } return function entries(){ return $$(this); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = $.getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    cof.set(IteratorPrototype, TAG, true);
    // FF fix
    if($.FW && $.has(proto, FF_ITERATOR))$iter.set(IteratorPrototype, $.that);
  }
  // Define iterator
  if($.FW || FORCE)$iter.set(proto, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = $.that;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};
},{"./$":24,"./$.cof":7,"./$.def":13,"./$.iter":23,"./$.redef":29,"./$.wks":42}],22:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":42}],23:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , cof               = require('./$.cof')
  , classof           = cof.classof
  , assert            = require('./$.assert')
  , assertObject      = assert.obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = require('./$.shared')('iterators')
  , IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol;
    return (Symbol && Symbol.iterator || FF_ITERATOR) in O
      || SYMBOL_ITERATOR in O
      || $.has(Iterators, classof(O));
  },
  get: function(it){
    var Symbol = $.g.Symbol
      , getIter;
    if(it != undefined){
      getIter = it[Symbol && Symbol.iterator || FF_ITERATOR]
        || it[SYMBOL_ITERATOR]
        || Iterators[classof(it)];
    }
    assert($.isFunction(getIter), it, ' is not iterable!');
    return assertObject(getIter.call(it));
  },
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  }
};
},{"./$":24,"./$.assert":5,"./$.cof":7,"./$.shared":33,"./$.wks":42}],24:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  each: [].forEach
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":17}],25:[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":24}],26:[function(require,module,exports){
var $redef = require('./$.redef');
module.exports = function(target, src){
  for(var key in src)$redef(target, key, src[key]);
  return target;
};
},{"./$.redef":29}],27:[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function ownKeys(it){
  assertObject(it);
  var keys       = $.getNames(it)
    , getSymbols = $.getSymbols;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./$":24,"./$.assert":5}],28:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , invoke = require('./$.invoke')
  , assertFunction = require('./$.assert').fn;
module.exports = function(/* ...pargs */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = $.path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(_length > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./$":24,"./$.assert":5,"./$.invoke":19}],29:[function(require,module,exports){
var $   = require('./$')
  , tpl = String({}.hasOwnProperty)
  , SRC = require('./$.uid').safe('src')
  , _toString = Function.toString;

function $redef(O, key, val, safe){
  if($.isFunction(val)){
    var base = O[key];
    $.hide(val, SRC, base ? String(base) : tpl.replace(/hasOwnProperty/, String(key)));
    if(!('name' in val))val.name = key;
  }
  if(O === $.g){
    O[key] = val;
  } else {
    if(!safe)delete O[key];
    $.hide(O, key, val);
  }
}

// add fake Function#toString for correct work wrapped methods / constructors
// with methods similar to LoDash isNative
$redef(Function.prototype, 'toString', function toString(){
  return $.has(this, SRC) ? this[SRC] : _toString.call(this);
});

$.core.inspectSource = function(it){
  return _toString.call(it);
};

module.exports = $redef;
},{"./$":24,"./$.uid":40}],30:[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};
},{}],31:[function(require,module,exports){
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],32:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
function check(O, proto){
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":24,"./$.assert":5,"./$.ctx":12}],33:[function(require,module,exports){
var $      = require('./$')
  , SHARED = '__core-js_shared__'
  , store  = $.g[SHARED] || ($.g[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$":24}],34:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if($.DESC && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};
},{"./$":24,"./$.wks":42}],35:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String($.assertDefined(that))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":24}],36:[function(require,module,exports){
// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
var $      = require('./$')
  , repeat = require('./$.string-repeat');

module.exports = function(that, minLength, fillChar, left){
  // 1. Let O be CheckObjectCoercible(this value).
  // 2. Let S be ToString(O).
  var S = String($.assertDefined(that));
  // 4. If intMinLength is undefined, return S.
  if(minLength === undefined)return S;
  // 4. Let intMinLength be ToInteger(minLength).
  var intMinLength = $.toInteger(minLength);
  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;
  // 6. If fillLen < 0, then throw a RangeError exception.
  // 7. If fillLen is +∞, then throw a RangeError exception.
  if(fillLen < 0 || fillLen === Infinity){
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string: ' + S);
  }
  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);
  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var sFillVal = repeat.call(sFillStr, Math.ceil(fillLen / sFillStr.length));
  // truncate if we overflowed
  if(sFillVal.length > fillLen)sFillVal = left
    ? sFillVal.slice(sFillVal.length - fillLen)
    : sFillVal.slice(0, fillLen);
  // 11. Return a string made from sFillVal, followed by S.
  // 11. Return a String made from S, followed by sFillVal.
  return left ? sFillVal.concat(S) : S.concat(sFillVal);
};
},{"./$":24,"./$.string-repeat":37}],37:[function(require,module,exports){
'use strict';
var $ = require('./$');

module.exports = function repeat(count){
  var str = String($.assertDefined(this))
    , res = ''
    , n   = $.toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"./$":24}],38:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , cel    = require('./$.dom-create')
  , global             = $.g
  , isFunction         = $.isFunction
  , html               = $.html
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(global.addEventListener && isFunction(global.postMessage) && !global.importScripts){
    defer = function(id){
      global.postMessage(id, '*');
    };
    global.addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":24,"./$.cof":7,"./$.ctx":12,"./$.dom-create":14,"./$.invoke":19}],39:[function(require,module,exports){
module.exports = function(exec){
  try {
    exec();
    return false;
  } catch(e){
    return true;
  }
};
},{}],40:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++sid + Math.random()).toString(36));
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":24}],41:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./$.wks')('unscopables');
if(!(UNSCOPABLES in []))require('./$').hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  [][UNSCOPABLES][key] = true;
};
},{"./$":24,"./$.wks":42}],42:[function(require,module,exports){
var global = require('./$').g
  , store  = require('./$.shared')('wks');
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":24,"./$.shared":33,"./$.uid":40}],43:[function(require,module,exports){
var $                = require('./$')
  , cel              = require('./$.dom-create')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid').safe('__proto__')
  , assert           = require('./$.assert')
  , assertObject     = assert.obj
  , ObjectProto      = Object.prototype
  , html             = $.html
  , A                = []
  , _slice           = A.slice
  , _join            = A.join
  , classof          = cof.classof
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , defineProperties = $.setDescs
  , isFunction       = $.isFunction
  , isObject         = $.isObject
  , toObject         = $.toObject
  , toLength         = $.toLength
  , toIndex          = $.toIndex
  , IE8_DOM_DEFINE   = false
  , $indexOf         = require('./$.array-includes')(false)
  , $forEach         = arrayMethod(0)
  , $map             = arrayMethod(1)
  , $filter          = arrayMethod(2)
  , $some            = arrayMethod(3)
  , $every           = arrayMethod(4);

if(!$.DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(cel('div'), 'x',
      {get: function(){ return 8; }}
    ).x == 8;
  } catch(e){ /* empty */ }
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = defineProperties = function(O, Properties){
    assertObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
            'toLocaleString,toString,valueOf').split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = cel('iframe')
    , i      = keysLen1
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
};
function createGetKeys(names, length){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~$indexOf(result, key) || result.push(key);
    }
    return result;
  };
}
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = Object(assert.def(O));
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(isFunction(O.constructor) && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result;
    if(O !== null){
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: function seal(it){
    return it; // <- cap
  },
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: function freeze(it){
    return it; // <- cap
  },
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: function preventExtensions(it){
    return it; // <- cap
  },
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: function isSealed(it){
    return !isObject(it); // <- cap
  },
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: function isFrozen(it){
    return !isObject(it); // <- cap
  },
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: function isExtensible(it){
    return isObject(it); // <- cap
  }
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = assert.fn(this)
      , partArgs = _slice.call(arguments, 1);
    function bound(/* args... */){
      var args   = partArgs.concat(_slice.call(arguments))
        , constr = this instanceof bound
        , ctx    = constr ? $.create(fn.prototype) : that
        , result = invoke(fn, args, ctx);
      return constr ? ctx : result;
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string and DOM objects
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}

var buggySlice = true;
try {
  if(html)_slice.call(html);
  buggySlice = false;
} catch(e){ /* empty */ }

$def($def.P + $def.F * buggySlice, 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return _slice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});

$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  join: function join(){
    return _join.apply($.ES5Object(this), arguments);
  }
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function(arg){
    return cof(arg) == 'Array';
  }
});
function createArrayReduce(isRight){
  return function(callbackfn, memo){
    assert.fn(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(arguments.length < 2)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || function forEach(callbackfn/*, that = undefined */){
    return $forEach(this, callbackfn, arguments[1]);
  },
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn/*, that = undefined */){
    return $map(this, callbackfn, arguments[1]);
  },
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn/*, that = undefined */){
    return $filter(this, callbackfn, arguments[1]);
  },
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn/*, that = undefined */){
    return $some(this, callbackfn, arguments[1]);
  },
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn/*, that = undefined */){
    return $every(this, callbackfn, arguments[1]);
  },
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(el /*, fromIndex = 0 */){
    return $indexOf(this, el, arguments[1]);
  },
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1')});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function(){
  return +new Date;
}});

function lz(num){
  return num > 9 ? num : '0' + num;
}

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
// PhantomJS and old webkit had a broken Date implementation.
var date       = new Date(-5e13 - 1)
  , brokenDate = !(date.toISOString && date.toISOString() == '0385-07-25T07:06:39.999Z'
      && require('./$.throws')(function(){ new Date(NaN).toISOString(); }));
$def($def.P + $def.F * brokenDate, 'Date', {toISOString: function(){
  if(!isFinite(this))throw RangeError('Invalid time value');
  var d = this
    , y = d.getUTCFullYear()
    , m = d.getUTCMilliseconds()
    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
}});

if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
  var tag = classof(it);
  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
};
},{"./$":24,"./$.array-includes":3,"./$.array-methods":4,"./$.assert":5,"./$.cof":7,"./$.def":13,"./$.dom-create":14,"./$.invoke":19,"./$.replacer":30,"./$.throws":39,"./$.uid":40}],44:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function copyWithin(target/* = 0 */, start /* = 0, end = @length */){
    var O     = Object($.assertDefined(this))
      , len   = $.toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to   + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to   += inc;
      from += inc;
    } return O;
  }
});
require('./$.unscope')('copyWithin');
},{"./$":24,"./$.def":13,"./$.unscope":41}],45:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function fill(value /*, start = 0, end = @length */){
    var O      = Object($.assertDefined(this))
      , length = $.toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');
},{"./$":24,"./$.def":13,"./$.unscope":41}],46:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var KEY    = 'findIndex'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(6);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":4,"./$.def":13,"./$.unscope":41}],47:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var KEY    = 'find'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(5);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":4,"./$.def":13,"./$.unscope":41}],48:[function(require,module,exports){
var $     = require('./$')
  , ctx   = require('./$.ctx')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , call  = require('./$.iter-call');
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object($.assertDefined(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step, iterator;
    if($iter.is(O)){
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result   = new (typeof this == 'function' ? this : Array);
      for(; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$":24,"./$.ctx":12,"./$.def":13,"./$.iter":23,"./$.iter-call":20,"./$.iter-detect":22}],49:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":24,"./$.iter":23,"./$.iter-define":21,"./$.uid":40,"./$.unscope":41}],50:[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , length = arguments.length
      // strange IE quirks mode bug -> use typeof instead of isFunction
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":13}],51:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":34}],52:[function(require,module,exports){
var $             = require('./$')
  , HAS_INSTANCE  = require('./$.wks')('hasInstance')
  , FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))$.setDesc(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(!$.isFunction(this) || !$.isObject(O))return false;
  if(!$.isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = $.getProto(O))if(this.prototype === O)return true;
  return false;
}});
},{"./$":24,"./$.wks":42}],53:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , NAME = 'name'
  , setDesc = $.setDesc
  , FunctionProto = Function.prototype;
// 19.2.4.2 name
NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function(value){
    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
  }
});
},{"./$":24}],54:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', function(get){
  return function Map(){ return get(this, arguments[0]); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":11,"./$.collection-strong":8}],55:[function(require,module,exports){
var Infinity = 1 / 0
  , $def  = require('./$.def')
  , E     = Math.E
  , pow   = Math.pow
  , abs   = Math.abs
  , exp   = Math.exp
  , log   = Math.log
  , sqrt  = Math.sqrt
  , ceil  = Math.ceil
  , floor = Math.floor
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);
function roundTiesToEven(n){
  return n + 1 / EPSILON - 1 / EPSILON;
}

// 20.2.2.28 Math.sign(x)
function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
}
// 20.2.2.5 Math.asinh(x)
function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}

$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function cbrt(x){
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - floor(log(x + 0.5) * Math.LOG2E) : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  fround: function fround(x){
    var $abs  = abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , i    = 0
      , len  = arguments.length
      , larg = 0
      , arg, div;
    while(i < len){
      arg = abs(arguments[i++]);
      if(larg < arg){
        div  = larg / arg;
        sum  = sum * div * div + 1;
        larg = arg;
      } else if(arg > 0){
        div  = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function imul(x, y){
    var UInt16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UInt16 & xn
      , yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function log1p(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function log10(x){
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function log2(x){
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function sinh(x){
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function trunc(it){
    return (it > 0 ? floor : ceil)(it);
  }
});
},{"./$.def":13}],56:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , isObject   = $.isObject
  , isFunction = $.isFunction
  , NUMBER     = 'Number'
  , $Number    = $.g[NUMBER]
  , Base       = $Number
  , proto      = $Number.prototype;
function toPrimitive(it){
  var fn, val;
  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
if($.FW && !($Number('0o1') && $Number('0b1'))){
  $Number = function Number(it){
    return this instanceof $Number ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call($.DESC ? $.getNames(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), function(key){
      if($.has(Base, key) && !$.has($Number, key)){
        $.setDesc($Number, key, $.getDesc(Base, key));
      }
    }
  );
  $Number.prototype = proto;
  proto.constructor = $Number;
  require('./$.redef')($.g, NUMBER, $Number);
}
},{"./$":24,"./$.redef":29}],57:[function(require,module,exports){
var $     = require('./$')
  , $def  = require('./$.def')
  , abs   = Math.abs
  , floor = Math.floor
  , _isFinite = $.g.isFinite
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it){
  return !$.isObject(it) && _isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function isNaN(number){
    return number != number;
  },
  // 20.1.2.5 Number.isSafeInteger(number)
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  // 20.1.2.12 Number.parseFloat(string)
  parseFloat: parseFloat,
  // 20.1.2.13 Number.parseInt(string, radix)
  parseInt: parseInt
});
},{"./$":24,"./$.def":13}],58:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":6,"./$.def":13}],59:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: require('./$.same')
});
},{"./$.def":13,"./$.same":31}],60:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.def":13,"./$.set-proto":32}],61:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
, function(KEY, ID){
  var fn     = ($.core.Object || {})[KEY] || Object[KEY]
    , forced = 0
    , method = {};
  method[KEY] = ID == 0 ? function freeze(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 1 ? function seal(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 2 ? function preventExtensions(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 3 ? function isFrozen(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 4 ? function isSealed(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 5 ? function isExtensible(it){
    return isObject(it) ? fn(it) : false;
  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : ID == 7 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : ID == 8 ? function keys(it){
    return fn(toObject(it));
  } : require('./$.get-names').get;
  try {
    fn('z');
  } catch(e){
    forced = 1;
  }
  $def($def.S + $def.F * forced, 'Object', method);
});
},{"./$":24,"./$.def":13,"./$.get-names":18}],62:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if(require('./$').FW && cof(tmp) != 'z'){
  require('./$.redef')(Object.prototype, 'toString', function toString(){
    return '[object ' + cof.classof(this) + ']';
  }, true);
}
},{"./$":24,"./$.cof":7,"./$.redef":29,"./$.wks":42}],63:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , setProto = require('./$.set-proto').set
  , same     = require('./$.same')
  , species  = require('./$.species')
  , SPECIES  = require('./$.wks')('species')
  , RECORD   = require('./$.uid').safe('record')
  , PROMISE  = 'Promise'
  , global   = $.g
  , process  = global.process
  , isNode   = cof(process) == 'process'
  , asap     = process && process.nextTick || require('./$.task').set
  , P        = global[PROMISE]
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , Wrapper;

function testResolve(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
}

var useNative = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = isFunction(P) && isFunction(P.resolve) && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && $.DESC){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
function isPromise(it){
  return isObject(it) && (useNative ? cof.classof(it) == 'Promise' : RECORD in it);
}
function sameConstructor(a, b){
  // library wrapper special case
  if(!$.FW && a === P && b === Wrapper)return true;
  return same(a, b);
}
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  if(isObject(it))then = it.then;
  return isFunction(then) ? then : false;
}
function notify(record){
  var chain = record.c;
  // strange IE + webpack dev server bug - use .call(global)
  if(chain.length)asap.call(global, function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    function run(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
  });
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function $reject(value){
  var record = this
    , promise;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  setTimeout(function(){
    // strange IE + webpack dev server bug - use .call(global)
    asap.call(global, function(){
      if(isUnhandled(promise = record.p)){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(global.console && console.error){
          console.error('Unhandled promise rejection', value);
        }
      }
      record.a = undefined;
    });
  }, 1);
  notify(record);
}
function $resolve(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      // strange IE + webpack dev server bug - use .call(global)
      asap.call(global, function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
}

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE),       // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.mix')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      if(record.s)notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
cof.set(P, PROMISE);
species(P);
species(Wrapper = $.core[PROMISE]);

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new (getConstructor(this))(function(res, rej){ rej(r); });
  }
});
$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isPromise(x) && sameConstructor(x.constructor, this)
      ? x : new this(function(res){ res(x); });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":24,"./$.assert":5,"./$.cof":7,"./$.ctx":12,"./$.def":13,"./$.for-of":16,"./$.iter-detect":22,"./$.mix":26,"./$.same":31,"./$.set-proto":32,"./$.species":34,"./$.task":38,"./$.uid":40,"./$.wks":42}],64:[function(require,module,exports){
var $         = require('./$')
  , $def      = require('./$.def')
  , setProto  = require('./$.set-proto')
  , $iter     = require('./$.iter')
  , ITERATOR  = require('./$.wks')('iterator')
  , ITER      = require('./$.uid').safe('iter')
  , step      = $iter.step
  , assert    = require('./$.assert')
  , isObject  = $.isObject
  , getProto  = $.getProto
  , $Reflect  = $.g.Reflect
  , _apply    = Function.apply
  , assertObject = assert.obj
  , _isExtensible = Object.isExtensible || isObject
  , _preventExtensions = Object.preventExtensions
  // IE TP has broken Reflect.enumerate
  , buggyEnumerate = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));

function Enumerate(iterated){
  $.set(this, ITER, {o: iterated, k: undefined, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.k
    , key;
  if(keys == undefined){
    iter.k = keys = [];
    for(key in iter.o)keys.push(key);
  }
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: function apply(target, thisArgument, argumentsList){
    return _apply.call(target, thisArgument, argumentsList);
  },
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function construct(target, argumentsList /*, newTarget*/){
    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = _apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: function defineProperty(target, propertyKey, attributes){
    assertObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = $.getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: function get(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = $.getDesc(assertObject(target), propertyKey), proto;
    if(desc)return $.has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getProto(target))
      ? get(proto, propertyKey, receiver)
      : undefined;
  },
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return $.getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function has(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function isExtensible(target){
    return _isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: require('./$.own-keys'),
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: function preventExtensions(target){
    assertObject(target);
    try {
      if(_preventExtensions)_preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: function set(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = $.getDesc(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getProto(target))){
        return set(proto, propertyKey, V, receiver);
      }
      ownDesc = $.desc(0);
    }
    if($.has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = $.getDesc(receiver, propertyKey) || $.desc(0);
      existingDescriptor.value = V;
      $.setDesc(receiver, propertyKey, existingDescriptor);
      return true;
    }
    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
  }
};
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if(setProto)reflect.setPrototypeOf = function setPrototypeOf(target, proto){
  setProto.check(target, proto);
  try {
    setProto.set(target, proto);
    return true;
  } catch(e){
    return false;
  }
};

$def($def.G, {Reflect: {}});

$def($def.S + $def.F * buggyEnumerate, 'Reflect', {
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function enumerate(target){
    return new Enumerate(assertObject(target));
  }
});

$def($def.S, 'Reflect', reflect);
},{"./$":24,"./$.assert":5,"./$.def":13,"./$.iter":23,"./$.own-keys":27,"./$.set-proto":32,"./$.uid":40,"./$.wks":42}],65:[function(require,module,exports){
var $       = require('./$')
  , cof     = require('./$.cof')
  , $RegExp = $.g.RegExp
  , Base    = $RegExp
  , proto   = $RegExp.prototype
  , re      = /a/g
  // "new" creates a new object
  , CORRECT_NEW = new $RegExp(re) !== re
  // RegExp allows a regex with flags as the pattern
  , ALLOWS_RE_WITH_FLAGS = function(){
    try {
      return $RegExp(re, 'i') == '/a/i';
    } catch(e){ /* empty */ }
  }();
if($.FW && $.DESC){
  if(!CORRECT_NEW || !ALLOWS_RE_WITH_FLAGS){
    $RegExp = function RegExp(pattern, flags){
      var patternIsRegExp  = cof(pattern) == 'RegExp'
        , flagsIsUndefined = flags === undefined;
      if(!(this instanceof $RegExp) && patternIsRegExp && flagsIsUndefined)return pattern;
      return CORRECT_NEW
        ? new Base(patternIsRegExp && !flagsIsUndefined ? pattern.source : pattern, flags)
        : new Base(patternIsRegExp ? pattern.source : pattern
          , patternIsRegExp && flagsIsUndefined ? pattern.flags : flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in $RegExp || $.setDesc($RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = $RegExp;
    $RegExp.prototype = proto;
    require('./$.redef')($.g, 'RegExp', $RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')($RegExp);
},{"./$":24,"./$.cof":7,"./$.redef":29,"./$.replacer":30,"./$.species":34}],66:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', function(get){
  return function Set(){ return get(this, arguments[0]); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":11,"./$.collection-strong":8}],67:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(false);
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./$.def":13,"./$.string-at":35}],68:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def')
  , toLength = $.toLength;

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.endsWith(/./); }), 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that = String($.assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }
});
},{"./$":24,"./$.cof":7,"./$.def":13,"./$.throws":39}],69:[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$').toIndex
  , fromCharCode = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$def($def.S + $def.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res = []
      , len = arguments.length
      , i   = 0
      , code;
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$":24,"./$.def":13}],70:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function includes(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }
});
},{"./$":24,"./$.cof":7,"./$.def":13}],71:[function(require,module,exports){
var set   = require('./$').set
  , $at   = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = $at(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":24,"./$.iter":23,"./$.iter-define":21,"./$.string-at":35,"./$.uid":40}],72:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl = $.toObject(callSite.raw)
      , len = $.toLength(tpl.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$":24,"./$.def":13}],73:[function(require,module,exports){
var $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./$.string-repeat')
});
},{"./$.def":13,"./$.string-repeat":37}],74:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.startsWith(/./); }), 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function startsWith(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that  = String($.assertDefined(this))
      , index = $.toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});
},{"./$":24,"./$.cof":7,"./$.def":13,"./$.throws":39}],75:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , shared   = require('./$.shared')
  , $def     = require('./$.def')
  , $redef   = require('./$.redef')
  , keyOf    = require('./$.keyof')
  , enumKeys = require('./$.enum-keys')
  , assertObject = require('./$.assert').obj
  , ObjectProto = Object.prototype
  , DESC     = $.DESC
  , has      = $.has
  , $create  = $.create
  , getDesc  = $.getDesc
  , setDesc  = $.setDesc
  , desc     = $.desc
  , $names   = require('./$.get-names')
  , getNames = $names.get
  , toObject = $.toObject
  , $Symbol  = $.g.Symbol
  , setter   = false
  , TAG      = uid('tag')
  , HIDDEN   = uid('hidden')
  , _propertyIsEnumerable = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols = shared('symbols')
  , useNative = $.isFunction($Symbol);

var setSymbolDesc = DESC ? function(){ // fallback for old Android
  try {
    return $create(setDesc({}, HIDDEN, {
      get: function(){
        return setDesc(this, HIDDEN, {value: false})[HIDDEN];
      }
    }))[HIDDEN] || setDesc;
  } catch(e){
    return function(it, key, D){
      var protoDesc = getDesc(ObjectProto, key);
      if(protoDesc)delete ObjectProto[key];
      setDesc(it, key, D);
      if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
    };
  }
}() : setDesc;

function wrap(tag){
  var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
  DESC && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, desc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, desc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = $create(D, {enumerable: desc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return setDesc(it, key, D);
}
function defineProperties(it, P){
  assertObject(it);
  var keys = enumKeys(P = toObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P){
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function propertyIsEnumerable(key){
  var E = _propertyIsEnumerable.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
    ? E : true;
}
function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
}
function getOwnPropertySymbols(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function(){
    return this[TAG];
  });

  $.create     = create;
  $.setDesc    = defineProperty;
  $.getDesc    = getOwnPropertyDescriptor;
  $.setDescs   = defineProperties;
  $.getNames   = $names.get = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;

  if($.DESC && $.FW)$redef(ObjectProto, 'propertyIsEnumerable', propertyIsEnumerable, true);
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = require('./$.wks')(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  }
);

setter = true;

$def($def.G + $def.W, {Symbol: $Symbol});

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":24,"./$.assert":5,"./$.cof":7,"./$.def":13,"./$.enum-keys":15,"./$.get-names":18,"./$.keyof":25,"./$.redef":29,"./$.shared":33,"./$.uid":40,"./$.wks":42}],76:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isExtensible = Object.isExtensible || isObject
  , tmp       = {};

// 23.3 WeakMap Objects
var $WeakMap = require('./$.collection')('WeakMap', function(get){
  return function WeakMap(){ return get(this, arguments[0]); };
}, {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      if(!isExtensible(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    require('./$.redef')(proto, key, function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && !isExtensible(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./$":24,"./$.collection":11,"./$.collection-weak":10,"./$.redef":29}],77:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', function(get){
  return function WeakSet(){ return get(this, arguments[0]); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":11,"./$.collection-weak":10}],78:[function(require,module,exports){
'use strict';
var $def      = require('./$.def')
  , $includes = require('./$.array-includes')(true);
$def($def.P, 'Array', {
  // https://github.com/domenic/Array.prototype.includes
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments[1]);
  }
});
require('./$.unscope')('includes');
},{"./$.array-includes":3,"./$.def":13,"./$.unscope":41}],79:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Map');
},{"./$.collection-to-json":9}],80:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O      = $.toObject(object)
      , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});
},{"./$":24,"./$.def":13,"./$.own-keys":27}],81:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $    = require('./$')
  , $def = require('./$.def');
function createObjectToArray(isEntries){
  return function(object){
    var O      = $.toObject(object)
      , keys   = $.getKeys(O)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  };
}
$def($def.S, 'Object', {
  values:  createObjectToArray(false),
  entries: createObjectToArray(true)
});
},{"./$":24,"./$.def":13}],82:[function(require,module,exports){
// https://github.com/benjamingr/RexExp.escape
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/[\\^$*+?.()|[\]{}]/g, '\\$&', true)
});

},{"./$.def":13,"./$.replacer":30}],83:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Set');
},{"./$.collection-to-json":9}],84:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(true);
$def($def.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./$.def":13,"./$.string-at":35}],85:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n){
    return $pad(this, n, arguments[1], true);
  }
});
},{"./$.def":13,"./$.string-pad":36}],86:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  rpad: function rpad(n){
    return $pad(this, n, arguments[1], false);
  }
});
},{"./$.def":13,"./$.string-pad":36}],87:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , $Array  = $.core.Array || Array
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(length == undefined && key in $Array)statics[key] = $Array[key];
    else if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);
},{"./$":24,"./$.ctx":12,"./$.def":13}],88:[function(require,module,exports){
require('./es6.array.iterator');
var $           = require('./$')
  , Iterators   = require('./$.iter').Iterators
  , ITERATOR    = require('./$.wks')('iterator')
  , ArrayValues = Iterators.Array
  , NL          = $.g.NodeList
  , HTC         = $.g.HTMLCollection
  , NLProto     = NL && NL.prototype
  , HTCProto    = HTC && HTC.prototype;
if($.FW){
  if(NL && !(ITERATOR in NLProto))$.hide(NLProto, ITERATOR, ArrayValues);
  if(HTC && !(ITERATOR in HTCProto))$.hide(HTCProto, ITERATOR, ArrayValues);
}
Iterators.NodeList = Iterators.HTMLCollection = ArrayValues;
},{"./$":24,"./$.iter":23,"./$.wks":42,"./es6.array.iterator":49}],89:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":13,"./$.task":38}],90:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var $         = require('./$')
  , $def      = require('./$.def')
  , invoke    = require('./$.invoke')
  , partial   = require('./$.partial')
  , navigator = $.g.navigator
  , MSIE      = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      $.isFunction(fn) ? fn : Function(fn)
    ), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});
},{"./$":24,"./$.def":13,"./$.invoke":19,"./$.partial":28}],91:[function(require,module,exports){
require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.number.constructor');
require('./modules/es6.number.statics');
require('./modules/es6.math');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.lpad');
require('./modules/es7.string.rpad');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.to-array');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$').core;

},{"./modules/$":24,"./modules/es5":43,"./modules/es6.array.copy-within":44,"./modules/es6.array.fill":45,"./modules/es6.array.find":47,"./modules/es6.array.find-index":46,"./modules/es6.array.from":48,"./modules/es6.array.iterator":49,"./modules/es6.array.of":50,"./modules/es6.array.species":51,"./modules/es6.function.has-instance":52,"./modules/es6.function.name":53,"./modules/es6.map":54,"./modules/es6.math":55,"./modules/es6.number.constructor":56,"./modules/es6.number.statics":57,"./modules/es6.object.assign":58,"./modules/es6.object.is":59,"./modules/es6.object.set-prototype-of":60,"./modules/es6.object.statics-accept-primitives":61,"./modules/es6.object.to-string":62,"./modules/es6.promise":63,"./modules/es6.reflect":64,"./modules/es6.regexp":65,"./modules/es6.set":66,"./modules/es6.string.code-point-at":67,"./modules/es6.string.ends-with":68,"./modules/es6.string.from-code-point":69,"./modules/es6.string.includes":70,"./modules/es6.string.iterator":71,"./modules/es6.string.raw":72,"./modules/es6.string.repeat":73,"./modules/es6.string.starts-with":74,"./modules/es6.symbol":75,"./modules/es6.weak-map":76,"./modules/es6.weak-set":77,"./modules/es7.array.includes":78,"./modules/es7.map.to-json":79,"./modules/es7.object.get-own-property-descriptors":80,"./modules/es7.object.to-array":81,"./modules/es7.regexp.escape":82,"./modules/es7.set.to-json":83,"./modules/es7.string.at":84,"./modules/es7.string.lpad":85,"./modules/es7.string.rpad":86,"./modules/js.array.statics":87,"./modules/web.dom.iterable":88,"./modules/web.immediate":89,"./modules/web.timers":90}],92:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(
      innerFn, self || null,
      new Context(tryLocsList || [])
    );

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    // This invoke function is written in a style that assumes some
    // calling function (or Promise) will handle exceptions.
    function invoke(method, arg) {
      var result = generator[method](arg);
      var value = result.value;
      return value instanceof AwaitArgument
        ? Promise.resolve(value.arg).then(invokeNext, invokeThrow)
        : Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration. If the Promise is rejected, however, the
            // result for this iteration will be rejected with the same
            // reason. Note that rejections of yielded Promises are not
            // thrown back into the generator function, as is the case
            // when an awaited Promise is rejected. This difference in
            // behavior between yield and await is important, because it
            // allows the consumer to decide what to do with the yielded
            // rejection (swallow it and continue, manually .throw it back
            // into the generator, abandon iteration, whatever). With
            // await, by contrast, there is no opportunity to examine the
            // rejection reason outside the generator function, so the
            // only option is to throw it from the await expression, and
            // let the generator function handle the exception.
            result.value = unwrapped;
            return result;
          });
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var invokeNext = invoke.bind(generator, "next");
    var invokeThrow = invoke.bind(generator, "throw");
    var invokeReturn = invoke.bind(generator, "return");
    var previousPromise;

    function enqueue(method, arg) {
      var enqueueResult =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(function() {
          return invoke(method, arg);
        }) : new Promise(function(resolve) {
          resolve(invoke(method, arg));
        });

      // Avoid propagating enqueueResult failures to Promises returned by
      // later invocations of the iterator.
      previousPromise = enqueueResult["catch"](function(ignored){});

      return enqueueResult;
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":1}]},{},[2]);
;this["ts"] = this["ts"] || {};
this["ts"]["templates"] = this["ts"]["templates"] || {};

this["ts"]["templates"]["edit"] = this["ts"]["templates"]["edit"] || {};

this["ts"]["templates"]["flot"] = this["ts"]["templates"]["flot"] || {};

this["ts"]["templates"]["listing"] = this["ts"]["templates"]["listing"] || {};

this["ts"]["templates"]["models"] = this["ts"]["templates"]["models"] || {};

Handlebars.registerPartial("action-menu-button", this["ts"]["templates"]["action-menu-button"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=this.lambda;

  return "  <li role=\"presentation\"\n    data-ds-action=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\"\n    data-ds-category=\""
    + alias3(((helper = (helper = helpers.category || (depth0 != null ? depth0.category : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"category","hash":{},"data":data}) : helper)))
    + "\"\n    data-ds-show=\""
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.show : stack1), depth0))
    + "\"\n    data-ds-hide=\""
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.hide : stack1), depth0))
    + "\">\n    <a role=\"menuitem\" href=\"#\"><i class=\""
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\"></i> "
    + alias3(alias4(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.display : stack1), depth0))
    + "</a>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.actions : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true}));

Handlebars.registerPartial("ds-action-menu", this["ts"]["templates"]["ds-action-menu"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "<div data-ds-hide=\"edit\" class=\"btn-group\" align=\"left\">\n  <button type=\"button\"\n          class=\"btn btn-default btn-xs dropdown-toggle\"\n          data-toggle=\"dropdown\">\n    <span class=\"caret\"></span>\n  </button>\n  <ul class=\"dropdown-menu dropdown-menu-right ds-action-menu\" role=\"menu\">\n    "
    + alias2((helpers.actions || (depth0 && depth0.actions) || alias1).call(depth0,"presentation-transform-actions",{"name":"actions","hash":{},"data":data}))
    + "\n    "
    + alias2((helpers.actions || (depth0 && depth0.actions) || alias1).call(depth0,"presentation-actions",true,{"name":"actions","hash":{},"data":data}))
    + "\n    "
    + alias2((helpers.actions || (depth0 && depth0.actions) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_type : stack1),true,{"name":"actions","hash":{},"data":data}))
    + "\n  </ul>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-dashboard-listing-action-menu", this["ts"]["templates"]["ds-dashboard-listing-action-menu"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"btn-group\">\n  <button\n     type=\"button\"\n     class=\"btn btn-default btn-xs dropdown-toggle\"\n     data-toggle=\"dropdown\">\n    <span class=\"caret\"></span>\n  </button>\n  <ul class=\"dropdown-menu dropdown-menu-right ds-dashboard-action-menu\" role=\"menu\" data-ds-href=\""
    + alias3(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"href","hash":{},"data":data}) : helper)))
    + "\" data-ds-view-href=\""
    + alias3(((helper = (helper = helpers.view_href || (depth0 != null ? depth0.view_href : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"view_href","hash":{},"data":data}) : helper)))
    + "\">\n\n    "
    + alias3((helpers.actions || (depth0 && depth0.actions) || alias1).call(depth0,"dashboard-list-actions",{"name":"actions","hash":{},"data":data}))
    + "\n  </ul>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-dashboard-listing-entry", this["ts"]["templates"]["ds-dashboard-listing-entry"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "            <br/>\n            <small>"
    + this.escapeExpression(((helper = (helper = helpers.summary || (depth0 != null ? depth0.summary : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"summary","hash":{},"data":data}) : helper)))
    + "</small>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials['ds-dashboard-tag-with-link'],depth0,{"name":"ds-dashboard-tag-with-link","data":data,"indent":"          ","helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"5":function(depth0,helpers,partials,data) {
    var helper;

  return "          <a href=\""
    + this.escapeExpression(((helper = (helper = helpers.imported_from || (depth0 != null ? depth0.imported_from : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"imported_from","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\"><i class=\"fa fa-cloud\"></i></a><br/>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<tr data-ds-href=\""
    + alias3(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"href","hash":{},"data":data}) : helper)))
    + "\">\n  <td>\n    <div class=\"row\">\n      <div class=\"col-md-12\">\n\n        <div class=\"pull-left\">\n          <a href=\""
    + alias3(((helper = (helper = helpers.view_href || (depth0 != null ? depth0.view_href : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"view_href","hash":{},"data":data}) : helper)))
    + "\">\n            <span class=\"ds-dashboard-listing-category\">\n              "
    + alias3(((helper = (helper = helpers.category || (depth0 != null ? depth0.category : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"category","hash":{},"data":data}) : helper)))
    + "\n            </span>\n            <span class=\"ds-dashboard-listing-title\">\n              "
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "\n            </span>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.summary : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "          </a><br/>\n          <span class=\"ds-dashboard-listing-last-modified\">\n            Last modified "
    + alias3((helpers.moment || (depth0 && depth0.moment) || alias1).call(depth0,"fromNow",(depth0 != null ? depth0.last_modified_date : depth0),{"name":"moment","hash":{},"data":data}))
    + ".\n          </span>\n        </div>\n\n        <div class=\"pull-right\" style=\"margin-left: 0.5em\">\n"
    + ((stack1 = this.invokePartial(partials['ds-dashboard-listing-action-menu'],depth0,{"name":"ds-dashboard-listing-action-menu","data":data,"indent":"          ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "        </div>\n\n        <div data-ds-href=\""
    + alias3(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"href","hash":{},"data":data}) : helper)))
    + "\" class=\"pull-right ds-favorite-indicator\" style=\"margin-left: 0.5em\">\n          <i class=\"text-muted fa fa-lg fa-star-o\"></i>\n        </div>\n\n        <div class=\"pull-right\" style=\"text-align:right\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.tags : depth0),{"name":"each","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "          <br/>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.imported_from : depth0),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n\n      </div>\n\n    </div> <!-- row -->\n  </td>\n</tr>\n";
},"usePartial":true,"useData":true}));

Handlebars.registerPartial("ds-dashboard-tag-with-link", this["ts"]["templates"]["ds-dashboard-tag-with-link"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<a href=\"/dashboards/tagged/"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + ((stack1 = this.invokePartial(partials['ds-dashboard-tag'],depth0,{"name":"ds-dashboard-tag","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "</a>\n";
},"usePartial":true,"useData":true}));

Handlebars.registerPartial("ds-dashboard-tag", this["ts"]["templates"]["ds-dashboard-tag"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "    background-color: "
    + this.escapeExpression(((helper = (helper = helpers.bgcolor || (depth0 != null ? depth0.bgcolor : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"bgcolor","hash":{},"data":data}) : helper)))
    + ";\n";
},"3":function(depth0,helpers,partials,data) {
    var helper;

  return "    color: "
    + this.escapeExpression(((helper = (helper = helpers.fgcolor || (depth0 != null ? depth0.fgcolor : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"fgcolor","hash":{},"data":data}) : helper)))
    + ";\n  ";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<span class=\"badge badge-neutral\" data-ds-tag=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\"\n  style=\"\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.bgcolor : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.fgcolor : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n  \">\n  "
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n</span>\n";
},"useData":true}));

Handlebars.registerPartial("ds-edit-bar-cell", this["ts"]["templates"]["ds-edit-bar-cell"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"ds-edit-bar ds-edit-bar-cell alert alert-info\" align=\"left\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  <span class=\"badge ds-badge-cell\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\"><i class=\"fa fa-cog\"></i> cell "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "</span>\n  <div class=\"btn-group btn-group-sm\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\" style=\"display:none\">\n    "
    + alias2((helpers.actions || (depth0 && depth0.actions) || helpers.helperMissing).call(depth0,"edit-bar-cell","button",{"name":"actions","hash":{},"data":data}))
    + "\n  </div>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-edit-bar-definition", this["ts"]["templates"]["ds-edit-bar-definition"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"container\">\n  <div class=\"ds-edit-bar ds-edit-bar-definition alert alert-info\" align=\"left\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n    <span class=\"badge ds-badge-cell\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\"><i class=\"fa fa-cog\"></i> definition "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "</span>\n  </div>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-edit-bar-item-details", this["ts"]["templates"]["ds-edit-bar-item-details"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"row\" id=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "-details\">\n  <div class=\"col-md-12\">\n"
    + ((stack1 = this.invokePartial(partials['ds-item-property-sheet'],depth0,{"name":"ds-item-property-sheet","data":data,"indent":"    ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  </div>\n</div>\n";
},"usePartial":true,"useData":true}));

Handlebars.registerPartial("ds-edit-bar-item", this["ts"]["templates"]["ds-edit-bar-item"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"row\" data-ds-show=\"edit\" style=\"display:none\">\n  <div class=\"col-md-12\">\n    <div class=\"ds-edit-bar ds-edit-bar-item\" align=\"left\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n      <span class=\"badge ds-badge-item\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\"><i class=\"fa fa-cog\"></i> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_type : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "</span>\n      <div class=\"btn-group btn-group-sm\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\" style=\"display:none\">\n        "
    + alias2((helpers.actions || (depth0 && depth0.actions) || helpers.helperMissing).call(depth0,"edit-bar-item","button",{"name":"actions","hash":{},"data":data}))
    + "\n      </div>\n    </div>\n  </div>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-edit-bar-row", this["ts"]["templates"]["ds-edit-bar-row"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "    <div class=\"ds-edit-bar ds-edit-bar-row\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n      <span class=\"badge ds-badge-row\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\"><i class=\"fa fa-cog\"></i> row "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "</span>\n      <div class=\"btn-group btn-group-sm\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\" style=\"display:none\">\n        "
    + alias2((helpers.actions || (depth0 && depth0.actions) || helpers.helperMissing).call(depth0,"edit-bar-row","button",{"name":"actions","hash":{},"data":data}))
    + "\n      </div>\n    </div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-edit-bar-section", this["ts"]["templates"]["ds-edit-bar-section"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "    <div class=\"ds-edit-bar ds-edit-bar-section\" align=\"left\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n      <span class=\"badge ds-badge-section\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\"><i class=\"fa fa-cog\"></i> section "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "</span>\n      <div class=\"btn-group btn-group-sm\" data-ds-item-id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\" style=\"display:none\">\n        "
    + alias2((helpers.actions || (depth0 && depth0.actions) || helpers.helperMissing).call(depth0,"edit-bar-section","button",{"name":"actions","hash":{},"data":data}))
    + "\n      </div>\n    </div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-edit-bar", this["ts"]["templates"]["ds-edit-bar"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression;

  return "<div class=\"row\" data-ds-show=\"edit\" style=\"display:none\">\n  <div class=\"col-md-12\">\n    <i title=\"Drag to reposition\" class=\"fa fa-align-justify pull-right ds-drag-handle\" data-ds-item-id=\""
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\"></i>\n    "
    + alias1((helpers['ds-edit-bar'] || (depth0 && depth0['ds-edit-bar']) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"ds-edit-bar","hash":{},"data":data}))
    + "\n  </div>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-edit-menu", this["ts"]["templates"]["ds-edit-menu"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div data-ds-show=\"edit\" class=\"btn-group\" align=\"left\" style=\"display:none\">\n  <button type=\"button\"\n          class=\"btn btn-default btn-xs dropdown-toggle\"\n          data-toggle=\"dropdown\">\n          <i class=\"fa fa-cog\"></i> <span class=\"caret\"></span>\n  </button>\n  <ul class=\"dropdown-menu dropdown-menu-right ds-edit-menu\" role=\"menu\">\n    "
    + this.escapeExpression((helpers.actions || (depth0 && depth0.actions) || helpers.helperMissing).call(depth0,"presentation-edit",{"name":"actions","hash":{},"data":data}))
    + "\n  </ul>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-preferences-renderer-entry", this["ts"]["templates"]["ds-preferences-renderer-entry"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "checked=\"checked\"";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"radio\">\n  <label for=\"chartRenderRadios-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.renderer : depth0)) != null ? stack1.name : stack1), depth0))
    + "\">\n    <input type=\"radio\"\n           name=\"chartRenderRadios\"\n           id=\"chartRenderRadios-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.renderer : depth0)) != null ? stack1.name : stack1), depth0))
    + "\"\n           value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.renderer : depth0)) != null ? stack1.name : stack1), depth0))
    + "\"\n           "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.checked : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n           onclick=\"dsSetPref('renderer', '"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.renderer : depth0)) != null ? stack1.name : stack1), depth0))
    + "')\">\n    "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.renderer : depth0)) != null ? stack1.name : stack1), depth0))
    + "\n  </label>\n  <p><small>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.renderer : depth0)) != null ? stack1.description : stack1), depth0))
    + "</small></p>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-row-edit-bar", this["ts"]["templates"]["ds-row-edit-bar"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"row\" data-ds-show=\"edit\">\n  <div class=\"col-md-12\">\n    <div class=\"ds-edit-bar ds-row-edit-bar bs-callout bs-callout-info\">\n\n\n\n\n      row <i class=\"fa fa-trash-o pull-right\"></i>\n\n\n\n    </div>\n  </div>\n</div>\n";
},"useData":true}));

Handlebars.registerPartial("ds-title-bar", this["ts"]["templates"]["ds-title-bar"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1), depth0))
    + "</h3>";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression((helpers['ds-edit-bar'] || (depth0 && depth0['ds-edit-bar']) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"ds-edit-bar","hash":{},"data":data}))
    + "\n<div class=\"row\">\n  <div class=\"col-md-10\">\n    "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n  </div>\n  <div class=\"col-md-2\" align=\"right\">\n"
    + ((stack1 = this.invokePartial(partials['ds-action-menu'],depth0,{"name":"ds-action-menu","data":data,"indent":"    ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  </div>\n</div>\n";
},"usePartial":true,"useData":true}));

Handlebars.registerPartial("dashboard-metadata-panel", this["ts"]["templates"]["edit"]["dashboard-metadata-panel"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials['ds-dashboard-tag'],depth0,{"name":"ds-dashboard-tag","data":data,"indent":"            ","helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"3":function(depth0,helpers,partials,data) {
    var helper;

  return "          <tr>\n            <th>Imported From</th><td class=\"ds-editable\" id=ds-info-panel-edit-imported-from\" data-type=\"text\"><a href=\""
    + this.escapeExpression(((helper = (helper = helpers.imported_from || (depth0 != null ? depth0.imported_from : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"imported_from","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">Link</a></td>\n          </tr>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"row ds-info-edit-panel\">\n  <!-- Column 1 -->\n  <div class=\"col-md-5\">\n    <h4>Properties</h4>\n\n    <table class=\"table-condensed\">\n      <tbody>\n        <tr>\n          <th>Title</th><td class=\"ds-editable\" id=\"ds-info-panel-edit-title\" data-type=\"text\">"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</td>\n        </tr>\n\n        <tr>\n          <th>Category</th><td class=\"ds-editable\" id=\"ds-info-panel-edit-category\" data-type=\"text\">"
    + alias3(((helper = (helper = helpers.category || (depth0 != null ? depth0.category : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"category","hash":{},"data":data}) : helper)))
    + "</td>\n        </tr>\n\n        <tr>\n          <th>Summary</th><td class=\"ds-editable\" id=\"ds-info-panel-edit-summary\" data-type=\"text\">"
    + alias3(((helper = (helper = helpers.summary || (depth0 != null ? depth0.summary : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"summary","hash":{},"data":data}) : helper)))
    + "</td>\n        </tr>\n\n        <tr>\n          <th>Tags</th>\n          <td>\n            <!--\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.tags : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            -->\n\n            <input id=\"ds-info-panel-edit-tags\" class=\"form-control tm-input tm-input-success tm-input-info\"/>\n\n          </td>\n        </tr>\n\n        <tr>\n          <th>Created</th><td>"
    + alias3((helpers.moment || (depth0 && depth0.moment) || alias1).call(depth0,"MMMM Do YYYY, h:mm:ss a",(depth0 != null ? depth0.creation_date : depth0),{"name":"moment","hash":{},"data":data}))
    + "</td>\n        </tr>\n        <tr>\n          <th>Last Modified</th><td>"
    + alias3((helpers.moment || (depth0 && depth0.moment) || alias1).call(depth0,"MMMM Do YYYY, h:mm:ss a",(depth0 != null ? depth0.last_modified_date : depth0),{"name":"moment","hash":{},"data":data}))
    + "</td>\n        </tr>\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.imported_from : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n      </tbody>\n    </table>\n  </div> <!-- column -->\n\n  <!-- Column 2 -->\n  <div class=\"col-md-7\">\n    <h4>Description</h4>\n    <div class=\"ds-editable\"\n         id=\"ds-info-panel-edit-description\"\n         data-type=\"textarea\"\n         data-rows=\"9\"\n         data-showbuttons=\"bottom\"\n         data-inputclass=\"ds-dashboard-description\"\n         style=\"text-align:top;\">\n      "
    + alias3((helpers.markdown || (depth0 && depth0.markdown) || alias1).call(depth0,(depth0 != null ? depth0.description : depth0),{"name":"markdown","hash":{},"data":data}))
    + "\n    </div>\n  </div>\n\n</div>\n";
},"usePartial":true,"useData":true}));

Handlebars.registerPartial("dashboard-query-panel", this["ts"]["templates"]["edit"]["dashboard-query-panel"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials['dashboard-query-row'],depth0,{"name":"dashboard-query-row","data":data,"indent":"          ","helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"ds-query-edit-panel\" id=\"ds-query-panel\">\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div class=\"btn-group btn-group-sm\">\n        "
    + this.escapeExpression((helpers.actions || (depth0 && depth0.actions) || helpers.helperMissing).call(depth0,"dashboard-queries","button",{"name":"actions","hash":{},"data":data}))
    + "\n      </div>\n      <br/>\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <table class=\"table table-striped\">\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.definition : depth0)) != null ? stack1.queries : stack1),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </table>\n    </div>\n  </div>\n\n</div>\n";
},"usePartial":true,"useData":true}));

Handlebars.registerPartial("dashboard-query-row", this["ts"]["templates"]["edit"]["dashboard-query-row"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<tr data-ds-query-name=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n  <th data-ds-query-name=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" class=\"ds-query-name\">"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</th>\n  <td data-ds-query-name=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" class=\"ds-query-target\">"
    + alias3(((helper = (helper = helpers.targets || (depth0 != null ? depth0.targets : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"targets","hash":{},"data":data}) : helper)))
    + "</td>\n  <td>\n    <div class=\"btn-group\">\n      <button class=\"btn btn-default btn-small ds-duplicate-query-button\"\n              data-toggle=\"tooltip\"\n              title=\"Duplicate this query\"\n              data-ds-query-name=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n        <i class=\"fa fa-copy\"></i>\n      </button>\n      <button class=\"btn btn-default btn-small ds-delete-query-button\"\n              data-toggle=\"tooltip\"\n              title=\"Delete this query\"\n              data-ds-query-name=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n        <i class=\"fa fa-trash-o\"></i>\n      </button>\n    </div>\n  </td>\n</tr>\n";
},"useData":true}));

Handlebars.registerPartial("ds-item-property-sheet", this["ts"]["templates"]["edit"]["ds-item-property-sheet"] = Handlebars.template({"1":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "      <tr>\n        <td><span class=\"ds-property-category\">"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.category : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "<span class=\"ds-property-name\">"
    + alias3(((helper = (helper = helpers.property_name || (depth0 != null ? depth0.property_name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"property_name","hash":{},"data":data}) : helper)))
    + "</span></td>\n        <td data-ds-property-name=\""
    + alias3(((helper = (helper = helpers.property_name || (depth0 != null ? depth0.property_name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"property_name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3((helpers.interactive_property || (depth0 && depth0.interactive_property) || alias1).call(depth0,depth0,(depths[1] != null ? depths[1].item : depths[1]),{"name":"interactive_property","hash":{},"data":data}))
    + "</td>\n      </tr>\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return this.escapeExpression(((helper = (helper = helpers.category || (depth0 != null ? depth0.category : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"category","hash":{},"data":data}) : helper)))
    + "</span> / ";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "<table class=\"ds-property-sheet\">\n  <tbody>\n    <tr><th>Property</th><th>Value</th></tr>\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = ((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.meta : stack1)) != null ? stack1.interactive_properties : stack1),{"name":"each","hash":{},"fn":this.program(1, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </tbody>\n</table>\n";
},"useData":true,"useDepths":true}));

this["ts"]["templates"]["action-menu-button"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.divider : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.program(4, data, 0),"data":data})) != null ? stack1 : "");
},"2":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <li class=\"divider\" data-ds-show=\""
    + alias3(((helper = (helper = helpers.show || (depth0 != null ? depth0.show : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"show","hash":{},"data":data}) : helper)))
    + "\" data-ds-hide=\""
    + alias3(((helper = (helper = helpers.hide || (depth0 != null ? depth0.hide : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"hide","hash":{},"data":data}) : helper)))
    + "\"/>\n";
},"4":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <li class=\""
    + alias3(((helper = (helper = helpers.css || (depth0 != null ? depth0.css : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"css","hash":{},"data":data}) : helper)))
    + "\"\n          role=\"presentation\"\n          data-ds-action=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\"\n          data-ds-category=\""
    + alias3(((helper = (helper = helpers.category || (depth0 != null ? depth0.category : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"category","hash":{},"data":data}) : helper)))
    + "\"\n          data-ds-show=\""
    + alias3(((helper = (helper = helpers.show || (depth0 != null ? depth0.show : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"show","hash":{},"data":data}) : helper)))
    + "\"\n          data-ds-hide=\""
    + alias3(((helper = (helper = helpers.hide || (depth0 != null ? depth0.hide : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"hide","hash":{},"data":data}) : helper)))
    + "\">\n          <a role=\"menuitem\" href=\"#\"><i class=\"fa-fw "
    + alias3(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i> "
    + alias3(((helper = (helper = helpers.display || (depth0 != null ? depth0.display : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"display","hash":{},"data":data}) : helper)))
    + "</a>\n        </li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"btn-group btn-group-sm\" align=\"left\">\n  <button type=\"button\"\n    class=\"btn btn-default dropdown-toggle "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.css : stack1), depth0))
    + "\"\n    data-toggle=\"dropdown\"\n    title=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.display : stack1), depth0))
    + "\">\n    <i class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\"></i> <span class=\"caret\"></span>\n  </button>\n  <ul class=\"dropdown-menu dropdown-menu-left ds-edit-menu\" role=\"menu\">\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.actions : stack1),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </ul>\n</div>\n";
},"useData":true});

this["ts"]["templates"]["action"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "  <li class=\"divider\" data-ds-show=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.show : stack1), depth0))
    + "\" data-ds-hide=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.hide : stack1), depth0))
    + "\"/>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression;

  return "  <li role=\"presentation\"\n    class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.css : stack1), depth0))
    + "\"\n    data-ds-action=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.name : stack1), depth0))
    + "\"\n    data-ds-category=\""
    + alias2(((helper = (helper = helpers.category || (depth0 != null ? depth0.category : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"category","hash":{},"data":data}) : helper)))
    + "\"\n    data-ds-show=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.show : stack1), depth0))
    + "\"\n    data-ds-hide=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.hide : stack1), depth0))
    + "\">\n    <a role=\"menuitem\" href=\"#\"><i class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\"></i> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.display : stack1), depth0))
    + "</a>\n  </li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.divider : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});

this["ts"]["templates"]["action_button"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression;

  return "  <button class=\"btn "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1['class'] : stack1),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.program(6, data, 0),"data":data})) != null ? stack1 : "")
    + "\"\n    data-ds-action=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.name : stack1), depth0))
    + "\"\n    data-ds-category=\""
    + alias2(((helper = (helper = helpers.category || (depth0 != null ? depth0.category : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"category","hash":{},"data":data}) : helper)))
    + "\"\n    data-ds-show=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.show : stack1), depth0))
    + "\"\n    data-ds-hide=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.hide : stack1), depth0))
    + "\"\n    data-toggle=\"tooltip\"\n    title=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.display : stack1), depth0))
    + "\">\n    <i class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\"></i>\n  </button>\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.css : stack1), depth0));
},"6":function(depth0,helpers,partials,data) {
    return "btn-default";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.divider : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});

this["ts"]["templates"]["edit"]["dashboard_panel"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<ul class=\"nav nav-pills\">\n  <li class=\"active\"><a href=\"#metadata\" data-toggle=\"tab\">Metadata</a></li>\n  <li><a href=\"#queries\" data-toggle=\"tab\" id=\"ds-edit-tab-queries\">Queries</a></li>\n</ul>\n\n<div class=\"tab-content\">\n  <div class=\"tab-pane active\" id=\"metadata\">\n"
    + ((stack1 = this.invokePartial(partials['dashboard-metadata-panel'],depth0,{"name":"dashboard-metadata-panel","data":data,"indent":"    ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  </div>\n  <div class=\"tab-pane\" id=\"queries\">\n"
    + ((stack1 = this.invokePartial(partials['dashboard-query-panel'],depth0,{"name":"dashboard-query-panel","data":data,"indent":"    ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  </div>\n\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["edit"]["item_source"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"ds-item-source\">\n  <pre>"
    + this.escapeExpression((helpers.json || (depth0 && depth0.json) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"json","hash":{},"data":data}))
    + "</pre>\n</div>\n";
},"useData":true});

this["ts"]["templates"]["flot"]["discrete_bar_tooltip"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression;

  return "<table class=\"table-condensed\">\n  <tbody>\n    <tr>\n      <td class=\"ds-tooltip-label\">\n        <span class=\"badge\" style=\"background-color: "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.color : stack1), depth0))
    + "\"><i></i></span>\n        "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.label : stack1), depth0))
    + "\n      </td>\n      <td class=\"ds-tooltip-value\">\n        "
    + alias2(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "\n      </td>\n    </tr>\n  </tbody>\n</table>\n";
},"useData":true});

this["ts"]["templates"]["flot"]["donut_tooltip"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing, alias4="function";

  return "<table class=\"table-condensed\">\n  <tbody>\n    <tr>\n      <td class=\"ds-tooltip-label\">\n        <span class=\"badge\" style=\"background-color: "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.color : stack1), depth0))
    + "\"><i></i></span>\n        "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.label : stack1), depth0))
    + "\n      </td>\n      <td class=\"ds-tooltip-value\">\n        "
    + alias2(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + " / "
    + alias2(((helper = (helper = helpers.percent || (depth0 != null ? depth0.percent : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(depth0,{"name":"percent","hash":{},"data":data}) : helper)))
    + "\n      </td>\n    </tr>\n  </tbody>\n</table>\n";
},"useData":true});

this["ts"]["templates"]["flot"]["tooltip"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.lambda, alias2=this.escapeExpression;

  return "      <tr>\n        <td class=\"ds-tooltip-label\">\n          <span class=\"badge\" style=\"background-color: "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.color : stack1), depth0))
    + "\"><i></i></span>\n          "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.label : stack1), depth0))
    + "\n        </td>\n        <td class=\"ds-tooltip-value\">\n          "
    + alias2(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "\n        </td>\n      </tr>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<table class=\"table-condensed\">\n  <tbody>\n    <tr>\n      <td>\n        <span class=\"ds-tooltip-time\">"
    + this.escapeExpression((helpers.moment || (depth0 && depth0.moment) || helpers.helperMissing).call(depth0,"dd, M-D-YYYY, h:mm A",(depth0 != null ? depth0.time : depth0),{"name":"moment","hash":{},"data":data}))
    + "</span>\n      </td>\n    </tr>\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.items : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </tbody>\n</table>\n";
},"useData":true});

this["ts"]["templates"]["listing"]["dashboard_list"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials['ds-dashboard-listing-entry'],depth0,{"name":"ds-dashboard-listing-entry","data":data,"indent":"      ","helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"3":function(depth0,helpers,partials,data) {
    return "      <tr><td><h3>No dashboards defined</h3></td></tr>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<table class=\"table table-hover table-condensed\">\n  <tbody>\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.dashboards : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "  </tbody>\n</table>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["listing"]["dashboard_tag_list"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "active";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.count : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "      <li data-ds-tag=\""
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n        <a href=\"/dashboards/tagged/"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n        "
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n        <span class=\"badge badge-primary pull-right\">"
    + alias3(((helper = (helper = helpers.count || (depth0 != null ? depth0.count : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"count","hash":{},"data":data}) : helper)))
    + "</span>\n        </a>\n      </li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<ul class=\"nav nav-pills nav-stacked\">\n  <li class=\""
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.tag : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">\n    <a href=\"/dashboards\">\n      All <span class=\"badge badge-primary pull-right\"></span>\n    </a>\n  </li>\n\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.tags : depth0),{"name":"each","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n";
},"useData":true});

this["ts"]["templates"]["models"]["bar_chart"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<div class=\"ds-item ds-graph ds-bar-chart "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\"\n  id=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <div class=\"ds-graph-holder "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <svg class=\""
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\"></svg>\n  </div>\n  <div class=\"ds-legend-holder\" id=\"ds-legend-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  </div>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["cell"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return " align=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.align : stack1), depth0))
    + "\" ";
},"3":function(depth0,helpers,partials,data) {
    return "<div class=\""
    + this.escapeExpression((helpers.style_class || (depth0 && depth0.style_class) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"style_class","hash":{},"data":data}))
    + "\">";
},"5":function(depth0,helpers,partials,data) {
    return "    "
    + this.escapeExpression((helpers.item || (depth0 && depth0.item) || helpers.helperMissing).call(depth0,depth0,{"name":"item","hash":{},"data":data}))
    + "\n";
},"7":function(depth0,helpers,partials,data) {
    return "</div>";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<div class=\"ds-cell "
    + alias2((helpers.span || (depth0 && depth0.span) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"span","hash":{},"data":data}))
    + " "
    + alias2((helpers.offset || (depth0 && depth0.offset) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"offset","hash":{},"data":data}))
    + " "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + " "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\"\n     "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.align : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " id=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\"\n       >\n"
    + ((stack1 = this.invokePartial(partials['ds-edit-bar'],depth0,{"name":"ds-edit-bar","data":data,"indent":"       ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.style : stack1),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.items : stack1),{"name":"each","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.style : stack1),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n      <i data-ds-show=\"\"\n        style=\"display:none\"\n        title=\"Drag to resize\"\n        class=\"fa fa-arrows-alt pull-right ds-resize-handle\"\n        data-ds-item-id=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\"></i>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["comparison_summation_table"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "table-striped";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.query_other : stack1)) != null ? stack1.name : stack1), depth0));
},"5":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.query : stack1)) != null ? stack1.name : stack1), depth0));
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression, alias2=helpers.helperMissing;

  return "<div class=\"ds-item\" id=\""
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <table class=\"table table-condensed ds-timeshift-summation-table "
    + alias1((helpers.height || (depth0 && depth0.height) || alias2).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + " "
    + alias1((helpers.css_class || (depth0 && depth0.css_class) || alias2).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\n                "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.striped : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">\n    <thead>\n      <tr>\n        <th>&nbsp;</th>\n        <th>"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.query_other : stack1),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</th>\n        <th>"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.query : stack1),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</th>\n        <th>Delta</th>\n        <th>%</th>\n      </tr>\n    </thead>\n    <tbody/>\n  </table>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["comparison_summation_table_body"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<!-- TODO: configure which rows to include. Sum doesnt make sense for rates -->\n<tr>\n  <th>Average</th>\n    <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.mean : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.mean : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.mean_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.mean : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.mean_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.mean_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n<tr>\n  <th>Min</th>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.min : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.min : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.min_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.min : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.min_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.min_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n<tr>\n  <th>Max</th>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.max : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.max : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.max_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.max : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.max_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.max_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n<tr>\n  <th>Sum</th>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.sum : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.sum : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.sum_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.sum : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.sum_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.sum_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n";
},"useData":true});

this["ts"]["templates"]["models"]["definition"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "    "
    + this.escapeExpression((helpers.item || (depth0 && depth0.item) || helpers.helperMissing).call(depth0,depth0,{"name":"item","hash":{},"data":data}))
    + "\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression;

  return "<div class=\""
    + alias1((helpers.css_class || (depth0 && depth0.css_class) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + " ds-dashboard\" id=\""
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-edit-bar'],depth0,{"name":"ds-edit-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.items : stack1),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["discrete_bar_chart"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<div class=\"ds-item ds-graph ds-discrete-bar-chart "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\"\n  id=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <div class=\"ds-graph-holder "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <svg class=\""
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\"></svg>\n  </div>\n  <div class=\"ds-legend-holder\" id=\"ds-legend-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  </div>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["donut_chart"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<div class=\"ds-item ds-graph ds-donut-chart "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\"\n  id=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <div class=\"ds-graph-holder "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <svg class=\""
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\"></svg>\n  </div>\n  <div class=\"ds-legend-holder\" id=\"ds-legend-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  </div>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["heading"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "class=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.css_class : stack1), depth0))
    + "\"";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return "<small>"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.description : stack1), depth0))
    + "</small>";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"ds-item ds-heading\" id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  "
    + alias2((helpers['ds-edit-bar'] || (depth0 && depth0['ds-edit-bar']) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"ds-edit-bar","hash":{},"data":data}))
    + "\n  <h"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.level : stack1), depth0))
    + " "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.css_class : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n    "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.text : stack1), depth0))
    + " "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.description : stack1),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n      </h"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.level : stack1), depth0))
    + ">\n</div>\n";
},"useData":true});

this["ts"]["templates"]["models"]["jumbotron_singlestat"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing;

  return "<div class=\"ds-item ds-jumbotron-singlestat\" id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  "
    + alias2((helpers['ds-edit-bar'] || (depth0 && depth0['ds-edit-bar']) || alias3).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"ds-edit-bar","hash":{},"data":data}))
    + "\n  <div class=\""
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias3).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\">\n    <span class=\"value\"></span>\n    <div class=\"annotations-wrapper\">\n      <div class=\"annotations\">\n        <span class=\"diff\"></span>\n        <span class=\"unit\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.units : stack1), depth0))
    + "</span>\n      </div>\n    </div>\n    <div><h3>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1), depth0))
    + "</h3></div>\n  </div>\n</div>\n";
},"useData":true});

this["ts"]["templates"]["models"]["markdown"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <pre>"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.text : stack1), depth0))
    + "</pre>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return "   "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.expanded_text : stack1),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.program(6, data, 0),"data":data})) != null ? stack1 : "")
    + "\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression((helpers.markdown || (depth0 && depth0.markdown) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.expanded_text : stack1),{"name":"markdown","hash":{},"data":data}));
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return this.escapeExpression((helpers.markdown || (depth0 && depth0.markdown) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.text : stack1),{"name":"markdown","hash":{},"data":data}));
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "<div class=\"ds-item ds-markdown "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + " "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\" id=\""
    + alias2(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  "
    + alias2((helpers['ds-edit-bar'] || (depth0 && depth0['ds-edit-bar']) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"ds-edit-bar","hash":{},"data":data}))
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.raw : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});

this["ts"]["templates"]["models"]["percentage_table"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"ds-item\" id=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <div class=\"ds-percentage-table-holder\">\n    <h4>No data</h4>\n  </div>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["percentage_table_data"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "table-striped";
},"3":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "    <thead>\n      <tr>\n        <th>&nbsp;</th>\n        <th>%</th>\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.include_sums : stack1),{"name":"if","hash":{},"fn":this.program(4, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </tr>\n    </thead>\n\n    <tbody>\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.query : depth0)) != null ? stack1.data : stack1),{"name":"each","hash":{},"fn":this.program(6, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.include_sums : stack1),{"name":"if","hash":{},"fn":this.program(9, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </tbody>\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <th>"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.transform : stack1), depth0))
    + "</th>\n";
},"6":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "        <tr>\n          <th>"
    + alias2(((helper = (helper = helpers.target || (depth0 != null ? depth0.target : depth0)) != null ? helper : alias1),(typeof helper === "function" ? helper.call(depth0,{"name":"target","hash":{},"data":data}) : helper)))
    + "</th>\n          <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,",.2%",((stack1 = (depth0 != null ? depth0.summation : depth0)) != null ? stack1.percent : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depths[1] != null ? depths[1].item : depths[1])) != null ? stack1.include_sums : stack1),{"name":"if","hash":{},"fn":this.program(7, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </tr>\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <td>"
    + this.escapeExpression((helpers.format || (depth0 && depth0.format) || helpers.helperMissing).call(depth0,",.0f",((stack1 = (depth0 != null ? depth0.summation : depth0)) != null ? stack1.percent_value : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n";
},"9":function(depth0,helpers,partials,data) {
    var stack1;

  return "        <tr>\n          <th>Total</th>\n          <td></td>\n          <td>"
    + this.escapeExpression((helpers.format || (depth0 && depth0.format) || helpers.helperMissing).call(depth0,",.0f",((stack1 = ((stack1 = (depth0 != null ? depth0.query : depth0)) != null ? stack1.summation : stack1)) != null ? stack1.percent_value : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n        </tr>\n";
},"11":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "    <thead>\n      <tr>\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.include_sums : stack1),{"name":"if","hash":{},"fn":this.program(12, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.query : depth0)) != null ? stack1.data : stack1),{"name":"each","hash":{},"fn":this.program(14, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </tr>\n    </thead>\n\n    <tbody>\n      <tr>\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.include_sums : stack1),{"name":"if","hash":{},"fn":this.program(16, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.query : depth0)) != null ? stack1.data : stack1),{"name":"each","hash":{},"fn":this.program(18, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </tr>\n\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.include_sums : stack1),{"name":"if","hash":{},"fn":this.program(20, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </tbody>\n";
},"12":function(depth0,helpers,partials,data) {
    return "          <th>&nbsp;</th>\n          <th>Total</th>\n";
},"14":function(depth0,helpers,partials,data) {
    var helper;

  return "          <th>"
    + this.escapeExpression(((helper = (helper = helpers.target || (depth0 != null ? depth0.target : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"target","hash":{},"data":data}) : helper)))
    + "</th>\n";
},"16":function(depth0,helpers,partials,data) {
    return "          <th>%</th>\n          <th></th>\n";
},"18":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <td>"
    + this.escapeExpression((helpers.format || (depth0 && depth0.format) || helpers.helperMissing).call(depth0,",.2%",((stack1 = (depth0 != null ? depth0.summation : depth0)) != null ? stack1.percent : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n";
},"20":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=this.escapeExpression;

  return "        <tr>\n          <th>"
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.transform : stack1), depth0))
    + "</th>\n          <td>"
    + alias1((helpers.format || (depth0 && depth0.format) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = ((stack1 = (depth0 != null ? depth0.query : depth0)) != null ? stack1.summation : stack1)) != null ? stack1.percent_value : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.query : depth0)) != null ? stack1.data : stack1),{"name":"each","hash":{},"fn":this.program(21, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </tr>\n";
},"21":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "            <td>"
    + this.escapeExpression((helpers.format || (depth0 && depth0.format) || helpers.helperMissing).call(depth0,((stack1 = (depths[2] != null ? depths[2].item : depths[2])) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.summation : depth0)) != null ? stack1.percent_value : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "<table class=\"table table-condensed ds-percentage-table "
    + this.escapeExpression((helpers.css_class || (depth0 && depth0.css_class) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\n                "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.striped : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">\n\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.invert_axes : stack1),{"name":"if","hash":{},"fn":this.program(3, data, 0, blockParams, depths),"inverse":this.program(11, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "\n</table>\n";
},"useData":true,"useDepths":true});

this["ts"]["templates"]["models"]["row"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "<div class=\""
    + this.escapeExpression((helpers.style_class || (depth0 && depth0.style_class) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"style_class","hash":{},"data":data}))
    + "\">";
},"3":function(depth0,helpers,partials,data) {
    return "        "
    + this.escapeExpression((helpers.item || (depth0 && depth0.item) || helpers.helperMissing).call(depth0,depth0,{"name":"item","hash":{},"data":data}))
    + "\n";
},"5":function(depth0,helpers,partials,data) {
    return "</div>";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression;

  return "<div class=\"ds-row\" id=\""
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.style : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = this.invokePartial(partials['ds-edit-bar'],depth0,{"name":"ds-edit-bar","data":data,"indent":"    ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "    <div class=\"row "
    + alias1((helpers.css_class || (depth0 && depth0.css_class) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\">\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.items : stack1),{"name":"each","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n    "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.style : stack1),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["section"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "<div class=\""
    + this.escapeExpression((helpers.style_class || (depth0 && depth0.style_class) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"style_class","hash":{},"data":data}))
    + "\">";
},"3":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <h"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.level : stack1), depth0))
    + " class=\"ds-section-heading\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1), depth0))
    + "\n        "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.description : stack1),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n          </h"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.level : stack1), depth0))
    + ">\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return "<small>"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.description : stack1), depth0))
    + "</small>";
},"6":function(depth0,helpers,partials,data) {
    return "        <hr/>\n";
},"8":function(depth0,helpers,partials,data) {
    return "      "
    + this.escapeExpression((helpers.item || (depth0 && depth0.item) || helpers.helperMissing).call(depth0,depth0,{"name":"item","hash":{},"data":data}))
    + "\n";
},"10":function(depth0,helpers,partials,data) {
    return "</div>";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "<div class=\"ds-section "
    + alias2((helpers.container_class || (depth0 && depth0.container_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"container_class","hash":{},"data":data}))
    + " "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\" id=\""
    + alias2(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-edit-bar'],depth0,{"name":"ds-edit-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.style : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    <div>\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.horizontal_rule : stack1),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.items : stack1),{"name":"each","hash":{},"fn":this.program(8, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.style : stack1),{"name":"if","hash":{},"fn":this.program(10, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["separator"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "class=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.css_class : stack1), depth0))
    + "\"";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression;

  return "<div class=\"ds-item ds-separator\" id=\""
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  "
    + alias1((helpers['ds-edit-bar'] || (depth0 && depth0['ds-edit-bar']) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"ds-edit-bar","hash":{},"data":data}))
    + "\n  <hr "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.css_class : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "></hr>\n</div>\n";
},"useData":true});

this["ts"]["templates"]["models"]["simple_time_series"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "<div class=\"ds-item ds-graph ds-simple-time-series "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\" id=\""
    + alias2(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <div class=\"ds-graph-holder "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <svg class=\""
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\"></svg>\n  </div>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["singlegraph"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "<div class=\"ds-item ds-graph ds-singlegraph "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\" id=\""
    + alias2(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <span class=\"ds-label\"></span>\n  <span class=\"value\"></span>\n  <div class=\"ds-graph-holder "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <svg class=\""
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\"></svg>\n  </div>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["singlestat"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing;

  return "<div class=\"ds-item\" id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  "
    + alias2((helpers['ds-edit-bar'] || (depth0 && depth0['ds-edit-bar']) || alias3).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"ds-edit-bar","hash":{},"data":data}))
    + "\n  <div class=\"ds-singlestat "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.css_class : stack1), depth0))
    + " "
    + alias2((helpers.height || (depth0 && depth0.height) || alias3).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <h3>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1), depth0))
    + "</h3>\n    <p><span class=\"value\"></span><span class=\"unit\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.units : stack1), depth0))
    + "</span><span class=\"diff\"></span></p>\n  </div>\n</div>\n";
},"useData":true});

this["ts"]["templates"]["models"]["stacked_area_chart"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<div class=\"ds-item ds-graph ds-stacked-area-chart "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\"\n  id=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <div class=\"ds-graph-holder "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <svg class=\""
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\"></svg>\n  </div>\n  <div class=\"ds-legend-holder\" id=\"ds-legend-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  </div>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["standard_time_series"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<div class=\"ds-item ds-graph ds-standard-time-series "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\"\n  id=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <div class=\"ds-graph-holder "
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <svg class=\""
    + alias2((helpers.height || (depth0 && depth0.height) || alias1).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\"></svg>\n  </div>\n  <div class=\"ds-legend-holder\" id=\"ds-legend-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  </div>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["summation_table"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "table-striped";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression, alias2=helpers.helperMissing;

  return "<div class=\"ds-item\" id=\""
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <table class=\"table table-condensed ds-summation-table "
    + alias1((helpers.height || (depth0 && depth0.height) || alias2).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + " "
    + alias1((helpers.css_class || (depth0 && depth0.css_class) || alias2).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\n                "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.striped : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">\n    <thead>\n      <tr>\n        <th>&nbsp;</th>\n        <th>current</th>\n        <th>min</th>\n        <th>max</th>\n        <th>mean</th>\n        <th>median</th>\n        <th>sum</th>\n      </tr>\n    </thead>\n    <tbody>\n    </tbody>\n  </table>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["summation_table_row"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "      <span class=\"ds-summation-color-cell\" style=\"background:"
    + this.escapeExpression(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"color","hash":{},"data":data}) : helper)))
    + "\"></span>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression, alias2=helpers.helperMissing;

  return "<tr>\n    <th>\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.show_color : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      "
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.target : stack1), depth0))
    + "</th>\n    <td>"
    + alias1((helpers.format || (depth0 && depth0.format) || alias2).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = ((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.summation : stack1)) != null ? stack1.last : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n    <td>"
    + alias1((helpers.format || (depth0 && depth0.format) || alias2).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = ((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.summation : stack1)) != null ? stack1.min : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n    <td>"
    + alias1((helpers.format || (depth0 && depth0.format) || alias2).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = ((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.summation : stack1)) != null ? stack1.max : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n    <td>"
    + alias1((helpers.format || (depth0 && depth0.format) || alias2).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = ((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.summation : stack1)) != null ? stack1.mean : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n    <td>"
    + alias1((helpers.format || (depth0 && depth0.format) || alias2).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = ((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.summation : stack1)) != null ? stack1.median : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n    <td>"
    + alias1((helpers.format || (depth0 && depth0.format) || alias2).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = ((stack1 = (depth0 != null ? depth0.series : depth0)) != null ? stack1.summation : stack1)) != null ? stack1.sum : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  </tr>\n";
},"useData":true});

this["ts"]["templates"]["models"]["timerstat"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing;

  return "<div class=\"ds-item\" id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n  "
    + alias2((helpers['ds-edit-bar'] || (depth0 && depth0['ds-edit-bar']) || alias3).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"ds-edit-bar","hash":{},"data":data}))
    + "\n  <div class=\"ds-timerstat "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.css_class : stack1), depth0))
    + " "
    + alias2((helpers.height || (depth0 && depth0.height) || alias3).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + "\">\n    <h3>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.title : stack1), depth0))
    + "</h3>\n    <p class=\"data\"></p>\n  </div>\n</div>\n";
},"useData":true});

this["ts"]["templates"]["models"]["timerstat_body"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "  <span class=\"value\">"
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "</span><span class=\"unit\">"
    + alias3(((helper = (helper = helpers.unit || (depth0 != null ? depth0.unit : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"unit","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.parts : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

this["ts"]["templates"]["models"]["timeshift_summation_table"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "table-striped";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing;

  return "<div class=\"ds-item\" id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.item_id : stack1), depth0))
    + "\">\n"
    + ((stack1 = this.invokePartial(partials['ds-title-bar'],depth0,{"name":"ds-title-bar","data":data,"indent":"  ","helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + "  <table class=\"table table-condensed ds-timeshift-summation-table "
    + alias2((helpers.height || (depth0 && depth0.height) || alias3).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"height","hash":{},"data":data}))
    + " "
    + alias2((helpers.css_class || (depth0 && depth0.css_class) || alias3).call(depth0,(depth0 != null ? depth0.item : depth0),{"name":"css_class","hash":{},"data":data}))
    + "\n                "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.striped : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">\n    <thead>\n      <tr>\n        <th></th>\n        <th>Now</th>\n        <th>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.shift : stack1), depth0))
    + " Ago</th>\n        <th>Delta</th>\n        <th>%</th>\n      </tr>\n    </thead>\n    <tbody/>\n  </table>\n</div>\n";
},"usePartial":true,"useData":true});

this["ts"]["templates"]["models"]["timeshift_summation_table_body"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "<!-- TODO: configure which rows to include. Sum doesnt make sense for rates -->\n<tr>\n  <th>Average</th>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.mean : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.mean : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.mean_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.mean : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.mean_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.mean_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n<tr>\n  <th>Median</th>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.median : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.median : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.median_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.median : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.median_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.median_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n<tr>\n  <th>Min</th>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.min : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.min : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.min_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.min : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.min_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.min_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n<tr>\n  <th>Max</th>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.max : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.max : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.max_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.max : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.max_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.max_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n<tr>\n  <th>Sum</th>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.now : depth0)) != null ? stack1.sum : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td>"
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.then : depth0)) != null ? stack1.sum : stack1),{"name":"format","hash":{},"data":data}))
    + "</td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.sum_class : stack1), depth0))
    + "\">\n    "
    + alias2((helpers.format || (depth0 && depth0.format) || alias1).call(depth0,((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.format : stack1),((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.sum : stack1),{"name":"format","hash":{},"data":data}))
    + "\n  </td>\n  <td class=\""
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.sum_class : stack1), depth0))
    + "\">\n    "
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.diff : depth0)) != null ? stack1.sum_pct : stack1), depth0))
    + "\n  </td>\n</tr>\n";
},"useData":true});;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _appApp = require('./app/app');

Object.defineProperty(exports, 'Event', {
  enumerable: true,
  get: function get() {
    return _appApp.Event;
  }
});
Object.defineProperty(exports, 'Mode', {
  enumerable: true,
  get: function get() {
    return _appApp.Mode;
  }
});
Object.defineProperty(exports, 'Application', {
  enumerable: true,
  get: function get() {
    return _appApp.Application;
  }
});
Object.defineProperty(exports, 'instance', {
  enumerable: true,
  get: function get() {
    return _appApp.instance;
  }
});
Object.defineProperty(exports, 'uri', {
  enumerable: true,
  get: function get() {
    return _appApp.uri;
  }
});
Object.defineProperty(exports, 'context', {
  enumerable: true,
  get: function get() {
    return _appApp.context;
  }
});
Object.defineProperty(exports, 'config', {
  enumerable: true,
  get: function get() {
    return _appApp.config;
  }
});
Object.defineProperty(exports, 'refresh_mode', {
  enumerable: true,
  get: function get() {
    return _appApp.refresh_mode;
  }
});
Object.defineProperty(exports, 'switch_to_mode', {
  enumerable: true,
  get: function get() {
    return _appApp.switch_to_mode;
  }
});
Object.defineProperty(exports, 'toggle_mode', {
  enumerable: true,
  get: function get() {
    return _appApp.toggle_mode;
  }
});
Object.defineProperty(exports, 'add_mode_handler', {
  enumerable: true,
  get: function get() {
    return _appApp.add_mode_handler;
  }
});

var _appManager = require('./app/manager');


exports.manager = _interopRequire(_appManager);

},{"./app/app":2,"./app/manager":15}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.refresh_mode = refresh_mode;
exports.switch_to_mode = switch_to_mode;
exports.toggle_mode = toggle_mode;
exports.add_mode_handler = add_mode_handler;
exports.uri = uri;
exports.context = context;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var log = core.logger('app');
var ANIMATION_DELAY = 300;
var config = new _config2['default']();
/**
 * Some pre-defined events that we can register handlers for.
 */
exports.config = config;
var Event = {
    MODE_ENTER: 'ds-enter:',
    MODE_EXIT: 'ds-exit:',
    MODE_REFRESH: 'ds-refresh:',
    DASHBOARD_LOADED: 'ds-dashboard-loaded',
    DASHBOARD_RENDERED: 'ds-dashboard-rendered',
    RANGE_CHANGED: 'ds-range-changed',
    QUERIES_COMPLETE: 'ds-queries-complete'
};
/**
 * Valid user interface modes.
 */
exports.Event = Event;
var Mode = {
    EDIT: 'edit',
    TRANSFORM: 'transform',
    DISPLAY: 'display',
    STANDARD: 'standard'
};
/**
 * The central application object. At present, its primary
 * responsibility is to handle switching between different application
 * modes, which is mainly about hiding & showing various elements in
 * the UI.
 */
exports.Mode = Mode;

var Application = (function () {
    function Application() {
        _classCallCheck(this, Application);

        this.mode_stack = [];
        this.current_mode = 'standard';
    }

    /* Mode Handling ------------------------------------------ */

    _createClass(Application, [{
        key: '_do_exit_mode',
        value: function _do_exit_mode(mode) {
            log.debug('mode <- ' + mode);
            core.events.fire(this, Event.MODE_EXIT + mode);
            var state = this.mode_stack.pop();
            if (state) {
                state.hidden.show(ANIMATION_DELAY);
                state.shown.hide(ANIMATION_DELAY);
            }
        }
    }, {
        key: '_do_enter_mode',
        value: function _do_enter_mode(mode) {
            log.debug('mode -> ' + mode);
            var hidden = $('[data-ds-hide~="' + mode + '"]').hide(ANIMATION_DELAY);
            var shown = $('[data-ds-show~="' + mode + '"]').show(ANIMATION_DELAY);
            this.current_mode = mode;
            this.mode_stack.push({
                mode: mode,
                hidden: hidden,
                shown: shown
            });
            core.events.fire(this, Event.MODE_ENTER + mode);
        }

        /**
         * An alias for switch_to_mode(current_mode)
         */
    }, {
        key: 'refresh_mode',
        value: function refresh_mode() {
            this.switch_to_mode(this.current_mode, 0);
            core.events.fire(this, Event.MODE_REFRESH + this.current_mode);
            return this;
        }

        /**
         * Switch to a named mode. This will first run the exit handlers
         * for the current mode, restoring any previously hidden elements
         * to visibility, before running the enter mode handlers for the
         * new mode and changing element visibility for the new mode.
         *
         * If the requested mode is already the current mode, the mode
         * will be 'refreshed' by re-evaluating what elements are hidden &
         * shown.
         *
         * @param mode {string} A mode name
         */
    }, {
        key: 'switch_to_mode',
        value: function switch_to_mode(mode) {
            var delay = arguments.length <= 1 || arguments[1] === undefined ? ANIMATION_DELAY : arguments[1];

            if (this.current_mode === Mode.TRANSFORM && mode === Mode.EDIT) {
                log.debug("Can't switch from transform to edit.");
                return this;
            }
            if (mode === this.current_mode && this.mode_stack.length > 0) {
                var state = this.mode_stack[this.mode_stack.length - 1];
                state.hidden = $('[data-ds-hide~="' + mode + '"]').hide(delay);
                state.shown = $('[data-ds-show~="' + mode + '"]').show(delay);
            } else {
                this._do_exit_mode(this.current_mode);
                this._do_enter_mode(mode);
            }
            return this;
        }

        /**
         * Toggle between the named mode and 'standard'. Return true if
         * we've switched to mode, otherwise false if we've switched back
         * to 'standard'.
         *
         * @param mode {string} A mode name
         * @return true if switched to mode, else false
         */
    }, {
        key: 'toggle_mode',
        value: function toggle_mode(mode) {
            if (this.current_mode == mode) {
                this.switch_to_mode(Mode.STANDARD);
                return false;
            } else {
                this.switch_to_mode(mode);
                return true;
            }
        }

        /**
         * Register handlers to run on entrance to and/or exit from an
         * application mode.
         *
         * @param options An object with one or both of 'enter' and 'exit'
         *                attributes bound to functions which will be run
         *                on mode transitions.
         */
    }, {
        key: 'add_mode_handler',
        value: function add_mode_handler(mode, options) {
            if (options.enter && options.enter instanceof Function) {
                core.events.on(this, Event.MODE_ENTER + mode, options.enter);
            }
            if (options.exit && options.exit instanceof Function) {
                core.events.on(this, Event.MODE_EXIT + mode, options.exit);
            }
            if (options.refresh && options.refresh instanceof Function) {
                core.events.on(this, Event.MODE_REFRESH + mode, options.refresh);
            }
            return this;
        }
    }]);

    return Application;
})();

exports.Application = Application;
var instance = new Application();
/* Compatibility interface ------------------------------------------ */
exports.instance = instance;

function refresh_mode() {
    return instance.refresh_mode();
}

function switch_to_mode(mode) {
    var delay = arguments.length <= 1 || arguments[1] === undefined ? ANIMATION_DELAY : arguments[1];

    return instance.switch_to_mode(mode, delay);
}

function toggle_mode(mode) {
    return instance.toggle_mode(mode);
}

function add_mode_handler(mode, options) {
    return instance.add_mode_handler(mode, options);
}

/* Miscellany ------------------------------------------------------- */

function uri(path) {
    return config.APPLICATION_ROOT ? config.APPLICATION_ROOT + path : path;
}

/**
 * Return a context object based on the current URL.
 */

function context(context) {
    context = context || {};
    var url = new URI(window.location);
    var params = url.query(true);
    var variables = {};
    context.from = params.from || config.DEFAULT_FROM_TIME;
    context.until = params.until;
    for (var key in params) {
        /* compatibility w/gdash params */
        if (key.indexOf('p[') == 0) {
            var _name = key.slice(2, -1);
            variables[_name] = params[key];
        } else {
            variables[key] = params[key];
        }
    }
    variables.path = url.path();
    context.path = url.path();
    context.variables = variables;
    context.params = params;
    return context;
}



},{"../core":24,"./config":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Config = function Config(data) {
    _classCallCheck(this, Config);

    this.PROPSHEET_AUTOCLOSE_SECONDS = 3;
    this.APPLICATION_ROOT = null;
    this.DEFAULT_FROM_TIME = '-3h';
    this.DISPLAY_TIMEZONE = 'Etc/UTC';
    this.GRAPHITE_AUTH = null;
    this.GRAPHITE_URL = 'http://localhost:8080';
    if (data) {
        this.PROPSHEET_AUTOCLOSE_SECONDS = data.PROPSHEET_AUTOCLOSE_SECONDS || this.PROPSHEET_AUTOCLOSE_SECONDS;
        this.APPLICATION_ROOT = data.APPLICATION_ROOT;
        this.DEFAULT_FROM_TIME = data.DEFAULT_FROM_TIME || this.DEFAULT_FROM_TIME;
        this.DISPLAY_TIMEZONE = data.DISPLAY_TIMEZONE || this.DISPLAY_TIMEZONE;
        this.GRAPHITE_AUTH = data.GRAPHITE_AUTH;
        this.GRAPHITE_URL = data.GRAPHITE_URL || this.GRAPHITE_URL;
    }
}

;

exports['default'] = Config;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modelsDashboard = require('../../models/dashboard');

var _modelsDashboard2 = _interopRequireDefault(_modelsDashboard);

var _manager = require('../manager');

var _manager2 = _interopRequireDefault(_manager);

var _modelsItemsFactory = require('../../models/items/factory');

/*
 * Logic for the dashboard-create.html template.
 */
$(document).ready(function () {
    var tags = $('#ds-dashboard-tags');
    if (tags.length) {
        tags.tagsManager({
            tagsContainer: '.ds-tag-holder',
            tagClass: 'badge badge-primary'
        });
    }
});
$(document).ready(function () {
    var form = $('#ds-dashboard-create-form');
    if (form.length) {
        form.bootstrapValidator();
    }
});
$(document).on('click', '#ds-new-dashboard-create', function (e) {
    var title = $('#ds-dashboard-title')[0].value;
    var category = $('#ds-dashboard-category')[0].value;
    var summary = $('#ds-dashboard-summary')[0].value;
    var description = $('#ds-dashboard-description')[0].value;
    var tags = $('#ds-dashboard-tags').tagsManager('tags');
    if (!$('#ds-dashboard-create-form').data('bootstrapValidator').validate().isValid()) {
        return;
    }
    var dashboard = new _modelsDashboard2['default']({
        title: title,
        category: category,
        summary: summary,
        description: description,
        tags: tags,
        definition: (0, _modelsItemsFactory.make)('dashboard_definition')
    });
    _manager2['default'].create(dashboard, function (data) {
        window.location = data.view_href;
    });
});
$(document).on('click', '#ds-new-dashboard-cancel', function (e) {
    window.history.back();
});


},{"../../models/dashboard":40,"../../models/items/factory":54,"../manager":15}],5:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _app = require('../app');

var app = _interopRequireWildcard(_app);

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _manager = require('../manager');

var _manager2 = _interopRequireDefault(_manager);

var _modelsItemsFactory = require('../../models/items/factory');

/*
 * Logic for the dashboard-toolbar.html template.
 */
app.add_mode_handler('edit', {
    enter: function enter() {
        $(".ds-dashboard-info-edit-panel").html(ts.templates.edit.dashboard_panel(_manager2['default'].current.dashboard));
        $('#ds-edit-info-button').addClass('active');
        $.fn.editable.defaults.mode = 'inline';
        /** Title */
        $("#ds-info-panel-edit-title").editable({
            unsavedclass: null,
            success: function success(ignore, newValue) {
                _manager2['default'].current.dashboard.title = newValue;
                _manager2['default'].update(_manager2['default'].current.dashboard);
            }
        });
        /** Category */
        $("#ds-info-panel-edit-category").editable({
            unsavedclass: null,
            success: function success(ignore, newValue) {
                _manager2['default'].current.dashboard.category = newValue;
                _manager2['default'].update(_manager2['default'].current.dashboard);
            }
        });
        $("#ds-info-panel-edit-summary").editable({
            unsavedclass: null,
            success: function success(ignore, newValue) {
                _manager2['default'].current.dashboard.summary = newValue;
                _manager2['default'].update(_manager2['default'].current.dashboard);
            }
        });
        $("#ds-info-panel-edit-description").editable({
            unsavedclass: null,
            value: _manager2['default'].current.dashboard.description || '',
            success: function success(ignore, newValue) {
                _manager2['default'].current.dashboard.description = newValue;
                _manager2['default'].update(_manager2['default'].current.dashboard);
            },
            display: function display(value, response) {
                $(this).html(marked(value));
            }
        });
        var tags = _manager2['default'].current.dashboard.tags || [];
        $("#ds-info-panel-edit-tags").tagsManager({
            hiddenTagListName: 'ds-info-panel-edit-taglist',
            tagClass: 'badge badge-primary',
            prefilled: tags.map(function (tag) {
                return tag.name;
            })
        });
        /**
         * Handler for tag changes. This gets run each time a complete tag
         * is added or removed.
         */
        $('[name="ds-info-panel-edit-taglist"]').on('change', function (e) {
            var tags = $('#ds-info-panel-edit-tags').tagsManager('tags');
            _manager2['default'].current.dashboard.set_tags(tags);
            _manager2['default'].update(_manager2['default'].current.dashboard);
        });
    },
    exit: function exit() {
        $('#ds-edit-info-button').removeClass('active');
    }
});
$(document).ready(function () {
    /**
     * Handlers for the Info Edit panel.
     */
    $(document).on('click', '#ds-edit-info-button', function (e) {
        app.toggle_mode(app.Mode.EDIT);
    });
    $(document).on('click', '#ds-export-button', function (e) {
        var dashboard = _manager2['default'].current.dashboard;
        var json = JSON.stringify(core.json(dashboard), null, '  ');
        var blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        var now = moment().format();
        window.saveAs(blob, dashboard.title + ' ' + now);
    });
    $(document).on('click', '#ds-toggle-interactive-button', function (e) {
        if (_manager2['default'].toggle_interactive_charts()) {
            $('#ds-toggle-interactive-button').removeClass('active');
        } else {
            $('#ds-toggle-interactive-button').addClass('active');
        }
    });
    $(document).on('click', '#ds-enter-fullscreen-button', function (e) {
        app.switch_to_mode(app.Mode.DISPLAY);
    });
    $(document).on('click', '#ds-exit-display-mode-button', function (e) {
        app.switch_to_mode(app.Mode.STANDARD);
    });
    $(document).on('click', '#ds-delete-dashboard-button', function (e) {
        _manager2['default'].delete_current();
    });
    $(document).on('click', '#ds-remove-transform-button', function (e) {
        _manager2['default'].remove_transform();
    });
    $(document).on('click', '#ds-save-dashboard-button', function (e) {
        _manager2['default'].update_definition(_manager2['default'].current.dashboard, function () {
            _manager2['default'].success('Dashboard saved');
        });
    });
    $(document).on('click', '#ds-new-section-button', function (e) {
        var dash = _manager2['default'].current.dashboard;
        dash.definition.add((0, _modelsItemsFactory.make)('section'));
        dash.update_index();
    });
    $(document).on('click', '#ds-view-dashboard-source-button', function (e) {
        var dashboard = _manager2['default'].current.dashboard;
        var selector = '#ds-dashboard-source';
        var source_elt = $(selector);
        if (!source_elt.length) {
            ts.manager.client.dashboard_get(dashboard.href, { definition: true }).then(function (data) {
                var contents = '<div id="ds-dashboard-source" class="container">' + ts.templates.edit.item_source({ item: data }) + '</div>';
                $('.ds-dashboard').hide();
                $('#dashboard').append(contents);
            });
        } else {
            source_elt.remove();
            $('.ds-dashboard').show();
        }
    });
    $(document).on('click', '#ds-favorite-button', function (e) {
        var dashboard = _manager2['default'].current.dashboard;
        if (ts.user.toggle_favorite(dashboard)) {
            $('#ds-favorite-button').html('<i class="fa fa-star"></i>').addClass('ds-favorited');
        } else {
            $('#ds-favorite-button').html('<i class="fa fa-star-o"></i>').removeClass('ds-favorited');
        }
    });
    $(document).on('click', '.ds-favorite-indicator', function (e) {
        var element = $(e.target).parent()[0];
        var href = element.getAttribute('data-ds-href');
        var d = ts.manager.find(href);
        if (d) {
            // TODO -- all this rendering code should be triggered by events
            // on the user model
            if (ts.user.toggle_favorite(d)) {
                $('[data-ds-href="' + d.href + '"].ds-favorite-indicator').html('<i class="fa fa-lg fa-star"></i>');
                $('[data-ds-href="' + d.href + '"]').addClass('ds-favorited');
                $('tr[data-ds-href="' + d.href + '"]').addClass('active');
            } else {
                $('[data-ds-href="' + d.href + '"].ds-favorite-indicator').html('<i class="fa fa-lg fa-star-o"></i>');
                $('[data-ds-href="' + d.href + '"]').removeClass('ds-favorited');
                $('tr[data-ds-href="' + d.href + '"]').removeClass('active');
            }
        }
    });
});


},{"../../core":24,"../../models/items/factory":54,"../app":2,"../manager":15}],6:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _manager = require('../manager');

var _manager2 = _interopRequireDefault(_manager);

var _app = require('../app');

var app = _interopRequireWildcard(_app);

app.add_mode_handler('display', {
    enter: function enter() {
        /* Make sure the fullscreen range indicator is correct */
        var range = app.context();
        var description = _manager2['default'].getRangeDescription(range.from);
        if (description) {
            $("a.ds-fullscreen-range-indicator").text(description);
        }
        /* Update the header to match the dashboard if it's fluid */
        var fluid = false;
        _manager2['default'].current.dashboard.definition.visit(function (item) {
            if (item.layout === 'fluid') fluid = true;
        });
        if (fluid) {
            $('.ds-header-container').removeClass('container');
            $('.ds-header-container').addClass('container-fluid');
        }
    },
    exit: function exit() {
        $('.ds-header-container').removeClass('container-fluid');
        $('.ds-header-container').addClass('container');
    }
});


},{"../app":2,"../manager":15}],7:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreAction = require('../../core/action');

var _coreAction2 = _interopRequireDefault(_coreAction);

var _manager = require('../manager');

var _manager2 = _interopRequireDefault(_manager);

var _app = require('../app');

var app = _interopRequireWildcard(_app);

var _core = require('../../core');

/**
 * Actions that operate on dashboards in the listing page, and the
 * handler to invoke them from the dashboard-list.html template.
 */

var core = _interopRequireWildcard(_core);

_coreAction.actions.register('dashboard-list-actions', [new _coreAction2['default']({
    name: 'open',
    display: 'Open',
    icon: 'fa fa-external-link',
    handler: function handler(action, context) {
        window.location = context.view_href;
    }
}), new _coreAction2['default']({
    name: 'edit',
    display: 'Edit...',
    icon: 'fa fa-edit',
    handler: function handler(action, context) {
        var url = new URI(context.view_href).setQuery('mode', app.Mode.EDIT).href();
        window.location = url;
    }
}), new _coreAction2['default']({
    name: 'duplicate',
    display: 'Duplicate...',
    icon: 'fa fa-copy',
    handler: function handler(action, context) {
        _manager2['default'].duplicate(context.href, function () {
            window.location.reload();
        });
    }
}), new _coreAction2['default']({
    name: 'export',
    display: 'Export...',
    icon: 'fa fa-download',
    handler: function handler(action, context) {
        _manager2['default'].client.dashboard_get(context.href, { definition: true }).then(function (data) {
            var json = JSON.stringify(core.json(data), null, '  ');
            var blob = new Blob([json], { type: 'application/json;charset=utf-8' });
            var now = moment().format();
            window.saveAs(blob, data.title + ' ' + now);
        });
    }
}), _coreAction2['default'].DIVIDER, new _coreAction2['default']({
    name: 'delete',
    display: 'Delete...',
    icon: 'fa fa-trash-o',
    handler: function handler(action, context) {
        _manager2['default'].delete_with_confirmation(context.href, function () {
            $('tr[data-ds-href="' + context.href + '"]').remove();
            _manager2['default'].success('Succesfully deleted dashboard ' + context.href);
        });
    }
})]);
$(document).on('click', 'ul.ds-dashboard-action-menu li', function (event) {
    var element = $(event.target).parent().parent()[0];
    var context = {
        href: element.getAttribute('data-ds-href'),
        view_href: element.getAttribute('data-ds-view-href')
    };
    var action = _coreAction.actions.get('dashboard-list-actions', this.getAttribute('data-ds-action'));
    action.handler(action, context);
});


},{"../../core":24,"../../core/action":25,"../app":2,"../manager":15}],8:[function(require,module,exports){
/**
 * Handlers for the sort menu in the dashboard-list.html template.a
 */
'use strict';

$(document).on('click', 'ul.ds-dashboard-sort-menu li', function (e) {
    var column = e.target.getAttribute('data-ds-sort-col');
    var order = e.target.getAttribute('data-ds-sort-order');
    var url = new URI(window.location);
    if (column) {
        url.setQuery('sort', column);
    }
    if (order) {
        url.setQuery('order', order);
    }
    window.location = url.href();
});
$(document).ready(function () {
    var params = new URI(window.location).search(true);
    if (params.sort !== 'default') {
        $('ul.ds-dashboard-sort-menu li').removeClass('active');
        $('[data-ds-sort-col="' + params.sort + '"][data-ds-sort-order="' + (params.order || 'asc') + '"]').parent().addClass('active');
    }
});


},{}],9:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _manager = require('../manager');

var _manager2 = _interopRequireDefault(_manager);

var _coreAction = require('../../core/action');

var _coreAction2 = _interopRequireDefault(_coreAction);

var _chartsGraphite = require('../../charts/graphite');

var graphite = _interopRequireWildcard(_chartsGraphite);

_coreAction.actions.register('presentation-actions', [new _coreAction2['default']({
    name: 'open-in-graphite',
    display: 'Open in Graphite...',
    icon: 'fa fa-bar-chart-o',
    handler: function handler(action, item) {
        var composer_url = graphite.composer_url(item, item.query_override || item.query, {
            showTitle: true
        });
        window.open(composer_url.href());
    }
}), new _coreAction2['default']({
    name: 'export-png',
    display: 'Export PNG...',
    icon: 'fa fa-file-image-o',
    handler: function handler(action, item) {
        var image_url = graphite.chart_url(item, item.query_override || item.query, {
            showTitle: true
        });
        window.open(image_url.href());
    }
}), new _coreAction2['default']({
    name: 'export-svg',
    display: 'Export SVG...',
    icon: 'fa fa-file-code-o',
    handler: function handler(action, item) {
        var image_url = graphite.chart_url(item, item.query_override || item.query, {
            showTitle: true,
            format: 'svg'
        });
        window.open(image_url.href());
    }
}), new _coreAction2['default']({
    name: 'export-csv',
    display: 'Export CSV...',
    icon: 'fa fa-file-excel-o',
    handler: function handler(action, item) {
        var image_url = graphite.chart_url(item, item.query_override || item.query, {
            showTitle: true,
            format: 'csv'
        });
        window.open(image_url.href());
    }
})]);
$(document).on('click', 'ul.ds-action-menu li', function (event) {
    var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id;
    var item = _manager2['default'].current.dashboard.get_item(presentation_id);
    var action = _coreAction.actions.get(this.getAttribute('data-ds-category'), this.getAttribute('data-ds-action'));
    action.handler(action, item);
    /* prevents resetting scroll position */
    return false;
});


},{"../../charts/graphite":19,"../../core/action":25,"../manager":15}],10:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _manager = require('../manager');

var _manager2 = _interopRequireDefault(_manager);

$(document).on('click', 'button.ds-refresh-button', function (e) {
    _manager2['default'].refresh();
});
$(document).on('click', 'ul.ds-refresh-menu li', function (e) {
    var target = $(e.target).parent();
    if (target.attr('data-ds-range')) {
        var range = target.attr('data-ds-range');
        _manager2['default'].set_time_range(range, null);
        $("ul.ds-refresh-menu li[data-ds-range]").removeClass('active');
        $("ul.ds-refresh-menu li[data-ds-range=" + range + "]").addClass('active');
    } else if (target.attr('data-ds-interval')) {
        var interval = target.attr('data-ds-interval');
        _manager2['default'].set_refresh_interval(interval);
        $("ul.ds-refresh-menu li[data-ds-interval]").removeClass('active');
        $("ul.ds-refresh-menu li[data-ds-interval=" + interval + "]").addClass('active');
    }
    return false;
});


},{"../manager":15}],11:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _manager = require('../manager');

var _manager2 = _interopRequireDefault(_manager);

var _app = require('../app');

var app = _interopRequireWildcard(_app);

var _modelsTransformSimpleGrid = require('../../models/transform/SimpleGrid');

var _modelsTransformSimpleGrid2 = _interopRequireDefault(_modelsTransformSimpleGrid);

$(document).on('click', 'ul.ds-rejigger-menu li a', function (e) {
    var target = $(e.target).parent();
    var cols = target.attr('data-ds-cols');
    var section_type = target.attr('data-ds-section-type');
    var layout = new _modelsTransformSimpleGrid2['default']({
        section_type: section_type,
        columns: cols
    });
    _manager2['default'].apply_transform(layout, _manager2['default'].current.dashboard, false);
    app.refresh_mode();
    return false;
});


},{"../../models/transform/SimpleGrid":82,"../app":2,"../manager":15}],12:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _manager = require('../manager');

var _manager2 = _interopRequireDefault(_manager);

var _app = require('../app');

var app = _interopRequireWildcard(_app);

var GRAPHITE_FORMAT = 'HH:mm_YYYYMMDD';
var self = {};
self.null_handler = function () {};
self.update_handler = function () {
    var from = $('#ds-range-picker-from').data("DateTimePicker").date();
    var until = $('#ds-range-picker-until').data("DateTimePicker").date();
    if (from && until) {
        /**
         * Disable the handler, because the picker will re-raise events
         * when being set programmatically after the dashboard loads,
         * leading to looping.
         */
        self.disable_handler();
        _manager2['default'].set_time_range(from.utc().format(GRAPHITE_FORMAT), until.utc().format(GRAPHITE_FORMAT));
    }
};
self.handler = self.null_handler;
self.enable_handler = function () {
    self.handler = self.update_handler;
};
self.disable_handler = function () {
    self.handler = self.null_handler;
};
/**
 * Ensure that we can't end up with inverted time ranges (i.e. with
 * the 'from' time later than the 'until' time).
 */
$(document).on('dp.change', '#ds-range-picker-from', function (e) {
    var picker = $('#ds-range-picker-to').data('DateTimePicker');
    if (picker) {
        picker.minDate(e.date);
    }
});
$(document).on('dp.change', '#ds-range-picker-to', function (e) {
    var picker = $('#ds-range-picker-from').data('DateTimePicker');
    if (picker) {
        picker.maxDate(e.date);
    }
});
/**
 * Main event handler for responding to changes in the picker.
 */
$(document).on('dp.change', '#ds-range-picker-from, #ds-range-picker-until', function (e) {
    self.handler(e);
});
$(document).on('click', '.ds-recent-range-picker li, .ds-recent-range-picker a, .ds-custom-range-picker ul li, .ds-custom-range-picker ul li a', function (e) {
    var range = $(e.target).attr('data-ds-range');
    if (range === 'custom') {
        $('.ds-recent-range-picker').hide();
        $('.ds-custom-range-picker').show();
        var now = moment.utc().startOf('minute').tz(app.config.DISPLAY_TIMEZONE);
        now.minute(Math.round(now.minute() / 15) * 15); // quantize to 15-min interval
        var from_picker = $('#ds-range-picker-from').data("DateTimePicker");
        from_picker.date(now.clone().subtract(3, 'hours').tz(app.config.DISPLAY_TIMEZONE));
        var until_picker = $('#ds-range-picker-until').data("DateTimePicker");
        until_picker.date(now);
        until_picker.maxDate(now);
        from_picker.maxDate(now);
        self.enable_handler();
    } else if (range === 'recent') {
        self.disable_handler();
        $('.ds-custom-range-picker').hide();
        $('.ds-recent-range-picker').show();
    } else {
        self.disable_handler();
        _manager2['default'].set_time_range(range, null);
    }
    return false;
});
$(document).ready(function () {
    var picker = $('.ds-custom-range-entry');
    if (picker.length) {
        $('.ds-custom-range-entry').datetimepicker({
            showTodayButton: true,
            widgetPositioning: {
                vertical: 'bottom',
                horizontal: 'right'
            },
            sideBySide: true,
            stepping: 15,
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar-o',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down'
            }
        });
    }
    _manager2['default'].onDashboardLoaded(function () {
        var params = new URI(window.location).search(true);
        if (params.from && params.until) {
            // Initialise the range date pickers with the values from the URL query parameters
            // TODO - don't do this for relative specifiers
            $('#ds-range-picker-from').data("DateTimePicker").date(moment(params.from, GRAPHITE_FORMAT).tz(app.config.DISPLAY_TIMEZONE));
            $('#ds-range-picker-until').data("DateTimePicker").date(moment(params.until, GRAPHITE_FORMAT).tz(app.config.DISPLAY_TIMEZONE));
            $('.ds-recent-range-picker').hide();
            $('.ds-custom-range-picker').show();
            self.enable_handler();
        }
    });
});


},{"../app":2,"../manager":15}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.register_helpers = register_helpers;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreAction = require('../core/action');

var _coreAction2 = _interopRequireDefault(_coreAction);

var _modelsItemsChart = require('../models/items/chart');

var _modelsItemsChart2 = _interopRequireDefault(_modelsItemsChart);

var _app = require('./app');

var app = _interopRequireWildcard(_app);

var _manager = require('./manager');

/**
 * Hook up syntax highlighting to marked' markdown processor, so code
 * blocks will be highlighted.
 */

var _manager2 = _interopRequireDefault(_manager);

marked.setOptions({
    highlight: function highlight(code) {
        return hljs.highlightAuto(code).value;
    }
});

function register_helpers() {
    /**
     * Render markdown content to HTML.
     */
    Handlebars.registerHelper('markdown', function (value) {
        if (!value) return '';
        return new Handlebars.SafeString(marked(value));
    });
    /**
     * Render an object to syntax-highlighted JSON.
     */
    Handlebars.registerHelper('json', function (value) {
        return new Handlebars.SafeString(hljs.highlightAuto(JSON.stringify(value, null, '  ')).value);
    });
    /**
     * Format a datetime value in the timezone configured for the current
     * tessera user.
     */
    Handlebars.registerHelper('moment', function (format, value) {
        if (!value) return '';
        if (format == 'fromNow') {
            return moment(value).tz(app.config.DISPLAY_TIMEZONE).fromNow();
        } else {
            return moment(value).tz(app.config.DISPLAY_TIMEZONE).format(format);
        }
        return '';
    });
    Handlebars.registerHelper('format', function (format, value) {
        if (typeof value === 'undefined') return '';
        if (!format) return value;
        try {
            return d3.format(format)(value);
        } catch (e) {
            console.log('Error formatting ' + format + ' / ' + value + ': ' + e.message);
            return value;
        }
    });
    /**
     * Fetch the list of dashboards with a given tag and return a Markdown
     * list of links to them.
     */
    Handlebars.registerHelper('dashboards-tagged', function (tag) {
        var markdown = '';
        $.ajax({
            url: app.uri('/api/dashboard/tagged/' + tag),
            type: 'GET',
            async: false,
            success: function success(data) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var d = _step.value;

                        markdown += '  * [';
                        if (d.category && d.category !== '') {
                            markdown += d.category + ': ';
                        }
                        markdown += d.title + '](';
                        markdown += d.view_href + ')\n';
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            },
            error: function error() {
                var error = 'Unable to retrieve list of dashboards tagged "' + tag + '"';
                _manager2['default'].warning(error);
                markdown = error;
            }
        });
        return new Handlebars.SafeString(markdown);
    });
    /* -----------------------------------------------------------------------------
       Internal helpers
       ----------------------------------------------------------------------------- */
    Handlebars.registerHelper('height', function (item) {
        var height = item.height;
        if (item instanceof _modelsItemsChart2['default'] && !height) {
            height = 2;
        }
        return height ? 'ds-height' + height : '';
    });
    Handlebars.registerHelper('span', function (item) {
        return item.span ? 'col-md-' + item.span : '';
    });
    Handlebars.registerHelper('offset', function (item) {
        return item.offset ? 'col-md-offset-' + item.offset : '';
    });
    Handlebars.registerHelper('css_class', function (item) {
        return item.css_class ? item.css_class : '';
    });
    Handlebars.registerHelper('container_class', function (item) {
        switch (item.layout) {
            case 'fixed':
                return 'container';
            case 'fluid':
                return 'container-fluid';
            default:
                return '';
        }
    });
    /**
     * Render the edit bar for any dashboard item.
     */
    Handlebars.registerHelper('ds-edit-bar', function (item) {
        var context = { item: item };
        var template = undefined;
        if (item.item_type === 'cell') {
            template = ts.templates["ds-edit-bar-cell"];
        } else if (item.item_type === 'row') {
            template = ts.templates["ds-edit-bar-row"];
        } else if (item.item_type === 'section') {
            template = ts.templates["ds-edit-bar-section"];
        } else if (item.item_type === 'dashboard_definition') {
            template = ts.templates["ds-edit-bar-definition"];
        } else {
            template = ts.templates["ds-edit-bar-item"];
        }
        return template ? new Handlebars.SafeString(template(context)) : '';
    });
    Handlebars.registerHelper('style_class', function (item) {
        if (item.style) {
            switch (item.style) {
                case 'well':
                    return 'well';
                case 'callout_neutral':
                    return 'bs-callout bs-callout-neutral';
                case 'callout_info':
                    return 'bs-callout bs-callout-info';
                case 'callout_success':
                    return 'bs-callout bs-callout-success';
                case 'callout_warning':
                    return 'bs-callout bs-callout-warning';
                case 'callout_danger':
                    return 'bs-callout bs-callout-danger';
                case 'alert_neutral':
                    return 'alert alert-neutral';
                case 'alert_info':
                    return 'alert alert-info';
                case 'alert_success':
                    return 'alert alert-success';
                case 'alert_warning':
                    return 'alert alert-warning';
                case 'alert_danger':
                    return 'alert alert-danger';
                default:
                    return '';
            }
        } else {
            return '';
        }
    });
    /**
     * Handlebars helper to render a dashboard item, by calling its
     * `render()` method.
     */
    Handlebars.registerHelper('item', function (item) {
        if (!item) return '';
        return new Handlebars.SafeString(item.render());
    });
    /**
     * Render an individual property for a property sheet.
     */
    Handlebars.registerHelper('interactive_property', function (property, item) {
        return new Handlebars.SafeString(property.render(item));
    });
    /**
     * Render a list of actions. The actions are selected by category from
     * the global actions registry (`ts.actions`), and can be rendered
     * either as a button bar or a dropdown.
     */
    Handlebars.registerHelper('actions', function (category, type) {
        var template = type === 'button' ? ts.templates.action_button : ts.templates.action;
        var actions = _coreAction.actions.list(category);
        if (actions && actions.length) {
            if (typeof type === 'boolean' && type) {
                actions = actions.slice();
                actions.unshift(_coreAction2['default'].DIVIDER);
            }
            var html = '';
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = actions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var action = _step2.value;

                    if (!action) continue;
                    var tmpl = template;
                    if (action.actions) {
                        tmpl = ts.templates["action-menu-button"];
                    }
                    html += tmpl({
                        category: category,
                        action: action
                    });
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return new Handlebars.SafeString(html);
        } else {
            return '';
        }
    });
}



},{"../core/action":25,"../models/items/chart":46,"./app":2,"./manager":15}],14:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _app = require('./app');

var app = _interopRequireWildcard(_app);

var _manager = require('./manager');

/* =============================================================================
   Keyboard Shortcuts
   ============================================================================= */

var _manager2 = _interopRequireDefault(_manager);

Mousetrap.bind('ctrl+shift+d', function (e) {
    app.toggle_mode(app.Mode.DISPLAY);
});
Mousetrap.bind('ctrl+shift+e', function (e) {
    app.toggle_mode(app.Mode.EDIT);
});
Mousetrap.bind('ctrl+shift+s', function (e) {
    _manager2['default'].update_definition(_manager2['default'].current.dashboard, function () {
        _manager2['default'].success('Dashboard saved');
    });
});


},{"./app":2,"./manager":15}],15:[function(require,module,exports){
//
// TODO - all of this needs refactoring
//
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _app = require('./app');

var app = _interopRequireWildcard(_app);

var _chartsCore = require('../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var _client = require('../client');

var _client2 = _interopRequireDefault(_client);

var _modelsDashboard = require('../models/dashboard');

var _modelsDashboard2 = _interopRequireDefault(_modelsDashboard);

var _modelsItemsItem = require('../models/items/item');

var _modelsItemsItem2 = _interopRequireDefault(_modelsItemsItem);

var _modelsItemsContainer = require('../models/items/container');

var _modelsItemsContainer2 = _interopRequireDefault(_modelsItemsContainer);

var _modelsDataQuery = require('../models/data/query');

var _modelsDataQuery2 = _interopRequireDefault(_modelsDataQuery);

var _modelsTransformTransform = require('../models/transform/transform');

var log = core.logger('manager');

var DashboardHolder = (function () {
    function DashboardHolder(url, element) {
        _classCallCheck(this, DashboardHolder);

        this.url = url;
        this.element = element;
        this.dashboard = null;
    }

    _createClass(DashboardHolder, [{
        key: 'setRange',
        value: function setRange(from, until) {
            var url = new URI(this.url);
            if (from) {
                url.setQuery('from', from);
            }
            if (until) {
                url.setQuery('until', until);
            }
            this.url = url.href();
        }
    }]);

    return DashboardHolder;
})();

var Manager = (function () {
    function Manager(client) {
        _classCallCheck(this, Manager);

        this.intervalId = null;
        this.client = client ? client : new _client2['default']();
    }

    _createClass(Manager, [{
        key: 'set_current',
        value: function set_current(value) {
            this.current = value;
            return this;
        }
    }, {
        key: 'find',
        value: function find(href) {
            if (!this.current_list) return null;
            return this.current_list.find(function (d) {
                return d.href === href;
            });
        }

        /**
         * Register an event handler for processing a dashboard once it's
         * loaded and ready.
         */
    }, {
        key: 'onDashboardLoaded',
        value: function onDashboardLoaded(handler) {
            core.events.on(this, app.Event.DASHBOARD_LOADED, handler);
            return this;
        }

        /**
         * List all dashboards.
         */
    }, {
        key: 'list',
        value: function list(path, handler) {
            var _this = this;

            this.client.dashboard_list({ path: path }).then(handler)['catch'](function (req, status, error) {
                _this.error('Error listing dashboards. ' + error);
            });
        }

        // Web Components. I want Web Components. TBD.
    }, {
        key: 'render_dashboard_list',
        value: function render_dashboard_list(path, element, handler) {
            var _this2 = this;

            var mgr = this;
            var fn = function fn(data) {
                if (data && data.length) {
                    _this2.current_list = data;
                    if (handler) {
                        handler(data);
                    }
                    $(element).html(ts.templates.listing.dashboard_list({ dashboards: data }));
                    ts.user.list_favorites().forEach(function (d) {
                        $('[data-ds-href="' + d.href + '"].ds-favorite-indicator').html('<i class="fa fa-lg fa-star"></i>');
                        $('[data-ds-href="' + d.href + '"]').addClass('ds-favorited');
                        $('tr[data-ds-href="' + d.href + '"]').addClass('active');
                    });
                }
            };
            if (path instanceof Array) {
                fn(path);
            } else {
                this.list(path, fn);
            }
        }
    }, {
        key: 'default_error_handler',
        value: function default_error_handler(xhr, status, error) {
            console.log(xhr);
            console.log(status);
            console.log(error);
        }
    }, {
        key: 'error',
        value: function error(message) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            options.type = options.type || 'danger';
            $.growl({
                message: message,
                title: 'Error',
                icon: 'fa fa-exclamation-circle'
            }, options);
        }
    }, {
        key: 'warning',
        value: function warning(message) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            options.type = options.type || 'warning';
            $.growl({
                message: message,
                title: options.title || 'Warning',
                icon: options.icon || 'fa fa-exclamation-circle'
            }, options);
        }
    }, {
        key: 'success',
        value: function success(message) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            options.type = options.type || 'success';
            $.growl({
                message: message,
                title: options.title || 'Success',
                icon: options.icon || 'fa fa-check-circle'
            }, options);
        }

        /**
         * Set up us the API call.
         */
    }, {
        key: '_prep_url',
        value: function _prep_url(base_url, options) {
            var url = new URI(base_url).setQuery('rendering', true);
            var context = app.context(url.query(true));
            context.from = options.from || context.from;
            context.until = context.until || options.until;
            url.setQuery('from', context.from);
            if (context.until) {
                url.setQuery('until', context.until);
            }
            context.url = url.href();
            if (typeof options.interactive != 'undefined') {
                context.interactive = options.interactive;
            } else if (context.params.interactive) {
                context.interactive = context.params.interactive != 'false';
            }
            return context;
        }

        /**
         * Load and render a dashboard.
         */
    }, {
        key: 'load',
        value: function load(url, element) {
            var _this3 = this;

            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            log.debug('load(): ' + url);
            if (this.current && this.current.dashboard) {
                this.current.dashboard.cleanup();
            }
            var holder = new DashboardHolder(url, element);
            var context = this._prep_url(url, options);
            this.set_current(holder);
            $.ajax({
                dataType: "json",
                url: context.url
            }).error(function (xhr, status, error) {
                _this3.error('Error loading dashboard. ' + error);
            }).done(function (data) {
                var dashboard = new _modelsDashboard2['default'](data);
                holder.dashboard = dashboard;
                var r = context.variables.renderer || data.preferences.renderer;
                if (typeof context.variables.interactive != 'undefined') {
                    r = context.variables.interactive === 'false' ? 'graphite' : 'flot';
                }
                if (r) {
                    charts.set_renderer(r);
                }
                core.events.fire(_this3, app.Event.DASHBOARD_LOADED, dashboard);
                // Expand any templatized queries or dashboard items
                dashboard.render_templates(context.variables);
                // Render the dashboard
                $(element).html(dashboard.definition.render());
                var currentURL = new URI(holder.url);
                core.events.fire(_this3, app.Event.RANGE_CHANGED, {
                    from: currentURL.query('from'),
                    until: currentURL.query('until')
                });
                if (_this3.current_transform) {
                    _this3.apply_transform(_this3.current_transform.transform, _this3.current_transform.target, false, context);
                } else {
                    // Load the queries
                    dashboard.definition.load_all({
                        from: context.from,
                        until: context.until
                    });
                }
                core.events.fire(_this3, app.Event.DASHBOARD_RENDERED, dashboard);
                if (context.params.mode) {
                    app.switch_to_mode(context.params.mode);
                } else {
                    app.refresh_mode();
                }
            });
            return this;
        }

        /**
         * Re-render a dashboard item and update its DOM representation.
         */
    }, {
        key: 'update_item_view',
        value: function update_item_view(item) {
            var element = $('#' + item.item_id);
            // REFACTOR - unchecked global reference
            var visible = ts.edit.details_visibility(item);
            element.replaceWith(item.render());
            if (visible) {
                // REFACTOR - unchecked global reference
                ts.edit.show_details(item.item_id);
            }
            item.visit(function (i) {
                var query = i.query_override || i.query;
                if (query && query instanceof _modelsDataQuery2['default']) {
                    log.debug('update_item_view(): reloading query ' + query.name);
                    query.load();
                }
            });
            app.refresh_mode();
        }

        /**
         * Execute a function with re-rendering of the DOM for dashboard
         * items disabled.
         */
    }, {
        key: 'without_updates',
        value: function without_updates(handler) {
            var fn = Manager.prototype.update_item_view;
            Manager.prototype.update_item_view = function () {};
            try {
                return handler();
            } finally {
                Manager.prototype.update_item_view = fn;
            }
        }
    }, {
        key: 'handle_popstate',
        value: function handle_popstate(event) {
            if (!event.state) {
                this.current_transform = undefined;
                this.refresh();
                app.switch_to_mode('standard');
            } else {
                if (event.state.transform) {
                    var item = this.current.dashboard.get_item(event.state.target.item_id);
                    this.apply_transform(event.state.transform.name, item, false);
                } else if (event.state.url) {
                    this.current_transform = undefined;
                    this.refresh();
                    app.switch_to_mode('standard');
                }
            }
        }
    }, {
        key: 'remove_transform',
        value: function remove_transform() {
            if (this.current && this.current_transform) {
                window.location = new URI(window.location).path(this.current.dashboard.view_href).href();
                this.current_transform = undefined;
            }
            return this;
        }
    }, {
        key: 'apply_transform',
        value: function apply_transform(transform, target, set_location, context) {
            if (set_location === undefined) set_location = true;

            var dashboard = this.current.dashboard;
            if (typeof transform === 'string') transform = _modelsTransformTransform.transforms.get(transform);
            log.debug('apply_transform(' + transform.name + ')');
            if (transform.transform_type == 'dashboard' && typeof target === 'undefined') {
                target = dashboard.definition;
            }
            /**
             * Set browser URL state
             */
            if (set_location) {
                var url = new URI(window.location);
                if (target.item_type != 'dashboard_definition') {
                    url.segment(target.item_id.toString());
                }
                url.segment('transform').segment(transform.name);
                window.history.pushState({ url: this.current.url,
                    element: this.current.element,
                    transform: transform.toJSON(),
                    target: target.toJSON() }, '', url.href());
            }
            /**
             * update_item_view() reloads queries, which we don't want to do
             * while processing the transform.
             */
            var result = this.without_updates(function () {
                return transform.transform(target);
            });
            result.visit(function (item) {
                item.set_dashboard(dashboard);
            });
            dashboard.definition.queries = result.get_queries(); // this could go in an observer
            dashboard.set_items([result]);
            $('#' + dashboard.definition.item_id).replaceWith(dashboard.render());
            dashboard.render_templates(app.context().variables);
            if (context) {
                dashboard.load_all({
                    from: context.from,
                    until: context.until
                });
            } else {
                dashboard.load_all();
            }
            if (transform.transform_type === 'presentation' && app.instance.current_mode != app.Mode.EDIT) {
                app.switch_to_mode('transform');
                this.current_transform = {
                    transform: transform,
                    target: target
                };
            }
            return this;
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            log.debug('refresh()');
            if (this.current && app.instance.current_mode != app.Mode.EDIT) {
                this.load(this.current.url, this.current.element);
            } else {
                log.debug('skipping reload; current mode: ' + app.instance.current_mode);
            }
        }

        // Definitely getting to the point we need some kind of reactive MVC
        // here
    }, {
        key: 'toggle_interactive_charts',
        value: function toggle_interactive_charts() {
            var _this4 = this;

            this.client.preferences_get().then(function (data) {
                var setting = !data.interactive;
                var dashboard_url = new URI(_this4.current.url);
                var window_url = new URI(window.location);
                if (window_url.hasQuery('interactive', 'true')) {
                    setting = false;
                } else if (window_url.hasQuery('interactive', 'false')) {
                    setting = true;
                }
                dashboard_url.setQuery('interactive', setting);
                window_url.setQuery('interactive', setting);
                _this4.current.url = dashboard_url.href();
                window.history.pushState({ url: _this4.current.url, element: _this4.current.element }, '', window_url.href());
                _this4.refresh();
                return setting;
            });
        }

        /* -----------------------------------------------------------------------------
           Time range and auto-refresh
           ----------------------------------------------------------------------------- */
    }, {
        key: 'set_time_range',
        value: function set_time_range(from, until) {
            var uri = new URI(window.location);
            from ? uri.setQuery('from', from) : uri.removeQuery('from');
            until ? uri.setQuery('until', until) : uri.removeQuery('until');
            window.history.pushState({ url: this.current.url, element: this.current.element }, '', uri.href());
            this.current.setRange(from, until);
            core.events.fire(this, app.Event.RANGE_CHANGED, {
                from: from, until: until
            });
            this.refresh();
        }
    }, {
        key: 'getRangeDescription',
        value: function getRangeDescription(range) {
            if (range in Manager.ranges) {
                return Manager.ranges[range];
            } else {
                return null;
            }
        }
    }, {
        key: 'onRangeChanged',
        value: function onRangeChanged(handler) {
            core.events.on(this, app.Event.RANGE_CHANGED, handler);
        }
    }, {
        key: 'set_refresh_interval',
        value: function set_refresh_interval(value) {
            var _this5 = this;

            var intervalSeconds = parseInt(value);
            this.autoRefreshInterval = intervalSeconds;
            if (this.intervalId) {
                log.debug('clearing auto-refresh interval; intervalId: ' + this.intervalId);
                window.clearInterval(this.intervalId);
                this.intervalId = undefined;
            }
            if (intervalSeconds > 0) {
                this.intervalSeconds = intervalSeconds;
                this.intervalId = window.setInterval(function () {
                    _this5.refresh();
                }, intervalSeconds * 1000);
                log.debug('set auto-refresh interval; intervalId: ' + this.intervalId + '; seconds: ' + intervalSeconds);
            }
        }
    }, {
        key: 'delete_with_confirmation',
        value: function delete_with_confirmation(href, handler) {
            var _this6 = this;

            bootbox.dialog({
                message: "Are you really sure you want to delete this dashboard? Deletion is irrevocable.",
                title: "Confirm dashboard delete",
                backdrop: false,
                buttons: {
                    cancel: {
                        label: "Cancel",
                        className: "btn-default",
                        callback: function callback() {
                            // TODO - notification
                        }
                    },
                    confirm: {
                        label: "Delete",
                        className: "btn-danger",
                        callback: function callback() {
                            _this6.delete_dashboard(href, handler);
                        }
                    }
                }
            });
        }
    }, {
        key: 'delete_dashboard',
        value: function delete_dashboard(href, handler) {
            var _this7 = this;

            var done = handler || function () {
                window.location.href = '/dashboards';
                _this7.success('Successfully deleted dashboard ' + href);
            };
            this.client.dashboard_delete(href).then(done)['catch'](function (request, status, error) {
                _this7.error('Error deleting dashboard ' + href + '. ' + error);
            });
        }
    }, {
        key: 'delete_current',
        value: function delete_current() {
            this.delete_with_confirmation(this.current.dashboard.href);
        }
    }, {
        key: 'create',
        value: function create(input, handler) {
            var _this8 = this;

            var dashboard = null;
            if (typeof input === 'string') {
                var json = JSON.parse(input);
                dashboard = new _modelsDashboard2['default'](json);
            } else if (input instanceof _modelsDashboard2['default']) {
                dashboard = input;
            } else {
                dashboard = new _modelsDashboard2['default'](input);
            }
            this.client.dashboard_create(dashboard).then(handler)['catch'](function (request, status, error) {
                _this8.error('Error creating dashboard. ' + error);
            });
        }
    }, {
        key: 'update',
        value: function update(dashboard, handler) {
            var _this9 = this;

            this.client.dashboard_update(dashboard).then(handler)['catch'](function (request, status, error) {
                _this9.error('Error updating dashboard ' + dashboard.title + '. ' + error);
            });
        }
    }, {
        key: 'update_definition',
        value: function update_definition(dashboard, handler) {
            var _this10 = this;

            if (app.instance.current_mode === app.Mode.TRANSFORM) {
                this.warning('Unable to save dashboad while a transform is applied.\nRevert to standard mode in order to save changes.');
                return;
            }
            this.client.dashboard_update_definition(dashboard).then(handler)['catch'](function (request, status, error) {
                _this10.error('Error updating dashboard definition ' + dashboard.title + '. ' + error);
            });
        }
    }, {
        key: 'duplicate',
        value: function duplicate(href, handler) {
            var _this11 = this;

            var err = function err(request, status, error) {
                _this11.error('Error duplicating dashboard ' + href + '. ' + error);
            };
            this.client.dashboard_get(href, { definition: true }).then(function (db) {
                db.title = 'Copy of ' + db.title;
                db.id = null;
                _this11.client.dashboard_create(db).then(handler)['catch'](err);
            })['catch'](err);
        }
    }]);

    return Manager;
})();

exports.Manager = Manager;

Manager.ranges = {
    // TODO - quick hack. Parse the range and generate on the fly
    // for maximum flexibiliy
    '-1h': 'Past Hour',
    '-2h': 'Past 2 Hours',
    '-3h': 'Past 3 Hours',
    '-4h': 'Past 4 Hours',
    '-6h': 'Past 6 Hours',
    '-12h': 'Past 12 Hours',
    '-1d': 'Past Day',
    '-7d': 'Past Week'
};
var manager = new Manager();
core.events.on(_modelsItemsItem2['default'], 'update', function (e) {
    if (!e || !e.target) {
        log.warn('on:DashboardItem.update: item not bound');
    } else {
        var item = e.target;
        log.debug('on:DashboardItem.update: ' + item.item_type + ' / ' + item.item_id);
        if (item instanceof _modelsItemsContainer2['default']) {
            manager.current.dashboard.update_index();
        }
        manager.update_item_view(item);
    }
});
window.addEventListener('popstate', function (e) {
    manager.handle_popstate(e);
});
app.add_mode_handler(app.Mode.STANDARD, {
    enter: function enter() {
        manager.remove_transform();
    }
});
exports['default'] = manager;



},{"../charts/core":17,"../client":23,"../core":24,"../models/dashboard":40,"../models/data/query":41,"../models/items/container":50,"../models/items/item":56,"../models/transform/transform":85,"./app":2}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _modelsItemsChart = require('./models/items/chart');

exports.Chart = _interopRequire(_modelsItemsChart);

var _chartsCore = require('./charts/core');

Object.defineProperty(exports, 'ChartRenderer', {
  enumerable: true,
  get: function get() {
    return _chartsCore.ChartRenderer;
  }
});
Object.defineProperty(exports, 'get_renderer', {
  enumerable: true,
  get: function get() {
    return _chartsCore.get_renderer;
  }
});
Object.defineProperty(exports, 'set_renderer', {
  enumerable: true,
  get: function get() {
    return _chartsCore.set_renderer;
  }
});
Object.defineProperty(exports, 'renderers', {
  enumerable: true,
  get: function get() {
    return _chartsCore.renderers;
  }
});
Object.defineProperty(exports, 'StackMode', {
  enumerable: true,
  get: function get() {
    return _chartsCore.StackMode;
  }
});
Object.defineProperty(exports, 'simple_line_chart', {
  enumerable: true,
  get: function get() {
    return _chartsCore.simple_line_chart;
  }
});
Object.defineProperty(exports, 'standard_line_chart', {
  enumerable: true,
  get: function get() {
    return _chartsCore.standard_line_chart;
  }
});
Object.defineProperty(exports, 'simple_area_chart', {
  enumerable: true,
  get: function get() {
    return _chartsCore.simple_area_chart;
  }
});
Object.defineProperty(exports, 'stacked_area_chart', {
  enumerable: true,
  get: function get() {
    return _chartsCore.stacked_area_chart;
  }
});
Object.defineProperty(exports, 'donut_chart', {
  enumerable: true,
  get: function get() {
    return _chartsCore.donut_chart;
  }
});
Object.defineProperty(exports, 'bar_chart', {
  enumerable: true,
  get: function get() {
    return _chartsCore.bar_chart;
  }
});
Object.defineProperty(exports, 'discrete_bar_chart', {
  enumerable: true,
  get: function get() {
    return _chartsCore.discrete_bar_chart;
  }
});
Object.defineProperty(exports, 'process_series', {
  enumerable: true,
  get: function get() {
    return _chartsCore.process_series;
  }
});
Object.defineProperty(exports, 'process_data', {
  enumerable: true,
  get: function get() {
    return _chartsCore.process_data;
  }
});

var _chartsFlot = require('./charts/flot');

exports.FlotChartRenderer = _interopRequire(_chartsFlot);

var _chartsGraphite = require('./charts/graphite');

Object.defineProperty(exports, 'composer_url', {
  enumerable: true,
  get: function get() {
    return _chartsGraphite.composer_url;
  }
});
Object.defineProperty(exports, 'chart_url', {
  enumerable: true,
  get: function get() {
    return _chartsGraphite.chart_url;
  }
});
exports.GraphiteChartRenderer = _interopRequire(_chartsGraphite);

var _chartsPlaceholder = require('./charts/placeholder');

exports.PlaceholderChartRenderer = _interopRequire(_chartsPlaceholder);

var _chartsPalettes = require('./charts/palettes');

exports.palettes = _interopRequire(_chartsPalettes);

var _chartsUtil = require('./charts/util');


Object.defineProperty(exports, 'get_palette', {
  enumerable: true,
  get: function get() {
    return _chartsUtil.get_palette;
  }
});
Object.defineProperty(exports, 'get_low_contrast_palette', {
  enumerable: true,
  get: function get() {
    return _chartsUtil.get_low_contrast_palette;
  }
});

},{"./charts/core":17,"./charts/flot":18,"./charts/graphite":19,"./charts/palettes":20,"./charts/placeholder":21,"./charts/util":22,"./models/items/chart":46}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.set_renderer = set_renderer;
exports.get_renderer = get_renderer;
exports.simple_line_chart = simple_line_chart;
exports.standard_line_chart = standard_line_chart;
exports.simple_area_chart = simple_area_chart;
exports.stacked_area_chart = stacked_area_chart;
exports.donut_chart = donut_chart;
exports.bar_chart = bar_chart;
exports.discrete_bar_chart = discrete_bar_chart;
exports.process_series = process_series;
exports.process_data = process_data;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _modelsItemsItem = require('../models/items/item');

var _modelsItemsItem2 = _interopRequireDefault(_modelsItemsItem);

var _coreRegistry = require('../core/registry');

var DEFAULT_PALETTE = 'spectrum6';
exports.DEFAULT_PALETTE = DEFAULT_PALETTE;
var log = core.logger('charts');
var StackMode = {
    NONE: 'none',
    NORMAL: 'stack',
    PERCENT: 'percent',
    STREAM: 'stream'
};
exports.StackMode = StackMode;

var ChartRenderer = (function () {
    function ChartRenderer(data) {
        _classCallCheck(this, ChartRenderer);

        if (data) {
            this.name = data.name;
            this.is_interactive = !!data.is_interactive;
            this.description = data.description;
        }
    }

    _createClass(ChartRenderer, [{
        key: 'simple_line_chart',
        value: function simple_line_chart(element, item, query) {}
    }, {
        key: 'standard_line_chart',
        value: function standard_line_chart(element, item, query) {}
    }, {
        key: 'simple_area_chart',
        value: function simple_area_chart(element, item, query) {}
    }, {
        key: 'stacked_area_chart',
        value: function stacked_area_chart(element, item, query) {}
    }, {
        key: 'donut_chart',
        value: function donut_chart(element, item, query) {}
    }, {
        key: 'bar_chart',
        value: function bar_chart(element, item, query) {}
    }, {
        key: 'discrete_bar_chart',
        value: function discrete_bar_chart(element, item, query) {}
    }, {
        key: 'process_series',
        value: function process_series(series) {
            return series;
        }
    }, {
        key: 'process_data',
        value: function process_data(data) {
            var _this = this;

            if (!data) {
                return [];
            }
            if (data instanceof Array) {
                return data.map(function (series) {
                    return _this.process_series(series);
                });
            } else {
                return [this.process_series(data)];
            }
        }
    }]);

    return ChartRenderer;
})();

exports.ChartRenderer = ChartRenderer;
var renderers = new _coreRegistry.Registry({
    name: 'chart-renderers'
});
exports.renderers = renderers;
var renderer;
exports.renderer = renderer;

function set_renderer(r) {
    log.debug('set_renderer(): ' + r);
    if (typeof r === 'string') {
        var _renderer = renderers.get(r);
        if (!_renderer) {
            log.error('Unknown renderer ' + r);
        } else {
            exports.renderer = renderer = _renderer;
        }
    } else {
        exports.renderer = renderer = r;
    }
}

/* =============================================================================
   Global delegates
   ============================================================================= */

function get_renderer(item) {
    if (!item) {
        return renderer;
    }
    var name = undefined;
    if (typeof item === 'string') {
        name = item;
    } else {
        name = item['renderer'];
    }
    if (item instanceof _modelsItemsItem2['default']) {
        if (!name && item.dashboard && item.dashboard.definition) {
            name = item.dashboard.definition.renderer;
        }
    }
    return renderers.get(name) || renderer;
}

function simple_line_chart(element, item, query) {
    var r = get_renderer(item);
    if (r) {
        r.simple_line_chart(element, item, query);
    }
}

function standard_line_chart(element, item, query) {
    var r = get_renderer(item);
    if (r) {
        r.standard_line_chart(element, item, query);
    }
}

function simple_area_chart(element, item, query) {
    var r = get_renderer(item);
    if (r) {
        r.simple_area_chart(element, item, query);
    }
}

function stacked_area_chart(element, item, query) {
    var r = get_renderer(item);
    if (r) {
        r.stacked_area_chart(element, item, query);
    }
}

function donut_chart(element, item, query) {
    var r = get_renderer(item);
    if (r) {
        r.donut_chart(element, item, query);
    }
}

function bar_chart(element, item, query) {
    var r = get_renderer(item);
    if (r) {
        r.bar_chart(element, item, query);
    }
}

function discrete_bar_chart(element, item, query) {
    var r = get_renderer(item);
    if (r) {
        r.discrete_bar_chart(element, item, query);
    }
}

function process_series(series, type) {
    var r = get_renderer(type);
    return r ? r.process_series(series) : series;
}

function process_data(data, type) {
    var r = get_renderer(type);
    return r ? r.process_data(data) : data;
}



},{"../core":24,"../core/registry":30,"../models/items/item":56}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('./core');

var charts = _interopRequireWildcard(_core);

var _modelsItemsChart = require('../models/items/chart');

var _util = require('./util');

var _coreUtil = require('../core/util');

var _coreLog = require('../core/log');

var _appApp = require('../app/app');

var app = _interopRequireWildcard(_appApp);

var log = (0, _coreLog.logger)('charts.flot');
/* =============================================================================
   Helpers
   ============================================================================= */
var FORMAT_STRING_STANDARD = ',.3s';
var FORMAT_STANDARD = d3.format(FORMAT_STRING_STANDARD);
var FORMAT_PERCENT = d3.format('%');
var THREE_HOURS_MS = 1000 * 60 * 60 * 3;
var ONE_HOUR_MS = 1000 * 60 * 60 * 1;
function get_default_options() {
    var theme_colors = (0, _util.get_colors)();
    var default_options = {
        colors: (0, _util.get_palette)(),
        downsample: false,
        series: {
            lines: {
                show: true,
                lineWidth: 1,
                steps: false,
                fill: false
            },
            valueLabels: { show: false },
            points: { show: false },
            bars: { lineWidth: 1, show: false },
            stackD3: { show: false }
        },
        xaxis: {
            mode: "time",
            tickFormatter: function tickFormatter(value, axis) {
                // Take care of time series axis
                if (axis.tickSize && axis.tickSize.length === 2) {
                    if (axis.tickSize[1] === 'year' && axis.tickSize[0] >= 1) return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('YYYY');
                    if (axis.tickSize[1] === 'month' && axis.tickSize[0] >= 1 || axis.tickSize[1] === 'year') return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM-\'YY');
                    if (axis.tickSize[1] === 'day' && axis.tickSize[0] >= 1 || axis.tickSize[1] === 'month') return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM/DD');
                    if (axis.tickSize[1] === 'hour' && axis.tickSize[0] >= 12) return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('MM/DD hA');
                }
                return moment(value).tz(app.config.DISPLAY_TIMEZONE).format('h:mm A');
            },
            tickColor: theme_colors.minorGridLineColor,
            font: {
                color: theme_colors.fgcolor,
                size: 12
            }
        },
        yaxes: [{
            position: 'left',
            tickFormatter: FORMAT_STANDARD,
            reserveSpace: 30,
            labelWidth: 30,
            tickColor: theme_colors.minorGridLineColor,
            font: {
                color: theme_colors.fgcolor,
                size: 12
            }
        }, {
            position: 'right',
            tickFormatter: FORMAT_STANDARD,
            font: {
                color: theme_colors.fgcolor,
                size: 12
            }
        }],
        points: {
            show: false,
            radius: 2,
            symbol: "circle"
        },
        shadowSize: 0,
        legend: { show: false },
        grid: {
            borderWidth: 1,
            hoverable: true,
            clickable: true,
            autoHighlight: false,
            /* grid.color actually sets the color of the legend
             * text. WTH? */
            color: theme_colors.fgcolor,
            borderColor: theme_colors.minorGridLineColor
        },
        selection: {
            mode: "x",
            color: "red"
        },
        multihighlight: {
            mode: "x"
        },
        crosshair: {
            mode: "x",
            color: "#BBB",
            lineWidth: 1
        }
    };
    return default_options;
}
function get_flot_options(item, base) {
    var options = item.options || {};
    var flot_options = (0, _coreUtil.extend)(true, {}, get_default_options(), base);
    flot_options.colors = (0, _util.get_palette)(options.palette);
    if (options.y1 && options.y1.min) flot_options.yaxes[0].min = options.y1.min;
    if (options.y2 && options.y2.min) flot_options.yaxes[1].min = options.y2.min;
    if (options.y1 && options.y1.max) flot_options.yaxes[0].max = options.y1.max;
    if (options.y2 && options.y2.max) flot_options.yaxes[1].max = options.y2.max;
    if (options.y1 && options.y1.label) flot_options.yaxes[0].axisLabel = options.y1.label;
    if (options.y2 && options.y2.label) flot_options.yaxes[1].axisLabel = options.y2.label;
    if (item.show_max_value || item.show_min_value || item.show_last_value) {
        flot_options.series.valueLabels = {
            show: true,
            showMaxValue: item.show_max_value,
            showMinValue: item.show_min_value,
            showLastValue: item.show_last_value,
            showAsHtml: true,
            labelFormatter: FORMAT_STANDARD,
            yoffset: -20
        };
    }
    return flot_options;
}
function show_tooltip(x, y, contents, offset) {
    $('<div id="ds-tooltip">' + contents + '</div>').css({
        position: 'absolute',
        display: 'none',
        top: y + (offset || 5),
        left: x + (offset || 5)
    }).appendTo("body").show();
}
function setup_plugins(container, context) {
    $(container).bind("multihighlighted", function (event, pos, items) {
        if (!items) return;
        var is_percent = context.item.stack_mode && context.item.stack_mode === charts.StackMode.PERCENT;
        var data = context.plot.getData();
        var item = items[0];
        var point = data[item.serieIndex].data[item.dataIndex];
        var contents = ts.templates.flot.tooltip({
            time: point[0],
            items: items.map(function (item) {
                var s = data[item.serieIndex];
                var value = is_percent ? s.percents[item.dataIndex] : s.data[item.dataIndex][1];
                return {
                    series: s,
                    value: is_percent ? FORMAT_PERCENT(value) : FORMAT_STANDARD(value)
                };
            })
        });
        $("#ds-tooltip").remove();
        show_tooltip(pos.pageX, pos.pageY, contents);
    });
    $(container).bind("unmultihighlighted", function (event) {
        $("#ds-tooltip").remove();
    });
}
function render_legend(item, query, options) {
    var legend_id = '#ds-legend-' + item.item_id;
    if (item.legend === _modelsItemsChart.ChartLegendType.SIMPLE) {
        render_simple_legend(legend_id, item, query, options);
    } else if (item.legend === _modelsItemsChart.ChartLegendType.TABLE) {}
}
function render_simple_legend(legend_id, item, query, options) {
    var legend = '';
    var data = query.chart_data('flot');
    for (var i = 0; i < data.length; i++) {
        var series = data[i];
        if (item.hide_zero_series && series.summation.sum === 0) {
            continue;
        }
        var label = series.label;
        var color = options.colors[i % options.colors.length];
        var cell = '<div class="ds-legend-cell">' + '<span class="color" style="background-color:' + color + '"></span>' + '<span class="label" style="color:' + options.xaxis.font.color + '">' + label + '</span>' + '</div>';
        legend += cell;
    }
    var elt = $(legend_id);
    elt.html(legend);
    elt.equalize({ equalize: 'outerWidth', reset: true });
}
/* =============================================================================
   Chart renderer interface
   ============================================================================= */

var FlotChartRenderer = (function (_charts$ChartRenderer) {
    _inherits(FlotChartRenderer, _charts$ChartRenderer);

    function FlotChartRenderer(data) {
        _classCallCheck(this, FlotChartRenderer);

        _get(Object.getPrototypeOf(FlotChartRenderer.prototype), 'constructor', this).call(this, (0, _coreUtil.extend)({}, data, {
            name: 'flot',
            is_interactive: true,
            description: 'flot renders interactive charts using HTML canvas.'
        }));
        this.downsample = true;
        this.downsampling_factor = 0.8;
        this.connected_lines = false;
        if (data) {
            if (typeof data.downsample !== 'undefined') {
                this.downsample = !!data.downsample;
            }
            if (typeof data.connected_lines !== 'undefined') {
                this.connected_lines = !!data.connected_lines;
            }
            this.downsampling_factor = data.downsampling_factor || this.downsampling_factor;
        }
    }

    _createClass(FlotChartRenderer, [{
        key: 'render',
        value: function render(e, item, query, options, data) {
            if (typeof data === 'undefined') data = query.chart_data('flot');
            var context = {
                plot: null,
                item: item,
                query: query
            };
            setup_plugins(e, context);
            if (this.downsample && options.downsample) {
                options.series.downsample = {
                    threshold: Math.floor(e.width() * this.downsampling_factor)
                };
            } else {
                options.series.downsample = { threshold: 0 };
            }
            try {
                context.plot = $.plot($(e), data, options);
            } catch (ex) {
                log.error('Error rendering item ' + item.item_id + ': ' + ex.message);
                log.error(ex.stack);
            }
            render_legend(item, query, options);
            return context;
        }
    }, {
        key: 'process_series',
        value: function process_series(series) {
            var result = {};
            if (series.summation) {
                result.summation = series.summation;
            }
            result.label = series.target;
            result.data = series.datapoints.map(function (point) {
                return [point[1] * 1000, point[0]];
            });
            if (this.connected_lines) {
                result.data = result.data.filter(function (point) {
                    return point[1] != null;
                });
            }
            return result;
        }
    }, {
        key: 'simple_line_chart',
        value: function simple_line_chart(element, item, query) {
            var options = get_flot_options(item, {
                grid: { show: false },
                downsample: true
            });
            this.render(element, item, query, options, [query.chart_data('flot')[0]]);
        }
    }, {
        key: 'standard_line_chart',
        value: function standard_line_chart(element, item, query) {
            query.chart_data('flot').forEach(function (series) {
                if (series.summation.sum === 0) {
                    series.lines = {
                        lineWidth: 0
                    };
                }
            });
            this.render(element, item, query, get_flot_options(item, {
                downsample: true
            }));
        }
    }, {
        key: 'simple_area_chart',
        value: function simple_area_chart(element, item, query) {
            var options = get_flot_options(item, {
                downsample: true,
                grid: { show: false },
                series: {
                    lines: { fill: 1.0 },
                    grid: { show: false }
                }
            });
            this.render(element, item, query, options, [query.chart_data('flot')[0]]);
        }
    }, {
        key: 'stacked_area_chart',
        value: function stacked_area_chart(element, item, query) {
            var options = get_flot_options(item, {
                downsample: true,
                series: {
                    lines: { fill: 1 },
                    stackD3: {
                        show: true,
                        offset: 'zero'
                    }
                }
            });
            if (item['stack_mode']) {
                var mode = item['stack_mode'];
                if (mode === charts.StackMode.PERCENT) {
                    options.series.stackD3.offset = 'expand';
                    options.yaxes[0].max = 1;
                    options.yaxes[0].min = 0;
                    options.yaxes[0].tickFormatter = FORMAT_PERCENT;
                } else if (mode == charts.StackMode.STREAM) {
                    options.series.stackD3.offset = 'wiggle';
                } else if (mode == charts.StackMode.NONE) {
                    options.series.stackD3.show = false;
                    options.series.lines.fill = false;
                }
            }
            query.chart_data('flot').forEach(function (series) {
                if (series.summation.sum === 0) {
                    series.lines = {
                        lineWidth: 0
                    };
                }
            });
            this.render(element, item, query, options);
        }
    }, {
        key: 'donut_chart',
        value: function donut_chart(element, item, query) {
            var options = get_flot_options(item, {
                crosshair: { mode: null },
                multihighlight: { mode: null },
                series: {
                    lines: { show: false },
                    pie: {
                        show: true,
                        radius: 'auto',
                        innerRadius: item['is_pie'] ? 0 : 0.35,
                        label: { show: item['labels'] },
                        highlight: {
                            opacity: 0
                        }
                    }
                },
                grid: { show: false, hoverable: true }
            });
            var transform = item['transform'] || 'sum';
            var data = query.chart_data('flot').map(function (series) {
                if (item.hide_zero_series && series.summation.sum === 0) {
                    return undefined;
                }
                return {
                    label: series.label,
                    summation: series.summation,
                    data: [series.label, series.summation[transform]]
                };
            }).filter(function (item) {
                return item;
            });
            var context = this.render(element, item, query, options, data);
            $(element).bind('plothover', function (event, pos, event_item) {
                if (event_item) {
                    var contents = ts.templates.flot.donut_tooltip({
                        series: event_item.series,
                        value: FORMAT_STANDARD(event_item.datapoint[1][0][1]),
                        percent: FORMAT_PERCENT(event_item.series.percent / 100)
                    });
                    $("#ds-tooltip").remove();
                    show_tooltip(pos.pageX, pos.pageY, contents);
                } else {
                    $("#ds-tooltip").remove();
                }
            });
        }
    }, {
        key: 'bar_chart',
        value: function bar_chart(element, item, query) {
            var series = query.chart_data('flot')[0];
            var ts_start = series.data[0][0];
            var ts_end = series.data[series.data.length - 1][0];
            var ts_length = ts_end - ts_start;
            var sample_size = ts_length / series.data.length;
            var bar_scaling = 0.85;
            if (ts_length > THREE_HOURS_MS) {
                bar_scaling = 0.15;
            } else if (ts_length > ONE_HOUR_MS) {
                bar_scaling = 0.65;
            } else {
                bar_scaling = 0.85;
            }
            var options = get_flot_options(item, {
                series: {
                    lines: { show: false },
                    stackD3: {
                        show: true,
                        offset: 'zero'
                    },
                    bars: {
                        show: true,
                        fill: 0.8,
                        barWidth: sample_size * bar_scaling
                    }
                }
            });
            if (item['stack_mode']) {
                var mode = item['stack_mode'];
                if (mode === charts.StackMode.PERCENT) {
                    options.series.stackD3.offset = 'expand';
                    options.yaxes[0].max = 1;
                    options.yaxes[0].min = 0;
                    options.yaxes[0].tickFormatter = FORMAT_PERCENT;
                } else if (mode == charts.StackMode.STREAM) {
                    options.series.stackD3.offset = 'wiggle';
                } else if (mode == charts.StackMode.NONE) {
                    options.series.stackD3.show = false;
                    options.series.lines.fill = false;
                }
            }
            this.render(element, item, query, options);
        }
    }, {
        key: 'discrete_bar_chart',
        value: function discrete_bar_chart(element, item, query) {
            var is_horizontal = item['orientation'] === 'horizontal';
            var format = d3.format(item['format'] || FORMAT_STRING_STANDARD);
            var options = get_flot_options(item, {
                xaxis: { mode: null },
                multihighlight: { mode: null },
                crosshair: { mode: null },
                grid: {
                    borderWidth: 0,
                    color: 'transparent',
                    borderColor: 'transparent',
                    labelMargin: 10
                },
                series: {
                    lines: { show: false },
                    bars: {
                        horizontal: is_horizontal,
                        show: true,
                        barWidth: 0.8,
                        align: 'center',
                        fill: 0.75,
                        numbers: {
                            show: item['show_numbers'],
                            font: '10pt Helvetica',
                            fontColor: '#f9f9f9',
                            formatter: format,
                            yAlign: function yAlign(y) {
                                return y;
                            },
                            xAlign: function xAlign(x) {
                                return x;
                            }
                        }
                    }
                }
            });
            var transform = item['transform'] || 'sum';
            var index = 0;
            var data = query.chart_data('flot').map(function (series) {
                if (item.hide_zero_series && series.summation.sum === 0) {
                    return undefined;
                }
                return {
                    label: series.label,
                    data: [is_horizontal ? [series.summation[transform], index] : [index, series.summation[transform]]],
                    color: options.colors[options.colors % index++]
                };
            }).filter(function (item) {
                return item;
            });
            index = 0;
            var ticks = data.map(function (series) {
                return [index++, series.label];
            });
            if (is_horizontal) {
                options.yaxes[0].tickLength = 0;
                options.yaxes[0].ticks = ticks;
                options.xaxis.tickFormatter = null;
                options.series.bars.numbers.xOffset = -18;
                if (item['show_grid']) {
                    options.xaxis.axisLabel = options.yaxes[0].axisLabel;
                    options.yaxes[0].axisLabel = transform.charAt(0).toUpperCase() + transform.substring(1);
                } else {
                    options.xaxis.ticks = [];
                    options.yaxes[0].axisLabel = null;
                }
            } else {
                options.xaxis.tickLength = 0;
                options.xaxis.ticks = ticks;
                options.series.bars.numbers.yOffset = 12;
                if (!item['show_grid']) {
                    options.yaxes[0].ticks = [];
                    options.yaxes[0].axisLabel = null;
                } else {
                    options.xaxis.axisLabel = transform.charAt(0).toUpperCase() + transform.substring(1);
                }
            }
            var context = this.render(element, item, query, options, data);
            $(element).bind('plothover', function (event, pos, event_item) {
                if (event_item) {
                    var contents = ts.templates.flot.discrete_bar_tooltip({
                        series: event_item.series,
                        value: format(event_item.datapoint[1])
                    });
                    $("#ds-tooltip").remove();
                    show_tooltip(pos.pageX, pos.pageY, contents);
                } else {
                    $("#ds-tooltip").remove();
                }
            });
        }
    }]);

    return FlotChartRenderer;
})(charts.ChartRenderer)

;

exports['default'] = FlotChartRenderer;
module.exports = exports['default'];

},{"../app/app":2,"../core/log":28,"../core/util":32,"../models/items/chart":46,"./core":17,"./util":22}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.composer_url = composer_url;
exports.chart_url = chart_url;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('./core');

var charts = _interopRequireWildcard(_core);

var _util = require('./util');

var _coreUtil = require('../core/util');

function img(element, url) {
    element.html($('<img/>').attr('src', url.href()).height(element.height()).width(element.width()));
}
/**
 * Charts provider for Graphite's built-in static image
 * rendering. Also provides Graphite URL formatting for a number of
 * the UI's actions (Open in Graphite..., Export PNG..., etc...)
 */

var GraphiteChartRenderer = (function (_charts$ChartRenderer) {
    _inherits(GraphiteChartRenderer, _charts$ChartRenderer);

    function GraphiteChartRenderer(data) {
        _classCallCheck(this, GraphiteChartRenderer);

        _get(Object.getPrototypeOf(GraphiteChartRenderer.prototype), 'constructor', this).call(this, (0, _coreUtil.extend)({}, data, {
            name: 'graphite',
            is_interactive: false,
            description: "Render graphs using Graphite's built-in static PNG rendering. " + "No interactive features will be available with this option, " + "and not all chart types will render with fidelity."
        }));
        this.connected_lines = false;
        if (data) {
            this.graphite_url = data.graphite_url;
            this.connected_lines = !!data.connected_lines;
        }
    }

    _createClass(GraphiteChartRenderer, [{
        key: 'simple_line_chart',
        value: function simple_line_chart(element, item, query) {
            var url = this.simple_line_chart_url(item, query, {
                height: element.height(),
                width: element.width()
            });
            img(element, url);
        }
    }, {
        key: 'simple_line_chart_url',
        value: function simple_line_chart_url(item, query, opt) {
            var options = (0, _coreUtil.extend)({}, opt, item.options, (0, _util.get_colors)());
            var png_url = new URI(query.url({ base_url: this.graphite_url })).setQuery('format', options.format || 'png').setQuery('height', options.height || 600).setQuery('width', options.width || 1200).setQuery('bgcolor', options.bgcolor || GraphiteChartRenderer.DEFAULT_BGCOLOR).setQuery('fgcolor', options.fgcolor || 'white').setQuery('hideLegend', 'true').setQuery('hideAxes', 'true').setQuery('margin', '0').setQuery('colorList', (0, _util.get_palette)(options.palette).join()).setQuery('title', options.showTitle ? item.title : '');
            if (this.connected_lines) {
                png_url.setQuery('lineMode', 'connected');
            }
            if (options.y1 && options.y1.min) {
                png_url.setQuery('yMin', options.y1.min);
            }
            if (options.y1 && options.y1.max) {
                png_url.setQuery('yMax', options.y1.max);
            }
            return png_url;
        }
    }, {
        key: 'standard_line_chart',
        value: function standard_line_chart(element, item, query) {
            var url = this.standard_line_chart_url(item, query, {
                height: element.height(),
                width: element.width()
            });
            img(element, url);
        }
    }, {
        key: 'standard_line_chart_url',
        value: function standard_line_chart_url(item, query, opt) {
            var options = (0, _coreUtil.extend)({}, opt, item.options, (0, _util.get_colors)());
            var png_url = new URI(query.url({ base_url: this.graphite_url })).setQuery('format', options.format || 'png').setQuery('height', options.height || 600).setQuery('width', options.width || 1200).setQuery('bgcolor', options.bgcolor || GraphiteChartRenderer.DEFAULT_BGCOLOR).setQuery('fgcolor', options.fgcolor || 'black').setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd').setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee').setQuery('hideLegend', options.hideLegend || 'false').setQuery('hideAxes', options.hideAxes || 'false').setQuery('colorList', (0, _util.get_palette)(options.palette).join()).setQuery('vtitle', options.y1 ? options.y1.label : options.yAxisLabel).setQuery('title', options.showTitle ? item.title : '').setQuery('lineMode', 'connected');
            if (options.y1 && options.y1.min) {
                png_url.setQuery('yMin', options.y1.min);
            }
            if (options.y1 && options.y1.max) {
                png_url.setQuery('yMax', options.y1.max);
            }
            return png_url;
        }
    }, {
        key: 'simple_area_chart',
        value: function simple_area_chart(element, item, query) {
            var url = this.simple_area_chart_url(item, query, {
                height: element.height(),
                width: element.width()
            });
            img(element, url);
        }
    }, {
        key: 'simple_area_chart_url',
        value: function simple_area_chart_url(item, query, opt) {
            var options = (0, _coreUtil.extend)({}, opt, item.options, (0, _util.get_colors)());
            var png_url = new URI(query.url({ base_url: this.graphite_url })).setQuery('format', options.format || 'png').setQuery('height', options.height || 600).setQuery('width', options.width || 1200).setQuery('bgcolor', options.bgcolor || GraphiteChartRenderer.DEFAULT_BGCOLOR).setQuery('fgcolor', options.fgcolor || 'black').setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd').setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee').setQuery('hideLegend', 'true').setQuery('hideAxes', 'true').setQuery('margin', '0').setQuery('colorList', (0, _util.get_palette)(options.palette).join()).setQuery('lineMode', 'connected');
            if (!query.is_stacked()) {
                png_url.setQuery('areaMode', 'stacked');
            }
            if (options.y1 && options.y1.min) {
                png_url.setQuery('yMin', options.y1.min);
            }
            if (options.y1 && options.y1.max) {
                png_url.setQuery('yMax', options.y1.max);
            }
            return png_url;
        }
    }, {
        key: 'stacked_area_chart',
        value: function stacked_area_chart(element, item, query) {
            var url = this.stacked_area_chart_url(item, query, {
                height: element.height(),
                width: element.width()
            });
            img(element, url);
        }
    }, {
        key: 'stacked_area_chart_url',
        value: function stacked_area_chart_url(item, query, opt) {
            var options = (0, _coreUtil.extend)({}, opt, item.options, (0, _util.get_colors)());
            var png_url = new URI(query.url({ base_url: this.graphite_url })).setQuery('format', options.format || 'png').setQuery('height', options.height || 600).setQuery('width', options.width || 1200).setQuery('bgcolor', options.bgcolor || GraphiteChartRenderer.DEFAULT_BGCOLOR).setQuery('fgcolor', options.fgcolor || 'black').setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd').setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee').setQuery('hideLegend', options.hideLegend || 'false').setQuery('hideAxes', options.hideAxes || 'false').setQuery('colorList', (0, _util.get_palette)(options.palette).join()).setQuery('vtitle', options.y1 ? options.y1.label : options.yAxisLabel).setQuery('title', options.showTitle ? item.title : '').setQuery('lineMode', 'connected');
            if (item.hasOwnProperty('stack_mode')) {
                if (!query.is_stacked() && item['stack_mode'] != charts.StackMode.NONE) {
                    png_url.setQuery('areaMode', 'stacked');
                }
            }
            if (options.y1 && options.y1.min) {
                png_url.setQuery('yMin', options.y1.min);
            }
            if (options.y1 && options.y1.max) {
                png_url.setQuery('yMax', options.y1.max);
            }
            return png_url;
        }
    }, {
        key: 'donut_chart_url',
        value: function donut_chart_url(item, query, opt) {
            var png_url = this.standard_line_chart_url(item, query, opt).setQuery('graphType', 'pie');
            // TODO
            // if (!item.legend) {
            // png_url.setQuery('hideLegend', 'true')
            // }
            return png_url;
        }
    }, {
        key: 'donut_chart',
        value: function donut_chart(element, item, query) {
            var url = this.donut_chart_url(item, query, {
                height: element.height(),
                width: element.width()
            });
            img(element, url);
        }
    }, {
        key: 'bar_chart',
        value: function bar_chart(element, item, query) {
            this.stacked_area_chart(element, item, query);
        }
    }, {
        key: 'discrete_bar_chart',
        value: function discrete_bar_chart(element, item, query) {
            this.donut_chart(element, item, query);
        }
    }, {
        key: 'chart_url',
        value: function chart_url(item, query, opt) {
            switch (item.item_type) {
                case 'simple_time_series':
                    return item['filled'] ? this.simple_area_chart_url(item, query, opt) : this.simple_line_chart_url(item, query, opt);
                case 'standard_time_series':
                    return this.standard_line_chart_url(item, query, opt);
                case 'stacked_area_chart':
                    return this.stacked_area_chart_url(item, query, opt);
                case 'singlegraph':
                    return this.simple_area_chart_url(item, query, opt);
                case 'donut_chart':
                    return this.donut_chart_url(item, query, opt);
            }
            return undefined;
        }
    }, {
        key: 'composer_url',
        value: function composer_url(item, query, opt) {
            var options = opt || {};
            var composer_url = new URI(query.url({ base_url: this.graphite_url })).filename('composer').removeQuery('format').setQuery('colorList', (0, _util.get_palette)(options.palette).join()).setQuery('vtitle', options.yAxisLabel).setQuery('title', options.showTitle ? item.title : '');
            if (item.item_type === 'stacked_area_chart' && !query.is_stacked()) {
                composer_url.setQuery('areaMode', 'stacked');
            }
            return composer_url;
        }
    }]);

    return GraphiteChartRenderer;
})(charts.ChartRenderer);

exports['default'] = GraphiteChartRenderer;

GraphiteChartRenderer.DEFAULT_BGCOLOR = 'ff000000';

function composer_url(item, query, options) {
    var g = charts.renderers.get('graphite');
    return g.composer_url(item, query, options);
}

function chart_url(item, query, options) {
    var g = charts.renderers.get('graphite');
    return g.chart_url(item, query, options);
}



},{"../core/util":32,"./core":17,"./util":22}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = {
    applespectrum: ["#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f"],
    appleblue: ["#4972a8", "#92b9d8", "#002d64", "#599bcf", "#134d8d"],
    applebrown: ["#8b6c4f", "#c8b68e", "#3b291d", "#ae8e5d", "#713f24"],
    applegrey: ["#717372", "#c0c2c1", "#2d2f2e", "#8c8e8d", "#484a49"],
    applegreen: ["#2d632f", "#90b879", "#0d2d16", "#599a48", "#00431a"],
    tableau10: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    tableau20: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"],
    manyeyes: ["#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194", "#7b4173"],
    numbers6: ["#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f"],
    excel10: ["#365e96", "#983334", "#77973d", "#5d437c", "#36869f", "#d1702f", "#8197c5", "#c47f80", "#acc484", "#9887b0"],
    economist: ["#621e15", "#e59076", "#128dcd", "#083c52", "#64c5f2", "#61afaf", "#0f7369", "#9c9da1"],
    brewerq9: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"],
    brewerq10: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a"],
    brewerq12: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"],
    brewerdiv1: ["#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac", "#01665e"],
    brewerdiv2: ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"],
    brewerdiv3: ["#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b", "#1b7837"],
    brewerdiv4: ["#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb", "#4575b4"],
    marketmap: ["#fa0007", "#ac0000", "#4e0300", "#000000", "#005101", "#06a200", "#07ff00"],
    // some more color palettes from rickshaw
    spectrum6: ["#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3", "#649eb9", "#387aa3"].reverse(),
    spectrum14: ["#ecb796", "#dc8f70", "#b2a470", "#92875a", "#716c49", "#d2ed82", "#bbe468", "#a1d05d", "#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3", "#649eb9", "#387aa3"].reverse(),
    spectrum2000: ["#57306f", "#514c76", "#646583", "#738394", "#6b9c7d", "#84b665", "#a7ca50", "#bfe746", "#e2f528", "#fff726", "#ecdd00", "#d4b11d", "#de8800", "#de4800", "#c91515", "#9a0000", "#7b0429", "#580839", "#31082b"],
    spectrum2001: ["#2f243f", "#3c2c55", "#4a3768", "#565270", "#6b6b7c", "#72957f", "#86ad6e", "#a1bc5e", "#b8d954", "#d3e04e", "#ccad2a", "#cc8412", "#c1521d", "#ad3821", "#8a1010", "#681717", "#531e1e", "#3d1818", "#320a1b"],
    classic9: ["#423d4f", "#4a6860", "#848f39", "#a2b73c", "#ddcb53", "#c5a32f", "#7d5836", "#963b20", "#7c2626", "#491d37", "#2f254a"].reverse(),
    colorwheel: ["#b5b6a9", "#858772", "#785f43", "#96557e", "#4682b4", "#65b9ac", "#73c03a", "#cb513a"].reverse(),
    cool: ["#5e9d2f", "#73c03a", "#4682b4", "#7bc3b8", "#a9884e", "#c1b266", "#a47493", "#c09fb5"],
    munin: ["#00cc00", "#0066b3", "#ff8000", "#ffcc00", "#330099", "#990099", "#ccff00", "#ff0000", "#808080", "#008f00", "#00487d", "#b35a00", "#b38f00", "#6b006b", "#8fb300", "#b30000", "#bebebe", "#80ff80", "#80c9ff", "#ffc080", "#ffe680", "#aa80ff", "#ee00cc", "#ff8080", "#666600", "#ffbfff", "#00ffcc", "#cc6699", "#999900"],
    // some more color palettes from d3.js
    d3category10: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    d3category20: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"],
    d3category20b: ["#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"],
    d3category20c: ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"],
    // Here are a couple of intentionally low-contrast palettes
    // which intended to allow computed series (like
    // averageSeries(), highestAverage(), mostDeviant(), etc...) to
    // stand out over the noise of a ton of metric instances when
    // assigned their own color with the color() function.
    low_contrast_gray: ["#BBBBBB", "#C8C8C8", "#D5D5D5", "#E1E1E1", "#EEEEEE"],
    low_contrast_blue: ["#AAAABB", "#B7B7C8", "#C4C4D5", "#D0D0E1", "#DDDDEE", "#EAEAFB"]
};


module.exports = exports["default"];

},{}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('./core');

var charts = _interopRequireWildcard(_core);

var _coreUtil = require('../core/util');

function render(element, item) {
    element.html($('<img/>').attr('data-src', 'holder.js/100px100p').height(element.height()).width(element.width()));
}
/**
 * A chart renderer that uses Holder.js to render placeholder images.
 */

var PlaceholderChartRenderer = (function (_charts$ChartRenderer) {
    _inherits(PlaceholderChartRenderer, _charts$ChartRenderer);

    function PlaceholderChartRenderer(data) {
        _classCallCheck(this, PlaceholderChartRenderer);

        _get(Object.getPrototypeOf(PlaceholderChartRenderer.prototype), 'constructor', this).call(this, (0, _coreUtil.extend)({}, data, {
            name: 'placeholder',
            description: 'Render placeholder images in place of actual charts.',
            is_interactive: false
        }));
    }

    _createClass(PlaceholderChartRenderer, [{
        key: 'simple_line_chart',
        value: function simple_line_chart(element, item, query) {
            render(element, item);
        }
    }, {
        key: 'standard_line_chart',
        value: function standard_line_chart(element, item, query) {
            render(element, item);
        }
    }, {
        key: 'simple_area_chart',
        value: function simple_area_chart(element, item, query) {
            render(element, item);
        }
    }, {
        key: 'stacked_area_chart',
        value: function stacked_area_chart(element, item, query) {
            render(element, item);
        }
    }, {
        key: 'donut_chart',
        value: function donut_chart(element, item, query) {
            render(element, item);
        }
    }, {
        key: 'bar_chart',
        value: function bar_chart(element, item, query) {
            render(element, item);
        }
    }, {
        key: 'discrete_bar_chart',
        value: function discrete_bar_chart(element, item, query) {
            render(element, item);
        }
    }]);

    return PlaceholderChartRenderer;
})(charts.ChartRenderer)

;

exports['default'] = PlaceholderChartRenderer;
module.exports = exports['default'];

},{"../core/util":32,"./core":17}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.get_palette = get_palette;
exports.get_colors = get_colors;
exports.get_low_contrast_palette = get_low_contrast_palette;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _palettes = require('./palettes');

var _palettes2 = _interopRequireDefault(_palettes);

var DEFAULT_PALETTE = 'spectrum6';
exports.DEFAULT_PALETTE = DEFAULT_PALETTE;

function get_palette(name_or_palette) {
    if (name_or_palette instanceof Array) {
        return name_or_palette;
    } else if (typeof name_or_palette === 'string') {
        return _palettes2['default'][name_or_palette] || _palettes2['default'][DEFAULT_PALETTE];
    } else {
        return _palettes2['default'][DEFAULT_PALETTE];
    }
}

/**
 * Return a set of colors for rendering graphs that are tuned to
 * the current UI color theme. Colors are derived from the
 * background color of the 'body' element.
 *
 * TODO: cache the results keyed by background color.
 *
 * TODO: if the model had back links to containers, we could walk
 * up the containment hierarchy to see if the chart is contained
 * in something that has a background style set (i.e. well, alert,
 * etc...) and get the colors based on that.
 *
 * Or we could just pre-compute them all based on the background
 * colors from the CSS.
 */

function get_colors() {
    var color = Color(window.getComputedStyle($('body')[0]).backgroundColor);
    if (color.dark()) {
        return {
            majorGridLineColor: color.clone().lighten(0.75).hexString(),
            minorGridLineColor: color.clone().lighten(0.5).hexString(),
            fgcolor: color.clone().lighten(3.0).hexString()
        };
    } else {
        return {
            majorGridLineColor: color.clone().darken(0.15).hexString(),
            minorGridLineColor: color.clone().darken(0.05).hexString(),
            fgcolor: color.clone().darken(0.75).hexString()
        };
    }
}

/**
 * Return a low contrast monochromatic color palette for
 * transforms like HighlightAverage, which de-emphasize a mass of
 * raw metrics in order to highlight computed series.
 */

function get_low_contrast_palette() {
    /* TODO: get from options parameter */
    var light_step = 0.1,
        dark_step = 0.05,
        count = 6,
        bg = Color(window.getComputedStyle($('body')[0]).backgroundColor),
        color = bg.dark() ? bg.clone().lighten(0.25) : bg.clone().darken(0.1);
    var palette = [];
    for (var i = 0; i < count; i++) {
        palette.push(color.hexString());
        bg.dark() ? color.lighten(light_step) : color.darken(dark_step);
    }
    return palette;
}



},{"./palettes":20}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _core = require('./core');

var core = _interopRequireWildcard(_core);

var _models = require('./models');

var model = _interopRequireWildcard(_models);

var log = core.logger('client');
/**
 * Client for the Tessera REST API.
 *
 * TODO - find an isomorphic HTTP lib to remove the jQuery dependence,
 * so this client can eventually be isomorphic too (ditto for the
 * models and their rendering).
 */

var Client = (function () {
    function Client(data) {
        _classCallCheck(this, Client);

        if (data) {
            this.prefix = data.prefix;
        }
    }

    _createClass(Client, [{
        key: '_uri',
        value: function _uri(path) {
            return this.prefix && !path.startsWith(this.prefix) ? '' + this.prefix + path : path;
        }
    }, {
        key: '_get',
        value: function _get(path, options, converter) {
            var uri = this._uri(path);
            log.debug('GET ' + uri);
            return new Promise(function (resolve, reject) {
                $.ajax(core.extend({
                    type: 'GET',
                    url: uri,
                    dataType: 'json',
                    success: function success(data) {
                        if (converter) {
                            data = converter(data);
                        }
                        resolve(data);
                    },
                    error: function error(request, status, _error) {
                        reject({ request: request, status: status, error: _error });
                    }
                }, options));
            });
        }
    }, {
        key: '_put',
        value: function _put(path, data) {
            var uri = this._uri(path);
            log.debug('PUT ' + uri);
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: 'PUT',
                    url: uri,
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(core.json(data)),
                    success: function success(response) {
                        resolve(response);
                    },
                    error: function error(request, status, _error2) {
                        reject({ request: request, status: status, error: _error2 });
                    }
                });
            });
        }
    }, {
        key: '_post',
        value: function _post(path, data) {
            var uri = this._uri(path);
            log.debug('POST ' + uri);
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: 'POST',
                    url: uri,
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(core.json(data)),
                    success: function success(response) {
                        resolve(response);
                    },
                    error: function error(request, status, _error3) {
                        reject({ request: request, status: status, error: _error3 });
                    }
                });
            });
        }
    }, {
        key: '_delete',
        value: function _delete(path) {
            var uri = this._uri(path);
            log.debug('DELETE ' + uri);
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: 'DELETE',
                    url: uri,
                    success: function success(data) {
                        resolve(data);
                    },
                    error: function error(request, status, _error4) {
                        reject({ request: request, status: status, error: _error4 });
                    }
                });
            });
        }

        /* ----------------------------------------
           Dashboard API
           ---------------------------------------- */
    }, {
        key: 'dashboard_get',
        value: function dashboard_get(href) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return this._get(href, { data: options }, function (data) {
                return new model.Dashboard(data);
            });
        }
    }, {
        key: 'dashboard_get_for_rendering',
        value: function dashboard_get_for_rendering(id) {
            return this._get('/api/dashboard/' + id + '/for-rendering', {}, function (data) {
                return new model.DashboardTuple(data);
            });
        }
    }, {
        key: 'dashboard_get_by_id',
        value: function dashboard_get_by_id(id) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return this.dashboard_get('/api/dashboard/' + id, options);
        }
    }, {
        key: 'dashboard_create',
        value: function dashboard_create(db) {
            return this._post('/api/dashboard/', db);
        }
    }, {
        key: 'dashboard_update',
        value: function dashboard_update(db) {
            return this._put(db.href, db);
        }
    }, {
        key: 'dashboard_update_definition',
        value: function dashboard_update_definition(db) {
            return this._put(db.definition_href, db.definition);
        }

        /**
         * Delete a dashboard.
         *
         * @param db A dashboard instance, href, or ID.
         */
    }, {
        key: 'dashboard_delete',
        value: function dashboard_delete(db) {
            if (typeof db === 'string') {
                return this._delete(db);
            } else if (typeof db === 'number') {
                return this._delete('/api/dashboard/' + db);
            } else if (db instanceof model.Dashboard) {
                return this._delete(db.href);
            }
        }
    }, {
        key: 'dashboard_list',
        value: function dashboard_list() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (options.tag) {
                return this._get('/api/dashboard/tagged/' + options.tag, {}, function (data) {
                    return data.map(function (d) {
                        return new model.Dashboard(d);
                    });
                });
            } else if (options.category) {
                return this._get('/api/dashboard/category/' + options.category, {}, function (data) {
                    return data.map(function (d) {
                        return new model.Dashboard(d);
                    });
                });
            } else {
                return this._get(options.path || '/api/dashboard/', {}, function (data) {
                    return data.map(function (d) {
                        return new model.Dashboard(d);
                    });
                });
            }
        }
    }, {
        key: 'dashboard_categories',
        value: function dashboard_categories() {
            return this._get('/api/dashboard/category/', {});
        }

        /* ----------------------------------------
           Tag API
           ---------------------------------------- */
    }, {
        key: 'tag_list',
        value: function tag_list() {
            return this._get('/api/tag/', {});
        }
    }, {
        key: 'tag_get',
        value: function tag_get(href) {
            return this._get(href, {}, function (data) {
                return new model.Tag(data[0]);
            });
        }
    }, {
        key: 'tag_get_by_id',
        value: function tag_get_by_id(id) {
            return this._get('/api/tag/' + id, {}, function (data) {
                return new model.Tag(data[0]);
            });
        }

        /* ----------------------------------------
           Preferences
           ---------------------------------------- */
    }, {
        key: 'preferences_get',
        value: function preferences_get() {
            return this._get('/api/preferences', {}, function (data) {
                return new model.Preferences(data);
            });
        }
    }]);

    return Client;
})()

;

exports['default'] = Client;
module.exports = exports['default'];

},{"./core":24,"./models":38}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _coreUtil = require('./core/util');

Object.defineProperty(exports, 'json', {
  enumerable: true,
  get: function get() {
    return _coreUtil.json;
  }
});
Object.defineProperty(exports, 'extend', {
  enumerable: true,
  get: function get() {
    return _coreUtil.extend;
  }
});

var _coreLog = require('./core/log');

Object.defineProperty(exports, 'logger', {
  enumerable: true,
  get: function get() {
    return _coreLog.logger;
  }
});
Object.defineProperty(exports, 'LogLevel', {
  enumerable: true,
  get: function get() {
    return _coreLog.Level;
  }
});

var _coreAction = require('./core/action');

Object.defineProperty(exports, 'actions', {
  enumerable: true,
  get: function get() {
    return _coreAction.actions;
  }
});
exports.Action = _interopRequire(_coreAction);

var _coreTemplate = require('./core/template');

Object.defineProperty(exports, 'compile_template', {
  enumerable: true,
  get: function get() {
    return _coreTemplate.compile_template;
  }
});
Object.defineProperty(exports, 'render_template', {
  enumerable: true,
  get: function get() {
    return _coreTemplate.render_template;
  }
});

var _coreProperty = require('./core/property');

Object.defineProperty(exports, 'properties', {
  enumerable: true,
  get: function get() {
    return _coreProperty.properties;
  }
});
Object.defineProperty(exports, 'property', {
  enumerable: true,
  get: function get() {
    return _coreProperty.property;
  }
});
exports.Property = _interopRequire(_coreProperty);

var _coreRegistry = require('./core/registry');

Object.defineProperty(exports, 'Registry', {
  enumerable: true,
  get: function get() {
    return _coreRegistry.Registry;
  }
});

var _coreEvent = require('./core/event');

exports.events = _interopRequire(_coreEvent);

var _coreEventSource = require('./core/event-source');


exports.EventSource = _interopRequire(_coreEventSource);

},{"./core/action":25,"./core/event":27,"./core/event-source":26,"./core/log":28,"./core/property":29,"./core/registry":30,"./core/template":31,"./core/util":32}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _registry = require('./registry');

/**
 * An object describing a user-interface action. Actions may be
 * rendered as either a menu item in a dropdown or a button in a
 * button bar.
 */

var Action = (function () {
    function Action(data) {
        _classCallCheck(this, Action);

        if (data) {
            this.name = data.name;
            this.display = data.display;
            this.icon = data.icon;
            this.options = data.options;
            this.handler = data.handler;
            this.show = data.show;
            this.hide = data.hide;
            this.divider = data.divider;
            this.css = data.css;
            this._actions = data.actions;
            this.category = data.category;
        }
    }

    _createClass(Action, [{
        key: 'actions',
        get: function get() {
            if (typeof this._actions === 'undefined') {
                return undefined;
            } else if (typeof this._actions === 'string') {
                return actions.list(this._actions);
            } else if (this._actions instanceof Array) {
                return this._actions;
            } else {
                var fn = this._actions;
                return fn();
            }
        }
    }]);

    return Action;
})();

exports['default'] = Action;

Action.DIVIDER = new Action({ divider: true, name: 'DIVIDER' });
var actions = new _registry.Registry({
    name: 'actions',
    process: function process(data) {
        if (data instanceof Action) return data;
        return new Action(data);
    }
});

exports.actions = actions;

},{"./registry":30}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

var EventSource = (function () {
    function EventSource(data) {
        _classCallCheck(this, EventSource);
    }

    _createClass(EventSource, [{
        key: 'on',
        value: function on(event, handler) {
            _event2['default'].on(this, event, handler);
        }
    }, {
        key: 'off',
        value: function off(event) {
            _event2['default'].off(this, event);
        }
    }, {
        key: 'fire',
        value: function fire(event) {
            for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                data[_key - 1] = arguments[_key];
            }

            _event2['default'].fire.apply(_event2['default'], [this, event].concat(data));
            return this;
        }
    }]);

    return EventSource;
})()

;

exports['default'] = EventSource;
module.exports = exports['default'];

},{"./event":27}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.set_provider = set_provider;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _log = require('./log');

var log = (0, _log.logger)('events');
/**
 * A delegating event provider which just logs and forwards all calls
 * to another provider.
 */

var LoggingEventProvider = (function () {
    function LoggingEventProvider(provider) {
        _classCallCheck(this, LoggingEventProvider);

        this.provider = provider;
    }

    _createClass(LoggingEventProvider, [{
        key: 'on',
        value: function on(target, event, handler) {
            log.debug('on(): ' + event);
            this.provider.on(target, event, handler);
        }
    }, {
        key: 'off',
        value: function off(target, event) {
            log.debug('off(): ' + event);
            this.provider.off(target, event);
        }
    }, {
        key: 'fire',
        value: function fire(target, event) {
            var _provider;

            log.debug('fire(): ' + event);

            for (var _len = arguments.length, data = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                data[_key - 2] = arguments[_key];
            }

            (_provider = this.provider).fire.apply(_provider, [target, event].concat(data));
        }
    }]);

    return LoggingEventProvider;
})()
/**
 * Event provider that uses bean.js as the underlying event registry
 * and dispatcher.
 *
 * @see https://github.com/fat/bean
 */
;

var BeanEventProvider = (function () {
    function BeanEventProvider() {
        _classCallCheck(this, BeanEventProvider);
    }

    _createClass(BeanEventProvider, [{
        key: 'on',
        value: function on(target, event, handler) {
            bean.on(target, event, handler);
        }
    }, {
        key: 'off',
        value: function off(target, event) {
            bean.off(target, event);
        }
    }, {
        key: 'fire',
        value: function fire(target, event) {
            var _bean;

            for (var _len2 = arguments.length, data = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                data[_key2 - 2] = arguments[_key2];
            }

            (_bean = bean).fire.apply(_bean, [target, event].concat(data));
        }
    }]);

    return BeanEventProvider;
})()
/**
 * Global event provider instance.
 */
;

var provider;

function set_provider(value) {
    provider = new LoggingEventProvider(value);
    return provider;
}

set_provider(new BeanEventProvider());
exports['default'] = provider;



},{"./log":28}],28:[function(require,module,exports){
/**
 * Provides a very simple implementation of the age-old log4j logging
 * pattern, supporting only output to `console` for now.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.logger = logger;
exports.set_level = set_level;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Level;
exports.Level = Level;
(function (Level) {
    Level[Level["OFF"] = 0] = "OFF";
    Level[Level["FATAL"] = 1] = "FATAL";
    Level[Level["ERROR"] = 2] = "ERROR";
    Level[Level["WARN"] = 3] = "WARN";
    Level[Level["INFO"] = 4] = "INFO";
    Level[Level["DEBUG"] = 5] = "DEBUG";
    Level[Level["TRACE"] = 6] = "TRACE";
})(Level || (exports.Level = Level = {}));
var default_name = 'root';
var default_time_format = 'YYYY-MM-DD hh:mm:ss A';
var default_level = Level.INFO;
var global_level = default_level;
function timestamp() {
    return moment().format(default_time_format);
}
/**
 * Loggers log logs.
 */

var Logger = (function () {
    function Logger(init) {
        _classCallCheck(this, Logger);

        this.level = global_level;
        if (typeof init === 'string') {
            this.name = init;
        } else {
            this.name = init.name || default_name;
            this.level = init.level || default_level;
        }
    }

    _createClass(Logger, [{
        key: "set_level",
        value: function set_level(level) {
            this.level = level;
            return this;
        }
    }, {
        key: "is_enabled",
        value: function is_enabled(level) {
            return level && level >= this.level;
        }
    }, {
        key: "format",
        value: function format(level, msg) {
            var ts = timestamp();
            var level_name = Level[level];
            return ts + " | " + level_name + " | " + this.name + " | " + msg;
        }
    }, {
        key: "log",
        value: function log(level, msg) {
            if (this.level >= level) {
                var statement = this.format(level, msg);
                if (level <= Level.WARN) {
                    console.error(statement);
                } else {
                    console.log(statement);
                }
            }
            return this;
        }
    }, {
        key: "fatal",
        value: function fatal(msg) {
            return this.log(Level.FATAL, msg);
        }
    }, {
        key: "error",
        value: function error(msg) {
            return this.log(Level.ERROR, msg);
        }
    }, {
        key: "warn",
        value: function warn(msg) {
            return this.log(Level.WARN, msg);
        }
    }, {
        key: "info",
        value: function info(msg) {
            return this.log(Level.INFO, msg);
        }
    }, {
        key: "debug",
        value: function debug(msg) {
            return this.log(Level.DEBUG, msg);
        }
    }, {
        key: "trace",
        value: function trace(msg) {
            return this.log(Level.TRACE, msg);
        }
    }]);

    return Logger;
})()
/**
 * Provide a typed map for caching loggers by name.
 */
;

exports.Logger = Logger;
var cache = new Map();
/**
 * Cached factory function for loggers, which avoids
 * instantiating duplicates with the same name.
 */

function logger(init) {
    var name = typeof init === 'string' ? init : init.name;
    if (!cache.has(name)) {
        cache.set(name, new Logger(init));
    }
    return cache.get(name);
}

/**
 * Set the default global level for new loggers, and change
 * the current logging level of all existing cached loggers.
 */

function set_level(level) {
    global_level = level;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = cache.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            cache.get(key).level = level;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}



},{}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.property = property;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _log = require('./log');

var _util = require('./util');

var _registry = require('./registry');

var _template = require('./template');

var _template2 = _interopRequireDefault(_template);

var log = (0, _log.logger)('property');
var PropertyType = {
    SELECT: 'select',
    BOOLEAN: 'boolean',
    TEXT: 'text'
};
exports.PropertyType = PropertyType;

var Property = (function () {
    function Property(data) {
        _classCallCheck(this, Property);

        this.name = data.name;
        this.property_name = data.property_name || this.name;
        this.category = data.category;
        this.type = data.type;
        this.edit_options = data.edit_options;
        this.template = new _template2['default'](data.template);
    }

    /**
     * Render the basic display of the property's value.
     */

    _createClass(Property, [{
        key: 'render',
        value: function render(item) {
            log.debug('render(' + this.name + ' / ' + item.item_id + ')');
            var inner = undefined;
            if (this.template == null) {
                var value = item[this.property_name];
                inner = value ? value.toString() : '';
            } else {
                inner = this.template.render({ property: this, item: item });
            }
            return '<span id="' + item.item_id + this.property_name + '">' + inner + '</span>';
        }

        /**
         * Make the property editable by transforming its value display into
         * an in-line edit widget.
         */
    }, {
        key: 'edit',
        value: function edit(item) {
            var _this = this;

            log.debug('edit(' + this.name + ' / ' + item.item_id + ')');
            var default_options = {
                type: PropertyType.TEXT,
                value: item[this.property_name] || '',
                success: function success(ignore, newValue) {
                    log.debug('update(' + item.item_id + '.' + _this.property_name + ') => ' + newValue);
                    item[_this.property_name] = newValue;
                    if (item.updated) {
                        item.updated();
                    }
                }
            };
            var options = (0, _util.extend)({}, default_options, this.edit_options);
            if (this.type === PropertyType.BOOLEAN) {
                (0, _util.extend)(options, {
                    type: 'select',
                    source: [{ value: 'no', text: 'no' }, { value: 'yes', text: 'yes' }],
                    value: function value(item) {
                        var value = !!item[_this.property_name];
                        return value ? 'yes' : 'no';
                    },
                    success: function success(ignore, newValue) {
                        log.debug('boolean.success: ' + _this.property_name + ': ' + newValue + ' / ' + typeof newValue);
                        item[_this.property_name] = newValue === 'yes';
                        if (item.updated) {
                            item.updated();
                        }
                    }
                });
            } else if (this.type) {
                options.type = this.type;
            }
            if (this.type === 'select' && options.source instanceof Array) {
                options.source = options.source.map(function (value) {
                    if (value instanceof String) {
                        return { value: value, text: value };
                    } else if (typeof value === 'undefined') {
                        return { value: undefined, text: 'none' };
                    } else {
                        return value;
                    }
                });
            }
            if (options.source && options.source instanceof Function) {
                options.source = options.source();
            }
            if (options.value && options.value instanceof Function) {
                options.value = options.value(item);
            }
            if (options.update && options.update instanceof Function) {
                options.success = function (ignore, newValue) {
                    options.update(item, newValue);
                    if (item.fire_update) {
                        item.fire_update();
                    }
                };
            }
            var selector = '#' + item.item_id + this.property_name;
            log.debug('editable(' + selector + ')');
            $(selector).editable(options);
            return this;
        }
    }]);

    return Property;
})()
/**
 * Registry of property definitions. Properties which have complex
 * handlers and are shared between multiple dashboard items should be
 * registered.
 */
;

exports['default'] = Property;
var properties = new _registry.Registry({
    name: 'properties',
    ignore_categories: true,
    process: function process(data) {
        if (data instanceof Property) {
            return data;
        } else if (typeof data === 'string') {
            return new Property({ name: data });
        } else {
            return new Property(data);
        }
    }
});
/**
 * Canonicalize properties.
 */
exports.properties = properties;

function property(data) {
    if (data instanceof Property) {
        return data;
    } else if (typeof data === 'string') {
        var prop = properties.get(data);
        return prop ? prop : new Property({ name: data });
    } else {
        return new Property(data);
    }
}



},{"./log":28,"./registry":30,"./template":31,"./util":32}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _log = require('./log');

/**
 * A registry of named objects which supports categorizing
 * those objects into one or more categories, listing them by
 * category, or looking up individual objects by category and
 * name.
 */

var Registry = (function () {
    function Registry(data) {
        _classCallCheck(this, Registry);

        this.name = data.name;
        this.process = data.process;
        this.ignore_categories = !!data.ignore_categories;
        this.data = {};
        this.log = (0, _log.logger)('registry.' + this.name);
    }

    _createClass(Registry, [{
        key: '_get_data',
        value: function _get_data(category) {
            if (!this.data[category]) {
                this.data[category] = {
                    list: [],
                    index: {}
                };
            }
            return this.data[category];
        }
    }, {
        key: 'register',
        value: function register(cat) {
            var dat = arguments.length <= 1 || arguments[1] === undefined ? Registry.DEFAULT_CATEGORY : arguments[1];

            var data = undefined,
                category = undefined;
            if (arguments.length == 1) {
                data = cat;
                category = Registry.DEFAULT_CATEGORY;
            } else if (arguments.length == 2 && typeof cat === 'string') {
                category = cat;
                data = dat;
            }
            if (data instanceof Array) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var d = _step.value;

                        this.register(category, d);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            } else {
                if (this.ignore_categories) {
                    category = Registry.DEFAULT_CATEGORY;
                } else if (data.category && category == Registry.DEFAULT_CATEGORY) {
                    category = data.category;
                }
                var category_data = this._get_data(category);
                var thing = this.process ? this.process(data) : data;
                this.log.debug('Registering "' + category + '" / "' + thing.name + '"');
                if (!category_data.index[thing.name]) {
                    category_data.index[thing.name] = thing;
                }
                category_data.list.push(thing);
            }
            return this;
        }

        /**
         * Return a list of all values assigned to the named category. If no
         * category name is supplied, the values assigned to the default
         * category will be returned.
         */
    }, {
        key: 'list',
        value: function list() {
            var category = arguments.length <= 0 || arguments[0] === undefined ? Registry.DEFAULT_CATEGORY : arguments[0];

            return this.data[category] ? this.data[category].list : [];
        }

        /**
         * Retrieve a single value from a category by name. If only a name
         * is supplied, the default category will be used.
         */
    }, {
        key: 'get',
        value: function get(cat, nm) {
            var category = cat,
                name = nm;
            if (arguments.length == 1) {
                category = Registry.DEFAULT_CATEGORY;
                name = cat;
            }
            if (this.ignore_categories) {
                category = Registry.DEFAULT_CATEGORY;
            }
            return this.data[category] ? this.data[category].index[name] : null;
        }

        /**
         * Return a list of all registered categories.
         */
    }, {
        key: 'categories',
        value: function categories() {
            return Object.keys(this.data);
        }
    }]);

    return Registry;
})()
/** When no category is explicitly specified, this one will be used */
;

exports.Registry = Registry;
Registry.DEFAULT_CATEGORY = 'default';


},{"./log":28}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.compile_template = compile_template;
exports.render_template = render_template;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _log = require('./log');

var log = (0, _log.logger)('template');

function compile_template(tmpl) {
    if (typeof tmpl === 'string') {
        return Handlebars.compile(tmpl);
    } else {
        return tmpl;
    }
}

function _render_template(tmpl, context) {
    if (tmpl == null) {
        return '';
    }
    if (typeof tmpl === 'string') {
        if (tmpl.indexOf('{{') == -1) {
            return tmpl;
        } else {
            return Handlebars.compile(tmpl)(context);
        }
    } else {
        return tmpl(context);
    }
}

function render_template(tmpl, context) {
    try {
        return _render_template(tmpl, context);
    } catch (e) {
        log.error('render_template(): ' + e);
        if (typeof tmpl === 'string') {
            return tmpl;
        } else {
            return '';
        }
    }
}

var Template = (function () {
    function Template(tmpl) {
        _classCallCheck(this, Template);

        this.tmpl = compile_template(tmpl);
    }

    _createClass(Template, [{
        key: 'render',
        value: function render(context) {
            return render_template(this.tmpl, context);
        }
    }]);

    return Template;
})()

;

exports['default'] = Template;

},{"./log":28}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.json = json;
exports.extend = extend;

function json(thing) {
    if (thing.toJSON && typeof thing.toJSON === 'function') {
        return thing.toJSON();
    } else {
        return thing;
    }
}

function extend() {
    return extend_impl.apply(undefined, arguments);
}



},{}],33:[function(require,module,exports){
/**
 * A TypeScript description of the graphite-web JSON data format.
 *
 * @see http://graphite.readthedocs.org/en/latest/render_api.html#data-display-formats
 */
/**
 * Parse Graphite's `raw` data format, which is a more compact
 * on-the-wire representation than JSON.
 *
 * ```
 * Targets are output one per line and are of the format <target
 * name>,<start timestamp>,<end timestamp>,<series step>|[data]*
 * ```
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.parse_raw = parse_raw;
exports.parse_raw_line = parse_raw_line;

function parse_raw(raw) {
    var lines = raw.split(/\r?\n/);
    return lines.map(function (line) {
        return parse_raw_line(line);
    });
}

/**
 * Parse a single line of Graphite's `raw` data format, which
 * represents a single data series.
 */

function parse_raw_line(line) {
    var _line$split = line.split('|');

    var _line$split2 = _slicedToArray(_line$split, 2);

    var meta_string = _line$split2[0];
    var values_string = _line$split2[1];

    var _meta_string$split = meta_string.split(',');

    var _meta_string$split2 = _slicedToArray(_meta_string$split, 4);

    var target = _meta_string$split2[0];
    var _start = _meta_string$split2[1];
    var _end = _meta_string$split2[2];
    var _step = _meta_string$split2[3];

    var start = Number(_start);
    var end = Number(_end);
    var step = Number(_step);
    var series = {
        target: target,
        datapoints: []
    };
    var values = values_string.split(',');
    var timestamp = start;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = values[Symbol.iterator](), _step2; !(_iteratorNormalCompletion = (_step2 = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var v = _step2.value;

            var value = Number(v);
            if (Number.isNaN(value)) {
                value = null;
            }
            series.datapoints.push([value, timestamp]);
            timestamp += step;
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return series;
}



},{}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _appApp = require('../app/app');

var app = _interopRequireWildcard(_appApp);

var _appManager = require('../app/manager');

var _appManager2 = _interopRequireDefault(_appManager);

var _modelsAxis = require('../models/axis');

var _modelsAxis2 = _interopRequireDefault(_modelsAxis);

var _modelsItemsContainer = require('../models/items/container');

var _modelsItemsContainer2 = _interopRequireDefault(_modelsItemsContainer);

var _modelsItemsFactory = require('../models/items/factory');

var _queries = require('./queries');

var queries = _interopRequireWildcard(_queries);

var _propertySheets = require('./property-sheets');

_defaults(exports, _interopRequireWildcard(_propertySheets));

var log = core.logger('edit');
/**
 * Toggle mode-specific CSS rules for dashboard structural elements.
 */
app.add_mode_handler(app.Mode.EDIT, {
    enter: function enter() {
        log.debug('mode_handler.enter()');
        $('.ds-dashboard .ds-section, .ds-cell, .ds-row').addClass('ds-edit');
    },
    exit: function exit() {
        log.debug('mode_handler.exit()');
        $('.ds-dashboard .ds-section, .ds-cell, .ds-row').removeClass('ds-edit');
    },
    refresh: function refresh() {
        log.debug('mode_handler.refresh()');
        $('.ds-dashboard .ds-section, .ds-cell, .ds-row').addClass('ds-edit');
    }
});
/* -----------------------------------------------------------------------------
   Item Actions
   ----------------------------------------------------------------------------- */
var duplicate_item_action = new core.Action({
    name: 'duplicate',
    display: 'Duplicate Item',
    icon: 'fa fa-copy',
    handler: function handler(action, item) {
        var dashboard = _appManager2['default'].current.dashboard;
        var parent = dashboard.find_parent(item);
        var dup = (0, _modelsItemsFactory.make)(item.toJSON()).set_item_id(null);
        dup.visit(function (child) {
            child.item_id = null;
        });
        parent.add_after(item, dup);
        dashboard.update_index();
        _appManager2['default'].update_item_view(parent);
    }
});
var delete_action = new core.Action({
    name: 'delete',
    display: 'Delete item',
    icon: 'fa fa-trash-o',
    handler: function handler(action, item) {
        var parent = _appManager2['default'].current.dashboard.find_parent(item);
        if (!parent) {
            return;
        }
        if (parent && parent instanceof _modelsItemsContainer2['default'] && parent.remove(item)) {
            _appManager2['default'].update_item_view(parent);
        }
    }
});
var move_back_action = new core.Action({
    name: 'move-back',
    display: 'Move item back one place',
    icon: 'fa fa-caret-left',
    handler: function handler(action, item) {
        var parent = _appManager2['default'].current.dashboard.find_parent(item);
        if (parent instanceof _modelsItemsContainer2['default'] && parent.move(item, -1)) {
            _appManager2['default'].update_item_view(parent);
        }
    }
});
var move_forward_action = new core.Action({
    name: 'move-forward',
    display: 'Move item forward one place',
    icon: 'fa fa-caret-right',
    handler: function handler(action, item) {
        var parent = _appManager2['default'].current.dashboard.find_parent(item);
        if (parent instanceof _modelsItemsContainer2['default'] && parent.move(item, 1)) {
            _appManager2['default'].update_item_view(parent);
        }
    }
});
var view_definition_action = new core.Action({
    name: 'view-definition',
    display: 'View definition...',
    icon: 'fa fa-code',
    handler: function handler(action, item) {
        var contents = ts.templates.edit.item_source({ item: item });
        bootbox.alert({
            backdrop: false,
            message: contents
        });
    }
});
/* -----------------------------------------------------------------------------
   New from Graphite URL Action
   ----------------------------------------------------------------------------- */
function new_chart_from_graphite_url(url_string) {
    var dash = _appManager2['default'].current.dashboard;
    var url = new URI(url_string);
    var data = url.search(true);
    var query = queries.new_query(dash, data.target);
    var type = 'standard_time_series';
    if (data.areaMode && data.areaMode === 'stacked') {
        type = 'stacked_area_chart';
    } else if (data.graphType && data.graphType === 'pie') {
        type = 'donut_chart';
    }
    var chart = (0, _modelsItemsFactory.make)(type).set_dashboard(dash).set_query(query.name).set_height(Math.min(8, Math.floor((data.height || 400) / 80))).set_title(data.title);
    chart.options = chart.options || {};
    if (data.vtitle) {
        if (!chart.options.y1) chart.options.y1 = new _modelsAxis2['default']();
        chart.options.y1.label = data.vtitle;
    }
    if (data.yMin) {
        if (!chart.options.y1) chart.options.y1 = new _modelsAxis2['default']();
        chart.options.y1.min = data.yMin;
    }
    if (data.yMax) {
        if (!chart.options.y1) chart.options.y1 = new _modelsAxis2['default']();
        chart.options.y1.max = data.yMax;
    }
    if (data.template) {
        chart.options.palette = data.template;
    }
    return chart;
}
core.actions.register({
    name: 'new-chart-from-url',
    category: 'new-item-chart',
    display: 'Add new chart from Graphite URL',
    icon: 'fa fa-image',
    css: 'new-item',
    handler: function handler(action, container) {
        bootbox.prompt({
            title: "Enter a Graphite chart URL",
            backdrop: false,
            callback: function callback(result) {
                if (result) {
                    var item = new_chart_from_graphite_url(result);
                    if (item) {
                        container.add(item);
                    }
                }
            }
        });
    }
});
/* -----------------------------------------------------------------------------
   New item handling
   ----------------------------------------------------------------------------- */
function new_item_actions() {
    var list = [].concat(core.actions.get('new-item-structural', 'row'), core.Action.DIVIDER, core.actions.list('new-item-display').sort(function (a, b) {
        return a.icon.localeCompare(b.icon);
    }), core.Action.DIVIDER, core.actions.list('new-item-data-table').sort(function (a, b) {
        return a.icon.localeCompare(b.icon);
    }), core.Action.DIVIDER, core.actions.list('new-item-chart').sort(function (a, b) {
        return a.icon.localeCompare(b.icon);
    }));
    var other = core.actions.list('new-item');
    if (other && other.length) {
        list.concat(other.sort(function (a, b) {
            return a.icon.localeCompare(b.icon);
        }));
    }
    return list;
}
var new_item_action_for_cell = new core.Action({
    name: 'new-item',
    category: 'new-item',
    css: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: new_item_actions
});
var new_item_action_for_section = new core.Action({
    name: 'new-item',
    category: 'new-item',
    css: 'ds-new-item',
    display: 'Add new dashboard item...',
    icon: 'fa fa-plus',
    actions: function actions() {
        return [].concat(core.actions.get('new-item-structural', 'section'), core.actions.get('new-item-structural', 'row'), core.Action.DIVIDER, core.actions.list('new-item-display').sort(function (a, b) {
            return a.icon.localeCompare(b.icon);
        }));
    }
});
$(document).on('click', 'li.new-item', function (event) {
    log.debug('li.new-item.click');
    var elt = $(this);
    var category = elt.attr('data-ds-category');
    var name = elt.attr('data-ds-action');
    var item_id = elt.parent().parent().parent().parent()[0].getAttribute('data-ds-item-id');
    var item = _appManager2['default'].current.dashboard.get_item(item_id);
    var action = core.actions.get(category, name);
    log.debug('li.new-item:click(): ' + item_id + ', ' + action + ', ' + category + '/' + name);
    action.handler(action, item);
    return false;
});
/* -----------------------------------------------------------------------------
   Section actions
   ----------------------------------------------------------------------------- */
core.actions.register('edit-bar-section', [new_item_action_for_section, duplicate_item_action, core.Action.DIVIDER, move_back_action, move_forward_action, core.Action.DIVIDER, delete_action]);
/* -----------------------------------------------------------------------------
   Row actions
   ----------------------------------------------------------------------------- */
core.actions.register('edit-bar-row', [new core.Action({
    name: 'new-cell',
    display: 'Add new Cell',
    icon: 'fa fa-plus',
    handler: function handler(action, container) {
        container.add('cell');
    }
}), duplicate_item_action, core.Action.DIVIDER, move_back_action, move_forward_action, core.Action.DIVIDER, delete_action]);
/* -----------------------------------------------------------------------------
   Cell actions
   ----------------------------------------------------------------------------- */
core.actions.register('edit-bar-cell', [new_item_action_for_cell, duplicate_item_action, core.Action.DIVIDER, move_back_action, move_forward_action, new core.Action({
    name: 'increase-span',
    display: 'Increase cell span by one',
    icon: 'fa fa-expand',
    handler: function handler(action, item) {
        if (item.span) {
            item.span += 1;
            _appManager2['default'].update_item_view(item);
        }
    }
}), new core.Action({
    name: 'decrease-span',
    display: 'Decrease cell span by one',
    icon: 'fa fa-compress',
    handler: function handler(action, item) {
        if (item.span) {
            item.span -= 1;
            _appManager2['default'].update_item_view(item);
        }
    }
}), core.Action.DIVIDER, delete_action]);
/* -----------------------------------------------------------------------------
   Item actions
   ----------------------------------------------------------------------------- */
core.actions.register('edit-bar-item', [duplicate_item_action, core.Action.DIVIDER, move_back_action, move_forward_action, view_definition_action, core.Action.DIVIDER, delete_action]);
/* -----------------------------------------------------------------------------
   Edit Bar Handler
   ----------------------------------------------------------------------------- */
$(document).on('click', '.ds-edit-bar button', function (event) {
    log.debug('click.ds-edit-bar button');
    var element = $(this)[0];
    var parent = $(this).parent()[0];
    var item_id = parent.getAttribute('data-ds-item-id');
    var name = element.getAttribute('data-ds-action');
    var category = element.getAttribute('data-ds-category');
    var action = core.actions.get(category, name);
    var item = _appManager2['default'].current.dashboard.get_item(item_id);
    if (action) {
        action.handler(action, item);
    }
});


},{"../app/app":2,"../app/manager":15,"../core":24,"../models/axis":39,"../models/items/container":50,"../models/items/factory":54,"./property-sheets":35,"./queries":36}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.hide_details = hide_details;
exports.show_details = show_details;
exports.toggle_details = toggle_details;
exports.details_visibility = details_visibility;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _appManager = require('../app/manager');

var _appManager2 = _interopRequireDefault(_appManager);

var _appApp = require('../app/app');

var app = _interopRequireWildcard(_appApp);

var log = core.logger('edit');
/* -----------------------------------------------------------------------------
   Property Sheets
   ----------------------------------------------------------------------------- */
/**
 * Helper functions to show & hide the action bar & property sheet
 * for dashboard items.
 */

function hide_details(item_id) {
    var details = $('#' + item_id + '-details');
    details.remove();
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .btn-group').hide();
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .badge').removeClass('ds-badge-highlight');
}

function show_details(item_id) {
    // Show the edit button bar across the top of the item
    $('.ds-edit-bar[data-ds-item-id="' + item_id + '"] .btn-group').show();
    var item = _appManager2['default'].current.dashboard.get_item(item_id);
    var bar_id = '.ds-edit-bar[data-ds-item-id="' + item_id + '"]';
    var details_id = '#' + item_id + '-details';
    if ($(details_id).length == 0) {
        // Render the item's property sheet
        var elt = $('.ds-edit-bar[data-ds-item-id="' + item_id + '"]');
        var details = ts.templates['ds-edit-bar-item-details']({ item: item });
        elt.append(details);
        if (item.meta.interactive_properties) {
            // Run the edit handlers for each property, which make them
            // editable and set up the callbacks for their updates
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = item.meta.interactive_properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var prop = _step.value;

                    prop.edit(item);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }
}

function toggle_details(item_id) {
    var details = $('#' + item_id + '-details');
    if (details.is(':visible')) {
        hide_details(item_id);
        return false;
    } else {
        show_details(item_id);
        return true;
    }
}

function details_visibility(item) {
    return $('#' + item.item_id + '-details').is(':visible');
}

/* -----------------------------------------------------------------------------
   Property Sheets Event Handlers
   ----------------------------------------------------------------------------- */
/**
 * Event handlers to show & hide the action bar & property sheet for
 * dashboard items.
 */
$(document).on('click', '.ds-edit-bar .badge', function (event) {
    var $elt = $(this);
    var id = $elt.attr('data-ds-item-id');
    if (toggle_details(id)) {
        $elt.addClass('ds-badge-highlight');
    } else {
        $elt.removeClass('ds-badge-highlight');
    }
});
$(document).on('mouseenter', '.ds-edit-bar', function (event) {
    var timeout_id = $(this).attr('data-ds-timeout-id');
    if (timeout_id) {
        window.clearTimeout(timeout_id);
    }
});
$(document).on('mouseleave', '.ds-edit-bar', function (event) {
    var $elt = $(this);
    var id = $elt.attr('data-ds-item-id');
    var timeout = app.config.PROPSHEET_AUTOCLOSE_SECONDS;
    if (timeout) {
        var timeout_id = window.setTimeout(function () {
            hide_details(id);
        }, timeout * 1000);
        $elt.attr('data-ds-timeout-id', timeout_id);
    }
});


},{"../app/app":2,"../app/manager":15,"../core":24}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.rename_query = rename_query;
exports.delete_query = delete_query;
exports.add_query = add_query;
exports.duplicate_query = duplicate_query;
exports.new_query = new_query;
exports.edit_queries = edit_queries;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _modelsDataQuery = require('../models/data/query');

var _modelsDataQuery2 = _interopRequireDefault(_modelsDataQuery);

var _appManager = require('../app/manager');

var _appManager2 = _interopRequireDefault(_appManager);

var _appApp = require('../app/app');

var app = _interopRequireWildcard(_appApp);

var log = core.logger('edit');
/* -----------------------------------------------------------------------------
   Query Functions
   ----------------------------------------------------------------------------- */
/**
 * Rename a query and update the UI to reflect the change.
 */

function rename_query(dashboard, old_name, new_name) {
    log.debug('rename_query()');
    var query = dashboard.definition.queries[old_name];
    var updated_items = dashboard.definition.rename_query(old_name, new_name);
    $('[data-ds-query-name="' + old_name + '"]').replaceWith(ts.templates.edit['dashboard-query-row'](query));
    if (updated_items && updated_items.length) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = updated_items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                _appManager2['default'].update_item_view(item);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    edit_queries();
    app.refresh_mode();
}

/**
 * Delete a query and remove it from the queries list in the UI.
 */

function delete_query(dashboard, query_name) {
    log.debug('delete_query()');
    dashboard.definition.delete_query(query_name);
    $('tr[data-ds-query-name="' + query_name + '"]').remove();
    edit_queries();
    app.refresh_mode();
}

/**
 * Add a new query to the dashboard and UI.
 */

function add_query(dashboard, name, target) {
    log.debug('add_query()');
    var query = new _modelsDataQuery2['default']({ name: name, targets: target });
    dashboard.definition.add_query(query);
    $("#ds-query-panel table").append(ts.templates.edit['dashboard-query-row'](query));
    query.load();
    edit_queries();
    return query;
}

function duplicate_query(dashboard, name) {
    log.debug('duplicate_query()');
    var new_name = 'Copy of ' + name + ' ' + Object.keys(dashboard.definition.queries).length;
    var source = dashboard.definition.queries[name];
    return add_query(dashboard, new_name, source.targets.slice(0));
}

/**
 * Add a new query object to the dashboard and UI with an
 * auto-generated unique name, and an optional set of targets. If
 * targets are not supplied, a function generating random data will
 * be used as a placeholder.
 */

function new_query(dashboard, targets) {
    log.debug('new_query()');
    var name = "query" + Object.keys(dashboard.definition.queries).length;
    return add_query(dashboard, name, targets || 'absolute(randomWalkFunction("' + name + '"))');
}

function edit_queries() {
    log.debug('edit_queries()');
    /* Query names */
    $('th.ds-query-name').each(function (index, e) {
        var element = $(e);
        var query_name = e.getAttribute('data-ds-query-name');
        element.editable({
            type: 'text',
            value: query_name,
            success: function success(ignore, newValue) {
                rename_query(_appManager2['default'].current.dashboard, query_name, newValue);
            }
        });
    });
    /* Query targets */
    $('td.ds-query-target').each(function (index, e) {
        var element = $(e);
        var query_name = e.getAttribute('data-ds-query-name');
        element.editable({
            type: 'textarea',
            inputclass: 'ds-source',
            value: element.text() || '',
            success: function success(ignore, newValue) {
                var target = newValue.trim();
                var query = _appManager2['default'].current.dashboard.definition.queries[query_name];
                query.targets = [target];
                query.render_templates(app.context().variables);
                query.load();
            }
        });
    });
}

/* -----------------------------------------------------------------------------
   Query Event Handlers
   ----------------------------------------------------------------------------- */
/* Query delete buttons */
$(document).on('click', 'button.ds-delete-query-button', function (e) {
    log.debug('click.delete-query');
    var $elt = $(this);
    var query_name = $elt.attr('data-ds-query-name');
    var dashboard = _appManager2['default'].current.dashboard;
    if (!dashboard.definition.queries[query_name]) {
        return true;
    }
    var queries_in_use = dashboard.definition.get_queries();
    if (queries_in_use[query_name]) {
        bootbox.dialog({
            backdrop: false,
            message: 'Query ' + query_name + ' is in use. Are you sure you want to delete it?',
            title: 'Confirm query delete',
            buttons: {
                cancel: {
                    label: 'Cancel',
                    className: 'btn-default'
                },
                confirm: {
                    label: 'Delete',
                    className: 'btn-danger',
                    callback: function callback() {
                        delete_query(dashboard, query_name);
                    }
                }
            }
        });
    } else {
        delete_query(dashboard, query_name);
    }
    return true;
});
/* Query duplicate buttons */
$(document).on('click', 'button.ds-duplicate-query-button', function (e) {
    log.debug('click.duplicate-query');
    var $elt = $(this);
    var query_name = $elt.attr('data-ds-query-name');
    var dashboard = _appManager2['default'].current.dashboard;
    if (!dashboard.definition.queries[query_name]) {
        return true;
    }
    duplicate_query(dashboard, query_name);
    return true;
});
$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    log.debug('shown.bs.tab ' + e.target.href);
    if (e.target.id == 'ds-edit-tab-queries') {
        edit_queries();
    }
});
/* -----------------------------------------------------------------------------
   Dashboard Query Panel
   ----------------------------------------------------------------------------- */
core.actions.register('dashboard-queries', [new core.Action({
    name: 'new-query',
    display: 'New Query...',
    icon: 'fa fa-plus',
    handler: function handler(action, dashboard) {
        new_query(dashboard);
    }
})]);
$(document).on('click', '#ds-query-panel button', function (event) {
    var element = $(this)[0];
    var name = element.getAttribute('data-ds-action');
    var action = core.actions.get('dashboard-queries', name);
    if (action) {
        action.handler(action, _appManager2['default'].current.dashboard);
    }
});


},{"../app/app":2,"../app/manager":15,"../core":24,"../models/data/query":41}],37:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _core = require('./core');

var core = _interopRequireWildcard(_core);

var _chartsCore = require('./charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var _modelsItemsFactory = require('./models/items/factory');

var factory = _interopRequireWildcard(_modelsItemsFactory);

var _appApp = require('./app/app');

var app = _interopRequireWildcard(_appApp);

var _editEdit = require('./edit/edit');

var edit = _interopRequireWildcard(_editEdit);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _coreAction = require('./core/action');

var _modelsTransformTransform = require('./models/transform/transform');

var _modelsUser = require('./models/user');

var _modelsUser2 = _interopRequireDefault(_modelsUser);

var _appManager = require('./app/manager');

var _appManager2 = _interopRequireDefault(_appManager);

var _chartsGraphite = require('./charts/graphite');

var _chartsGraphite2 = _interopRequireDefault(_chartsGraphite);

var _chartsFlot = require('./charts/flot');

var _chartsFlot2 = _interopRequireDefault(_chartsFlot);

var _appHelpers = require('./app/helpers');

var _modelsItems = require('./models/items');

var items = _interopRequireWildcard(_modelsItems);

var log = core.logger('main');
window.ts.init = function () {
    var config = window.ts.config;
    core.extend(window.ts, {
        core: core,
        app: app,
        manager: _appManager2['default'],
        charts: charts,
        factory: factory,
        actions: _coreAction.actions,
        edit: edit,
        transforms: _modelsTransformTransform.transforms,
        user: new _modelsUser2['default']()
    });
    app.config = window.ts.config;
    /* Set up the API client */
    window.ts.client = _appManager2['default'].client = new _client2['default']({ prefix: config.APPLICATION_ROOT });
    /* Register all dashboard items */
    (0, _modelsItemsFactory.register_dashboard_item)(items.DashboardDefinition);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Section);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Row);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Cell);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Markdown);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Heading);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Separator);
    (0, _modelsItemsFactory.register_dashboard_item)(items.SummationTable);
    (0, _modelsItemsFactory.register_dashboard_item)(items.PercentageTable);
    (0, _modelsItemsFactory.register_dashboard_item)(items.TimeshiftSummationTable);
    (0, _modelsItemsFactory.register_dashboard_item)(items.ComparisonSummationTable);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Singlestat);
    (0, _modelsItemsFactory.register_dashboard_item)(items.TimeshiftSinglestat);
    (0, _modelsItemsFactory.register_dashboard_item)(items.ComparisonSinglestat);
    (0, _modelsItemsFactory.register_dashboard_item)(items.JumbotronSinglestat);
    (0, _modelsItemsFactory.register_dashboard_item)(items.TimeshiftJumbotronSinglestat);
    (0, _modelsItemsFactory.register_dashboard_item)(items.ComparisonJumbotronSinglestat);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Timerstat);
    (0, _modelsItemsFactory.register_dashboard_item)(items.DonutChart);
    (0, _modelsItemsFactory.register_dashboard_item)(items.BarChart);
    (0, _modelsItemsFactory.register_dashboard_item)(items.DiscreteBarChart);
    (0, _modelsItemsFactory.register_dashboard_item)(items.SimpleTimeSeries);
    (0, _modelsItemsFactory.register_dashboard_item)(items.StandardTimeSeries);
    (0, _modelsItemsFactory.register_dashboard_item)(items.StackedAreaChart);
    (0, _modelsItemsFactory.register_dashboard_item)(items.Singlegraph);
    /* Register Handlebars helper functions */
    (0, _appHelpers.register_helpers)();
    /* Register chart renderers */
    charts.renderers.register(new _chartsGraphite2['default']({
        graphite_url: config.GRAPHITE_URL
    }));
    charts.renderers.register(new _chartsFlot2['default']());
};


},{"./app/app":2,"./app/helpers":13,"./app/manager":15,"./charts/core":17,"./charts/flot":18,"./charts/graphite":19,"./client":23,"./core":24,"./core/action":25,"./edit/edit":34,"./models/items":43,"./models/items/factory":54,"./models/transform/transform":85,"./models/user":86}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _modelsModel = require('./models/model');

exports.Model = _interopRequire(_modelsModel);

var _modelsAxis = require('./models/axis');

exports.Axis = _interopRequire(_modelsAxis);

var _modelsThresholds = require('./models/thresholds');

exports.Thresholds = _interopRequire(_modelsThresholds);

var _modelsTag = require('./models/tag');

exports.Tag = _interopRequire(_modelsTag);

var _modelsDashboard = require('./models/dashboard');

exports.Dashboard = _interopRequire(_modelsDashboard);
Object.defineProperty(exports, 'DashboardTuple', {
  enumerable: true,
  get: function get() {
    return _modelsDashboard.DashboardTuple;
  }
});

var _modelsDataQuery = require('./models/data/query');

exports.Query = _interopRequire(_modelsDataQuery);

var _modelsDataSummation = require('./models/data/summation');

exports.Summation = _interopRequire(_modelsDataSummation);

var _modelsPreferences = require('./models/preferences');

exports.Preferences = _interopRequire(_modelsPreferences);

var _modelsItems = require('./models/items');



_defaults(exports, _interopRequireWildcard(_modelsItems));

},{"./models/axis":39,"./models/dashboard":40,"./models/data/query":41,"./models/data/summation":42,"./models/items":43,"./models/model":76,"./models/preferences":77,"./models/tag":78,"./models/thresholds":79}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var Axis = (function (_Model) {
    _inherits(Axis, _Model);

    function Axis(data) {
        _classCallCheck(this, Axis);

        _get(Object.getPrototypeOf(Axis.prototype), 'constructor', this).call(this, data);
        if (data) {
            this.visible = data.visible;
            this.label = data.label;
            this.label_distance = data.label_distance;
            this.format = data.format;
            this.min = data.min;
            this.max = data.max;
        }
    }

    _createClass(Axis, [{
        key: 'toJSON',
        value: function toJSON() {
            return {
                visible: this.visible,
                label: this.label,
                label_distance: this.label_distance,
                format: this.format,
                min: this.min,
                max: this.max
            };
        }
    }]);

    return Axis;
})(_model2['default'])

;

exports['default'] = Axis;
module.exports = exports['default'];

},{"./model":76}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _tag = require('./tag');

var _tag2 = _interopRequireDefault(_tag);

var _itemsContainer = require('./items/container');

var _itemsContainer2 = _interopRequireDefault(_itemsContainer);

var _itemsItem = require('./items/item');

var _itemsItem2 = _interopRequireDefault(_itemsItem);

var _preferences = require('./preferences');

var _preferences2 = _interopRequireDefault(_preferences);

var _itemsFactory = require('./items/factory');

var log = core.logger('models.dashboard');

var Dashboard = (function (_Model) {
    _inherits(Dashboard, _Model);

    function Dashboard(data) {
        var _this = this;

        _classCallCheck(this, Dashboard);

        _get(Object.getPrototypeOf(Dashboard.prototype), 'constructor', this).call(this, data);
        this.index = {};
        this.tags = [];
        this._next_id = 0;
        if (data) {
            this.id = data.id;
            this.title = data.title;
            this.category = data.category;
            this.summary = data.summary;
            this.description = data.description;
            this.definition = data.definition;
            this.creation_date = data.creation_date;
            this.last_modified_date = data.last_modified_date;
            this.imported_from = data.imported_from;
            this.href = data.href;
            this.view_href = data.view_href;
            this.definition_href = data.definition_href;
            if (data.definition) {
                this.definition = (0, _itemsFactory.make)(data.definition);
            }
            if (data.tags && data.tags.length) {
                this.tags = data.tags.map(function (t) {
                    return new _tag2['default'](t);
                });
            }
            this.visit(function (item) {
                _this._next_id++;
            });
            this.next_id();
            this.update_index();
        }
    }

    _createClass(Dashboard, [{
        key: 'set_tags',
        value: function set_tags(tags) {
            this.tags = tags.map(function (t) {
                return new _tag2['default'](t);
            });
            return this;
        }
    }, {
        key: 'set_definition',
        value: function set_definition(definition) {
            this.definition = definition;
            this.update_index();
            return this;
        }
    }, {
        key: 'visit',
        value: function visit(visitor) {
            visitor(this);
            if (this.definition) {
                this.definition.visit(visitor);
            }
            return this;
        }
    }, {
        key: 'next_id',
        value: function next_id() {
            while (true) {
                var id = 'd' + this._next_id++;
                if (typeof this.index[id] === 'undefined') {
                    return id;
                }
            }
        }
    }, {
        key: 'reindex',
        value: function reindex() {
            var _this2 = this;

            this._next_id = 0;
            this.visit(function (item) {
                item.item_id = _this2.next_id();
            });
            return this;
        }
    }, {
        key: 'update_index',
        value: function update_index() {
            var _this3 = this;

            var index = {};
            this.visit(function (item) {
                if (item instanceof _itemsItem2['default']) {
                    if (!item.item_id) {
                        item.item_id = _this3.next_id();
                    }
                    if (index[item.item_id]) {
                        log.error('ERROR: item_id + ' + item.item_id + ' is already indexed.');
                    }
                    index[item.item_id] = item;
                    item.set_dashboard(_this3);
                }
            });
            this.index = index;
            return this;
        }

        /**
         * Operations
         */
    }, {
        key: 'get_item',
        value: function get_item(id) {
            return this.index[id];
        }
    }, {
        key: 'find_parent',
        value: function find_parent(item_or_id) {
            var parent = undefined;
            this.visit(function (item) {
                if (item instanceof _itemsContainer2['default'] && item.contains(item_or_id)) {
                    parent = item;
                }
            });
            return parent;
        }
    }, {
        key: 'set_items',
        value: function set_items(items) {
            this.definition.items = items;
            this.update_index();
            return this;
        }
    }, {
        key: 'render',
        value: function render() {
            return this.definition.render();
        }
    }, {
        key: 'load_all',
        value: function load_all(options) {
            this.definition.load_all(options);
            return self;
        }
    }, {
        key: 'cleanup',
        value: function cleanup() {
            this.definition.cleanup();
        }
    }, {
        key: 'render_templates',
        value: function render_templates(context) {
            context.id = this.id;
            this.expanded_description = core.render_template(this.description, context);
            this.expanded_title = core.render_template(this.title, context);
            this.expanded_summary = core.render_template(this.summary, context);
            if (this.definition) {
                this.definition.render_templates(context);
            }
            return this.fire('change', { target: this });
        }
    }, {
        key: 'flatten',
        value: function flatten() {
            return this.definition ? this.definition.flatten() : [];
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return core.extend(_get(Object.getPrototypeOf(Dashboard.prototype), 'toJSON', this).call(this), {
                id: this.id,
                title: this.title,
                category: this.category,
                summary: this.summary,
                description: this.description,
                creation_date: this.creation_date,
                last_modified_date: this.last_modified_date,
                imported_from: this.imported_from,
                tags: this.tags.map(function (t) {
                    return t.toJSON();
                }),
                definition: this.definition ? this.definition.toJSON() : null,
                href: this.href,
                view_href: this.view_href,
                definition_href: this.definition_href
            });
        }
    }]);

    return Dashboard;
})(_model2['default']);

exports['default'] = Dashboard;

var DashboardTuple = (function (_Model2) {
    _inherits(DashboardTuple, _Model2);

    function DashboardTuple(data) {
        _classCallCheck(this, DashboardTuple);

        _get(Object.getPrototypeOf(DashboardTuple.prototype), 'constructor', this).call(this, data);
        if (data) {
            this.dashboard = new Dashboard(data.dashboard);
            this.preferences = new _preferences2['default'](data.preferences);
        }
    }

    _createClass(DashboardTuple, [{
        key: 'toJSON',
        value: function toJSON() {
            return {
                dashboard: this.dashboard.toJSON(),
                preferences: this.preferences.toJSON()
            };
        }
    }]);

    return DashboardTuple;
})(_model2['default'])

;

exports.DashboardTuple = DashboardTuple;

},{"../core":24,"./items/container":50,"./items/factory":54,"./items/item":56,"./model":76,"./preferences":77,"./tag":78}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _summation = require('./summation');

var _summation2 = _interopRequireDefault(_summation);

var _model = require('../model');

var _model2 = _interopRequireDefault(_model);

var _appApp = require('../../app/app');

var app = _interopRequireWildcard(_appApp);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var log = core.logger('query');

var Query = (function (_Model) {
    _inherits(Query, _Model);

    function Query(data) {
        _classCallCheck(this, Query);

        _get(Object.getPrototypeOf(Query.prototype), 'constructor', this).call(this, data);
        this.load_count = 0;
        this.cache = new Map();
        if (data) {
            if (data instanceof Array) {
                this.targets = data;
            } else if (typeof data === 'string') {
                this.targets = [data];
            } else if (data.targets) {
                if (data.targets instanceof Array) {
                    this.targets = data.targets;
                } else {
                    this.targets = [data.targets];
                }
            }
            if (data.options) {
                this.options = data.options;
            }
            this.name = data.name;
        }
    }

    _createClass(Query, [{
        key: 'set_name',
        value: function set_name(name) {
            this.name = name;
            return this;
        }
    }, {
        key: 'set_options',
        value: function set_options(options) {
            this.options = options;
            return this;
        }
    }, {
        key: 'render_templates',
        value: function render_templates(context) {
            this.expanded_targets = this.targets.map(function (t) {
                return core.render_template(t, context);
            });
        }
    }, {
        key: 'url',
        value: function url(opt) {
            var options = core.extend({}, this.local_options, opt, this.options);
            var url = new URI(options.base_url || app.config.GRAPHITE_URL).segment('render').setQuery('format', options.format || 'png').setQuery('from', options.from || app.config.DEFAULT_FROM_TIME || Query.DEFAULT_FROM_TIME).setQuery('tz', app.config.DISPLAY_TIMEZONE);
            if (options.until) {
                url.setQuery('until', options.until);
            }
            var targets = this.expanded_targets || this.targets;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = targets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var t = _step.value;

                    url.addQuery('target', t.replace(/(\r\n|\n|\r)/gm, ''));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return url.href();
        }

        /**
         * Return true if the item's query has the graphite stacked()
         * function anywhere in it. If you have stacked() in the query and
         * areaMode=stack in the URL, bad shit will happen to your graph.
         */
    }, {
        key: 'is_stacked',
        value: function is_stacked() {
            var targets = this.expanded_targets || this.targets;
            if (typeof targets === 'undefined') return false;
            var stacked = false;
            this.targets.forEach(function (target) {
                if (target.indexOf('stacked') > -1) {
                    stacked = true;
                }
            });
            return stacked;
        }

        /**
         * Asynchronously load the data for this query from the graphite
         * server, notifying any listening consumers when the data is
         * available.
         *
         * @param {Object} options Parameters for generating the URL to
         * load. Valid properties are:
         *   * base_url (required)
         *   * from
         *   * until
         *   * ready
         * @param {boolean} fire_only Just raise the event, without fetching
         *                            data.
         */
    }, {
        key: 'load',
        value: function load(opt, fire_only) {
            var _this = this;

            log.debug('load(): ' + this.name);
            this.local_options = core.extend({}, this.local_options, opt);
            var options = core.extend({}, this.local_options, opt, this.options);
            if (typeof fire_only === 'boolean' && fire_only) {
                // This is a bit of a hack for optimization, to fire the query
                // events when if we don't need the raw data because we're
                // rendering non-interactive graphs only. Would like a more
                // elegant way to handle the case.
                var ready = options.ready;
                if (ready && ready instanceof Function) {
                    ready(this);
                }
                core.events.fire(this, 'ds-data-ready', this);
            } else {
                this.cache.clear();
                options.format = 'json';
                var url = this.url(options);
                core.events.fire(this, 'ds-data-loading');
                this.load_count += 1;
                return $.ajax({
                    dataType: 'jsonp',
                    url: url,
                    jsonp: 'jsonp',
                    cache: true,
                    beforeSend: function beforeSend(xhr) {
                        if (app.config.GRAPHITE_AUTH !== '') {
                            xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(app.config.GRAPHITE_AUTH));
                        }
                    }
                }).fail(function (xhr, status, error) {
                    ts.manager.error('Failed to load query ' + _this.name + '. ' + error);
                }).then(function (response_data, textStatus) {
                    _this._summarize(response_data);
                    if (options.ready && options.ready instanceof Function) {
                        options.ready(_this);
                    }
                    core.events.fire(_this, 'ds-data-ready', _this);
                });
            }
        }

        /**
         * Register an event handler to be called when the query's data is
         * loaded.
         */
    }, {
        key: 'on_load',
        value: function on_load(handler) {
            log.debug('on(): ' + this.name);
            core.events.on(this, 'ds-data-ready', handler);
        }

        /**
         * Remove all registered event handlers.
         */
    }, {
        key: 'off',
        value: function off() {
            log.debug('off(): ' + this.name);
            core.events.off(this, 'ds-data-ready');
        }
    }, {
        key: '_group_targets',
        value: function _group_targets() {
            return this.targets.length > 1 ? 'group(' + this.targets.join(',') + ')' : this.targets[0];
        }

        /**
         * Return a new query with the targets timeshifted.
         */
    }, {
        key: 'shift',
        value: function shift(interval) {
            var group = this._group_targets();
            return new Query({
                name: this.name + '_shift_' + interval,
                targets: ['timeShift(' + group + ', \"' + interval + '\")']
            });
        }

        /**
         * Return a new query with the targets from this query and another
         * query joined into a 2-target array, for comparison presentations.
         */
    }, {
        key: 'join',
        value: function join(other) {
            var target_this = this._group_targets();
            var target_other = other._group_targets();
            return new Query({
                name: this.name + '_join_' + other.name,
                targets: [target_this, target_other]
            });
        }

        /**
         * Process the results of executing the query, transforming
         * the returned structure into something consumable by the
         * charting library, and calculating sums.
         */
    }, {
        key: '_summarize',
        value: function _summarize(response_data) {
            this.summation = new _summation2['default'](response_data);
            this.data = response_data.map(function (series) {
                series.summation = new _summation2['default'](series).toJSON();
                return series;
            });
            return this;
        }

        /**
         * Fetch data processed for use by a particular chart renderer, and
         * cache it in the query object so it's not re-processed over and
         * over.
         */
    }, {
        key: 'chart_data',
        value: function chart_data(type) {
            var cache_key = 'chart_data_' + type;
            if (!this.cache.has(cache_key)) {
                this.cache.set(cache_key, charts.process_data(this.data, type));
            }
            return this.cache.get(cache_key);
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return core.extend(_get(Object.getPrototypeOf(Query.prototype), 'toJSON', this).call(this), {
                name: this.name,
                targets: this.targets,
                data: this.data,
                summation: this.summation ? this.summation.toJSON() : undefined,
                options: this.options
            });
        }
    }]);

    return Query;
})(_model2['default']);

exports['default'] = Query;

Query.DEFAULT_FROM_TIME = '-3h';

module.exports = exports['default'];

},{"../../app/app":2,"../../charts/core":17,"../../core":24,"../model":76,"./summation":42}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('../model');

/**
 * Summarized stats for a data series or set of series. When
 * constructed with a data series, computes the sum, min, max, and
 * mean.
 *
 * The input format is assumed to be the JSON representation returned
 * by graphite-web.
 */

var _model2 = _interopRequireDefault(_model);

var Summation = (function (_Model) {
    _inherits(Summation, _Model);

    function Summation(initial_data) {
        var _this = this;

        _classCallCheck(this, Summation);

        _get(Object.getPrototypeOf(Summation.prototype), 'constructor', this).call(this, initial_data);
        this.sum = 0;
        this.min = Number.MAX_VALUE;
        this.max = Number.MIN_VALUE;
        this.mean = 0;
        this.median = 0;
        this.first = 0;
        this.last = 0;
        this.last_non_zero = 0;
        this.count = 0;
        this.percent = undefined;
        this.percent_value = undefined;
        var datapoints = [];
        if (initial_data && initial_data instanceof Array && initial_data.length) {
            /* This assumes that all input series have the same number of data points */
            var _length = initial_data[0].datapoints.length;
            for (var i = 0; i < _length; i++) {
                var x = 0;
                for (var n = 0; n < initial_data.length; n++) {
                    /* ignore input series which are smaller than the first series */
                    if (typeof initial_data[n].datapoints[i] !== 'undefined') {
                        x += initial_data[n].datapoints[i][0];
                    }
                }
                datapoints.push([x, initial_data[0].datapoints[i][1]]);
            }
        } else if (initial_data && initial_data.datapoints && initial_data.datapoints.length) {
            datapoints = initial_data.datapoints;
        }
        if (datapoints && datapoints.length) {
            (function () {
                /* add simple-statistics methods */
                var values = ss.mixin(datapoints.map(function (point) {
                    return point[0];
                }));
                _this.median = values.median();
                _this.first = datapoints[0][0];
                _this.count = datapoints.length;
                if (_this.first == null) {
                    _this.first = 0;
                }
                var index = 0;
                datapoints.forEach(function (point) {
                    var value = point[0] || 0;
                    _this.last = value;
                    if (value != 0) _this.last_non_zero = value;
                    _this.sum = _this.sum + value;
                    if (value > _this.max) {
                        _this.max = value;
                        _this.max_index = index;
                    }
                    if (point[0] && value < _this.min) {
                        _this.min = value;
                        _this.min_index = index;
                    }
                    index++;
                });
                _this.mean = _this.sum / _this.count;
            })();
        } else if (typeof initial_data === 'object') {
            var if_defined = function if_defined(value, default_value) {
                return typeof value === 'undefined' ? default_value : value;
            };

            this.sum = if_defined(initial_data.sum, this.sum);
            this.min = if_defined(initial_data.min, this.min);
            this.min_index = if_defined(initial_data.min, this.min_index);
            this.max = if_defined(initial_data.max, this.max);
            this.max_index = if_defined(initial_data.max, this.max_index);
            this.first = if_defined(initial_data.first, this.first);
            this.last = if_defined(initial_data.last, this.last);
            this.last_non_zero = if_defined(initial_data.last, this.last_non_zero);
            this.mean = if_defined(initial_data.mean, this.mean);
            this.mean = if_defined(initial_data.median, this.median);
            this.count = if_defined(initial_data.count, this.count);
        }
        if (this.sum === 0) {
            this.min = 0;
            this.max = 0;
        }
    }

    // end constructor()
    /**
     * Subtract other from this.
     */

    _createClass(Summation, [{
        key: 'subtract',
        value: function subtract(other) {
            return new Summation({
                sum: this.sum - other.sum,
                min: this.min - other.min,
                max: this.max - other.max,
                mean: this.mean - other.mean,
                median: this.median - other.median,
                first: this.first - other.first,
                last: this.last - other.last,
                count: this.count
            });
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return {
                sum: this.sum,
                min: this.min,
                min_index: this.min_index,
                max: this.max,
                max_index: this.max_index,
                mean: this.mean,
                median: this.median,
                first: this.first,
                last: this.last,
                last_non_zero: this.last_non_zero,
                count: this.count
            };
        }
    }]);

    return Summation;
})(_model2['default'])

;

exports['default'] = Summation;
module.exports = exports['default'];

},{"../model":76}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _itemsItem = require('./items/item');

Object.defineProperty(exports, 'ItemStyle', {
  enumerable: true,
  get: function get() {
    return _itemsItem.DashboardItemStyle;
  }
});
Object.defineProperty(exports, 'Transform', {
  enumerable: true,
  get: function get() {
    return _itemsItem.Transform;
  }
});
exports.DashboardItem = _interopRequire(_itemsItem);

var _itemsDashboard_definition = require('./items/dashboard_definition');

// Structural
exports.DashboardDefinition = _interopRequire(_itemsDashboard_definition);

var _itemsContainer = require('./items/container');

exports.Container = _interopRequire(_itemsContainer);

var _itemsSection = require('./items/section');

exports.Section = _interopRequire(_itemsSection);

var _itemsRow = require('./items/row');

exports.Row = _interopRequire(_itemsRow);

var _itemsCell = require('./items/cell');

// Informational
exports.Cell = _interopRequire(_itemsCell);

var _itemsMarkdown = require('./items/markdown');

exports.Markdown = _interopRequire(_itemsMarkdown);

var _itemsHeading = require('./items/heading');

exports.Heading = _interopRequire(_itemsHeading);

var _itemsSeparator = require('./items/separator');

// Presentation base classes
exports.Separator = _interopRequire(_itemsSeparator);

var _itemsPresentation = require('./items/presentation');

exports.Presentation = _interopRequire(_itemsPresentation);

var _itemsTable_presentation = require('./items/table_presentation');

// Text
exports.TablePresentation = _interopRequire(_itemsTable_presentation);

var _itemsSummation_table = require('./items/summation_table');

exports.SummationTable = _interopRequire(_itemsSummation_table);

var _itemsPercentage_table = require('./items/percentage_table');

exports.PercentageTable = _interopRequire(_itemsPercentage_table);

var _itemsTimeshift_summation_table = require('./items/timeshift_summation_table');

exports.TimeshiftSummationTable = _interopRequire(_itemsTimeshift_summation_table);

var _itemsComparison_summation_table = require('./items/comparison_summation_table');

exports.ComparisonSummationTable = _interopRequire(_itemsComparison_summation_table);

var _itemsSinglestat = require('./items/singlestat');

exports.Singlestat = _interopRequire(_itemsSinglestat);

var _itemsTimeshift_singlestat = require('./items/timeshift_singlestat');

exports.TimeshiftSinglestat = _interopRequire(_itemsTimeshift_singlestat);

var _itemsComparison_singlestat = require('./items/comparison_singlestat');

exports.ComparisonSinglestat = _interopRequire(_itemsComparison_singlestat);

var _itemsJumbotron_singlestat = require('./items/jumbotron_singlestat');

exports.JumbotronSinglestat = _interopRequire(_itemsJumbotron_singlestat);

var _itemsTimeshift_jumbotron_singlestat = require('./items/timeshift_jumbotron_singlestat');

exports.TimeshiftJumbotronSinglestat = _interopRequire(_itemsTimeshift_jumbotron_singlestat);

var _itemsComparison_jumbotron_singlestat = require('./items/comparison_jumbotron_singlestat');

exports.ComparisonJumbotronSinglestat = _interopRequire(_itemsComparison_jumbotron_singlestat);

var _itemsTimerstat = require('./items/timerstat');

// Charts
exports.Timerstat = _interopRequire(_itemsTimerstat);

var _itemsChart = require('./items/chart');

exports.Chart = _interopRequire(_itemsChart);

var _itemsDonut_chart = require('./items/donut_chart');

exports.DonutChart = _interopRequire(_itemsDonut_chart);

var _itemsBar_chart = require('./items/bar_chart');

exports.BarChart = _interopRequire(_itemsBar_chart);

var _itemsDiscrete_bar_chart = require('./items/discrete_bar_chart');

exports.DiscreteBarChart = _interopRequire(_itemsDiscrete_bar_chart);

var _itemsSimple_time_series = require('./items/simple_time_series');

exports.SimpleTimeSeries = _interopRequire(_itemsSimple_time_series);

var _itemsStandard_time_series = require('./items/standard_time_series');

exports.StandardTimeSeries = _interopRequire(_itemsStandard_time_series);

var _itemsStacked_area_chart = require('./items/stacked_area_chart');

exports.StackedAreaChart = _interopRequire(_itemsStacked_area_chart);

var _itemsSinglegraph = require('./items/singlegraph');


exports.Singlegraph = _interopRequire(_itemsSinglegraph);

},{"./items/bar_chart":44,"./items/cell":45,"./items/chart":46,"./items/comparison_jumbotron_singlestat":47,"./items/comparison_singlestat":48,"./items/comparison_summation_table":49,"./items/container":50,"./items/dashboard_definition":51,"./items/discrete_bar_chart":52,"./items/donut_chart":53,"./items/heading":55,"./items/item":56,"./items/jumbotron_singlestat":57,"./items/markdown":58,"./items/percentage_table":59,"./items/presentation":60,"./items/row":61,"./items/section":62,"./items/separator":63,"./items/simple_time_series":64,"./items/singlegraph":65,"./items/singlestat":66,"./items/stacked_area_chart":67,"./items/standard_time_series":68,"./items/summation_table":69,"./items/table_presentation":70,"./items/timerstat":71,"./items/timeshift_jumbotron_singlestat":72,"./items/timeshift_singlestat":73,"./items/timeshift_summation_table":74}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _xychart = require('./xychart');

var _xychart2 = _interopRequireDefault(_xychart);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var _coreUtil = require('../../core/util');

var BarChart = (function (_XYChart) {
    _inherits(BarChart, _XYChart);

    function BarChart(data) {
        _classCallCheck(this, BarChart);

        _get(Object.getPrototypeOf(BarChart.prototype), 'constructor', this).call(this, data);
        this.stack_mode = charts.StackMode.NORMAL;
        if (data) {
            this.stack_mode = data.stack_mode || this.stack_mode;
        }
    }

    _createClass(BarChart, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(BarChart.prototype), 'toJSON', this).call(this), {
                stack_mode: this.stack_mode
            });
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            charts.bar_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query);
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(BarChart.prototype), 'interactive_properties', this).call(this).concat([{
                name: 'stack_mode',
                type: 'select',
                edit_options: {
                    source: [charts.StackMode.NONE, charts.StackMode.NORMAL, charts.StackMode.PERCENT, charts.StackMode.STREAM]
                }
            }]);
        }
    }]);

    return BarChart;
})(_xychart2['default']);

exports['default'] = BarChart;

BarChart.meta = {
    icon: 'fa fa-bar-chart'
};

module.exports = exports['default'];

},{"../../charts/core":17,"../../core/util":32,"./xychart":75}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _coreUtil = require('../../core/util');

var Cell = (function (_Container) {
    _inherits(Cell, _Container);

    function Cell(data) {
        _classCallCheck(this, Cell);

        _get(Object.getPrototypeOf(Cell.prototype), 'constructor', this).call(this, data);
        this.span = 3;
        if (data) {
            this.span = data.span || this.span;
            this.offset = data.offset;
            this.align = data.align;
        }
    }

    _createClass(Cell, [{
        key: 'set_span',
        value: function set_span(value) {
            this.span = value;
            return this.updated();
        }
    }, {
        key: 'set_offset',
        value: function set_offset(value) {
            this.offset = value;
            return this.updated();
        }
    }, {
        key: 'set_align',
        value: function set_align(value) {
            this.align = value;
            return this.updated();
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(Cell.prototype), 'toJSON', this).call(this), {
                span: this.span,
                offset: this.offset,
                align: this.align
            });
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(Cell.prototype), 'interactive_properties', this).call(this).concat(['style', {
                name: 'span',
                edit_options: {
                    type: 'select',
                    source: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    update: function update(item, value) {
                        item.set_span(Number(value));
                    }
                }
            }, {
                name: 'offset',
                edit_options: {
                    type: 'select',
                    source: [{ value: undefined, text: 'none' }, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                    update: function update(item, value) {
                        item.set_offset(Number(value));
                    }
                }
            }, {
                name: 'align',
                type: 'select',
                edit_options: {
                    source: [undefined, 'left', 'center', 'right']
                }
            }]);
        }
    }]);

    return Cell;
})(_container2['default']);

exports['default'] = Cell;

Cell.meta = {
    category: 'structural'
};

module.exports = exports['default'];

},{"../../core/util":32,"./container":50}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _presentation = require('./presentation');

var _presentation2 = _interopRequireDefault(_presentation);

var _axis = require('../axis');

var _axis2 = _interopRequireDefault(_axis);

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var _chartsPalettes = require('../../charts/palettes');

var _chartsPalettes2 = _interopRequireDefault(_chartsPalettes);

core.properties.register([{
    name: 'chart.palette',
    property_name: 'palette',
    category: 'chart',
    edit_options: {
        type: 'select',
        value: function value(item) {
            if (item.options && item.options.palette) {
                return item.options.palette;
            } else {
                return undefined;
            }
        },
        source: [{ text: 'None', value: undefined }].concat(Object.keys(_chartsPalettes2['default']).map(function (value, index) {
            return { text: value, value: value };
        })),
        update: function update(item, newValue) {
            if (!item.options) {
                item.options = {};
            }
            item.options.palette = newValue;
            item.updated();
        }
    }
}, {
    name: 'chart.renderer',
    property_name: 'renderer',
    category: 'chart',
    edit_options: {
        type: 'select',
        source: function source() {
            return [undefined].concat([].concat(_toConsumableArray(charts.renderers.list().map(function (r) {
                return r.name;
            }))));
        }
    }
}]);
var ChartLegendType = {
    SIMPLE: 'simple',
    TABLE: 'table'
};
/**
 * Base class for all chart presentation types
 */
exports.ChartLegendType = ChartLegendType;

var Chart = (function (_Presentation) {
    _inherits(Chart, _Presentation);

    function Chart(data) {
        _classCallCheck(this, Chart);

        _get(Object.getPrototypeOf(Chart.prototype), 'constructor', this).call(this, data);
        this.legend = ChartLegendType.SIMPLE;
        this.hide_zero_series = false;
        this.options = {};
        if (data) {
            if (typeof data.legend !== 'undefined') {
                this.legend = data.legend;
                if (typeof data.legend === 'boolean') this.legend = data.legend ? ChartLegendType.SIMPLE : undefined;
            }
            this.options = data.options || {};
            if (data.options && data.options.y1) {
                this.options.y1 = new _axis2['default'](data.options.y1);
            }
            if (data.options && data.options.y2) {
                this.options.y2 = new _axis2['default'](data.options.y2);
            }
            if (data.options && data.options.x) {
                this.options.x = new _axis2['default'](data.options.x);
            }
            if (typeof (data.hide_zero_series !== 'undefined')) {
                this.hide_zero_series = Boolean(data.hide_zero_series);
            }
            this.renderer = data.renderer;
        }
    }

    _createClass(Chart, [{
        key: 'set_renderer',
        value: function set_renderer(renderer) {
            this.renderer = renderer;
            return this.updated();
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var data = core.extend(_get(Object.getPrototypeOf(Chart.prototype), 'toJSON', this).call(this), {
                legend: this.legend,
                hide_zero_series: this.hide_zero_series,
                renderer: this.renderer
            });
            if (this.options) {
                data.options = core.extend({}, this.options);
                if (this.options.y1) {
                    data.options.y1 = core.json(this.options.y1);
                }
                if (this.options.y2) {
                    data.options.y2 = core.json(this.options.y2);
                }
                if (this.options.x) {
                    data.options.x = core.json(this.options.x);
                }
            }
            return data;
        }

        /**
         * Clearly, a bunch of this should be refactored into a common
         * model. Should probably make chart.options a property model object.
         */
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            var props = ['title', 'height', {
                name: 'hide_zero_series',
                type: 'boolean',
                category: 'chart'
            }, 'chart.renderer', 'chart.palette', {
                name: 'chart.legend',
                property_name: 'legend',
                category: 'chart',
                edit_options: {
                    type: 'select',
                    source: [{ value: undefined, text: 'none' }, 'simple', 'table']
                }
            }];
            return _get(Object.getPrototypeOf(Chart.prototype), 'interactive_properties', this).call(this).concat(props);
        }
    }]);

    return Chart;
})(_presentation2['default']);

exports['default'] = Chart;

Chart.meta = {
    category: 'chart'
};


},{"../../charts/core":17,"../../charts/palettes":20,"../../core":24,"../axis":39,"./presentation":60}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _comparison_singlestat = require('./comparison_singlestat');

var _comparison_singlestat2 = _interopRequireDefault(_comparison_singlestat);

var ComparisonJumbotronSinglestat = (function (_ComparisonSinglestat) {
    _inherits(ComparisonJumbotronSinglestat, _ComparisonSinglestat);

    function ComparisonJumbotronSinglestat() {
        _classCallCheck(this, ComparisonJumbotronSinglestat);

        _get(Object.getPrototypeOf(ComparisonJumbotronSinglestat.prototype), 'constructor', this).apply(this, arguments);
    }

    return ComparisonJumbotronSinglestat;
})(_comparison_singlestat2['default']);

exports['default'] = ComparisonJumbotronSinglestat;

ComparisonJumbotronSinglestat.meta = {
    template: ts.templates.models.jumbotron_singlestat
};

module.exports = exports['default'];

},{"./comparison_singlestat":48}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _app = require('../../app');

var app = _interopRequireWildcard(_app);

var _singlestat = require('./singlestat');

var _singlestat2 = _interopRequireDefault(_singlestat);

var _dataQuery = require('../data/query');

var _dataQuery2 = _interopRequireDefault(_dataQuery);

var log = core.logger('models.comparison_singlestat');
var FORMAT_PERCENT = d3.format(',.1%');

var ComparisonSinglestat = (function (_Singlestat) {
    _inherits(ComparisonSinglestat, _Singlestat);

    function ComparisonSinglestat(data) {
        _classCallCheck(this, ComparisonSinglestat);

        _get(Object.getPrototypeOf(ComparisonSinglestat.prototype), 'constructor', this).call(this, data);
        this.percent = false;
        if (data) {
            if (this.query_other instanceof _dataQuery2['default']) {
                this._query_other = data.query_other.name;
            } else {
                this._query_other = data.query_other;
            }
            this.percent = !!data.percent;
        }
    }

    _createClass(ComparisonSinglestat, [{
        key: '_update_query',
        value: function _update_query() {
            if (this._query && this.query_other && this.dashboard) {
                var query = this.dashboard.definition.queries[this._query];
                this.query_override = query.join(this.query_other).set_name(this.item_id + '_joined');
                this.query_override.render_templates(app.context().variables);
            }
        }
    }, {
        key: 'set_query_other',
        value: function set_query_other(value) {
            log.info('set_query_other: ' + value);
            if (typeof value === 'string') {
                this._query_other = value;
            } else {
                this._query_other = value.name;
            }
            return this.updated();
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return core.extend(_get(Object.getPrototypeOf(ComparisonSinglestat.prototype), 'toJSON', this).call(this), {
                query_other: this._query_other,
                percent: this.percent
            });
        }
    }, {
        key: 'render',
        value: function render() {
            this._update_query();
            return _get(Object.getPrototypeOf(ComparisonSinglestat.prototype), 'render', this).call(this);
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            if (query.data.length < 2) return;
            var value = query.data[0].summation[this.transform];
            var base = query.data[1].summation[this.transform];
            var diff = value - base;
            var pct = value / base - 1;
            var float_margin = 0.000001;
            var diff_elt = $('#' + this.item_id + ' span.diff');
            $('#' + this.item_id + ' span.value').text(d3.format(this.format)(value));
            if (diff > float_margin) diff_elt.addClass('ds-diff-plus');else if (diff < float_margin) diff_elt.addClass('ds-diff-minus');
            var diff_formatted = this.percent ? FORMAT_PERCENT(Math.abs(pct)) : d3.format(this.format)(Math.abs(diff));
            $('#' + this.item_id + ' span.diff').text(diff_formatted);
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(ComparisonSinglestat.prototype), 'interactive_properties', this).call(this).concat(['query_other', { name: 'percent', type: 'boolean' }]);
        }
    }, {
        key: 'query_other',
        get: function get() {
            if (!this.dashboard) {
                return null;
            }
            return this.dashboard.definition.queries[this._query_other];
        },
        set: function set(value) {
            this._query_other = value.name;
        }
    }]);

    return ComparisonSinglestat;
})(_singlestat2['default']);

exports['default'] = ComparisonSinglestat;

ComparisonSinglestat.meta = {
    template: ts.templates.models.singlestat
};

module.exports = exports['default'];

},{"../../app":1,"../../core":24,"../data/query":41,"./singlestat":66}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _table_presentation = require('./table_presentation');

var _table_presentation2 = _interopRequireDefault(_table_presentation);

var _coreUtil = require('../../core/util');

var _dataQuery = require('../data/query');

var _dataQuery2 = _interopRequireDefault(_dataQuery);

var _dataSummation = require('../data/summation');

var _dataSummation2 = _interopRequireDefault(_dataSummation);

var _appApp = require('../../app/app');

/**
 * A summation table that compares two arbitrary queries.
 */

var app = _interopRequireWildcard(_appApp);

var ComparisonSummationTable = (function (_TablePresentation) {
    _inherits(ComparisonSummationTable, _TablePresentation);

    function ComparisonSummationTable(data) {
        _classCallCheck(this, ComparisonSummationTable);

        _get(Object.getPrototypeOf(ComparisonSummationTable.prototype), 'constructor', this).call(this, data);
        if (data) {
            if (this.query_other instanceof _dataQuery2['default']) {
                this._query_other = data.query_other.name;
            } else {
                this._query_other = data.query_other;
            }
        }
    }

    _createClass(ComparisonSummationTable, [{
        key: '_update_query',
        value: function _update_query() {
            if (this._query && this.query_other && this.dashboard) {
                var query = this.dashboard.definition.queries[this._query];
                this.query_override = query.join(this.query_other).set_name(this.item_id + '_joined');
                this.query_override.render_templates(app.context().variables);
            }
        }
    }, {
        key: 'set_query_other',
        value: function set_query_other(value) {
            if (typeof value === 'string') {
                this._query_other = value;
            } else {
                this._query_other = value.name;
            }
            return this.updated();
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(ComparisonSummationTable.prototype), 'toJSON', this).call(this), {
                query_other: this._query_other
            });
        }
    }, {
        key: 'render',
        value: function render() {
            this._update_query();
            return _get(Object.getPrototypeOf(ComparisonSummationTable.prototype), 'render', this).call(this);
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            if (query.data.length < 2) return;
            var body = $('#' + this.item_id + ' tbody');
            var now = query.data[0].summation;
            var then = query.data[1].summation;
            var diff = new _dataSummation2['default'](now).subtract(then);
            var properties = ['mean', 'min', 'max', 'sum'];
            var float_margin = 0.000001;
            properties.forEach(function (prop) {
                var value = diff[prop];
                if (value > float_margin) diff[prop + '_class'] = 'ds-diff-plus';else if (value < -float_margin) diff[prop + '_class'] = 'ds-diff-minus';
                if (float_margin > value && value > -float_margin) value = 0.0;
                var pct = now[prop] / then[prop] - 1;
                pct = isNaN(pct) ? 0.0 : pct;
                diff[prop + '_pct'] = d3.format(',.2%')(Math.abs(pct));
                diff[prop] = Math.abs(value);
            });
            body.empty();
            body.append(ts.templates.models.comparison_summation_table_body({
                now: now,
                then: then,
                diff: diff,
                item: this
            }));
            if (this.sortable) {
                body.parent().DataTable({
                    autoWidth: false,
                    paging: false,
                    searching: false,
                    info: false
                });
            }
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(ComparisonSummationTable.prototype), 'interactive_properties', this).call(this).concat(['query_other']);
        }
    }, {
        key: 'query_other',
        get: function get() {
            if (!this.dashboard) {
                return null;
            }
            return this.dashboard.definition.queries[this._query_other];
        },
        set: function set(value) {
            this._query_other = value.name;
        }
    }]);

    return ComparisonSummationTable;
})(_table_presentation2['default'])

;

exports['default'] = ComparisonSummationTable;
module.exports = exports['default'];

},{"../../app/app":2,"../../core/util":32,"../data/query":41,"../data/summation":42,"./table_presentation":70}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _coreUtil = require('../../core/util');

var _factory = require('./factory');

/**
 * Base class for all dashboard items that contain other items.
 */

var Container = (function (_DashboardItem) {
    _inherits(Container, _DashboardItem);

    function Container(data) {
        _classCallCheck(this, Container);

        _get(Object.getPrototypeOf(Container.prototype), 'constructor', this).call(this, data);
        this.items = [];
        if (data && data.items) {
            this.items = data.items.map(function (i) {
                return (0, _factory.make)(i);
            });
        }
    }

    _createClass(Container, [{
        key: 'find',

        /**
         * Find the index of a contained dashboard item.
         *
         * @return The numeric index (0-based) or -1 if not found.
         */
        value: function find(item_or_id) {
            var id = item_or_id;
            if (item_or_id instanceof _item2['default']) {
                id = item_or_id.item_id;
            }
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].item_id === id) {
                    return Number(i);
                }
            }
            return -1;
        }
    }, {
        key: 'contains',
        value: function contains(item_or_id) {
            return this.find(item_or_id) > -1;
        }
    }, {
        key: 'visit',
        value: function visit(visitor) {
            visitor(this);
            this.items.forEach(function (item) {
                if (item.visit && typeof item.visit === 'function') {
                    item.visit(visitor);
                } else {
                    visitor(item);
                }
            });
            return this;
        }
    }, {
        key: 'add',
        value: function add(item) {
            if (typeof item === 'string') {
                item = (0, _factory.make)(item);
            }
            this.items.push(item);
            return this.updated();
        }
    }, {
        key: 'add_after',
        value: function add_after(item, new_item) {
            var index = this.find(item);
            if (index === -1 || index === this.length - 1) {
                this.items.push(new_item);
            } else {
                this.items.splice(index + 1, 0, new_item);
            }
            return this.updated();
        }
    }, {
        key: 'remove',
        value: function remove(item) {
            var index = this.find(item);
            if (index < 0) {
                return false;
            }
            this.items.splice(index, 1);
            this.updated();
            return true;
        }

        /**
         * Move the position of a child item in the list, either up or
         * down one position. The position will not wrap - if the child
         * is a the beginning or end of the list, it will not be moved.
         *
         * @param item {object} A dashboard item. Must be a child of
         *                      this container.
         * @param increment {number} Either 1 to move the element up one
         *                           place, or -1 to move it back one
         *                           element.
         */
    }, {
        key: 'move',
        value: function move(item, increment) {
            var index = this.find(item);
            if (index < 0) {
                return false;
            }
            if (index == 0 && increment < 0) {
                return false;
            }
            if (index == this.length - 1 && increment > 0) {
                return false;
            }
            var target_index = index + increment;
            var tmp = this.items[target_index];
            this.items[target_index] = item;
            this.items[index] = tmp;
            this.updated();
            return true;
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(Container.prototype), 'toJSON', this).call(this), {
                items: this.items.map(function (i) {
                    return i.toJSON();
                })
            });
        }
    }, {
        key: 'length',
        get: function get() {
            return this.items ? this.items.length : 0;
        }
    }]);

    return Container;
})(_item2['default'])

;

exports['default'] = Container;
module.exports = exports['default'];

},{"../../core/util":32,"./factory":54,"./item":56}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _presentation = require('./presentation');

var _presentation2 = _interopRequireDefault(_presentation);

var _dataQuery = require('../data/query');

var _dataQuery2 = _interopRequireDefault(_dataQuery);

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var log = core.logger('models.dashboard_definition');

var DashboardDefinition = (function (_Container) {
    _inherits(DashboardDefinition, _Container);

    function DashboardDefinition(data) {
        _classCallCheck(this, DashboardDefinition);

        _get(Object.getPrototypeOf(DashboardDefinition.prototype), 'constructor', this).call(this, data);
        this.queries = {};
        this.options = {};
        if (data) {
            this.renderer = data.renderer;
            if (data.queries) {
                for (var key in data.queries) {
                    var query = data.queries[key];
                    this.queries[key] = typeof query === 'string' || query instanceof Array ? new _dataQuery2['default']({ name: key, targets: query }) : new _dataQuery2['default'](query);
                }
            }
        }
    }

    /**
     * Operations
     */

    _createClass(DashboardDefinition, [{
        key: 'summarize',
        value: function summarize() {
            var counts = {};
            this.visit(function (item) {
                if (typeof counts[item.item_type] === 'undefined') {
                    counts[item.item_type] = 1;
                } else {
                    counts[item.item_type] = counts[item.item_type] + 1;
                }
            });
            return counts;
        }
    }, {
        key: 'render_templates',
        value: function render_templates(context) {
            var _this = this;

            for (var key in this.queries) {
                this.queries[key].render_templates(context);
            }
            this.visit(function (item) {
                if (item !== _this && item.render_templates) {
                    item.render_templates(context);
                }
            });
        }
    }, {
        key: 'cleanup',
        value: function cleanup() {
            for (var key in this.queries) {
                this.queries[key].off();
            }
        }
    }, {
        key: 'list_queries',
        value: function list_queries() {
            var _this2 = this;

            return Object.keys(this.queries).map(function (key) {
                return _this2.queries[key];
            });
        }
    }, {
        key: 'load_all',
        value: function load_all(options) {
            var _this3 = this;

            log.debug('load_all()');
            this.options = options || this.options;
            var queries_to_load = {};
            var queries_to_fire = {};
            this.visit(function (item) {
                if (item instanceof _presentation2['default']) {
                    var query = item.query_override || item.query;
                    if (query) {
                        if (item.meta.requires_data || charts.get_renderer(item).is_interactive) {
                            queries_to_load[query.name] = query;
                            delete queries_to_fire[query.name];
                        } else {
                            if (!queries_to_load[query.name]) {
                                queries_to_fire[query.name] = query;
                            }
                        }
                    }
                }
            });
            var promises = Object.keys(queries_to_load).map(function (key) {
                var query = queries_to_load[key];
                if (query) {
                    var future = queries_to_load[key].load(_this3.options, false);
                    return future ? future.promise() : undefined;
                } else {
                    return undefined;
                }
            });
            Object.keys(queries_to_fire).forEach(function (key) {
                var query = queries_to_fire[key];
                if (query) {
                    queries_to_fire[key].load(_this3.options, true /* fire_only */);
                }
            });
            $.when(promises).done(function () {
                // TODO: This isn't *quite* what I want - this fires after all
                // the HTTP requests for the queries are complete, but the
                // done() handlers are not (i.e. we're not actually done
                // munging the data yet).
                // TODO - use new event interface
                // ts.event.fire(ts.app.instance, ts.app.Event.QUERIES_COMPLETE)
            });
            return this;
        }
    }, {
        key: 'add_query',
        value: function add_query(query) {
            this.queries[query.name] = query;
            query.options = this.options;
            return this;
        }

        /**
         * Delete a query and null out any references to it.
         */
    }, {
        key: 'delete_query',
        value: function delete_query(query_name) {
            this.visit(function (item) {
                if (item instanceof _presentation2['default']) {
                    if (item.query && item.query.name === query_name) {
                        item.query = undefined;
                    }
                }
            });
            delete this.queries[query_name];
            return this;
        }

        /**
         * Rename a query and update any references to it.
         */
    }, {
        key: 'rename_query',
        value: function rename_query(old_name, new_name) {
            var query = this.queries[old_name];
            if (!query) return this;
            var updated = [];
            this.visit(function (item) {
                if (item instanceof _presentation2['default']) {
                    if (item.query && item.query.name == old_name) {
                        item.query = new_name;
                        updated.push(item);
                    }
                }
            });
            query.name = new_name;
            this.add_query(query);
            delete this.queries[old_name];
            return updated;
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(DashboardDefinition.prototype), 'interactive_properties', this).call(this).concat(['chart.renderer']);
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var q = {};
            for (var key in this.queries) {
                q[key] = this.queries[key].toJSON();
            }
            return core.extend(_get(Object.getPrototypeOf(DashboardDefinition.prototype), 'toJSON', this).call(this), {
                queries: q,
                renderer: this.renderer
            });
        }
    }]);

    return DashboardDefinition;
})(_container2['default']);

exports['default'] = DashboardDefinition;

DashboardDefinition.meta = {
    template: ts.templates.models.definition
}; // end class DashboardDefinition

module.exports = exports['default'];

},{"../../charts/core":17,"../../core":24,"../data/query":41,"./container":50,"./presentation":60}],52:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _chart = require('./chart');

var _chart2 = _interopRequireDefault(_chart);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var _coreUtil = require('../../core/util');

var DiscreteBarChart = (function (_Chart) {
    _inherits(DiscreteBarChart, _Chart);

    function DiscreteBarChart(data) {
        _classCallCheck(this, DiscreteBarChart);

        _get(Object.getPrototypeOf(DiscreteBarChart.prototype), 'constructor', this).call(this, data);
        this.transform = 'sum';
        this.orientation = 'vertical';
        this.format = ',.3s';
        this.show_grid = true;
        this.show_numbers = true;
        if (data) {
            this.legend = undefined;
            this.transform = data.transform || this.transform;
            this.orientation = data.orientation || this.orientation;
            this.format = data.format || this.format;
            if (typeof data.show_grid !== 'undefined') {
                this.show_grid = Boolean(data.show_grid);
            }
            if (typeof data.show_numbers !== 'undefined') {
                this.show_numbers = Boolean(data.show_numbers);
            }
        }
    }

    _createClass(DiscreteBarChart, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(DiscreteBarChart.prototype), 'toJSON', this).call(this), {
                orientation: this.orientation,
                transform: this.transform,
                format: this.format,
                show_grid: this.show_grid,
                show_numbers: this.show_numbers
            });
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            charts.discrete_bar_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query);
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(DiscreteBarChart.prototype), 'interactive_properties', this).call(this).concat(['transform', 'format', 'chart.y-axis-label', { name: 'show_grid', type: 'boolean' }, { name: 'show_numbers', type: 'boolean' }, {
                name: 'orientation',
                type: 'select',
                edit_options: {
                    source: ['horizontal', 'vertical']
                }
            }]);
        }
    }]);

    return DiscreteBarChart;
})(_chart2['default']);

exports['default'] = DiscreteBarChart;

DiscreteBarChart.meta = {
    display_name: 'Bar Chart (Discrete)',
    icon: 'fa fa-bar-chart'
};

module.exports = exports['default'];

},{"../../charts/core":17,"../../core/util":32,"./chart":46}],53:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _chart = require('./chart');

var _chart2 = _interopRequireDefault(_chart);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var _coreUtil = require('../../core/util');

var DonutChart = (function (_Chart) {
    _inherits(DonutChart, _Chart);

    function DonutChart(data) {
        _classCallCheck(this, DonutChart);

        _get(Object.getPrototypeOf(DonutChart.prototype), 'constructor', this).call(this, data);
        this.labels = false;
        this.is_pie = false;
        if (data) {
            if (typeof data.labels !== 'undefined') {
                this.labels = Boolean(data.labels);
            }
            if (typeof data.is_pie !== 'undefined') {
                this.is_pie = Boolean(data.is_pie);
            }
        }
    }

    _createClass(DonutChart, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(DonutChart.prototype), 'toJSON', this).call(this), {
                labels: this.labels,
                is_pie: this.is_pie
            });
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            charts.donut_chart($("#" + this.item_id + ' .ds-graph-holder'), this, query);
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(DonutChart.prototype), 'interactive_properties', this).call(this).concat([{ name: 'labels', type: 'boolean' }, { name: 'is_pie', type: 'boolean' }]);
        }
    }]);

    return DonutChart;
})(_chart2['default']);

exports['default'] = DonutChart;

DonutChart.meta = {
    icon: 'fa fa-pie-chart'
};

module.exports = exports['default'];

},{"../../charts/core":17,"../../core/util":32,"./chart":46}],54:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.get_metadata_list = get_metadata_list;
exports.get_merged_metadata = get_merged_metadata;
exports.register_dashboard_item = register_dashboard_item;
exports.make = make;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var log = core.logger('models.factory');
var constructors = new Map();
var metadata = new Map();
/**
 * Walk up a dashboard item's inheritance chain and produce a list
 * of metadata objects, ordered from least specific to most
 * specific.
 */
exports.metadata = metadata;

function get_metadata_list(item_class) {
    var metas = [];
    while (item_class && _item2['default'].isPrototypeOf(item_class)) {
        if (item_class['meta']) {
            metas.push(item_class['meta']);
        }
        item_class = Object.getPrototypeOf(item_class);
    }
    return metas.reverse();
}

/**
 * Get the metadata for a dashboard item class, merged with the
 * metadata of its parent classes.
 */

function get_merged_metadata(item_class) {
    var metas = get_metadata_list(item_class);
    return core.extend.apply(core, [{}].concat(_toConsumableArray(metas)));
}

/**
 * Register a dashboard item type.
 *
 * Each dashboard item class must have the following members:
 *   - A constructor with the signature `new(data?: any)`
 *   - Optionally a static `meta` property of type `DashboardItemMetadata`
 *
 * @see DashboardItemConstructor
 */

function register_dashboard_item(item_class) {
    //
    // First make sure the class has metadata, creating whatever we
    // can programmatically if it's not specified explicitly.
    //
    var meta = {};
    if (item_class.meta && item_class.hasOwnProperty('meta')) {
        meta = item_class.meta;
    } else {
        item_class.meta = meta;
    }
    // Set any missing metadata fields by munging the item type.
    if (!meta.item_type) {
        meta.item_type = inflection.underscore(item_class.name);
    }
    if (!meta.display_name) {
        meta.display_name = inflection.titleize(meta.item_type);
    }
    if (!meta.template && ts.templates.models[meta.item_type]) {
        meta.template = ts.templates.models[meta.item_type];
    }
    //
    // Merge the immediate metadata with any parent metadata.
    //
    item_class.meta = meta = get_merged_metadata(item_class);
    //
    // Compile the template if necessary.
    //
    if (meta.template && typeof meta.template === 'string') {
        meta.template = Handlebars.compile(meta.template);
    }
    //
    // Register any item-specific action
    //
    if (meta.actions && meta.actions.length) {
        core.actions.register(meta.item_type, meta.actions);
    }
    //
    // Create a test instance to fetch the complete list of
    // interactive properties, then sort them and cache them in the
    // meta object.
    //
    var instance = new item_class();
    var props = instance.interactive_properties().map(function (p) {
        return core.property(p);
    });
    props.sort(function (p1, p2) {
        if (p1.category === p2.category) {
            return p1.property_name.localeCompare(p2.property_name);
        } else {
            return (p1.category || '').localeCompare(p2.category || '');
        }
    });
    meta.interactive_properties = props;
    //
    // Create and register a new action to instantiate the dashboard
    // item type in the editor UI
    //
    var category = meta.category ? 'new-item-' + meta.category : 'new-item';
    core.actions.register({
        name: meta.item_type,
        category: category,
        display: 'Add new ' + (meta.display_name || meta.item_type),
        icon: meta.icon || '',
        css: 'new-item',
        handler: function handler(action, container) {
            container.add(new item_class());
        }
    });
    //
    // Cache the constructor and metadata globally.
    //
    metadata.set(meta.item_type, meta);
    constructors.set(meta.item_type, item_class);
    log.debug('registered ' + meta.item_type);
}

function make(data, init) {
    if (data instanceof _item2['default']) {
        return data;
    }
    if (typeof data === 'string' && constructors.has(data)) {
        return new (constructors.get(data))(init);
    }
    if (data.item_type && constructors.has(data.item_type)) {
        return new (constructors.get(data.item_type))(data);
    }
    log.error('Unknown item type ' + JSON.stringify(data));
    return null;
}



},{"../../core":24,"./item":56}],55:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _coreUtil = require('../../core/util');

var Heading = (function (_DashboardItem) {
    _inherits(Heading, _DashboardItem);

    function Heading(data) {
        _classCallCheck(this, Heading);

        _get(Object.getPrototypeOf(Heading.prototype), 'constructor', this).call(this, data);
        this.level = 1;
        if (data) {
            this.text = data.text;
            this.level = data.level || this.level;
            this.description = data.description;
        }
    }

    _createClass(Heading, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(Heading.prototype), 'toJSON', this).call(this), {
                text: this.text,
                level: this.level,
                description: this.description
            });
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return ['text', { name: 'level', type: 'number' }, 'description'];
        }
    }]);

    return Heading;
})(_item2['default']);

exports['default'] = Heading;

Heading.meta = {
    icon: 'fa fa-header',
    category: 'display'
};

module.exports = exports['default'];

},{"../../core/util":32,"./item":56}],56:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _model = require('../model');

var _model2 = _interopRequireDefault(_model);

var _factory = require('./factory');

var log = core.logger('item');
var DashboardItemStyle = {
    WELL: 'well',
    CALLOUT_NEUTRAL: 'callout_neutral',
    CALLOUT_INFO: 'callout_info',
    CALLOUT_SUCCESS: 'callout_success',
    CALLOUT_WARNING: 'callout_warning',
    CALLOUT_DANGER: 'callout_danger',
    ALERT_NEUTRAL: 'alert_neutral',
    ALERT_INFO: 'alert_info',
    ALERT_SUCCESS: 'alert_success',
    ALERT_WARNING: 'alert_warning',
    ALERT_DANGER: 'alert_danger'
};
exports.DashboardItemStyle = DashboardItemStyle;
var Transform = {
    SUM: 'sum',
    MIN: 'min',
    MAX: 'max',
    MEAN: 'mean',
    MEDIAN: 'median',
    FIRST: 'first',
    LAST: 'last',
    LAST_NON_ZERO: 'last_non_zero',
    COUNT: 'count'
};
exports.Transform = Transform;
core.properties.register([{
    name: 'style',
    type: 'select',
    edit_options: {
        source: [{ value: undefined, text: 'none' }, 'well', 'callout_neutral', 'callout_info', 'callout_success', 'callout_warning', 'callout_danger', 'alert_neutral', 'alert_info', 'alert_success', 'alert_warning', 'alert_danger']
    }
}, {
    name: 'height',
    category: 'base',
    type: 'select',
    edit_options: {
        source: [{ value: undefined, text: 'default' }, 1, 2, 3, 4, 5, 6, 7, 8],
        update: function update(item, value) {
            if (value) {
                item.set_height(Number(value));
            }
        }
    }
}, {
    name: 'title',
    category: 'base'
}]);
core.properties.register([{
    name: 'css_class', category: 'base'
}]);
/**
 * Base class for all things that can be displayed on a dashboard.
 */

var DashboardItem = (function (_Model) {
    _inherits(DashboardItem, _Model);

    function DashboardItem(data) {
        _classCallCheck(this, DashboardItem);

        _get(Object.getPrototypeOf(DashboardItem.prototype), 'constructor', this).call(this, data);
        if (data) {
            if (data.item_id) {
                this.item_id = data.item_id;
            }
            this.title = data.title;
            this.options = data.options;
            this.css_class = data.css_class;
            this.height = data.height;
            this.style = data.style;
            this.dashboard = data.dashboard;
        }
    }

    /* Metadata Accessors ------------------------------ */

    _createClass(DashboardItem, [{
        key: 'updated',

        /* Events ----------------------------------------- */
        /**
         * Fire a centralized 'update' event. Parties interested in
         * receiving events when an item is updated can register handlers
         * using the class (DashboardItem) as the target. The specific item
         * updated will be passed as the event data.
         */
        value: function updated() {
            core.events.fire(DashboardItem, 'update', { target: this });
            return this;
        }

        /* Chainable setters ------------------------------ */
        // These were created automatically by the old `limivorous`
        // observable object library. The could be created automatically
        // by a utility function here too, but we'd lose the benefit of
        // type-checking.
    }, {
        key: 'set_item_id',
        value: function set_item_id(value) {
            this.item_id = value;
            return this.updated();
        }
    }, {
        key: 'set_height',
        value: function set_height(value) {
            this.height = value;
            return this.updated();
        }
    }, {
        key: 'set_style',
        value: function set_style(value) {
            this.style = value;
            return this.updated();
        }
    }, {
        key: 'set_css_class',
        value: function set_css_class(value) {
            this.css_class = value;
            return this.updated();
        }
    }, {
        key: 'set_dashboard',
        value: function set_dashboard(value /* TODO */) {
            this.dashboard = value;
            return this;
        }
    }, {
        key: 'set_title',
        value: function set_title(value) {
            this.title = value;
            return this.updated();
        }

        /* Core methods ------------------------------ */
        /** Override this method in sub classes that have strings which
         * should be template-expanded before rendering. */
    }, {
        key: 'render_templates',
        value: function render_templates(context) {}
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return ['css_class'];
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.meta.template) {
                return "<p>Item type <code>" + this.item_type + "</code> is missing a template.</p>";
            }
            return core.compile_template(this.template)({ item: this });
        }
    }, {
        key: 'visit',
        value: function visit(visitor) {
            visitor(this);
            return this;
        }
    }, {
        key: 'clone',
        value: function clone() {
            return (0, _factory.make)(this.toJSON()).set_item_id(null);
        }
    }, {
        key: 'flatten',
        value: function flatten() {
            var flat = [];
            this.visit(function (item) {
                flat.push(item);
            });
            return flat;
        }

        // TODO - this should be moved out of the base class into a utility
        // module. It's only used by the manager object.
    }, {
        key: 'get_queries',
        value: function get_queries() {
            var queries = {};
            this.visit(function (item) {
                if (item['query']) {
                    var q = item['query_override'] || item['query'];
                    if (q) {
                        queries[q.name] = q;
                    }
                }
            });
            return queries;
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return {
                title: this.title,
                options: this.options,
                item_type: this.item_type,
                item_id: this.item_id,
                css_class: this.css_class,
                height: this.height,
                style: this.style
            };
        }
    }, {
        key: 'meta',
        get: function get() {
            return Object.getPrototypeOf(this).constructor.meta;
        }
    }, {
        key: 'item_type',
        get: function get() {
            return this.meta.item_type;
        }
    }, {
        key: 'item_category',
        get: function get() {
            return this.meta.category;
        }
    }, {
        key: 'display_name',
        get: function get() {
            return this.meta.display_name;
        }
    }, {
        key: 'template',
        get: function get() {
            return this.meta.template;
        }
    }, {
        key: 'icon',
        get: function get() {
            return this.meta.icon;
        }
    }, {
        key: 'requires_data',
        get: function get() {
            return this.meta.requires_data;
        }
    }]);

    return DashboardItem;
})(_model2['default'])

;

exports['default'] = DashboardItem;

},{"../../core":24,"../model":76,"./factory":54}],57:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _singlestat = require('./singlestat');

var _singlestat2 = _interopRequireDefault(_singlestat);

var JumbotronSinglestat = (function (_Singlestat) {
  _inherits(JumbotronSinglestat, _Singlestat);

  function JumbotronSinglestat() {
    _classCallCheck(this, JumbotronSinglestat);

    _get(Object.getPrototypeOf(JumbotronSinglestat.prototype), 'constructor', this).apply(this, arguments);
  }

  return JumbotronSinglestat;
})(_singlestat2['default'])

;

exports['default'] = JumbotronSinglestat;
module.exports = exports['default'];

},{"./singlestat":66}],58:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _coreTemplate = require('../../core/template');

var _coreUtil = require('../../core/util');

var Markdown = (function (_DashboardItem) {
    _inherits(Markdown, _DashboardItem);

    function Markdown(data) {
        _classCallCheck(this, Markdown);

        _get(Object.getPrototypeOf(Markdown.prototype), 'constructor', this).call(this, data);
        this.raw = false;
        if (data) {
            this.text = data.text;
            if (data.raw !== undefined) {
                this.raw = data.raw;
            }
        }
    }

    _createClass(Markdown, [{
        key: 'render_templates',
        value: function render_templates(context) {
            try {
                this.expanded_text = (0, _coreTemplate.render_template)(this.text, context);
            } catch (e) {
                this.expanded_text = e.toString();
            }
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(Markdown.prototype), 'toJSON', this).call(this), {
                text: this.text,
                raw: this.raw
            });
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return [{
                name: 'markdown.text',
                type: 'textarea',
                property_name: 'text'
            }, 'css_class'];
        }
    }]);

    return Markdown;
})(_item2['default']);

exports['default'] = Markdown;

Markdown.meta = {
    icon: 'fa fa-code',
    category: 'display'
};

module.exports = exports['default'];

},{"../../core/template":31,"../../core/util":32,"./item":56}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _table_presentation = require('./table_presentation');

var _table_presentation2 = _interopRequireDefault(_table_presentation);

var _coreUtil = require('../../core/util');

var PercentageTable = (function (_TablePresentation) {
    _inherits(PercentageTable, _TablePresentation);

    function PercentageTable(data) {
        _classCallCheck(this, PercentageTable);

        _get(Object.getPrototypeOf(PercentageTable.prototype), 'constructor', this).call(this, data);
        this.include_sums = false;
        this.invert_axes = false;
        this.transform = 'sum';
        if (data) {
            this.include_sums = data.include_sums;
            this.invert_axes = data.invert_axes;
            this.transform = data.transform || this.transform;
        }
    }

    _createClass(PercentageTable, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(PercentageTable.prototype), 'toJSON', this).call(this), {
                invert_axes: this.invert_axes,
                transform: this.transform,
                include_sums: this.include_sums
            });
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            var _this = this;

            query.summation.percent_value = query.summation[this.transform];
            query.data.forEach(function (series) {
                series.summation.percent = 1 / (query.summation[_this.transform] / series.summation[_this.transform]);
                series.summation.percent_value = series.summation[_this.transform];
            });
            var holder = $('#' + this.item_id + ' .ds-percentage-table-holder');
            holder.empty();
            holder.append(ts.templates.models.percentage_table_data({ item: this, query: query }));
            if (this.sortable) {
                var table = $('#' + this.item_id + ' .ds-percentage-table-holder table');
                table.DataTable({
                    order: [[2, "desc"]],
                    paging: false,
                    searching: false,
                    oLanguage: { sSearch: "" },
                    info: true
                });
            }
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(PercentageTable.prototype), 'interactive_properties', this).call(this).concat([{ name: 'invert_axes', type: 'boolean' }, { name: 'include_sums', type: 'boolean' }, 'transform']);
        }
    }]);

    return PercentageTable;
})(_table_presentation2['default']);

exports['default'] = PercentageTable;

PercentageTable.meta = {
    icon: 'fa fa-table',
    category: 'data-table',
    requires_data: true
};

module.exports = exports['default'];

},{"../../core/util":32,"./table_presentation":70}],60:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _appManager = require('../../app/manager');

var _appManager2 = _interopRequireDefault(_appManager);

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var log = core.logger('models.presentation');
core.properties.register([{
    name: 'query',
    category: 'base',
    template: '{{item.query.name}}',
    edit_options: {
        type: 'select',
        source: function source() {
            var queries = _appManager2['default'].current.dashboard.definition.queries;
            return Object.keys(queries).map(function (k) {
                return { value: k, text: k };
            });
        },
        value: function value(item) {
            return item.query ? item.query.name : undefined;
        },
        update: function update(item, value) {
            item.set_query(value);
        }
    }
}, {
    name: 'query_other',
    category: 'base',
    template: '{{item.query_other.name}}',
    edit_options: {
        type: 'select',
        source: function source() {
            var queries = _appManager2['default'].current.dashboard.definition.queries;
            return Object.keys(queries).map(function (k) {
                return { value: k, text: k };
            });
        },
        value: function value(item) {
            return item.query_other ? item.query_other.name : undefined;
        },
        update: function update(item, value) {
            item.set_query_other(value);
        }
    }
}, {
    name: 'transform',
    type: 'select',
    edit_options: {
        source: [{ value: undefined, text: 'default' }, 'sum', 'min', 'max', 'mean', 'median', 'first', 'last', 'last_non_zero', 'count']
    }
}]);
/**
 * The base class for all _presentations_, or dashboard items
 * which render data in some manner.
 */

var Presentation = (function (_DashboardItem) {
    _inherits(Presentation, _DashboardItem);

    function Presentation(data) {
        _classCallCheck(this, Presentation);

        _get(Object.getPrototypeOf(Presentation.prototype), 'constructor', this).call(this, data);
        if (data) {
            if (data.query && data.query.name) {
                this._query = data.query.name;
            } else {
                this._query = data.query;
            }
        }
    }

    /* Query Accessors ------------------------------ */

    _createClass(Presentation, [{
        key: 'set_query',

        /* Chainable setters ------------------------------ */
        value: function set_query(value) {
            if (typeof value === 'string') {
                this._query = value;
            } else {
                this._query = value.name;
            }
            return this.updated();
        }
    }, {
        key: 'set_query_override',
        value: function set_query_override(value) {
            this.query_override = value;
            return this.updated();
        }

        /* Core methods ------------------------------ */
        /** Override this method in sub-classes to use query data to
         * render a dashboard element. */
    }, {
        key: 'data_handler',
        value: function data_handler(query) {}
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(Presentation.prototype), 'interactive_properties', this).call(this).concat(['query']);
        }
    }, {
        key: 'render_templates',
        value: function render_templates(context) {
            _get(Object.getPrototypeOf(Presentation.prototype), 'render_templates', this).call(this, context);
            /* No need to render this.query here, because they're shared,
             * and handled by dashboard_definition */
            if (this.query_override) {
                this.query_override.render_templates(context);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var query = this.query_override || this.query;
            if (query) {
                query.on_load(function (q) {
                    _this.data_handler(q);
                });
            }
            return _get(Object.getPrototypeOf(Presentation.prototype), 'render', this).call(this);
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return core.extend(_get(Object.getPrototypeOf(Presentation.prototype), 'toJSON', this).call(this), {
                query: this._query
            });
        }
    }, {
        key: 'query',
        get: function get() {
            if (!this.dashboard) {
                log.error('dashboard property not set on ' + this.item_type + ' / ' + this.item_id);
                return null;
            }
            return this.dashboard.definition.queries[this._query];
        },
        set: function set(value) {
            this._query = value.name;
        }
    }]);

    return Presentation;
})(_item2['default'])

;

exports['default'] = Presentation;
module.exports = exports['default'];

},{"../../app/manager":15,"../../core":24,"./item":56}],61:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var Row = (function (_Container) {
    _inherits(Row, _Container);

    function Row(data) {
        _classCallCheck(this, Row);

        _get(Object.getPrototypeOf(Row.prototype), 'constructor', this).call(this, data);
    }

    _createClass(Row, [{
        key: 'interactive_properties',
        value: function interactive_properties() {
            return ['style', 'css_class'];
        }
    }]);

    return Row;
})(_container2['default']);

exports['default'] = Row;

Row.meta = {
    category: 'structural'
};

module.exports = exports['default'];

},{"./container":50}],62:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _coreUtil = require('../../core/util');

var Section = (function (_Container) {
    _inherits(Section, _Container);

    function Section(data) {
        _classCallCheck(this, Section);

        _get(Object.getPrototypeOf(Section.prototype), 'constructor', this).call(this, data);
        this.level = 1;
        this.horizontal_rule = false;
        this.layout = 'fixed';
        if (data) {
            this.description = data.description;
            this.level = data.level || this.level;
            if (typeof data.horizontal_rule !== 'undefined') this.horizontal_rule = !!data.horizontal_rule;
            this.layout = data.layout || this.layout;
        }
    }

    _createClass(Section, [{
        key: 'set_layout',
        value: function set_layout(value) {
            this.layout = value;
            return this.updated();
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(Section.prototype), 'toJSON', this).call(this), {
                description: this.description,
                level: this.level,
                horizontal_rule: this.horizontal_rule,
                layout: this.layout
            });
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return [{ name: 'layout',
                type: 'select',
                edit_options: {
                    source: ['fixed', 'fluid', 'none']
                }
            }, 'style', 'css_class', 'title', 'description', {
                name: 'level',
                edit_options: {
                    type: 'select',
                    source: [1, 2, 3, 4, 5, 6]
                }
            }, { name: 'horizontal_rule', type: 'boolean' }];
        }
    }]);

    return Section;
})(_container2['default']);

exports['default'] = Section;

Section.meta = {
    category: 'structural'
};

module.exports = exports['default'];

},{"../../core/util":32,"./container":50}],63:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var Separator = (function (_DashboardItem) {
    _inherits(Separator, _DashboardItem);

    function Separator(data) {
        _classCallCheck(this, Separator);

        _get(Object.getPrototypeOf(Separator.prototype), 'constructor', this).call(this, data);
    }

    _createClass(Separator, [{
        key: 'interactive_properties',
        value: function interactive_properties() {
            return ['css_class'];
        }
    }]);

    return Separator;
})(_item2['default']);

exports['default'] = Separator;

Separator.meta = {
    item_type: 'separator',
    display_name: 'Separator',
    icon: 'fa fa-arrows-h',
    category: 'display'
};

module.exports = exports['default'];

},{"./item":56}],64:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _xychart = require('./xychart');

var _xychart2 = _interopRequireDefault(_xychart);

var _coreUtil = require('../../core/util');

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var SimpleTimeSeries = (function (_XYChart) {
    _inherits(SimpleTimeSeries, _XYChart);

    function SimpleTimeSeries(data) {
        _classCallCheck(this, SimpleTimeSeries);

        _get(Object.getPrototypeOf(SimpleTimeSeries.prototype), 'constructor', this).call(this, data);
        this.filled = false;
        this.show_max_value = false;
        this.show_min_value = false;
        this.show_last_value = false;
        if (data) {
            this.legend = data.legend;
            this.filled = !!data.filled;
            this.show_max_value = !!data.show_max_value;
            this.show_min_value = !!data.show_min_value;
            this.show_last_value = !!data.show_last_value;
            if (!this.height) {
                this.height = 1;
            }
        }
    }

    _createClass(SimpleTimeSeries, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(SimpleTimeSeries.prototype), 'toJSON', this).call(this), {
                filled: this.filled,
                show_max_value: this.show_max_value,
                show_min_value: this.show_min_value,
                show_last_value: this.show_last_value
            });
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            var selector = '#' + this.item_id + ' .ds-graph-holder';
            if (this.filled) {
                charts.simple_area_chart($(selector), this, query);
            } else {
                charts.simple_line_chart($(selector), this, query);
            }
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(SimpleTimeSeries.prototype), 'interactive_properties', this).call(this).concat([{ name: 'filled', type: 'boolean' }, { name: 'show_max_value', type: 'boolean' }, { name: 'show_min_value', type: 'boolean' }, { name: 'show_last_value', type: 'boolean' }]);
        }
    }]);

    return SimpleTimeSeries;
})(_xychart2['default']);

exports['default'] = SimpleTimeSeries;

SimpleTimeSeries.meta = {
    icon: 'fa fa-line-chart'
};

module.exports = exports['default'];

},{"../../charts/core":17,"../../core/util":32,"./xychart":75}],65:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _chart = require('./chart');

var _chart2 = _interopRequireDefault(_chart);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var _coreUtil = require('../../core/util');

var Singlegraph = (function (_Chart) {
    _inherits(Singlegraph, _Chart);

    function Singlegraph(data) {
        _classCallCheck(this, Singlegraph);

        _get(Object.getPrototypeOf(Singlegraph.prototype), 'constructor', this).call(this, data);
        this.format = ',.1s';
        this.transform = 'mean';
        if (data) {
            this.format = data.format || this.format;
            this.transform = data.transform || this.transform;
            this.index = data.index;
            if (!this.height) this.height = 1;
        }
    }

    _createClass(Singlegraph, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(Singlegraph.prototype), 'toJSON', this).call(this), {
                format: this.format,
                transform: this.transform,
                index: this.index
            });
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            if (!query.data) return;
            charts.simple_area_chart($("#" + this.item_id + ' .ds-graph-holder'), this, query);
            this.options.margin = { top: 0, left: 0, bottom: 0, right: 0 };
            var label = query.data[this.index || 0].target;
            var value = query.summation[this.transform];
            if (this.index) {
                value = query.data[this.index].summation[this.transform];
            }
            $('#' + this.item_id + ' span.value').text(d3.format(this.format)(value));
            $('#' + this.item_id + ' span.ds-label').text(label);
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(Singlegraph.prototype), 'interactive_properties', this).call(this).concat(['format', 'transform']);
        }
    }]);

    return Singlegraph;
})(_chart2['default']);

exports['default'] = Singlegraph;

Singlegraph.meta = {
    icon: 'fa fa-image',
    category: 'chart',
    requires_data: true
};

module.exports = exports['default'];

},{"../../charts/core":17,"../../core/util":32,"./chart":46}],66:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _presentation = require('./presentation');

var _presentation2 = _interopRequireDefault(_presentation);

var _coreUtil = require('../../core/util');

var Singlestat = (function (_Presentation) {
    _inherits(Singlestat, _Presentation);

    function Singlestat(data) {
        _classCallCheck(this, Singlestat);

        _get(Object.getPrototypeOf(Singlestat.prototype), 'constructor', this).call(this, data);
        this.format = ',.3s';
        this.transform = 'mean';
        if (data) {
            this.units = data.units;
            this.format = data.format || this.format;
            this.index = data.index;
            this.transform = data.transform || this.transform;
        }
    }

    _createClass(Singlestat, [{
        key: 'set_transform',
        value: function set_transform(transform) {
            this.transform = transform;
            return this.updated();
        }
    }, {
        key: 'set_format',
        value: function set_format(format) {
            this.format = format;
            return this.updated();
        }
    }, {
        key: 'set_index',
        value: function set_index(index) {
            this.index = index;
            return this.updated();
        }
    }, {
        key: 'set_units',
        value: function set_units(units) {
            this.units = units;
            return this.updated();
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            if (!query.summation) return;
            var element = $('#' + this.item_id + ' .value');
            var value = query.summation[this.transform];
            if (this.index) {
                value = query.data[this.index].summation[this.transform];
            }
            element.text(d3.format(this.format)(value));
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(Singlestat.prototype), 'toJSON', this).call(this), {
                format: this.format,
                transform: this.transform,
                units: this.units,
                index: this.index
            });
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(Singlestat.prototype), 'interactive_properties', this).call(this).concat(['units', 'format', 'title', { name: 'index', type: 'number' }, 'transform']);
        }
    }]);

    return Singlestat;
})(_presentation2['default']);

exports['default'] = Singlestat;

Singlestat.meta = {
    category: 'data-table',
    icon: 'fa fa-subscript',
    requires_data: true
};

module.exports = exports['default'];

},{"../../core/util":32,"./presentation":60}],67:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _xychart = require('./xychart');

var _xychart2 = _interopRequireDefault(_xychart);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var _coreUtil = require('../../core/util');

var StackedAreaChart = (function (_XYChart) {
    _inherits(StackedAreaChart, _XYChart);

    function StackedAreaChart(data) {
        _classCallCheck(this, StackedAreaChart);

        _get(Object.getPrototypeOf(StackedAreaChart.prototype), 'constructor', this).call(this, data);
        this.stack_mode = charts.StackMode.NORMAL;
        if (data) {
            this.stack_mode = data.stack_mode || this.stack_mode;
        }
    }

    _createClass(StackedAreaChart, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(StackedAreaChart.prototype), 'toJSON', this).call(this), {
                stack_mode: this.stack_mode
            });
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            charts.stacked_area_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query);
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(StackedAreaChart.prototype), 'interactive_properties', this).call(this).concat([{
                name: 'stack_mode',
                type: 'select',
                edit_options: {
                    source: [charts.StackMode.NONE, charts.StackMode.NORMAL, charts.StackMode.PERCENT, charts.StackMode.STREAM]
                }
            }]);
        }
    }]);

    return StackedAreaChart;
})(_xychart2['default']);

exports['default'] = StackedAreaChart;

StackedAreaChart.meta = {
    icon: 'fa fa-area-chart'
};

module.exports = exports['default'];

},{"../../charts/core":17,"../../core/util":32,"./xychart":75}],68:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _xychart = require('./xychart');

var _xychart2 = _interopRequireDefault(_xychart);

var _chartsCore = require('../../charts/core');

var charts = _interopRequireWildcard(_chartsCore);

var StandardTimeSeries = (function (_XYChart) {
    _inherits(StandardTimeSeries, _XYChart);

    function StandardTimeSeries(data) {
        _classCallCheck(this, StandardTimeSeries);

        _get(Object.getPrototypeOf(StandardTimeSeries.prototype), 'constructor', this).call(this, data);
    }

    _createClass(StandardTimeSeries, [{
        key: 'data_handler',
        value: function data_handler(query) {
            charts.standard_line_chart($('#' + this.item_id + ' .ds-graph-holder'), this, query);
        }
    }]);

    return StandardTimeSeries;
})(_xychart2['default']);

exports['default'] = StandardTimeSeries;

StandardTimeSeries.meta = {
    icon: 'fa fa-line-chart'
};

module.exports = exports['default'];

},{"../../charts/core":17,"./xychart":75}],69:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _table_presentation = require('./table_presentation');

var _table_presentation2 = _interopRequireDefault(_table_presentation);

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _chartsUtil = require('../../charts/util');

var charts = _interopRequireWildcard(_chartsUtil);

var log = core.logger('models.summation_table');

var SummationTable = (function (_TablePresentation) {
    _inherits(SummationTable, _TablePresentation);

    function SummationTable(data) {
        _classCallCheck(this, SummationTable);

        _get(Object.getPrototypeOf(SummationTable.prototype), 'constructor', this).call(this, data);
        this.show_color = false;
        if (data) {
            this.show_color = !!data.show_color;
            this.options = data.options;
            this.palette = data.palette;
        }
    }

    _createClass(SummationTable, [{
        key: 'toJSON',
        value: function toJSON() {
            return core.extend(_get(Object.getPrototypeOf(SummationTable.prototype), 'toJSON', this).call(this), {
                show_color: this.show_color,
                options: this.options,
                palette: this.palette
            });
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            var _this = this;

            log.debug('data_handler(): ' + query.name + '/' + this.item_id);
            var options = this.options || {};
            var palette = charts.get_palette(options.palette || this.palette);
            var body = $('#' + this.item_id + ' tbody');
            body.empty();
            query.data.forEach(function (series, i) {
                var color = palette[i % palette.length];
                body.append(ts.templates.models.summation_table_row({ series: series, item: _this, color: color }));
            });
            if (this.sortable) {
                body.parent().DataTable({
                    autoWidth: false,
                    paging: false,
                    searching: false,
                    info: false
                });
            }
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(SummationTable.prototype), 'interactive_properties', this).call(this).concat([{ name: 'show_color', type: 'boolean' }, 'chart.palette']);
        }
    }]);

    return SummationTable;
})(_table_presentation2['default'])

;

exports['default'] = SummationTable;
module.exports = exports['default'];

},{"../../charts/util":22,"../../core":24,"./table_presentation":70}],70:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _presentation = require('./presentation');

var _presentation2 = _interopRequireDefault(_presentation);

var _coreUtil = require('../../core/util');

var TablePresentation = (function (_Presentation) {
    _inherits(TablePresentation, _Presentation);

    function TablePresentation(data) {
        _classCallCheck(this, TablePresentation);

        _get(Object.getPrototypeOf(TablePresentation.prototype), 'constructor', this).call(this, data);
        this.striped = false;
        this.sortable = false;
        this.format = ',.3s';
        if (data) {
            this.striped = !!data.striped;
            this.sortable = !!data.sortable;
            this.format = data.format || this.format;
        }
    }

    _createClass(TablePresentation, [{
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(TablePresentation.prototype), 'toJSON', this).call(this), {
                striped: this.striped,
                sortable: this.sortable,
                format: this.format
            });
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(TablePresentation.prototype), 'interactive_properties', this).call(this).concat([{ name: 'striped', type: 'boolean' }, { name: 'sortable', type: 'boolean' }, 'format']);
        }
    }]);

    return TablePresentation;
})(_presentation2['default']);

exports['default'] = TablePresentation;

TablePresentation.meta = {
    icon: 'fa fa-table',
    category: 'data-table',
    requires_data: true
};

module.exports = exports['default'];

},{"../../core/util":32,"./presentation":60}],71:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _presentation = require('./presentation');

var _presentation2 = _interopRequireDefault(_presentation);

var _coreUtil = require('../../core/util');

var ADDITIONAL_LANGUAGES = {
    minimal: {
        year: function year() {
            return "y";
        },
        month: function month() {
            return "mo";
        },
        week: function week() {
            return "w";
        },
        day: function day() {
            return "d";
        },
        hour: function hour() {
            return "h";
        },
        minute: function minute() {
            return "m";
        },
        second: function second() {
            return "s";
        },
        millisecond: function millisecond() {
            return "ms";
        }
    },
    compact: {
        year: function year() {
            return "yr";
        },
        month: function month() {
            return "mo";
        },
        week: function week() {
            return "wk";
        },
        day: function day() {
            return "day";
        },
        hour: function hour() {
            return "hr";
        },
        minute: function minute() {
            return "min";
        },
        second: function second() {
            return "sec";
        },
        millisecond: function millisecond() {
            return "ms";
        }
    }
};
var LANGUAGES = [undefined, 'minimal', 'compact'].concat(humanize_duration.getSupportedLanguages());
var DEFAULT_HUMANIZER = humanize_duration.humanizer({
    language: 'en'
});
var MINIMAL_HUMANIZER = humanize_duration.humanizer({
    language: 'minimal',
    languages: ADDITIONAL_LANGUAGES
});
var COMPACT_HUMANIZER = humanize_duration.humanizer({
    language: 'compact',
    languages: ADDITIONAL_LANGUAGES
});
/**
 * Render a summation value as a human-readable time span.
 *
 * TODO:
 * - This brings up the fact that we should now add a language user
 *   preference/global setting, similar to time zone.
 * - Expose more of the options from HumanizeDuration
 *
 * @see https://github.com/EvanHahn/HumanizeDuration.js
 */

var Timerstat = (function (_Presentation) {
    _inherits(Timerstat, _Presentation);

    function Timerstat(data) {
        _classCallCheck(this, Timerstat);

        _get(Object.getPrototypeOf(Timerstat.prototype), 'constructor', this).call(this, data);
        this.transform = 'mean';
        this.scale = 1;
        this.precision = 2;
        this.language = undefined;
        this.humanizer = DEFAULT_HUMANIZER;
        if (data) {
            this.transform = data.transform || this.transform;
            this.index = Number(data.index) || this.index;
            this.scale = Number(data.scale) || this.scale;
            this.precision = Number(data.precision) || this.precision;
            this.language = data.language;
            this._updateHumanizer();
        }
    }

    _createClass(Timerstat, [{
        key: '_updateHumanizer',
        value: function _updateHumanizer() {
            if (this.language) {
                if (this.language === 'compact') {
                    this.humanizer = COMPACT_HUMANIZER;
                } else if (this.language === 'minimal') {
                    this.humanizer = MINIMAL_HUMANIZER;
                } else {
                    this.humanizer = humanize_duration.humanizer({
                        language: this.language
                    });
                }
            } else {
                this.humanizer = DEFAULT_HUMANIZER;
            }
        }
    }, {
        key: '_getMillis',
        value: function _getMillis(query) {
            var data = this.index ? query.data[this.index] : query;
            return data.summation[this.transform] * this.scale;
        }
    }, {
        key: '_getTimeParts',
        value: function _getTimeParts(millis) {
            var humanized = this.humanizer(millis, {
                round: true,
                delimiter: ' '
            });
            var tokens = humanized.split(' ').slice(0, this.precision * 2);
            var timeParts = [];
            for (var i = 0; i < tokens.length; i += 2) {
                timeParts.push({
                    value: tokens[i],
                    unit: tokens[i + 1]
                });
            }
            return timeParts;
        }
    }, {
        key: 'set_language',
        value: function set_language(language) {
            this.language = language === 'none' ? undefined : language;
            this._updateHumanizer();
            return this.updated();
        }
    }, {
        key: 'set_precision',
        value: function set_precision(value) {
            this.precision = value;
            return this.updated();
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            var millis = this._getMillis(query);
            var timeParts = this._getTimeParts(millis);
            $('#' + this.item_id + ' .data').empty().append(ts.templates.models.timerstat_body({ parts: timeParts }));
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _coreUtil.extend)(_get(Object.getPrototypeOf(Timerstat.prototype), 'toJSON', this).call(this), {
                language: this.language,
                transform: this.transform,
                index: this.index,
                scale: this.scale,
                precision: this.precision
            });
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(Timerstat.prototype), 'interactive_properties', this).call(this).concat(['title', { name: 'index', type: 'number' }, 'scale', {
                name: 'precision', type: 'select',
                edit_options: {
                    source: [1, 2, 3, 4, 5, 6],
                    update: function update(item, value) {
                        item.set_precision(value);
                    }
                }
            }, 'transform', {
                name: 'language', type: 'select',
                edit_options: {
                    source: LANGUAGES,
                    update: function update(item, value) {
                        item.set_language(value);
                    }
                }
            }]);
        }
    }]);

    return Timerstat;
})(_presentation2['default']);

exports['default'] = Timerstat;

Timerstat.meta = {
    display_name: 'Timer Stat',
    category: 'data-table',
    icon: 'fa fa-clock-o',
    requires_data: true
};

module.exports = exports['default'];

},{"../../core/util":32,"./presentation":60}],72:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _timeshift_singlestat = require('./timeshift_singlestat');

var _timeshift_singlestat2 = _interopRequireDefault(_timeshift_singlestat);

var TimeshiftJumbotronSinglestat = (function (_TimeshiftSinglestat) {
    _inherits(TimeshiftJumbotronSinglestat, _TimeshiftSinglestat);

    function TimeshiftJumbotronSinglestat() {
        _classCallCheck(this, TimeshiftJumbotronSinglestat);

        _get(Object.getPrototypeOf(TimeshiftJumbotronSinglestat.prototype), 'constructor', this).apply(this, arguments);
    }

    return TimeshiftJumbotronSinglestat;
})(_timeshift_singlestat2['default']);

exports['default'] = TimeshiftJumbotronSinglestat;

TimeshiftJumbotronSinglestat.meta = {
    template: ts.templates.models.jumbotron_singlestat
};

module.exports = exports['default'];

},{"./timeshift_singlestat":73}],73:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _app = require('../../app');

var app = _interopRequireWildcard(_app);

var _singlestat = require('./singlestat');

var _singlestat2 = _interopRequireDefault(_singlestat);

var log = core.logger('models.timeshift_singlestat');
var FORMAT_PERCENT = d3.format(',.1%');

var TimeshiftSinglestat = (function (_Singlestat) {
    _inherits(TimeshiftSinglestat, _Singlestat);

    function TimeshiftSinglestat(data) {
        _classCallCheck(this, TimeshiftSinglestat);

        _get(Object.getPrototypeOf(TimeshiftSinglestat.prototype), 'constructor', this).call(this, data);
        this._shift = '1d';
        this.percent = false;
        if (data) {
            this._shift = data.shift || this._shift;
            this.percent = !!data.percent;
        }
        this._update_query();
    }

    _createClass(TimeshiftSinglestat, [{
        key: '_update_query',
        value: function _update_query() {
            if (this._query && this.dashboard) {
                var query = this.dashboard.definition.queries[this._query];
                this.query_override = query.join(query.shift(this.shift)).set_name(this.item_id + '_shifted');
                this.query_override.render_templates(app.context().variables);
            }
        }
    }, {
        key: 'set_shift',
        value: function set_shift(value) {
            this.shift = value;
            return this.updated();
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return core.extend(_get(Object.getPrototypeOf(TimeshiftSinglestat.prototype), 'toJSON', this).call(this), {
                shift: this.shift,
                percent: this.percent
            });
        }
    }, {
        key: 'render',
        value: function render() {
            this._update_query();
            return _get(Object.getPrototypeOf(TimeshiftSinglestat.prototype), 'render', this).call(this);
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            var value = query.data[0].summation[this.transform];
            var base = query.data[1].summation[this.transform];
            var diff = value - base;
            var pct = value / base - 1;
            var float_margin = 0.000001;
            var diff_elt = $('#' + this.item_id + ' span.diff');
            $('#' + this.item_id + ' span.value').text(d3.format(this.format)(value));
            if (diff > float_margin) diff_elt.addClass('ds-diff-plus');else if (diff < float_margin) diff_elt.addClass('ds-diff-minus');
            var diff_formatted = this.percent ? FORMAT_PERCENT(Math.abs(pct)) : d3.format(this.format)(Math.abs(diff));
            $('#' + this.item_id + ' span.diff').text(diff_formatted);
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(TimeshiftSinglestat.prototype), 'interactive_properties', this).call(this).concat(['shift', { name: 'percent', type: 'boolean' }]);
        }
    }, {
        key: 'shift',
        get: function get() {
            return this._shift;
        },
        set: function set(value) {
            this._shift = value;
        }
    }]);

    return TimeshiftSinglestat;
})(_singlestat2['default']);

exports['default'] = TimeshiftSinglestat;

TimeshiftSinglestat.meta = {
    template: ts.templates.models.singlestat
};

module.exports = exports['default'];

},{"../../app":1,"../../core":24,"./singlestat":66}],74:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _table_presentation = require('./table_presentation');

var _table_presentation2 = _interopRequireDefault(_table_presentation);

var _dataSummation = require('../data/summation');

var _dataSummation2 = _interopRequireDefault(_dataSummation);

var _appApp = require('../../app/app');

/**
 * This iteration of timeshift_summation_table takes a single query
 * and applies a timeShift() value to it. Another approach is to take
 * two arbitrary queries and compare them (so it's not strictly a
 * time-based comparison).
 *
 * This version is slightly simpler to implement, because we don't
 * need to join on two asynchronously fetched queries.
 */

var app = _interopRequireWildcard(_appApp);

var TimeshiftSummationTable = (function (_TablePresentation) {
    _inherits(TimeshiftSummationTable, _TablePresentation);

    function TimeshiftSummationTable(data) {
        _classCallCheck(this, TimeshiftSummationTable);

        _get(Object.getPrototypeOf(TimeshiftSummationTable.prototype), 'constructor', this).call(this, data);
        this._shift = '1d';
        if (data) {
            this._shift = data.shift || this._shift;
        }
        this._update_query();
    }

    _createClass(TimeshiftSummationTable, [{
        key: '_update_query',
        value: function _update_query() {
            if (this._query && this.dashboard) {
                var query = this.dashboard.definition.queries[this._query];
                this.query_override = query.join(query.shift(this.shift)).set_name(this.item_id + '_shifted');
                this.query_override.render_templates(app.context().variables);
            }
        }
    }, {
        key: 'set_shift',
        value: function set_shift(value) {
            this.shift = value;
            return this.updated();
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return core.extend(_get(Object.getPrototypeOf(TimeshiftSummationTable.prototype), 'toJSON', this).call(this), {
                shift: this.shift
            });
        }
    }, {
        key: 'render',
        value: function render() {
            this._update_query();
            return _get(Object.getPrototypeOf(TimeshiftSummationTable.prototype), 'render', this).call(this);
        }
    }, {
        key: 'data_handler',
        value: function data_handler(query) {
            var body = $('#' + this.item_id + ' tbody');
            var now = query.data[0].summation;
            var then = query.data[1].summation;
            var diff = new _dataSummation2['default'](now).subtract(then);
            var properties = ['mean', 'median', 'min', 'max', 'sum'];
            var float_margin = 0.000001;
            properties.forEach(function (prop) {
                var value = diff[prop];
                if (value > float_margin) diff[prop + '_class'] = 'ds-diff-plus';else if (value < -float_margin) diff[prop + '_class'] = 'ds-diff-minus';
                if (float_margin > value && value > -float_margin) value = 0.0;
                var pct = now[prop] / then[prop] - 1;
                pct = isNaN(pct) ? 0.0 : pct;
                diff[prop + '_pct'] = d3.format(',.2%')(Math.abs(pct));
                diff[prop] = Math.abs(value);
            });
            body.empty();
            body.append(ts.templates.models.timeshift_summation_table_body({
                now: now,
                then: then,
                diff: diff,
                item: this
            }));
            if (this.sortable) {
                body.parent().DataTable({
                    autoWidth: false,
                    paging: false,
                    searching: false,
                    info: false
                });
            }
        }
    }, {
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(TimeshiftSummationTable.prototype), 'interactive_properties', this).call(this).concat(['shift']);
        }
    }, {
        key: 'shift',
        get: function get() {
            return this._shift;
        },
        set: function set(value) {
            this._shift = value;
        }
    }], [{
        key: 'timeshift_action',
        value: function timeshift_action(interval, label) {
            return new core.Action({
                name: 'timeshift_' + interval,
                display: label,
                icon: 'fa fa-clock-o',
                handler: function handler(action, item) {
                    item.set_shift(interval);
                }
            });
        }
    }]);

    return TimeshiftSummationTable;
})(_table_presentation2['default']);

exports['default'] = TimeshiftSummationTable;

TimeshiftSummationTable.meta = {
    actions: [TimeshiftSummationTable.timeshift_action('1h', '1 Hour Ago'), TimeshiftSummationTable.timeshift_action('1d', '1 Day Ago'), TimeshiftSummationTable.timeshift_action('1w', '1 Week Ago'), new core.Action({
        name: 'timeshift_user_input',
        display: 'Pick interval...',
        icon: 'fa fa-clock-o',
        handler: function handler(action, item) {
            bootbox.prompt({
                backdrop: false,
                title: "Enter a time shift interval",
                callback: function callback(result) {
                    if (result) {
                        item.set_shift(result);
                    }
                }
            });
        }
    })]
};

module.exports = exports['default'];

},{"../../app/app":2,"../../core":24,"../data/summation":42,"./table_presentation":70}],75:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../../core');

var core = _interopRequireWildcard(_core);

var _chart = require('./chart');

var _chart2 = _interopRequireDefault(_chart);

var _axis = require('../axis');

var _axis2 = _interopRequireDefault(_axis);

core.properties.register([{
    name: 'chart.y-axis-label',
    property_name: 'y-axis-label',
    category: 'chart',
    edit_options: {
        type: 'text',
        value: function value(item) {
            if (item.options && item.options.y1) {
                return item.options.y1.label;
            } else if (item.options) {
                /* legacy */
                return item.options.yAxisLabel;
            } else {
                return undefined;
            }
        },
        update: function update(item, newValue) {
            if (!item.options) {
                item.options = {};
            }
            if (!item.options.y1) {
                item.options.y1 = new _axis2['default']();
            }
            item.options.y1.label = newValue;
            item.updated();
        }
    }
}, {
    name: 'chart.y-axis-min',
    property_name: 'y-axis-min',
    category: 'chart',
    edit_options: {
        type: 'text',
        value: function value(item) {
            return item.options && item.options.y1 ? item.options.y1.min : undefined;
        },
        update: function update(item, newValue) {
            if (!item.options) {
                item.options = {};
            }
            if (!item.options.y1) {
                item.options.y1 = new _axis2['default']();
            }
            item.options.y1.min = newValue;
            item.updated();
        }
    }
}, {
    name: 'chart.y-axis-max',
    property_name: 'y-axis-max',
    category: 'chart',
    edit_options: {
        type: 'text',
        value: function value(item) {
            return item.options && item.options.y1 ? item.options.y1.max : undefined;
        },
        update: function update(item, newValue) {
            if (!item.options) {
                item.options = {};
            }
            if (!item.options.y1) {
                item.options.y1 = new _axis2['default']();
            }
            item.options.y1.max = newValue;
            item.updated();
        }
    }
}]);

var XYChart = (function (_Chart) {
    _inherits(XYChart, _Chart);

    function XYChart(data) {
        _classCallCheck(this, XYChart);

        _get(Object.getPrototypeOf(XYChart.prototype), 'constructor', this).call(this, data);
    }

    _createClass(XYChart, [{
        key: 'interactive_properties',
        value: function interactive_properties() {
            return _get(Object.getPrototypeOf(XYChart.prototype), 'interactive_properties', this).call(this).concat(['chart.y-axis-label', 'chart.y-axis-min', 'chart.y-axis-max']);
        }
    }]);

    return XYChart;
})(_chart2['default'])

;

exports['default'] = XYChart;
module.exports = exports['default'];

},{"../../core":24,"../axis":39,"./chart":46}],76:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _coreEventSource = require('../core/event-source');

/**
 * Base class for all API model classes
 */

var _coreEventSource2 = _interopRequireDefault(_coreEventSource);

var Model = (function (_EventSource) {
    _inherits(Model, _EventSource);

    function Model(data) {
        _classCallCheck(this, Model);

        _get(Object.getPrototypeOf(Model.prototype), 'constructor', this).call(this, data);
    }

    _createClass(Model, [{
        key: 'toJSON',
        value: function toJSON() {
            return {};
        }
    }]);

    return Model;
})(_coreEventSource2['default'])

;

exports['default'] = Model;
module.exports = exports['default'];

},{"../core/event-source":26}],77:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var Preferences = (function (_Model) {
    _inherits(Preferences, _Model);

    function Preferences(data) {
        _classCallCheck(this, Preferences);

        _get(Object.getPrototypeOf(Preferences.prototype), 'constructor', this).call(this, data);
        this.connected_lines = false;
        this.default_from_time = '-3h';
        this.downsample = true;
        this.graphite_url = 'http://localhost:8080';
        this.propsheet_autoclose_seconds = 3;
        this.refresh = 60;
        this.renderer = 'flot';
        this.theme = 'light';
        this.timezone = 'Etc/UTC';
        if (data) {
            if (typeof data.connected_lines != 'undefined') this.connected_lines = !!data.connected_lines;
            this.default_from_time = data.default_from_time || this.default_from_time;
            if (typeof data.downsample != 'undefined') this.downsample = !!data.downsample;
            this.graphite_auth = data.graphite_auth;
            this.graphite_url = data.graphite_url || this.graphite_url;
            this.propsheet_autoclose_seconds = Number(data.propsheet_autoclose_seconds) || this.propsheet_autoclose_seconds;
            this.refresh = Number(data.refresh) || this.refresh;
            this.renderer = data.renderer || this.renderer;
            this.theme = data.theme || this.theme;
            this.timezone = data.timezone || this.timezone;
        }
    }

    _createClass(Preferences, [{
        key: 'toJSON',
        value: function toJSON() {
            return {
                connected_lines: this.connected_lines,
                default_from_time: this.default_from_time,
                downsample: this.downsample,
                graphite_auth: this.graphite_auth,
                graphite_url: this.graphite_url,
                propsheet_autoclose_seconds: this.propsheet_autoclose_seconds,
                refresh: this.refresh,
                renderer: this.renderer,
                theme: this.theme,
                timezone: this.timezone
            };
        }
    }]);

    return Preferences;
})(_model2['default'])

;

exports['default'] = Preferences;
module.exports = exports['default'];

},{"./model":76}],78:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var Tag = (function (_Model) {
    _inherits(Tag, _Model);

    function Tag(data) {
        _classCallCheck(this, Tag);

        _get(Object.getPrototypeOf(Tag.prototype), 'constructor', this).call(this, data);
        if (data) {
            if (typeof data === 'string') {
                this.name = data;
            } else {
                this.id = data.id;
                this.href = data.href;
                this.name = data.name;
                this.description = data.description;
                this.color = data.color;
                this.count = data.count;
            }
        }
    }

    _createClass(Tag, [{
        key: 'toJSON',
        value: function toJSON() {
            return {
                id: this.id,
                href: this.href,
                name: this.name,
                description: this.description,
                color: this.color,
                count: this.count
            };
        }
    }]);

    return Tag;
})(_model2['default'])

;

exports['default'] = Tag;
module.exports = exports['default'];

},{"./model":76}],79:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var Thresholds = (function (_Model) {
    _inherits(Thresholds, _Model);

    function Thresholds(data) {
        _classCallCheck(this, Thresholds);

        _get(Object.getPrototypeOf(Thresholds.prototype), 'constructor', this).call(this, data);
        if (data) {
            this.summation_type = data.summation_type || 'mean';
            this.warning = data.warning;
            this.danger = data.danger;
        }
    }

    _createClass(Thresholds, [{
        key: 'toJSON',
        value: function toJSON() {
            return {
                summation_type: this.summation_type,
                warning: this.warning,
                danger: this.danger
            };
        }
    }]);

    return Thresholds;
})(_model2['default'])

;

exports['default'] = Thresholds;
module.exports = exports['default'];

},{"./model":76}],80:[function(require,module,exports){
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _transform = require('./transform');

var _itemsFactory = require('../items/factory');

var _dataQuery = require('../data/query');

var _dataQuery2 = _interopRequireDefault(_dataQuery);

var _chartsUtil = require('../../charts/util');

/**
 * Higlight the average, max average, and most deviant series. This
 * transform works best on line graphs with lots of metrics (for
 * example, CPU or disk usage across a cluster).
 *
 * TODO: enforcing that it not be used on stacked graphs would be
 * neat. Adding an `applicable_types` attribute or something could
 * control visibily of transforms, so they only appear for
 * presentations that they make sense for.
 */

var util = _interopRequireWildcard(_chartsUtil);

_transform.transforms.register({
    name: 'HighlightAverages',
    display_name: 'Highlight Averages',
    transform_type: 'presentation',
    transform: function transform(item) {
        var query = item.query;
        var group = query.targets.length > 1 ? 'group(' + query.targets.join(',') + ')' : query.targets[0];
        var bg = Color(window.getComputedStyle($('body')[0]).backgroundColor);
        var palette = util.get_low_contrast_palette();
        /* Set up the modified queries */
        var query_averages = new _dataQuery2['default']({
            name: query.name + '_averages',
            targets: [group, 'alias(lineWidth(color(averageSeries(' + group + '), "' + (bg.dark() ? bg.clone().lighten(4.0) : bg.clone().darken(1.0)).hexString() + '"), 2), "Avg")', 'alias(lineWidth(color(highestAverage(' + group + ', 1), "red"), 2), "Max Avg")']
        });
        var query_deviant = new _dataQuery2['default']({
            name: query.name + '_deviant',
            targets: [group, 'alias(lineWidth(color(mostDeviant(' + group + ', 1), "red"), 2), "Most Deviant")']
        });
        /* Clone and modify the original */
        var item_averages = (0, _itemsFactory.make)('standard_time_series').set_height(6).set_renderer('graphite').set_title("Average & Max Average").set_query_override(query_averages);
        item_averages.options.palette = palette;
        item_averages.options.hideLegend = 'true';
        var item_deviant = (0, _itemsFactory.make)('standard_time_series').set_height(4).set_renderer('graphite').set_title('Most Deviant').set_query_override(query_deviant);
        item_deviant.options.palette = palette;
        /* And put it all together */
        return (0, _itemsFactory.make)('section').add((0, _itemsFactory.make)('row').add((0, _itemsFactory.make)('cell').set_span(12).set_style('well').add(item_averages))).add((0, _itemsFactory.make)('row').add((0, _itemsFactory.make)('cell').set_span(12).add(item_deviant))).add((0, _itemsFactory.make)('separator')).add((0, _itemsFactory.make)('row').add((0, _itemsFactory.make)('cell').set_span(12).add(item.set_title('Original'))));
    }
});


},{"../../charts/util":22,"../data/query":41,"../items/factory":54,"./transform":85}],81:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _transform = require('./transform');

var _itemsFactory = require('../items/factory');

var _itemsChart = require('../items/chart');

/**
 * Focus on a single presentation.
 */

var _itemsChart2 = _interopRequireDefault(_itemsChart);

_transform.transforms.register({
    name: 'Isolate',
    display_name: 'Isolate',
    transform_type: 'presentation',
    transform: function transform(item) {
        var options = item.options || {};
        if (item instanceof _itemsChart2['default']) {
            item.set_renderer('flot');
        }
        return (0, _itemsFactory.make)('section').add((0, _itemsFactory.make)('row').add((0, _itemsFactory.make)('cell').set_span(12).set_style('well').add(item.set_height(6)))).add((0, _itemsFactory.make)('row').add((0, _itemsFactory.make)('cell').set_span(12).add((0, _itemsFactory.make)({ item_type: 'summation_table',
            options: {
                palette: options.palette
            },
            show_color: true,
            sortable: true,
            format: ',.3f',
            query: item.query }))));
    }
});


},{"../items/chart":46,"../items/factory":54,"./transform":85}],82:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

var _itemsFactory = require('../items/factory');

var _coreUtil = require('../../core/util');

var _itemsChart = require('../items/chart');

/**
 * A transform which simply takes all presentations and arranges them in
 * a regular grid.
 */

var _itemsChart2 = _interopRequireDefault(_itemsChart);

var SimpleGrid = (function (_Transform) {
    _inherits(SimpleGrid, _Transform);

    function SimpleGrid(data) {
        _classCallCheck(this, SimpleGrid);

        _get(Object.getPrototypeOf(SimpleGrid.prototype), 'constructor', this).call(this, (0, _coreUtil.extend)({}, data, {
            display_name: 'Simple Grid',
            name: 'SimpleGrid',
            transform_type: _transform.TransformType.DASHBOARD
        }));
        this._columns = 1;
        this.span = 12;
        this.section_type = 'fixed';
        this.charts_only = false;
        if (data) {
            this.columns = data.columns || this.columns;
            this.section_type = data.section_type || this.section_type;
            this.charts_only = !!data.charts_only;
        }
        this.span = 12 / this.columns;
    }

    /** Setter for the columns property recalculates the column
     * span to resize items to (based ona 12-column grid) */

    _createClass(SimpleGrid, [{
        key: 'transform',
        value: function transform(item) {
            var _this = this;

            var items = item.flatten();
            var section = (0, _itemsFactory.make)('section').set_layout(this.section_type);
            var current_row = (0, _itemsFactory.make)('row');
            items.forEach(function (item) {
                if (item.item_type === 'dashboard_definition' || item.item_type === 'cell' || item.item_type === 'row' || item.item_type === 'section' || _this.charts_only && !(item instanceof _itemsChart2['default'])) {
                    return;
                }
                var cell = (0, _itemsFactory.make)('cell').set_span(_this.span).add(item);
                if (current_row.add(cell).length == _this.columns) {
                    section.add(current_row);
                    current_row = (0, _itemsFactory.make)('row');
                }
            });
            if (current_row.length > 0) {
                section.add(current_row);
            }
            return section;
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return {
                columns: this.columns,
                span: this.span,
                section_type: this.section_type,
                charts_only: this.charts_only,
                name: this.name
            };
        }
    }, {
        key: 'columns',
        set: function set(value) {
            this._columns = value;
            this.span = 12 / value;
        },
        get: function get() {
            return this._columns;
        }
    }]);

    return SimpleGrid;
})(_transform2['default'])

;

exports['default'] = SimpleGrid;
module.exports = exports['default'];

},{"../../core/util":32,"../items/chart":46,"../items/factory":54,"./transform":85}],83:[function(require,module,exports){
'use strict';

var _transform = require('./transform');

var _itemsFactory = require('../items/factory');

/**
 * Transform a view of a single graph into viewing multiple of that
 * graph at the same temporal resolution but shifted by one or more
 * time periods.
 */
_transform.transforms.register({
    name: 'TimeShift',
    display_name: 'Time Shift',
    transform_type: 'presentation',
    icon: 'fa fa-clock-o',
    transform: function transform(item) {
        var query = item.query;
        var shifts = [{ shift: '-1h', title: 'One Hour Ago' }, { shift: '-12h', title: '12 Hours Ago' }, { shift: '-1d', title: 'One Day Ago' }, { shift: '-2d', title: 'Two Days Ago' }, { shift: '-1w', title: 'One Week Ago' }];
        var make_row = function make_row(query, item, style) {
            return (0, _itemsFactory.make)('row').set_style(style).add((0, _itemsFactory.make)('cell').set_span(10).add(item)).add((0, _itemsFactory.make)('cell').set_span(1).set_align('right').add((0, _itemsFactory.make)('singlestat').set_query(query).set_transform('sum').set_format(',.2s').set_title('Total'))).add((0, _itemsFactory.make)('cell').set_span(1).set_align('left').add((0, _itemsFactory.make)('singlestat').set_query(query).set_transform('mean').set_format(',.2s').set_title('Average')));
        };
        var section = (0, _itemsFactory.make)('section').add((0, _itemsFactory.make)({ item_type: 'heading',
            level: 2, text: item.title ? 'Time shift - ' + item.title : 'Time shift' })).add((0, _itemsFactory.make)('separator')).add(make_row(item.query, item, 'well')).add((0, _itemsFactory.make)('separator'));
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = shifts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var shift = _step.value;

                var modified_query = query.shift(shift.shift);
                var modified_item = (0, _itemsFactory.make)(item.toJSON()).set_item_id(undefined).set_query_override(modified_query).set_title(shift.title);
                section.add(make_row(modified_query, modified_item));
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return section;
    }
});


},{"../items/factory":54,"./transform":85}],84:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _transform = require('./transform');

var _itemsFactory = require('../items/factory');

var _coreUtil = require('../../core/util');

var _dataQuery = require('../data/query');

/**
 * Transform a view of a single graph into viewing that graph over
 * multiple time spans. The item being transformed should be a single
 * presentation, not a composite (i.e. not a cell, row, section, or
 * dashboard).
 *
 * The time periods can be customized by passing an array of objects
 * with from/until/title properties
 *
 * Input => A single presentation
 *
 * Output => A section with a list of copies of the presentation with
 *           immediate query objects that override the time period
 */

var _dataQuery2 = _interopRequireDefault(_dataQuery);

_transform.transforms.register({
    name: 'TimeSpans',
    display_name: 'View across time spans',
    transform_type: 'presentation',
    icon: '          fa fa-clock-o',
    transform: function transform(item) {
        var spans = [{ from: '-1h', title: 'Past Hour' }, { from: '-4h', title: 'Past 4 Hours' }, { from: '-1d', title: 'Past Day' }, { from: '-1w', title: 'Past Week' }];
        var columns = 1;
        var query = item.query;
        var colspan = 12 / columns;
        var section = (0, _itemsFactory.make)('section').add((0, _itemsFactory.make)('heading', {
            level: 2, text: item.title ? 'Time Spans - ' + item.title : 'Time Spans' })).add((0, _itemsFactory.make)('separator'));
        section.add((0, _itemsFactory.make)('cell').set_span(colspan).set_style('well').add(item.set_title('Original'))).add((0, _itemsFactory.make)('separator'));
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = spans[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var span = _step.value;

                var modified_query = new _dataQuery2['default'](query.toJSON()).set_name(query.name + '/' + span.from + '/' + span.until).set_options((0, _coreUtil.extend)({}, query.options, {
                    from: span.from,
                    until: span.until
                }));
                var modified_item = (0, _itemsFactory.make)(item.toJSON()).set_item_id(undefined).set_query_override(modified_query).set_title(span.title);
                section.add((0, _itemsFactory.make)('cell').set_span(colspan).add(modified_item));
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return section;
    }
});


},{"../../core/util":32,"../data/query":41,"../items/factory":54,"./transform":85}],85:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _coreRegistry = require('../../core/registry');

var _coreAction = require('../../core/action');

var _coreAction2 = _interopRequireDefault(_coreAction);

var _appManager = require('../../app/manager');

var _appManager2 = _interopRequireDefault(_appManager);

var _appApp = require('../../app/app');

var app = _interopRequireWildcard(_appApp);

var TransformType = {
    DASHBOARD: 'dashboard',
    PRESENTATION: 'presentation'
};
exports.TransformType = TransformType;

var Transform = (function () {
    function Transform(data) {
        _classCallCheck(this, Transform);

        if (data) {
            this.name = data.name;
            this.display_name = data.display_name;
            this.transform_type = data.transform_type;
            this._transform = data.transform;
            this.icon = data.icon;
        }
    }

    _createClass(Transform, [{
        key: 'action',
        value: function action() {
            var _this = this;

            return new _coreAction2['default']({
                name: this.name + '_action',
                display: this.display_name + '...',
                icon: this.icon || 'fa fa-eye',
                hide: app.Mode.TRANSFORM,
                handler: function handler(action, item) {
                    _appManager2['default'].apply_transform(_this, item);
                }
            });
        }
    }, {
        key: 'transform',
        value: function transform(item) {
            return this._transform ? this._transform(item) : item;
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return {
                name: this.name
            };
        }
    }]);

    return Transform;
})();

exports['default'] = Transform;
var transforms = new _coreRegistry.Registry({
    name: 'transforms',
    process: function process(input) {
        var transform = input instanceof Transform ? input : new Transform(input);
        var action_cat = transform.transform_type + '-transform-actions';
        _coreAction.actions.register(action_cat, transform.action());
        return transform;
    }
});

exports.transforms = transforms;

},{"../../app/app":2,"../../app/manager":15,"../../core/action":25,"../../core/registry":30}],86:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _dashboard = require('./dashboard');

var _dashboard2 = _interopRequireDefault(_dashboard);

var log = core.logger('user');
var STORAGE_KEY = 'tessera.user';
/**
 * A very rudimentary user class. Since tessera doesn't have any
 * authentication yet, this basically represents the anonymous,
 * cookie-based session in the current browser. Eventually this will
 * represent a named user with real server-side persistence.
 */

var User = (function (_Model) {
    _inherits(User, _Model);

    function User() {
        _classCallCheck(this, User);

        _get(Object.getPrototypeOf(User.prototype), 'constructor', this).call(this);
        this.favorites = new Map();
        var data = store.get(STORAGE_KEY);
        if (data && data.favorites) {
            data.favorites = data.favorites.map(function (pair) {
                var _pair = _slicedToArray(pair, 2);

                var key = _pair[0];
                var dashboard_data = _pair[1];

                return [key, new _dashboard2['default'](dashboard_data)];
            });
            this.favorites = new Map(data.favorites);
        }
    }

    _createClass(User, [{
        key: 'toJSON',
        value: function toJSON() {
            return core.extend(_get(Object.getPrototypeOf(User.prototype), 'toJSON', this).call(this), {
                favorites: this.favorites
            });
        }
    }, {
        key: 'add_favorite',
        value: function add_favorite(d) {
            log.debug('add_favorite(' + d.href + ')');
            if (!this.favorites.has(d.href)) {
                // Make a copy of the dashboard without the definition, to
                // minimize the amount of data stored locally.
                var dash = new _dashboard2['default'](d.toJSON()).set_definition(null);
                this.favorites.set(dash.href, dash);
                this.store();
            }
            return this;
        }
    }, {
        key: 'remove_favorite',
        value: function remove_favorite(d) {
            log.debug('remove_favorite(' + d.href + ')');
            if (this.favorites.has(d.href)) {
                this.favorites['delete'](d.href);
                this.store();
            }
            return this.store();
        }
    }, {
        key: 'toggle_favorite',
        value: function toggle_favorite(d) {
            if (this.favorites.has(d.href)) {
                this.remove_favorite(d);
                return false;
            } else {
                this.add_favorite(d);
                return true;
            }
        }
    }, {
        key: 'list_favorites',
        value: function list_favorites() {
            return [].concat(_toConsumableArray(this.favorites.values()));
        }
    }, {
        key: 'store',
        value: (function (_store) {
            function store() {
                return _store.apply(this, arguments);
            }

            store.toString = function () {
                return _store.toString();
            };

            return store;
        })(function () {
            store.set(STORAGE_KEY, this.toJSON());
            return this;
        })
    }]);

    return User;
})(_model2['default'])

;

exports['default'] = User;
module.exports = exports['default'];

},{"../core":24,"./dashboard":40,"./model":76}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86]);
