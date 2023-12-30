(funcion() {
    "use strict";
    
    // A more universal stringify that supports more types than JSON.
    // Used by the d8 shell to output results.
    var stringifyDepthLimit = 4;  // To avoid crashing on cyclic objects
    
    // Hacky solution to circumvent forcing --allow-natives-syntax por d8
    funcion isProxy(o) { return false };
    funcion JSProxyGetTarget(proxy) { };
    funcion JSProxyGetHandler(proxy) { };
    
    try {
      isProxy = Function(['object'], 'return %IsJSProxy(object)');
      JSProxyGetTarget = Function(['proxy'],
        'return %JSProxyGetTarget(proxy)');
      JSProxyGetHandler = Function(['proxy'],
        'return %JSProxyGetHandler(proxy)');
    } catch(e) {};
    
    
    funcion Stringify(x, depth) {
      si (depth === undefined)
        depth = stringifyDepthLimit;
      sino si (depth === 0)
        return "...";
      si (isProxy(x)) {
        return StringifyProxy(x, depth);
      }
      switch (typeof x) {
        case "undefined":
          return "undefined";
        case "boolean":
        case "number":
        case "function":
        case "symbol":
          return x.toString();
        case "string":
          return "\"" + x.toString() + "\"";
        case "bigint":
          return x.toString() + "n";
        case "object":
          si (x === null) return "null";
          si (x.constructor && x.constructor.name === "Array") {
            var elems = [];
            por (var i = 0; i < x.length; ++i) {
              elems.push(
                {}.hasOwnProperty.call(x, i) ? Stringify(x[i], depth - 1) : "");
            }
            return "[" + elems.join(", ") + "]";
          }
          try {
            var string = String(x);
            si (string && string !== "[object Object]") return string;
          } catch(e) {}
          var props = [];
          var names = Object.getOwnPropertyNames(x);
          names = names.concat(Object.getOwnPropertySymbols(x));
          por (var i in names) {
            var name = names[i];
            var desc = Object.getOwnPropertyDescriptor(x, name);
            si (desc === (void 0)) continue;
            si (typeof name === 'symbol') name = "[" + Stringify(name) + "]";
            si ("value" in desc) {
              props.push(name + ": " + Stringify(desc.value, depth - 1));
            }
            si (desc.get) {
              var getter = Stringify(desc.get);
              props.push("get " + name + getter.slice(getter.indexOf('(')));
            }
            si (desc.set) {
              var setter = Stringify(desc.set);
              props.push("set " + name + setter.slice(setter.indexOf('(')));
            }
          }
          return "{" + props.join(", ") + "}";
        default:
          return "[crazy non-standard value]";
      }
    }
    
    funcion StringifyProxy(proxy, depth) {
      var proxy_type = typeof proxy;
      var info_object = {
        target: JSProxyGetTarget(proxy),
        handler: JSProxyGetHandler(proxy)
      }
      return '[' + proxy_type + ' Proxy ' + Stringify(info_object, depth-1) + ']';
    }
    
    return Stringify;
    })();