function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*! (C) 2017 Andrea Giammarchi - MIT Style License */
var Class = function (Object, Reflect) {
  'use strict';

  var getProp = Reflect.get,
      setProp = Reflect.set,
      ownProps = Reflect.ownKeys,
      defProp = Reflect.defineProperty,
      reConstruct = Reflect.construct,
      gPO = Object.getPrototypeOf,
      sPO = Object.setPrototypeOf,
      defProps = Object.defineProperties,
      gOPD = Object.getOwnPropertyDescriptor,
      constructorHandler = {
    apply: function apply(p, self, args) {
      return Reflect.apply(p.self, self, args);
    },
    construct: function construct(p, args, t) {
      return reConstruct(p.self, args, t);
    },
    defineProperty: function defineProperty(p, k, d) {
      return defProp(p.self, k, d);
    },
    deleteProperty: function deleteProperty(p, k) {
      return Reflect.deleteProperty(p.self, k);
    },
    get: function get(p, k, r) {
      if (k === 'super' && !('self' in p)) {
        return function () {
          return p.self = reConstruct(p.super, arguments, p.class);
        };
      }

      var value = getProp(p.self, k);
      return typeof value === 'function' ? function () {
        return value.apply(this === r ? p.self : this, arguments);
      } : value;
    },
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(p, k) {
      return gOPD(p.self, k);
    },
    getPrototypeOf: function getPrototypeOf(p) {
      return gPO(p.self);
    },
    has: function has(p, k) {
      return Reflect.has(p.self, k);
    },
    isExtensible: function isExtensible(p) {
      return Reflect.isExtensible(p.self);
    },
    ownKeys: function ownKeys(p) {
      return ownProps(p.self);
    },
    preventExtensions: function preventExtensions(p) {
      return Reflect.preventExtensions(p.self);
    },
    set: function set(p, k, v) {
      return setProp(p.self, k, v);
    },
    setPrototypeOf: function setPrototypeOf(p, v) {
      return sPO(p.self, v);
    }
  },
      superHandler = {
    get: function get(self, prop, receiver) {
      return function () {
        var proto = gPO(self),
            method = proto[prop];
        var result,
            parent = proto;

        do {
          parent = gPO(parent);
        } while (method === parent[prop]);

        try {
          result = parent[prop].apply(sPO(self, parent), arguments);
        } finally {
          sPO(self, proto);
        }

        return result;
      };
    }
  },
      staticHandler = {
    get: function get(self, prop, receiver) {
      return function () {
        var proto = gPO(self),
            method = self[prop];
        var result,
            parent = proto;

        while (method === parent[prop]) {
          parent = gPO(parent);
        }

        self.method = parent[prop];

        try {
          result = self.method.apply(sPO(self, gPO(parent)), arguments);
        } finally {
          sPO(self, proto).method = method;
        }

        return result;
      };
    }
  },
      reserved = new Set(['constructor', 'extends', 'static']);
  return function Classtrophobic(definition) {
    var Constructor = definition.constructor,
        Statics = definition.static,
        Super = definition.extends,
        Class = definition.hasOwnProperty('constructor') ? Super ?
    /*#__PURE__*/
    function (_Super) {
      _inherits(_class, _Super);

      function _class() {
        var _this;

        _classCallCheck(this, _class);

        var target = isFunction ? function () {} : {};
        target.super = Super;
        target.class = Class;
        return _possibleConstructorReturn(_this, Constructor.apply(new Proxy(target, constructorHandler), arguments) || target.self);
      }

      return _class;
    }(Super) :
    /*#__PURE__*/
    function () {
      function _class2() {
        _classCallCheck(this, _class2);

        return Constructor.apply(this, arguments) || this;
      }

      return _class2;
    }() : Super ?
    /*#__PURE__*/
    function (_Super2) {
      _inherits(_class3, _Super2);

      function _class3() {
        _classCallCheck(this, _class3);

        return _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).apply(this, arguments));
      }

      return _class3;
    }(Super) :
    /*#__PURE__*/
    function () {
      function _class4() {
        _classCallCheck(this, _class4);
      }

      return _class4;
    }(),
        Static = Super ? {
      super: {
        get: function get() {
          return new Proxy(Class, staticHandler);
        }
      }
    } : {},
        Prototype = Super ? {
      super: {
        get: function get() {
          return new Proxy(this, superHandler);
        }
      }
    } : {},
        isFunction = Super ? Function.prototype.isPrototypeOf(Super) : false;
    ownProps(definition).filter(function (key) {
      return !reserved.has(key);
    }).forEach(function (key) {
      Prototype[key] = gOPD(definition, key);
      Prototype[key].enumerable = false;
    });
    defProps(Class.prototype, Prototype);
    if (Statics) ownProps(Statics).forEach(function (key) {
      Static[key] = gOPD(Statics, key);
      Static[key].enumerable = false;
    });
    return defProps(Class, Static);
  };
}(Object, Reflect);

try {
  module.exports = Class;
} catch (o_O) {}
