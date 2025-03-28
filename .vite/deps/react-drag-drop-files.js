import {
  require_jsx_runtime
} from "./chunk-EWFHFZ6H.js";
import {
  require_react
} from "./chunk-F4ERGI4E.js";
import {
  __commonJS,
  __toESM
} from "./chunk-QHEXK6IG.js";

// node_modules/react-is/cjs/react-is.development.js
var require_react_is_development = __commonJS({
  "node_modules/react-is/cjs/react-is.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        var hasSymbol = typeof Symbol === "function" && Symbol.for;
        var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 60103;
        var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 60106;
        var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for("react.fragment") : 60107;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for("react.strict_mode") : 60108;
        var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 60114;
        var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 60109;
        var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 60110;
        var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for("react.async_mode") : 60111;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for("react.concurrent_mode") : 60111;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for("react.forward_ref") : 60112;
        var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 60113;
        var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for("react.suspense_list") : 60120;
        var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 60115;
        var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 60116;
        var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for("react.block") : 60121;
        var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for("react.fundamental") : 60117;
        var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for("react.responder") : 60118;
        var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for("react.scope") : 60119;
        function isValidElementType(type) {
          return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
          type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
        }
        function typeOf(object) {
          if (typeof object === "object" && object !== null) {
            var $$typeof = object.$$typeof;
            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                var type = object.type;
                switch (type) {
                  case REACT_ASYNC_MODE_TYPE:
                  case REACT_CONCURRENT_MODE_TYPE:
                  case REACT_FRAGMENT_TYPE:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                  case REACT_SUSPENSE_TYPE:
                    return type;
                  default:
                    var $$typeofType = type && type.$$typeof;
                    switch ($$typeofType) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_LAZY_TYPE:
                      case REACT_MEMO_TYPE:
                      case REACT_PROVIDER_TYPE:
                        return $$typeofType;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }
          return void 0;
        }
        var AsyncMode = REACT_ASYNC_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment = REACT_FRAGMENT_TYPE;
        var Lazy = REACT_LAZY_TYPE;
        var Memo = REACT_MEMO_TYPE;
        var Portal = REACT_PORTAL_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var StrictMode = REACT_STRICT_MODE_TYPE;
        var Suspense = REACT_SUSPENSE_TYPE;
        var hasWarnedAboutDeprecatedIsAsyncMode = false;
        function isAsyncMode(object) {
          {
            if (!hasWarnedAboutDeprecatedIsAsyncMode) {
              hasWarnedAboutDeprecatedIsAsyncMode = true;
              console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
            }
          }
          return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
        }
        function isConcurrentMode(object) {
          return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        function isLazy(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        }
        function isMemo(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        }
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isProfiler(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isStrictMode(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        function isSuspense(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment;
        exports.Lazy = Lazy;
        exports.Memo = Memo;
        exports.Portal = Portal;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode;
        exports.Suspense = Suspense;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment;
        exports.isLazy = isLazy;
        exports.isMemo = isMemo;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler;
        exports.isStrictMode = isStrictMode;
        exports.isSuspense = isSuspense;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
      })();
    }
  }
});

// node_modules/react-is/index.js
var require_react_is = __commonJS({
  "node_modules/react-is/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_is_development();
    }
  }
});

// node_modules/shallowequal/index.js
var require_shallowequal = __commonJS({
  "node_modules/shallowequal/index.js"(exports, module) {
    module.exports = function shallowEqual(objA, objB, compare, compareContext) {
      var ret = compare ? compare.call(compareContext, objA, objB) : void 0;
      if (ret !== void 0) {
        return !!ret;
      }
      if (objA === objB) {
        return true;
      }
      if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) {
        return false;
      }
      var keysA = Object.keys(objA);
      var keysB = Object.keys(objB);
      if (keysA.length !== keysB.length) {
        return false;
      }
      var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
      for (var idx = 0; idx < keysA.length; idx++) {
        var key = keysA[idx];
        if (!bHasOwnProperty(key)) {
          return false;
        }
        var valueA = objA[key];
        var valueB = objB[key];
        ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;
        if (ret === false || ret === void 0 && valueA !== valueB) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js
var require_hoist_non_react_statics_cjs = __commonJS({
  "node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js"(exports, module) {
    "use strict";
    var reactIs = require_react_is();
    var REACT_STATICS = {
      childContextTypes: true,
      contextType: true,
      contextTypes: true,
      defaultProps: true,
      displayName: true,
      getDefaultProps: true,
      getDerivedStateFromError: true,
      getDerivedStateFromProps: true,
      mixins: true,
      propTypes: true,
      type: true
    };
    var KNOWN_STATICS = {
      name: true,
      length: true,
      prototype: true,
      caller: true,
      callee: true,
      arguments: true,
      arity: true
    };
    var FORWARD_REF_STATICS = {
      "$$typeof": true,
      render: true,
      defaultProps: true,
      displayName: true,
      propTypes: true
    };
    var MEMO_STATICS = {
      "$$typeof": true,
      compare: true,
      defaultProps: true,
      displayName: true,
      propTypes: true,
      type: true
    };
    var TYPE_STATICS = {};
    TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
    TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;
    function getStatics(component) {
      if (reactIs.isMemo(component)) {
        return MEMO_STATICS;
      }
      return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
    }
    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getPrototypeOf = Object.getPrototypeOf;
    var objectPrototype = Object.prototype;
    function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
      if (typeof sourceComponent !== "string") {
        if (objectPrototype) {
          var inheritedComponent = getPrototypeOf(sourceComponent);
          if (inheritedComponent && inheritedComponent !== objectPrototype) {
            hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
          }
        }
        var keys = getOwnPropertyNames(sourceComponent);
        if (getOwnPropertySymbols) {
          keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }
        var targetStatics = getStatics(targetComponent);
        var sourceStatics = getStatics(sourceComponent);
        for (var i3 = 0; i3 < keys.length; ++i3) {
          var key = keys[i3];
          if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
            var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
            try {
              defineProperty(targetComponent, key, descriptor);
            } catch (e3) {
            }
          }
        }
      }
      return targetComponent;
    }
    module.exports = hoistNonReactStatics;
  }
});

// node_modules/react-drag-drop-files/dist/react-drag-drop-files.esm.js
var import_jsx_runtime = __toESM(require_jsx_runtime());

// node_modules/styled-components/dist/styled-components.browser.esm.js
var import_react_is = __toESM(require_react_is());
var import_react = __toESM(require_react());
var import_shallowequal = __toESM(require_shallowequal());

// node_modules/@emotion/stylis/dist/stylis.browser.esm.js
function stylis_min(W2) {
  function M2(d3, c3, e3, h2, a3) {
    for (var m3 = 0, b3 = 0, v3 = 0, n3 = 0, q2, g3, x3 = 0, K2 = 0, k3, u3 = k3 = q2 = 0, l3 = 0, r3 = 0, I2 = 0, t2 = 0, B3 = e3.length, J2 = B3 - 1, y3, f2 = "", p2 = "", F3 = "", G3 = "", C3; l3 < B3; ) {
      g3 = e3.charCodeAt(l3);
      l3 === J2 && 0 !== b3 + n3 + v3 + m3 && (0 !== b3 && (g3 = 47 === b3 ? 10 : 47), n3 = v3 = m3 = 0, B3++, J2++);
      if (0 === b3 + n3 + v3 + m3) {
        if (l3 === J2 && (0 < r3 && (f2 = f2.replace(N2, "")), 0 < f2.trim().length)) {
          switch (g3) {
            case 32:
            case 9:
            case 59:
            case 13:
            case 10:
              break;
            default:
              f2 += e3.charAt(l3);
          }
          g3 = 59;
        }
        switch (g3) {
          case 123:
            f2 = f2.trim();
            q2 = f2.charCodeAt(0);
            k3 = 1;
            for (t2 = ++l3; l3 < B3; ) {
              switch (g3 = e3.charCodeAt(l3)) {
                case 123:
                  k3++;
                  break;
                case 125:
                  k3--;
                  break;
                case 47:
                  switch (g3 = e3.charCodeAt(l3 + 1)) {
                    case 42:
                    case 47:
                      a: {
                        for (u3 = l3 + 1; u3 < J2; ++u3) {
                          switch (e3.charCodeAt(u3)) {
                            case 47:
                              if (42 === g3 && 42 === e3.charCodeAt(u3 - 1) && l3 + 2 !== u3) {
                                l3 = u3 + 1;
                                break a;
                              }
                              break;
                            case 10:
                              if (47 === g3) {
                                l3 = u3 + 1;
                                break a;
                              }
                          }
                        }
                        l3 = u3;
                      }
                  }
                  break;
                case 91:
                  g3++;
                case 40:
                  g3++;
                case 34:
                case 39:
                  for (; l3++ < J2 && e3.charCodeAt(l3) !== g3; ) {
                  }
              }
              if (0 === k3)
                break;
              l3++;
            }
            k3 = e3.substring(t2, l3);
            0 === q2 && (q2 = (f2 = f2.replace(ca, "").trim()).charCodeAt(0));
            switch (q2) {
              case 64:
                0 < r3 && (f2 = f2.replace(N2, ""));
                g3 = f2.charCodeAt(1);
                switch (g3) {
                  case 100:
                  case 109:
                  case 115:
                  case 45:
                    r3 = c3;
                    break;
                  default:
                    r3 = O2;
                }
                k3 = M2(c3, r3, k3, g3, a3 + 1);
                t2 = k3.length;
                0 < A && (r3 = X2(O2, f2, I2), C3 = H3(3, k3, r3, c3, D2, z3, t2, g3, a3, h2), f2 = r3.join(""), void 0 !== C3 && 0 === (t2 = (k3 = C3.trim()).length) && (g3 = 0, k3 = ""));
                if (0 < t2)
                  switch (g3) {
                    case 115:
                      f2 = f2.replace(da, ea);
                    case 100:
                    case 109:
                    case 45:
                      k3 = f2 + "{" + k3 + "}";
                      break;
                    case 107:
                      f2 = f2.replace(fa, "$1 $2");
                      k3 = f2 + "{" + k3 + "}";
                      k3 = 1 === w3 || 2 === w3 && L3("@" + k3, 3) ? "@-webkit-" + k3 + "@" + k3 : "@" + k3;
                      break;
                    default:
                      k3 = f2 + k3, 112 === h2 && (k3 = (p2 += k3, ""));
                  }
                else
                  k3 = "";
                break;
              default:
                k3 = M2(c3, X2(c3, f2, I2), k3, h2, a3 + 1);
            }
            F3 += k3;
            k3 = I2 = r3 = u3 = q2 = 0;
            f2 = "";
            g3 = e3.charCodeAt(++l3);
            break;
          case 125:
          case 59:
            f2 = (0 < r3 ? f2.replace(N2, "") : f2).trim();
            if (1 < (t2 = f2.length))
              switch (0 === u3 && (q2 = f2.charCodeAt(0), 45 === q2 || 96 < q2 && 123 > q2) && (t2 = (f2 = f2.replace(" ", ":")).length), 0 < A && void 0 !== (C3 = H3(1, f2, c3, d3, D2, z3, p2.length, h2, a3, h2)) && 0 === (t2 = (f2 = C3.trim()).length) && (f2 = "\0\0"), q2 = f2.charCodeAt(0), g3 = f2.charCodeAt(1), q2) {
                case 0:
                  break;
                case 64:
                  if (105 === g3 || 99 === g3) {
                    G3 += f2 + e3.charAt(l3);
                    break;
                  }
                default:
                  58 !== f2.charCodeAt(t2 - 1) && (p2 += P(f2, q2, g3, f2.charCodeAt(2)));
              }
            I2 = r3 = u3 = q2 = 0;
            f2 = "";
            g3 = e3.charCodeAt(++l3);
        }
      }
      switch (g3) {
        case 13:
        case 10:
          47 === b3 ? b3 = 0 : 0 === 1 + q2 && 107 !== h2 && 0 < f2.length && (r3 = 1, f2 += "\0");
          0 < A * Y2 && H3(0, f2, c3, d3, D2, z3, p2.length, h2, a3, h2);
          z3 = 1;
          D2++;
          break;
        case 59:
        case 125:
          if (0 === b3 + n3 + v3 + m3) {
            z3++;
            break;
          }
        default:
          z3++;
          y3 = e3.charAt(l3);
          switch (g3) {
            case 9:
            case 32:
              if (0 === n3 + m3 + b3)
                switch (x3) {
                  case 44:
                  case 58:
                  case 9:
                  case 32:
                    y3 = "";
                    break;
                  default:
                    32 !== g3 && (y3 = " ");
                }
              break;
            case 0:
              y3 = "\\0";
              break;
            case 12:
              y3 = "\\f";
              break;
            case 11:
              y3 = "\\v";
              break;
            case 38:
              0 === n3 + b3 + m3 && (r3 = I2 = 1, y3 = "\f" + y3);
              break;
            case 108:
              if (0 === n3 + b3 + m3 + E3 && 0 < u3)
                switch (l3 - u3) {
                  case 2:
                    112 === x3 && 58 === e3.charCodeAt(l3 - 3) && (E3 = x3);
                  case 8:
                    111 === K2 && (E3 = K2);
                }
              break;
            case 58:
              0 === n3 + b3 + m3 && (u3 = l3);
              break;
            case 44:
              0 === b3 + v3 + n3 + m3 && (r3 = 1, y3 += "\r");
              break;
            case 34:
            case 39:
              0 === b3 && (n3 = n3 === g3 ? 0 : 0 === n3 ? g3 : n3);
              break;
            case 91:
              0 === n3 + b3 + v3 && m3++;
              break;
            case 93:
              0 === n3 + b3 + v3 && m3--;
              break;
            case 41:
              0 === n3 + b3 + m3 && v3--;
              break;
            case 40:
              if (0 === n3 + b3 + m3) {
                if (0 === q2)
                  switch (2 * x3 + 3 * K2) {
                    case 533:
                      break;
                    default:
                      q2 = 1;
                  }
                v3++;
              }
              break;
            case 64:
              0 === b3 + v3 + n3 + m3 + u3 + k3 && (k3 = 1);
              break;
            case 42:
            case 47:
              if (!(0 < n3 + m3 + v3))
                switch (b3) {
                  case 0:
                    switch (2 * g3 + 3 * e3.charCodeAt(l3 + 1)) {
                      case 235:
                        b3 = 47;
                        break;
                      case 220:
                        t2 = l3, b3 = 42;
                    }
                    break;
                  case 42:
                    47 === g3 && 42 === x3 && t2 + 2 !== l3 && (33 === e3.charCodeAt(t2 + 2) && (p2 += e3.substring(t2, l3 + 1)), y3 = "", b3 = 0);
                }
          }
          0 === b3 && (f2 += y3);
      }
      K2 = x3;
      x3 = g3;
      l3++;
    }
    t2 = p2.length;
    if (0 < t2) {
      r3 = c3;
      if (0 < A && (C3 = H3(2, p2, r3, d3, D2, z3, t2, h2, a3, h2), void 0 !== C3 && 0 === (p2 = C3).length))
        return G3 + p2 + F3;
      p2 = r3.join(",") + "{" + p2 + "}";
      if (0 !== w3 * E3) {
        2 !== w3 || L3(p2, 2) || (E3 = 0);
        switch (E3) {
          case 111:
            p2 = p2.replace(ha, ":-moz-$1") + p2;
            break;
          case 112:
            p2 = p2.replace(Q2, "::-webkit-input-$1") + p2.replace(Q2, "::-moz-$1") + p2.replace(Q2, ":-ms-input-$1") + p2;
        }
        E3 = 0;
      }
    }
    return G3 + p2 + F3;
  }
  function X2(d3, c3, e3) {
    var h2 = c3.trim().split(ia);
    c3 = h2;
    var a3 = h2.length, m3 = d3.length;
    switch (m3) {
      case 0:
      case 1:
        var b3 = 0;
        for (d3 = 0 === m3 ? "" : d3[0] + " "; b3 < a3; ++b3) {
          c3[b3] = Z2(d3, c3[b3], e3).trim();
        }
        break;
      default:
        var v3 = b3 = 0;
        for (c3 = []; b3 < a3; ++b3) {
          for (var n3 = 0; n3 < m3; ++n3) {
            c3[v3++] = Z2(d3[n3] + " ", h2[b3], e3).trim();
          }
        }
    }
    return c3;
  }
  function Z2(d3, c3, e3) {
    var h2 = c3.charCodeAt(0);
    33 > h2 && (h2 = (c3 = c3.trim()).charCodeAt(0));
    switch (h2) {
      case 38:
        return c3.replace(F2, "$1" + d3.trim());
      case 58:
        return d3.trim() + c3.replace(F2, "$1" + d3.trim());
      default:
        if (0 < 1 * e3 && 0 < c3.indexOf("\f"))
          return c3.replace(F2, (58 === d3.charCodeAt(0) ? "" : "$1") + d3.trim());
    }
    return d3 + c3;
  }
  function P(d3, c3, e3, h2) {
    var a3 = d3 + ";", m3 = 2 * c3 + 3 * e3 + 4 * h2;
    if (944 === m3) {
      d3 = a3.indexOf(":", 9) + 1;
      var b3 = a3.substring(d3, a3.length - 1).trim();
      b3 = a3.substring(0, d3).trim() + b3 + ";";
      return 1 === w3 || 2 === w3 && L3(b3, 1) ? "-webkit-" + b3 + b3 : b3;
    }
    if (0 === w3 || 2 === w3 && !L3(a3, 1))
      return a3;
    switch (m3) {
      case 1015:
        return 97 === a3.charCodeAt(10) ? "-webkit-" + a3 + a3 : a3;
      case 951:
        return 116 === a3.charCodeAt(3) ? "-webkit-" + a3 + a3 : a3;
      case 963:
        return 110 === a3.charCodeAt(5) ? "-webkit-" + a3 + a3 : a3;
      case 1009:
        if (100 !== a3.charCodeAt(4))
          break;
      case 969:
      case 942:
        return "-webkit-" + a3 + a3;
      case 978:
        return "-webkit-" + a3 + "-moz-" + a3 + a3;
      case 1019:
      case 983:
        return "-webkit-" + a3 + "-moz-" + a3 + "-ms-" + a3 + a3;
      case 883:
        if (45 === a3.charCodeAt(8))
          return "-webkit-" + a3 + a3;
        if (0 < a3.indexOf("image-set(", 11))
          return a3.replace(ja, "$1-webkit-$2") + a3;
        break;
      case 932:
        if (45 === a3.charCodeAt(4))
          switch (a3.charCodeAt(5)) {
            case 103:
              return "-webkit-box-" + a3.replace("-grow", "") + "-webkit-" + a3 + "-ms-" + a3.replace("grow", "positive") + a3;
            case 115:
              return "-webkit-" + a3 + "-ms-" + a3.replace("shrink", "negative") + a3;
            case 98:
              return "-webkit-" + a3 + "-ms-" + a3.replace("basis", "preferred-size") + a3;
          }
        return "-webkit-" + a3 + "-ms-" + a3 + a3;
      case 964:
        return "-webkit-" + a3 + "-ms-flex-" + a3 + a3;
      case 1023:
        if (99 !== a3.charCodeAt(8))
          break;
        b3 = a3.substring(a3.indexOf(":", 15)).replace("flex-", "").replace("space-between", "justify");
        return "-webkit-box-pack" + b3 + "-webkit-" + a3 + "-ms-flex-pack" + b3 + a3;
      case 1005:
        return ka.test(a3) ? a3.replace(aa, ":-webkit-") + a3.replace(aa, ":-moz-") + a3 : a3;
      case 1e3:
        b3 = a3.substring(13).trim();
        c3 = b3.indexOf("-") + 1;
        switch (b3.charCodeAt(0) + b3.charCodeAt(c3)) {
          case 226:
            b3 = a3.replace(G2, "tb");
            break;
          case 232:
            b3 = a3.replace(G2, "tb-rl");
            break;
          case 220:
            b3 = a3.replace(G2, "lr");
            break;
          default:
            return a3;
        }
        return "-webkit-" + a3 + "-ms-" + b3 + a3;
      case 1017:
        if (-1 === a3.indexOf("sticky", 9))
          break;
      case 975:
        c3 = (a3 = d3).length - 10;
        b3 = (33 === a3.charCodeAt(c3) ? a3.substring(0, c3) : a3).substring(d3.indexOf(":", 7) + 1).trim();
        switch (m3 = b3.charCodeAt(0) + (b3.charCodeAt(7) | 0)) {
          case 203:
            if (111 > b3.charCodeAt(8))
              break;
          case 115:
            a3 = a3.replace(b3, "-webkit-" + b3) + ";" + a3;
            break;
          case 207:
          case 102:
            a3 = a3.replace(b3, "-webkit-" + (102 < m3 ? "inline-" : "") + "box") + ";" + a3.replace(b3, "-webkit-" + b3) + ";" + a3.replace(b3, "-ms-" + b3 + "box") + ";" + a3;
        }
        return a3 + ";";
      case 938:
        if (45 === a3.charCodeAt(5))
          switch (a3.charCodeAt(6)) {
            case 105:
              return b3 = a3.replace("-items", ""), "-webkit-" + a3 + "-webkit-box-" + b3 + "-ms-flex-" + b3 + a3;
            case 115:
              return "-webkit-" + a3 + "-ms-flex-item-" + a3.replace(ba, "") + a3;
            default:
              return "-webkit-" + a3 + "-ms-flex-line-pack" + a3.replace("align-content", "").replace(ba, "") + a3;
          }
        break;
      case 973:
      case 989:
        if (45 !== a3.charCodeAt(3) || 122 === a3.charCodeAt(4))
          break;
      case 931:
      case 953:
        if (true === la.test(d3))
          return 115 === (b3 = d3.substring(d3.indexOf(":") + 1)).charCodeAt(0) ? P(d3.replace("stretch", "fill-available"), c3, e3, h2).replace(":fill-available", ":stretch") : a3.replace(b3, "-webkit-" + b3) + a3.replace(b3, "-moz-" + b3.replace("fill-", "")) + a3;
        break;
      case 962:
        if (a3 = "-webkit-" + a3 + (102 === a3.charCodeAt(5) ? "-ms-" + a3 : "") + a3, 211 === e3 + h2 && 105 === a3.charCodeAt(13) && 0 < a3.indexOf("transform", 10))
          return a3.substring(0, a3.indexOf(";", 27) + 1).replace(ma, "$1-webkit-$2") + a3;
    }
    return a3;
  }
  function L3(d3, c3) {
    var e3 = d3.indexOf(1 === c3 ? ":" : "{"), h2 = d3.substring(0, 3 !== c3 ? e3 : 10);
    e3 = d3.substring(e3 + 1, d3.length - 1);
    return R2(2 !== c3 ? h2 : h2.replace(na, "$1"), e3, c3);
  }
  function ea(d3, c3) {
    var e3 = P(c3, c3.charCodeAt(0), c3.charCodeAt(1), c3.charCodeAt(2));
    return e3 !== c3 + ";" ? e3.replace(oa, " or ($1)").substring(4) : "(" + c3 + ")";
  }
  function H3(d3, c3, e3, h2, a3, m3, b3, v3, n3, q2) {
    for (var g3 = 0, x3 = c3, w4; g3 < A; ++g3) {
      switch (w4 = S2[g3].call(B2, d3, x3, e3, h2, a3, m3, b3, v3, n3, q2)) {
        case void 0:
        case false:
        case true:
        case null:
          break;
        default:
          x3 = w4;
      }
    }
    if (x3 !== c3)
      return x3;
  }
  function T2(d3) {
    switch (d3) {
      case void 0:
      case null:
        A = S2.length = 0;
        break;
      default:
        if ("function" === typeof d3)
          S2[A++] = d3;
        else if ("object" === typeof d3)
          for (var c3 = 0, e3 = d3.length; c3 < e3; ++c3) {
            T2(d3[c3]);
          }
        else
          Y2 = !!d3 | 0;
    }
    return T2;
  }
  function U2(d3) {
    d3 = d3.prefix;
    void 0 !== d3 && (R2 = null, d3 ? "function" !== typeof d3 ? w3 = 1 : (w3 = 2, R2 = d3) : w3 = 0);
    return U2;
  }
  function B2(d3, c3) {
    var e3 = d3;
    33 > e3.charCodeAt(0) && (e3 = e3.trim());
    V2 = e3;
    e3 = [V2];
    if (0 < A) {
      var h2 = H3(-1, c3, e3, e3, D2, z3, 0, 0, 0, 0);
      void 0 !== h2 && "string" === typeof h2 && (c3 = h2);
    }
    var a3 = M2(O2, e3, c3, 0, 0);
    0 < A && (h2 = H3(-2, a3, e3, e3, D2, z3, a3.length, 0, 0, 0), void 0 !== h2 && (a3 = h2));
    V2 = "";
    E3 = 0;
    z3 = D2 = 1;
    return a3;
  }
  var ca = /^\0+/g, N2 = /[\0\r\f]/g, aa = /: */g, ka = /zoo|gra/, ma = /([,: ])(transform)/g, ia = /,\r+?/g, F2 = /([\t\r\n ])*\f?&/g, fa = /@(k\w+)\s*(\S*)\s*/, Q2 = /::(place)/g, ha = /:(read-only)/g, G2 = /[svh]\w+-[tblr]{2}/, da = /\(\s*(.*)\s*\)/g, oa = /([\s\S]*?);/g, ba = /-self|flex-/g, na = /[^]*?(:[rp][el]a[\w-]+)[^]*/, la = /stretch|:\s*\w+\-(?:conte|avail)/, ja = /([^-])(image-set\()/, z3 = 1, D2 = 1, E3 = 0, w3 = 1, O2 = [], S2 = [], A = 0, R2 = null, Y2 = 0, V2 = "";
  B2.use = T2;
  B2.set = U2;
  void 0 !== W2 && U2(W2);
  return B2;
}
var stylis_browser_esm_default = stylis_min;

// node_modules/@emotion/unitless/dist/unitless.browser.esm.js
var unitlessKeys = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};
var unitless_browser_esm_default = unitlessKeys;

// node_modules/@emotion/memoize/dist/emotion-memoize.esm.js
function memoize(fn) {
  var cache = /* @__PURE__ */ Object.create(null);
  return function(arg) {
    if (cache[arg] === void 0)
      cache[arg] = fn(arg);
    return cache[arg];
  };
}

// node_modules/@emotion/is-prop-valid/dist/emotion-is-prop-valid.esm.js
var reactPropsRegex = /^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|abbr|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|disableRemotePlayback|download|draggable|encType|enterKeyHint|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|translate|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|incremental|fallback|inert|itemProp|itemScope|itemType|itemID|itemRef|on|option|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/;
var isPropValid = memoize(
  function(prop) {
    return reactPropsRegex.test(prop) || prop.charCodeAt(0) === 111 && prop.charCodeAt(1) === 110 && prop.charCodeAt(2) < 91;
  }
  /* Z+1 */
);

// node_modules/styled-components/dist/styled-components.browser.esm.js
var import_hoist_non_react_statics = __toESM(require_hoist_non_react_statics_cjs());
function y() {
  return (y = Object.assign || function(e3) {
    for (var t2 = 1; t2 < arguments.length; t2++) {
      var n3 = arguments[t2];
      for (var r3 in n3)
        Object.prototype.hasOwnProperty.call(n3, r3) && (e3[r3] = n3[r3]);
    }
    return e3;
  }).apply(this, arguments);
}
var v = function(e3, t2) {
  for (var n3 = [e3[0]], r3 = 0, o2 = t2.length; r3 < o2; r3 += 1)
    n3.push(t2[r3], e3[r3 + 1]);
  return n3;
};
var g = function(t2) {
  return null !== t2 && "object" == typeof t2 && "[object Object]" === (t2.toString ? t2.toString() : Object.prototype.toString.call(t2)) && !(0, import_react_is.typeOf)(t2);
};
var S = Object.freeze([]);
var w = Object.freeze({});
function E(e3) {
  return "function" == typeof e3;
}
function b(e3) {
  return "string" == typeof e3 && e3 || e3.displayName || e3.name || "Component";
}
function _(e3) {
  return e3 && "string" == typeof e3.styledComponentId;
}
var N = "undefined" != typeof process && void 0 !== process.env && (process.env.REACT_APP_SC_ATTR || process.env.SC_ATTR) || "data-styled";
var C = "undefined" != typeof window && "HTMLElement" in window;
var I = Boolean("boolean" == typeof SC_DISABLE_SPEEDY ? SC_DISABLE_SPEEDY : "undefined" != typeof process && void 0 !== process.env && (void 0 !== process.env.REACT_APP_SC_DISABLE_SPEEDY && "" !== process.env.REACT_APP_SC_DISABLE_SPEEDY ? "false" !== process.env.REACT_APP_SC_DISABLE_SPEEDY && process.env.REACT_APP_SC_DISABLE_SPEEDY : void 0 !== process.env.SC_DISABLE_SPEEDY && "" !== process.env.SC_DISABLE_SPEEDY ? "false" !== process.env.SC_DISABLE_SPEEDY && process.env.SC_DISABLE_SPEEDY : true));
var O = true ? { 1: "Cannot create styled-component for component: %s.\n\n", 2: "Can't collect styles once you've consumed a `ServerStyleSheet`'s styles! `ServerStyleSheet` is a one off instance for each server-side render cycle.\n\n- Are you trying to reuse it across renders?\n- Are you accidentally calling collectStyles twice?\n\n", 3: "Streaming SSR is only supported in a Node.js environment; Please do not try to call this method in the browser.\n\n", 4: "The `StyleSheetManager` expects a valid target or sheet prop!\n\n- Does this error occur on the client and is your target falsy?\n- Does this error occur on the server and is the sheet falsy?\n\n", 5: "The clone method cannot be used on the client!\n\n- Are you running in a client-like environment on the server?\n- Are you trying to run SSR on the client?\n\n", 6: "Trying to insert a new style tag, but the given Node is unmounted!\n\n- Are you using a custom target that isn't mounted?\n- Does your document not have a valid head element?\n- Have you accidentally removed a style tag manually?\n\n", 7: 'ThemeProvider: Please return an object from your "theme" prop function, e.g.\n\n```js\ntheme={() => ({})}\n```\n\n', 8: 'ThemeProvider: Please make your "theme" prop an object.\n\n', 9: "Missing document `<head>`\n\n", 10: "Cannot find a StyleSheet instance. Usually this happens if there are multiple copies of styled-components loaded at once. Check out this issue for how to troubleshoot and fix the common cases where this situation can happen: https://github.com/styled-components/styled-components/issues/1941#issuecomment-417862021\n\n", 11: "_This error was replaced with a dev-time warning, it will be deleted for v4 final._ [createGlobalStyle] received children which will not be rendered. Please use the component without passing children elements.\n\n", 12: "It seems you are interpolating a keyframe declaration (%s) into an untagged string. This was supported in styled-components v3, but is not longer supported in v4 as keyframes are now injected on-demand. Please wrap your string in the css\\`\\` helper which ensures the styles are injected correctly. See https://www.styled-components.com/docs/api#css\n\n", 13: "%s is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details.\n\n", 14: 'ThemeProvider: "theme" prop is required.\n\n', 15: "A stylis plugin has been supplied that is not named. We need a name for each plugin to be able to prevent styling collisions between different stylis configurations within the same app. Before you pass your plugin to `<StyleSheetManager stylisPlugins={[]}>`, please make sure each plugin is uniquely-named, e.g.\n\n```js\nObject.defineProperty(importedPlugin, 'name', { value: 'some-unique-name' });\n```\n\n", 16: "Reached the limit of how many styled components may be created at group %s.\nYou may only create up to 1,073,741,824 components. If you're creating components dynamically,\nas for instance in your render method then you may be running into this limitation.\n\n", 17: "CSSStyleSheet could not be found on HTMLStyleElement.\nHas styled-components' style tag been unmounted or altered by another script?\n" } : {};
function R() {
  for (var e3 = arguments.length <= 0 ? void 0 : arguments[0], t2 = [], n3 = 1, r3 = arguments.length; n3 < r3; n3 += 1)
    t2.push(n3 < 0 || arguments.length <= n3 ? void 0 : arguments[n3]);
  return t2.forEach(function(t3) {
    e3 = e3.replace(/%[a-z]/, t3);
  }), e3;
}
function D(e3) {
  for (var t2 = arguments.length, n3 = new Array(t2 > 1 ? t2 - 1 : 0), r3 = 1; r3 < t2; r3++)
    n3[r3 - 1] = arguments[r3];
  throw false ? new Error("An error occurred. See https://git.io/JUIaE#" + e3 + " for more information." + (n3.length > 0 ? " Args: " + n3.join(", ") : "")) : new Error(R.apply(void 0, [O[e3]].concat(n3)).trim());
}
var j = function() {
  function e3(e4) {
    this.groupSizes = new Uint32Array(512), this.length = 512, this.tag = e4;
  }
  var t2 = e3.prototype;
  return t2.indexOfGroup = function(e4) {
    for (var t3 = 0, n3 = 0; n3 < e4; n3++)
      t3 += this.groupSizes[n3];
    return t3;
  }, t2.insertRules = function(e4, t3) {
    if (e4 >= this.groupSizes.length) {
      for (var n3 = this.groupSizes, r3 = n3.length, o2 = r3; e4 >= o2; )
        (o2 <<= 1) < 0 && D(16, "" + e4);
      this.groupSizes = new Uint32Array(o2), this.groupSizes.set(n3), this.length = o2;
      for (var s3 = r3; s3 < o2; s3++)
        this.groupSizes[s3] = 0;
    }
    for (var i3 = this.indexOfGroup(e4 + 1), a3 = 0, c3 = t3.length; a3 < c3; a3++)
      this.tag.insertRule(i3, t3[a3]) && (this.groupSizes[e4]++, i3++);
  }, t2.clearGroup = function(e4) {
    if (e4 < this.length) {
      var t3 = this.groupSizes[e4], n3 = this.indexOfGroup(e4), r3 = n3 + t3;
      this.groupSizes[e4] = 0;
      for (var o2 = n3; o2 < r3; o2++)
        this.tag.deleteRule(n3);
    }
  }, t2.getGroup = function(e4) {
    var t3 = "";
    if (e4 >= this.length || 0 === this.groupSizes[e4])
      return t3;
    for (var n3 = this.groupSizes[e4], r3 = this.indexOfGroup(e4), o2 = r3 + n3, s3 = r3; s3 < o2; s3++)
      t3 += this.tag.getRule(s3) + "/*!sc*/\n";
    return t3;
  }, e3;
}();
var T = /* @__PURE__ */ new Map();
var x = /* @__PURE__ */ new Map();
var k = 1;
var V = function(e3) {
  if (T.has(e3))
    return T.get(e3);
  for (; x.has(k); )
    k++;
  var t2 = k++;
  return ((0 | t2) < 0 || t2 > 1 << 30) && D(16, "" + t2), T.set(e3, t2), x.set(t2, e3), t2;
};
var B = function(e3) {
  return x.get(e3);
};
var z = function(e3, t2) {
  t2 >= k && (k = t2 + 1), T.set(e3, t2), x.set(t2, e3);
};
var M = "style[" + N + '][data-styled-version="5.3.11"]';
var G = new RegExp("^" + N + '\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)');
var L = function(e3, t2, n3) {
  for (var r3, o2 = n3.split(","), s3 = 0, i3 = o2.length; s3 < i3; s3++)
    (r3 = o2[s3]) && e3.registerName(t2, r3);
};
var F = function(e3, t2) {
  for (var n3 = (t2.textContent || "").split("/*!sc*/\n"), r3 = [], o2 = 0, s3 = n3.length; o2 < s3; o2++) {
    var i3 = n3[o2].trim();
    if (i3) {
      var a3 = i3.match(G);
      if (a3) {
        var c3 = 0 | parseInt(a3[1], 10), u3 = a3[2];
        0 !== c3 && (z(u3, c3), L(e3, u3, a3[3]), e3.getTag().insertRules(c3, r3)), r3.length = 0;
      } else
        r3.push(i3);
    }
  }
};
var Y = function() {
  return "undefined" != typeof __webpack_nonce__ ? __webpack_nonce__ : null;
};
var q = function(e3) {
  var t2 = document.head, n3 = e3 || t2, r3 = document.createElement("style"), o2 = function(e4) {
    for (var t3 = e4.childNodes, n4 = t3.length; n4 >= 0; n4--) {
      var r4 = t3[n4];
      if (r4 && 1 === r4.nodeType && r4.hasAttribute(N))
        return r4;
    }
  }(n3), s3 = void 0 !== o2 ? o2.nextSibling : null;
  r3.setAttribute(N, "active"), r3.setAttribute("data-styled-version", "5.3.11");
  var i3 = Y();
  return i3 && r3.setAttribute("nonce", i3), n3.insertBefore(r3, s3), r3;
};
var H = function() {
  function e3(e4) {
    var t3 = this.element = q(e4);
    t3.appendChild(document.createTextNode("")), this.sheet = function(e5) {
      if (e5.sheet)
        return e5.sheet;
      for (var t4 = document.styleSheets, n3 = 0, r3 = t4.length; n3 < r3; n3++) {
        var o2 = t4[n3];
        if (o2.ownerNode === e5)
          return o2;
      }
      D(17);
    }(t3), this.length = 0;
  }
  var t2 = e3.prototype;
  return t2.insertRule = function(e4, t3) {
    try {
      return this.sheet.insertRule(t3, e4), this.length++, true;
    } catch (e5) {
      return false;
    }
  }, t2.deleteRule = function(e4) {
    this.sheet.deleteRule(e4), this.length--;
  }, t2.getRule = function(e4) {
    var t3 = this.sheet.cssRules[e4];
    return void 0 !== t3 && "string" == typeof t3.cssText ? t3.cssText : "";
  }, e3;
}();
var $ = function() {
  function e3(e4) {
    var t3 = this.element = q(e4);
    this.nodes = t3.childNodes, this.length = 0;
  }
  var t2 = e3.prototype;
  return t2.insertRule = function(e4, t3) {
    if (e4 <= this.length && e4 >= 0) {
      var n3 = document.createTextNode(t3), r3 = this.nodes[e4];
      return this.element.insertBefore(n3, r3 || null), this.length++, true;
    }
    return false;
  }, t2.deleteRule = function(e4) {
    this.element.removeChild(this.nodes[e4]), this.length--;
  }, t2.getRule = function(e4) {
    return e4 < this.length ? this.nodes[e4].textContent : "";
  }, e3;
}();
var W = function() {
  function e3(e4) {
    this.rules = [], this.length = 0;
  }
  var t2 = e3.prototype;
  return t2.insertRule = function(e4, t3) {
    return e4 <= this.length && (this.rules.splice(e4, 0, t3), this.length++, true);
  }, t2.deleteRule = function(e4) {
    this.rules.splice(e4, 1), this.length--;
  }, t2.getRule = function(e4) {
    return e4 < this.length ? this.rules[e4] : "";
  }, e3;
}();
var U = C;
var J = { isServer: !C, useCSSOMInjection: !I };
var X = function() {
  function e3(e4, t3, n3) {
    void 0 === e4 && (e4 = w), void 0 === t3 && (t3 = {}), this.options = y({}, J, {}, e4), this.gs = t3, this.names = new Map(n3), this.server = !!e4.isServer, !this.server && C && U && (U = false, function(e5) {
      for (var t4 = document.querySelectorAll(M), n4 = 0, r3 = t4.length; n4 < r3; n4++) {
        var o2 = t4[n4];
        o2 && "active" !== o2.getAttribute(N) && (F(e5, o2), o2.parentNode && o2.parentNode.removeChild(o2));
      }
    }(this));
  }
  e3.registerId = function(e4) {
    return V(e4);
  };
  var t2 = e3.prototype;
  return t2.reconstructWithOptions = function(t3, n3) {
    return void 0 === n3 && (n3 = true), new e3(y({}, this.options, {}, t3), this.gs, n3 && this.names || void 0);
  }, t2.allocateGSInstance = function(e4) {
    return this.gs[e4] = (this.gs[e4] || 0) + 1;
  }, t2.getTag = function() {
    return this.tag || (this.tag = (n3 = (t3 = this.options).isServer, r3 = t3.useCSSOMInjection, o2 = t3.target, e4 = n3 ? new W(o2) : r3 ? new H(o2) : new $(o2), new j(e4)));
    var e4, t3, n3, r3, o2;
  }, t2.hasNameForId = function(e4, t3) {
    return this.names.has(e4) && this.names.get(e4).has(t3);
  }, t2.registerName = function(e4, t3) {
    if (V(e4), this.names.has(e4))
      this.names.get(e4).add(t3);
    else {
      var n3 = /* @__PURE__ */ new Set();
      n3.add(t3), this.names.set(e4, n3);
    }
  }, t2.insertRules = function(e4, t3, n3) {
    this.registerName(e4, t3), this.getTag().insertRules(V(e4), n3);
  }, t2.clearNames = function(e4) {
    this.names.has(e4) && this.names.get(e4).clear();
  }, t2.clearRules = function(e4) {
    this.getTag().clearGroup(V(e4)), this.clearNames(e4);
  }, t2.clearTag = function() {
    this.tag = void 0;
  }, t2.toString = function() {
    return function(e4) {
      for (var t3 = e4.getTag(), n3 = t3.length, r3 = "", o2 = 0; o2 < n3; o2++) {
        var s3 = B(o2);
        if (void 0 !== s3) {
          var i3 = e4.names.get(s3), a3 = t3.getGroup(o2);
          if (i3 && a3 && i3.size) {
            var c3 = N + ".g" + o2 + '[id="' + s3 + '"]', u3 = "";
            void 0 !== i3 && i3.forEach(function(e5) {
              e5.length > 0 && (u3 += e5 + ",");
            }), r3 += "" + a3 + c3 + '{content:"' + u3 + '"}/*!sc*/\n';
          }
        }
      }
      return r3;
    }(this);
  }, e3;
}();
var Z = /(a)(d)/gi;
var K = function(e3) {
  return String.fromCharCode(e3 + (e3 > 25 ? 39 : 97));
};
function Q(e3) {
  var t2, n3 = "";
  for (t2 = Math.abs(e3); t2 > 52; t2 = t2 / 52 | 0)
    n3 = K(t2 % 52) + n3;
  return (K(t2 % 52) + n3).replace(Z, "$1-$2");
}
var ee = function(e3, t2) {
  for (var n3 = t2.length; n3; )
    e3 = 33 * e3 ^ t2.charCodeAt(--n3);
  return e3;
};
var te = function(e3) {
  return ee(5381, e3);
};
function ne(e3) {
  for (var t2 = 0; t2 < e3.length; t2 += 1) {
    var n3 = e3[t2];
    if (E(n3) && !_(n3))
      return false;
  }
  return true;
}
var re = te("5.3.11");
var oe = function() {
  function e3(e4, t2, n3) {
    this.rules = e4, this.staticRulesId = "", this.isStatic = false, this.componentId = t2, this.baseHash = ee(re, t2), this.baseStyle = n3, X.registerId(t2);
  }
  return e3.prototype.generateAndInjectStyles = function(e4, t2, n3) {
    var r3 = this.componentId, o2 = [];
    if (this.baseStyle && o2.push(this.baseStyle.generateAndInjectStyles(e4, t2, n3)), this.isStatic && !n3.hash)
      if (this.staticRulesId && t2.hasNameForId(r3, this.staticRulesId))
        o2.push(this.staticRulesId);
      else {
        var s3 = _e(this.rules, e4, t2, n3).join(""), i3 = Q(ee(this.baseHash, s3) >>> 0);
        if (!t2.hasNameForId(r3, i3)) {
          var a3 = n3(s3, "." + i3, void 0, r3);
          t2.insertRules(r3, i3, a3);
        }
        o2.push(i3), this.staticRulesId = i3;
      }
    else {
      for (var c3 = this.rules.length, u3 = ee(this.baseHash, n3.hash), l3 = "", d3 = 0; d3 < c3; d3++) {
        var h2 = this.rules[d3];
        if ("string" == typeof h2)
          l3 += h2, u3 = ee(u3, h2 + d3);
        else if (h2) {
          var p2 = _e(h2, e4, t2, n3), f2 = Array.isArray(p2) ? p2.join("") : p2;
          u3 = ee(u3, f2 + d3), l3 += f2;
        }
      }
      if (l3) {
        var m3 = Q(u3 >>> 0);
        if (!t2.hasNameForId(r3, m3)) {
          var y3 = n3(l3, "." + m3, void 0, r3);
          t2.insertRules(r3, m3, y3);
        }
        o2.push(m3);
      }
    }
    return o2.join(" ");
  }, e3;
}();
var se = /^\s*\/\/.*$/gm;
var ie = [":", "[", ".", "#"];
function ae(e3) {
  var t2, n3, r3, o2, s3 = void 0 === e3 ? w : e3, i3 = s3.options, a3 = void 0 === i3 ? w : i3, c3 = s3.plugins, u3 = void 0 === c3 ? S : c3, l3 = new stylis_browser_esm_default(a3), d3 = [], p2 = /* @__PURE__ */ function(e4) {
    function t3(t4) {
      if (t4)
        try {
          e4(t4 + "}");
        } catch (e5) {
        }
    }
    return function(n4, r4, o3, s4, i4, a4, c4, u4, l4, d4) {
      switch (n4) {
        case 1:
          if (0 === l4 && 64 === r4.charCodeAt(0))
            return e4(r4 + ";"), "";
          break;
        case 2:
          if (0 === u4)
            return r4 + "/*|*/";
          break;
        case 3:
          switch (u4) {
            case 102:
            case 112:
              return e4(o3[0] + r4), "";
            default:
              return r4 + (0 === d4 ? "/*|*/" : "");
          }
        case -2:
          r4.split("/*|*/}").forEach(t3);
      }
    };
  }(function(e4) {
    d3.push(e4);
  }), f2 = function(e4, r4, s4) {
    return 0 === r4 && -1 !== ie.indexOf(s4[n3.length]) || s4.match(o2) ? e4 : "." + t2;
  };
  function m3(e4, s4, i4, a4) {
    void 0 === a4 && (a4 = "&");
    var c4 = e4.replace(se, ""), u4 = s4 && i4 ? i4 + " " + s4 + " { " + c4 + " }" : c4;
    return t2 = a4, n3 = s4, r3 = new RegExp("\\" + n3 + "\\b", "g"), o2 = new RegExp("(\\" + n3 + "\\b){2,}"), l3(i4 || !s4 ? "" : s4, u4);
  }
  return l3.use([].concat(u3, [function(e4, t3, o3) {
    2 === e4 && o3.length && o3[0].lastIndexOf(n3) > 0 && (o3[0] = o3[0].replace(r3, f2));
  }, p2, function(e4) {
    if (-2 === e4) {
      var t3 = d3;
      return d3 = [], t3;
    }
  }])), m3.hash = u3.length ? u3.reduce(function(e4, t3) {
    return t3.name || D(15), ee(e4, t3.name);
  }, 5381).toString() : "", m3;
}
var ce = import_react.default.createContext();
var ue = ce.Consumer;
var le = import_react.default.createContext();
var de = (le.Consumer, new X());
var he = ae();
function pe() {
  return (0, import_react.useContext)(ce) || de;
}
function fe() {
  return (0, import_react.useContext)(le) || he;
}
function me(e3) {
  var t2 = (0, import_react.useState)(e3.stylisPlugins), n3 = t2[0], s3 = t2[1], c3 = pe(), u3 = (0, import_react.useMemo)(function() {
    var t3 = c3;
    return e3.sheet ? t3 = e3.sheet : e3.target && (t3 = t3.reconstructWithOptions({ target: e3.target }, false)), e3.disableCSSOMInjection && (t3 = t3.reconstructWithOptions({ useCSSOMInjection: false })), t3;
  }, [e3.disableCSSOMInjection, e3.sheet, e3.target]), l3 = (0, import_react.useMemo)(function() {
    return ae({ options: { prefix: !e3.disableVendorPrefixes }, plugins: n3 });
  }, [e3.disableVendorPrefixes, n3]);
  return (0, import_react.useEffect)(function() {
    (0, import_shallowequal.default)(n3, e3.stylisPlugins) || s3(e3.stylisPlugins);
  }, [e3.stylisPlugins]), import_react.default.createElement(ce.Provider, { value: u3 }, import_react.default.createElement(le.Provider, { value: l3 }, true ? import_react.default.Children.only(e3.children) : e3.children));
}
var ye = function() {
  function e3(e4, t2) {
    var n3 = this;
    this.inject = function(e5, t3) {
      void 0 === t3 && (t3 = he);
      var r3 = n3.name + t3.hash;
      e5.hasNameForId(n3.id, r3) || e5.insertRules(n3.id, r3, t3(n3.rules, r3, "@keyframes"));
    }, this.toString = function() {
      return D(12, String(n3.name));
    }, this.name = e4, this.id = "sc-keyframes-" + e4, this.rules = t2;
  }
  return e3.prototype.getName = function(e4) {
    return void 0 === e4 && (e4 = he), this.name + e4.hash;
  }, e3;
}();
var ve = /([A-Z])/;
var ge = /([A-Z])/g;
var Se = /^ms-/;
var we = function(e3) {
  return "-" + e3.toLowerCase();
};
function Ee(e3) {
  return ve.test(e3) ? e3.replace(ge, we).replace(Se, "-ms-") : e3;
}
var be = function(e3) {
  return null == e3 || false === e3 || "" === e3;
};
function _e(e3, n3, r3, o2) {
  if (Array.isArray(e3)) {
    for (var s3, i3 = [], a3 = 0, c3 = e3.length; a3 < c3; a3 += 1)
      "" !== (s3 = _e(e3[a3], n3, r3, o2)) && (Array.isArray(s3) ? i3.push.apply(i3, s3) : i3.push(s3));
    return i3;
  }
  if (be(e3))
    return "";
  if (_(e3))
    return "." + e3.styledComponentId;
  if (E(e3)) {
    if ("function" != typeof (l3 = e3) || l3.prototype && l3.prototype.isReactComponent || !n3)
      return e3;
    var u3 = e3(n3);
    return (0, import_react_is.isElement)(u3) && console.warn(b(e3) + " is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details."), _e(u3, n3, r3, o2);
  }
  var l3;
  return e3 instanceof ye ? r3 ? (e3.inject(r3, o2), e3.getName(o2)) : e3 : g(e3) ? function e4(t2, n4) {
    var r4, o3, s4 = [];
    for (var i4 in t2)
      t2.hasOwnProperty(i4) && !be(t2[i4]) && (Array.isArray(t2[i4]) && t2[i4].isCss || E(t2[i4]) ? s4.push(Ee(i4) + ":", t2[i4], ";") : g(t2[i4]) ? s4.push.apply(s4, e4(t2[i4], i4)) : s4.push(Ee(i4) + ": " + (r4 = i4, null == (o3 = t2[i4]) || "boolean" == typeof o3 || "" === o3 ? "" : "number" != typeof o3 || 0 === o3 || r4 in unitless_browser_esm_default || r4.startsWith("--") ? String(o3).trim() : o3 + "px") + ";"));
    return n4 ? [n4 + " {"].concat(s4, ["}"]) : s4;
  }(e3) : e3.toString();
}
var Ne = function(e3) {
  return Array.isArray(e3) && (e3.isCss = true), e3;
};
function Ae(e3) {
  for (var t2 = arguments.length, n3 = new Array(t2 > 1 ? t2 - 1 : 0), r3 = 1; r3 < t2; r3++)
    n3[r3 - 1] = arguments[r3];
  return E(e3) || g(e3) ? Ne(_e(v(S, [e3].concat(n3)))) : 0 === n3.length && 1 === e3.length && "string" == typeof e3[0] ? e3 : Ne(_e(v(e3, n3)));
}
var Ce = /invalid hook call/i;
var Ie = /* @__PURE__ */ new Set();
var Pe = function(e3, t2) {
  if (true) {
    var n3 = "The component " + e3 + (t2 ? ' with the id of "' + t2 + '"' : "") + " has been created dynamically.\nYou may see this warning because you've called styled inside another component.\nTo resolve this only create new StyledComponents outside of any render method and function component.", r3 = console.error;
    try {
      var o2 = true;
      console.error = function(e4) {
        if (Ce.test(e4))
          o2 = false, Ie.delete(n3);
        else {
          for (var t3 = arguments.length, s3 = new Array(t3 > 1 ? t3 - 1 : 0), i3 = 1; i3 < t3; i3++)
            s3[i3 - 1] = arguments[i3];
          r3.apply(void 0, [e4].concat(s3));
        }
      }, (0, import_react.useRef)(), o2 && !Ie.has(n3) && (console.warn(n3), Ie.add(n3));
    } catch (e4) {
      Ce.test(e4.message) && Ie.delete(n3);
    } finally {
      console.error = r3;
    }
  }
};
var Oe = function(e3, t2, n3) {
  return void 0 === n3 && (n3 = w), e3.theme !== n3.theme && e3.theme || t2 || n3.theme;
};
var Re = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g;
var De = /(^-|-$)/g;
function je(e3) {
  return e3.replace(Re, "-").replace(De, "");
}
var Te = function(e3) {
  return Q(te(e3) >>> 0);
};
function xe(e3) {
  return "string" == typeof e3 && e3.charAt(0) === e3.charAt(0).toLowerCase();
}
var ke = function(e3) {
  return "function" == typeof e3 || "object" == typeof e3 && null !== e3 && !Array.isArray(e3);
};
var Ve = function(e3) {
  return "__proto__" !== e3 && "constructor" !== e3 && "prototype" !== e3;
};
function Be(e3, t2, n3) {
  var r3 = e3[n3];
  ke(t2) && ke(r3) ? ze(r3, t2) : e3[n3] = t2;
}
function ze(e3) {
  for (var t2 = arguments.length, n3 = new Array(t2 > 1 ? t2 - 1 : 0), r3 = 1; r3 < t2; r3++)
    n3[r3 - 1] = arguments[r3];
  for (var o2 = 0, s3 = n3; o2 < s3.length; o2++) {
    var i3 = s3[o2];
    if (ke(i3))
      for (var a3 in i3)
        Ve(a3) && Be(e3, i3[a3], a3);
  }
  return e3;
}
var Me = import_react.default.createContext();
var Ge = Me.Consumer;
var Fe = {};
function Ye(e3, t2, n3) {
  var o2 = _(e3), i3 = !xe(e3), a3 = t2.attrs, c3 = void 0 === a3 ? S : a3, l3 = t2.componentId, d3 = void 0 === l3 ? function(e4, t3) {
    var n4 = "string" != typeof e4 ? "sc" : je(e4);
    Fe[n4] = (Fe[n4] || 0) + 1;
    var r3 = n4 + "-" + Te("5.3.11" + n4 + Fe[n4]);
    return t3 ? t3 + "-" + r3 : r3;
  }(t2.displayName, t2.parentComponentId) : l3, h2 = t2.displayName, p2 = void 0 === h2 ? function(e4) {
    return xe(e4) ? "styled." + e4 : "Styled(" + b(e4) + ")";
  }(e3) : h2, v3 = t2.displayName && t2.componentId ? je(t2.displayName) + "-" + t2.componentId : t2.componentId || d3, g3 = o2 && e3.attrs ? Array.prototype.concat(e3.attrs, c3).filter(Boolean) : c3, N2 = t2.shouldForwardProp;
  o2 && e3.shouldForwardProp && (N2 = t2.shouldForwardProp ? function(n4, r3, o3) {
    return e3.shouldForwardProp(n4, r3, o3) && t2.shouldForwardProp(n4, r3, o3);
  } : e3.shouldForwardProp);
  var A, C3 = new oe(n3, v3, o2 ? e3.componentStyle : void 0), I2 = C3.isStatic && 0 === c3.length, P = function(e4, t3) {
    return function(e5, t4, n4, r3) {
      var o3 = e5.attrs, i4 = e5.componentStyle, a4 = e5.defaultProps, c4 = e5.foldedComponentIds, l4 = e5.shouldForwardProp, d4 = e5.styledComponentId, h3 = e5.target, p3 = function(e6, t5, n5) {
        void 0 === e6 && (e6 = w);
        var r4 = y({}, t5, { theme: e6 }), o4 = {};
        return n5.forEach(function(e7) {
          var t6, n6, s3, i5 = e7;
          for (t6 in E(i5) && (i5 = i5(r4)), i5)
            r4[t6] = o4[t6] = "className" === t6 ? (n6 = o4[t6], s3 = i5[t6], n6 && s3 ? n6 + " " + s3 : n6 || s3) : i5[t6];
        }), [r4, o4];
      }(Oe(t4, (0, import_react.useContext)(Me), a4) || w, t4, o3), m3 = p3[0], v4 = p3[1], g4 = function(e6, t5, n5, r4) {
        var o4 = pe(), s3 = fe(), i5 = t5 ? e6.generateAndInjectStyles(w, o4, s3) : e6.generateAndInjectStyles(n5, o4, s3);
        return !t5 && r4 && r4(i5), i5;
      }(i4, r3, m3, true ? e5.warnTooManyClasses : void 0), S2 = n4, b3 = v4.$as || t4.$as || v4.as || t4.as || h3, _2 = xe(b3), N3 = v4 !== t4 ? y({}, t4, {}, v4) : t4, A2 = {};
      for (var C4 in N3)
        "$" !== C4[0] && "as" !== C4 && ("forwardedAs" === C4 ? A2.as = N3[C4] : (l4 ? l4(C4, isPropValid, b3) : !_2 || isPropValid(C4)) && (A2[C4] = N3[C4]));
      return t4.style && v4.style !== t4.style && (A2.style = y({}, t4.style, {}, v4.style)), A2.className = Array.prototype.concat(c4, d4, g4 !== d4 ? g4 : null, t4.className, v4.className).filter(Boolean).join(" "), A2.ref = S2, (0, import_react.createElement)(b3, A2);
    }(A, e4, t3, I2);
  };
  return P.displayName = p2, (A = import_react.default.forwardRef(P)).attrs = g3, A.componentStyle = C3, A.displayName = p2, A.shouldForwardProp = N2, A.foldedComponentIds = o2 ? Array.prototype.concat(e3.foldedComponentIds, e3.styledComponentId) : S, A.styledComponentId = v3, A.target = o2 ? e3.target : e3, A.withComponent = function(e4) {
    var r3 = t2.componentId, o3 = function(e5, t3) {
      if (null == e5)
        return {};
      var n4, r4, o4 = {}, s4 = Object.keys(e5);
      for (r4 = 0; r4 < s4.length; r4++)
        n4 = s4[r4], t3.indexOf(n4) >= 0 || (o4[n4] = e5[n4]);
      return o4;
    }(t2, ["componentId"]), s3 = r3 && r3 + "-" + (xe(e4) ? e4 : je(b(e4)));
    return Ye(e4, y({}, o3, { attrs: g3, componentId: s3 }), n3);
  }, Object.defineProperty(A, "defaultProps", { get: function() {
    return this._foldedDefaultProps;
  }, set: function(t3) {
    this._foldedDefaultProps = o2 ? ze({}, e3.defaultProps, t3) : t3;
  } }), Pe(p2, v3), A.warnTooManyClasses = /* @__PURE__ */ function(e4, t3) {
    var n4 = {}, r3 = false;
    return function(o3) {
      if (!r3 && (n4[o3] = true, Object.keys(n4).length >= 200)) {
        var s3 = t3 ? ' with the id of "' + t3 + '"' : "";
        console.warn("Over 200 classes were generated for component " + e4 + s3 + ".\nConsider using the attrs method, together with a style object for frequently changed styles.\nExample:\n  const Component = styled.div.attrs(props => ({\n    style: {\n      background: props.background,\n    },\n  }))`width: 100%;`\n\n  <Component />"), r3 = true, n4 = {};
      }
    };
  }(p2, v3), Object.defineProperty(A, "toString", { value: function() {
    return "." + A.styledComponentId;
  } }), i3 && (0, import_hoist_non_react_statics.default)(A, e3, { attrs: true, componentStyle: true, displayName: true, foldedComponentIds: true, shouldForwardProp: true, styledComponentId: true, target: true, withComponent: true }), A;
}
var qe = function(e3) {
  return function e4(t2, r3, o2) {
    if (void 0 === o2 && (o2 = w), !(0, import_react_is.isValidElementType)(r3))
      return D(1, String(r3));
    var s3 = function() {
      return t2(r3, o2, Ae.apply(void 0, arguments));
    };
    return s3.withConfig = function(n3) {
      return e4(t2, r3, y({}, o2, {}, n3));
    }, s3.attrs = function(n3) {
      return e4(t2, r3, y({}, o2, { attrs: Array.prototype.concat(o2.attrs, n3).filter(Boolean) }));
    }, s3;
  }(Ye, e3);
};
["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "marquee", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr", "circle", "clipPath", "defs", "ellipse", "foreignObject", "g", "image", "line", "linearGradient", "marker", "mask", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "text", "textPath", "tspan"].forEach(function(e3) {
  qe[e3] = qe(e3);
});
var He = function() {
  function e3(e4, t3) {
    this.rules = e4, this.componentId = t3, this.isStatic = ne(e4), X.registerId(this.componentId + 1);
  }
  var t2 = e3.prototype;
  return t2.createStyles = function(e4, t3, n3, r3) {
    var o2 = r3(_e(this.rules, t3, n3, r3).join(""), ""), s3 = this.componentId + e4;
    n3.insertRules(s3, s3, o2);
  }, t2.removeStyles = function(e4, t3) {
    t3.clearRules(this.componentId + e4);
  }, t2.renderStyles = function(e4, t3, n3, r3) {
    e4 > 2 && X.registerId(this.componentId + e4), this.removeStyles(e4, n3), this.createStyles(e4, t3, n3, r3);
  }, e3;
}();
var Ue = function() {
  function e3() {
    var e4 = this;
    this._emitSheetCSS = function() {
      var t3 = e4.instance.toString();
      if (!t3)
        return "";
      var n3 = Y();
      return "<style " + [n3 && 'nonce="' + n3 + '"', N + '="true"', 'data-styled-version="5.3.11"'].filter(Boolean).join(" ") + ">" + t3 + "</style>";
    }, this.getStyleTags = function() {
      return e4.sealed ? D(2) : e4._emitSheetCSS();
    }, this.getStyleElement = function() {
      var t3;
      if (e4.sealed)
        return D(2);
      var n3 = ((t3 = {})[N] = "", t3["data-styled-version"] = "5.3.11", t3.dangerouslySetInnerHTML = { __html: e4.instance.toString() }, t3), o2 = Y();
      return o2 && (n3.nonce = o2), [import_react.default.createElement("style", y({}, n3, { key: "sc-0-0" }))];
    }, this.seal = function() {
      e4.sealed = true;
    }, this.instance = new X({ isServer: true }), this.sealed = false;
  }
  var t2 = e3.prototype;
  return t2.collectStyles = function(e4) {
    return this.sealed ? D(2) : import_react.default.createElement(me, { sheet: this.instance }, e4);
  }, t2.interleaveWithNodeStream = function(e4) {
    return D(3);
  }, e3;
}();
"undefined" != typeof navigator && "ReactNative" === navigator.product && console.warn("It looks like you've imported 'styled-components' on React Native.\nPerhaps you're looking to import 'styled-components/native'?\nRead more about this at https://www.styled-components.com/docs/basics#react-native"), "undefined" != typeof window && (window["__styled-components-init__"] = window["__styled-components-init__"] || 0, 1 === window["__styled-components-init__"] && console.warn("It looks like there are several instances of 'styled-components' initialized in this application. This may cause dynamic styles to not render properly, errors during the rehydration process, a missing theme prop, and makes your application bigger without good reason.\n\nSee https://s-c.sh/2BAXzed for more info."), window["__styled-components-init__"] += 1);
var styled_components_browser_esm_default = qe;

// node_modules/react-drag-drop-files/dist/react-drag-drop-files.esm.js
var import_react2 = __toESM(require_react());
var p = function() {
  return p = Object.assign || function(n3) {
    for (var e3, r3 = 1, t2 = arguments.length; r3 < t2; r3++)
      for (var o2 in e3 = arguments[r3])
        Object.prototype.hasOwnProperty.call(e3, o2) && (n3[o2] = e3[o2]);
    return n3;
  }, p.apply(this, arguments);
};
function d2(n3, e3) {
  return Object.defineProperty ? Object.defineProperty(n3, "raw", { value: e3 }) : n3.raw = e3, n3;
}
var c2;
var u2;
var f;
var v2;
var h;
var x2 = Ae(c2 || (c2 = d2(["\n  display: flex;\n  align-items: center;\n  min-width: 322px;\n  max-width: 508px;\n  height: 48px;\n  border: dashed 2px ", ";\n  padding: 8px 16px 8px 8px;\n  border-radius: 5px;\n  cursor: pointer;\n  flex-grow: 0;\n\n  &.is-disabled {\n    border: dashed 2px ", ";\n    cursor: no-drop;\n    svg {\n      fill: ", ";\n      color: ", ";\n      path {\n        fill: ", ";\n        color: ", ";\n      }\n    }\n  }\n"], ["\n  display: flex;\n  align-items: center;\n  min-width: 322px;\n  max-width: 508px;\n  height: 48px;\n  border: dashed 2px ", ";\n  padding: 8px 16px 8px 8px;\n  border-radius: 5px;\n  cursor: pointer;\n  flex-grow: 0;\n\n  &.is-disabled {\n    border: dashed 2px ", ";\n    cursor: no-drop;\n    svg {\n      fill: ", ";\n      color: ", ";\n      path {\n        fill: ", ";\n        color: ", ";\n      }\n    }\n  }\n"])), "#0658c2", "#666", "#666", "#666", "#666", "#666");
var g2 = styled_components_browser_esm_default.label(u2 || (u2 = d2(["\n  position: relative;\n  ", ";\n  &:focus-within {\n    outline: 2px solid black;\n  }\n  & > input {\n    display: block;\n    opacity: 0;\n    position: absolute;\n    pointer-events: none;\n  }\n"], ["\n  position: relative;\n  ", ";\n  &:focus-within {\n    outline: 2px solid black;\n  }\n  & > input {\n    display: block;\n    opacity: 0;\n    position: absolute;\n    pointer-events: none;\n  }\n"])), function(n3) {
  return n3.overRide ? "" : x2;
});
var m2 = styled_components_browser_esm_default.div(f || (f = d2(["\n  border: dashed 2px ", ";\n  border-radius: 5px;\n  background-color: ", ";\n  opacity: 0.5;\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  bottom: 0;\n  & > span {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translateX(-50%) translateY(-50%);\n  }\n"], ["\n  border: dashed 2px ", ";\n  border-radius: 5px;\n  background-color: ", ";\n  opacity: 0.5;\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  bottom: 0;\n  & > span {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    transform: translateX(-50%) translateY(-50%);\n  }\n"])), "#666", "#999");
var b2 = styled_components_browser_esm_default.div(v2 || (v2 = d2(["\n  display: flex;\n  justify-content: space-between;\n  flex-grow: 1;\n  & > span {\n    font-size: 12px;\n    color: ", ";\n  }\n  .file-types {\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    max-width: 100px;\n  }\n"], ["\n  display: flex;\n  justify-content: space-between;\n  flex-grow: 1;\n  & > span {\n    font-size: 12px;\n    color: ", ";\n  }\n  .file-types {\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    max-width: 100px;\n  }\n"])), function(n3) {
  return n3.error ? "red" : "#666";
});
var w2 = styled_components_browser_esm_default.span(h || (h = d2(["\n  font-size: 14px;\n  color: ", ";\n  span {\n    text-decoration: underline;\n  }\n"], ["\n  font-size: 14px;\n  color: ", ";\n  span {\n    text-decoration: underline;\n  }\n"])), "#666");
var y2 = function(n3) {
  return n3 / 1e3 / 1e3;
};
var z2 = function(n3) {
  return void 0 === n3 ? "" : n3.map(function(n4) {
    return ".".concat(n4.toLowerCase());
  }).join(",");
};
function L2(e3) {
  var r3 = e3.types, t2 = e3.minSize, o2 = e3.maxSize;
  if (r3) {
    var i3 = r3.toString(), a3 = "";
    return o2 && (a3 += "size >= ".concat(o2, ", ")), t2 && (a3 += "size <= ".concat(t2, ", ")), (0, import_jsx_runtime.jsx)("span", p({ title: "".concat(a3, "types: ").concat(i3), className: "file-types" }, { children: i3 }), void 0);
  }
  return null;
}
function C2() {
  return (0, import_jsx_runtime.jsxs)("svg", p({ width: "32", height: "32", viewBox: "0 0 32 32", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, { children: [(0, import_jsx_runtime.jsx)("path", { d: "M5.33317 6.66667H22.6665V16H25.3332V6.66667C25.3332 5.196 24.1372 4 22.6665 4H5.33317C3.8625 4 2.6665 5.196 2.6665 6.66667V22.6667C2.6665 24.1373 3.8625 25.3333 5.33317 25.3333H15.9998V22.6667H5.33317V6.66667Z", fill: "#0658C2" }, void 0), (0, import_jsx_runtime.jsx)("path", { d: "M10.6665 14.6667L6.6665 20H21.3332L15.9998 12L11.9998 17.3333L10.6665 14.6667Z", fill: "#0658C2" }, void 0), (0, import_jsx_runtime.jsx)("path", { d: "M25.3332 18.6667H22.6665V22.6667H18.6665V25.3333H22.6665V29.3333H25.3332V25.3333H29.3332V22.6667H25.3332V18.6667Z", fill: "#0658C2" }, void 0)] }), void 0);
}
var H2 = 0;
var k2 = function(t2, o2, i3, a3, l3) {
  return i3 ? (0, import_jsx_runtime.jsx)("span", { children: "File type/size error, Hovered on types!" }, void 0) : (0, import_jsx_runtime.jsx)(w2, { children: a3 ? (0, import_jsx_runtime.jsx)("span", { children: "Upload disabled" }, void 0) : t2 || o2 ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("span", { children: "Uploaded Successfully!" }, void 0), " Upload another?"] }, void 0) : (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, l3 ? { children: [(0, import_jsx_runtime.jsx)("span", { children: l3.split(" ")[0] }, void 0), " ", l3.substr(l3.indexOf(" ") + 1)] } : { children: [(0, import_jsx_runtime.jsx)("span", { children: "Upload" }, void 0), " or drop a file right here"] }, void 0) }, void 0) }, void 0);
};
var E2 = function(t2) {
  var o2 = t2.name, d3 = t2.hoverTitle, c3 = t2.types, u3 = t2.handleChange, f2 = t2.classes, v3 = t2.children, h2 = t2.maxSize, x3 = t2.minSize, w3 = t2.fileOrFiles, E3 = t2.onSizeError, S2 = t2.onTypeError, V2 = t2.onSelect, D2 = t2.onDrop, P = t2.disabled, j2 = t2.label, F2 = t2.multiple, O2 = t2.required, R2 = t2.onDraggingStateChange, T2 = t2.dropMessageStyle, M2 = (0, import_react2.useRef)(null), U2 = (0, import_react2.useRef)(null), Z2 = (0, import_react2.useState)(false), q2 = Z2[0], N2 = Z2[1], X2 = (0, import_react2.useState)(null), Y2 = X2[0], B2 = X2[1], A = (0, import_react2.useState)(false), G2 = A[0], I2 = A[1], J2 = function(n3) {
    return c3 && !function(n4, e3) {
      var r3 = n4.name.split(".").pop();
      return e3.map(function(n5) {
        return n5.toLowerCase();
      }).includes(r3.toLowerCase());
    }(n3, c3) ? (I2(true), S2 && S2("File type is not supported"), false) : h2 && y2(n3.size) > h2 ? (I2(true), E3 && E3("File size is too big"), false) : !(x3 && y2(n3.size) < x3) || (I2(true), E3 && E3("File size is too small"), false);
  }, K2 = function(n3) {
    var e3 = false;
    if (n3) {
      if (n3 instanceof File)
        e3 = !J2(n3);
      else
        for (var r3 = 0; r3 < n3.length; r3++) {
          var t3 = n3[r3];
          e3 = !J2(t3) || e3;
        }
      return !e3 && (u3 && u3(n3), B2(n3), N2(true), I2(false), true);
    }
    return false;
  }, Q2 = function(n3) {
    var e3 = n3.labelRef, r3 = n3.inputRef, t3 = n3.multiple, o3 = n3.handleChanges, s3 = n3.onDrop, p2 = (0, import_react2.useState)(false), d4 = p2[0], c4 = p2[1], u4 = (0, import_react2.useCallback)(function() {
      r3.current.click();
    }, [r3]), f3 = (0, import_react2.useCallback)(function(n4) {
      n4.preventDefault(), n4.stopPropagation(), H2++, n4.dataTransfer.items && 0 !== n4.dataTransfer.items.length && c4(true);
    }, []), v4 = (0, import_react2.useCallback)(function(n4) {
      n4.preventDefault(), n4.stopPropagation(), --H2 > 0 || c4(false);
    }, []), h3 = (0, import_react2.useCallback)(function(n4) {
      n4.preventDefault(), n4.stopPropagation();
    }, []), x4 = (0, import_react2.useCallback)(function(n4) {
      n4.preventDefault(), n4.stopPropagation(), c4(false), H2 = 0;
      var e4 = n4.dataTransfer.files;
      if (e4 && e4.length > 0) {
        var r4 = t3 ? e4 : e4[0], i3 = o3(r4);
        s3 && i3 && s3(r4);
      }
    }, [o3]);
    return (0, import_react2.useEffect)(function() {
      var n4 = e3.current;
      return n4.addEventListener("click", u4), n4.addEventListener("dragenter", f3), n4.addEventListener("dragleave", v4), n4.addEventListener("dragover", h3), n4.addEventListener("drop", x4), function() {
        n4.removeEventListener("click", u4), n4.removeEventListener("dragenter", f3), n4.removeEventListener("dragleave", v4), n4.removeEventListener("dragover", h3), n4.removeEventListener("drop", x4);
      };
    }, [u4, f3, v4, h3, x4, e3]), d4;
  }({ labelRef: M2, inputRef: U2, multiple: F2, handleChanges: K2, onDrop: D2 });
  return (0, import_react2.useEffect)(function() {
    null == R2 || R2(Q2);
  }, [Q2]), (0, import_react2.useEffect)(function() {
    w3 ? (N2(true), B2(w3)) : (U2.current && (U2.current.value = ""), N2(false), B2(null));
  }, [w3]), (0, import_jsx_runtime.jsxs)(g2, p({ overRide: v3, className: "".concat(f2 || "", " ").concat(P ? "is-disabled" : ""), ref: M2, htmlFor: o2, onClick: function(n3) {
    n3.preventDefault(), n3.stopPropagation();
  } }, { children: [(0, import_jsx_runtime.jsx)("input", { onClick: function(n3) {
    n3.stopPropagation(), U2 && U2.current && (U2.current.value = "", U2.current.click());
  }, onChange: function(n3) {
    var e3 = n3.target.files, r3 = F2 ? e3 : e3[0], t3 = K2(r3);
    V2 && t3 && V2(r3);
  }, accept: z2(c3), ref: U2, type: "file", name: o2, disabled: P, multiple: F2, required: O2 }, void 0), Q2 && (0, import_jsx_runtime.jsx)(m2, p({ style: T2 }, { children: (0, import_jsx_runtime.jsx)("span", { children: d3 || "Drop Here" }, void 0) }), void 0), !v3 && (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)(C2, {}, void 0), (0, import_jsx_runtime.jsxs)(b2, p({ error: G2 }, { children: [k2(Y2, q2, G2, P, j2), (0, import_jsx_runtime.jsx)(L2, { types: c3, minSize: x3, maxSize: h2 }, void 0)] }), void 0)] }, void 0), v3] }), void 0);
};
export {
  E2 as FileUploader
};
/*! Bundled license information:

react-is/cjs/react-is.development.js:
  (** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-drag-drop-files/dist/react-drag-drop-files.esm.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)
*/
//# sourceMappingURL=react-drag-drop-files.js.map
