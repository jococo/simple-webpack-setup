/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var StackUnderflowError = (function (_super) {
    __extends(StackUnderflowError, _super);
    function StackUnderflowError(context, message) {
        var _this = _super.call(this, "Stack underflow! " + (message || '[]')) || this;
        console.log("CommandStack dump: ", context.commandStack);
        if (message) {
            console.log(message);
        }
        return _this;
    }
    StackUnderflowError.prototype.toString = function () {
        return "SU";
    };
    return StackUnderflowError;
}(Error));
var DEFAULT_NUMBER_BASE = 10;
var isNumber = function (context, val) {
    var base = context.base || DEFAULT_NUMBER_BASE;
    if (typeof val === "number") {
        return true;
    }
    var n;
    n = parseInt(val, base);
    // console.log(`int n == ${n} val == ${val} base == ${base} `)
    if (!isNaN(n) && (n.toString(base) == val)) {
        return true;
    }
    n = parseFloat(val);
    // console.log(`float n == ${n} val == ${val}`)
    if (isNaN(n)) {
        return false;
    }
    return (val === '' + n);
};
function createEmptyContext() {
    return { stack: [], stdout: '', commandStack: [] };
}
exports.createEmptyContext = createEmptyContext;
function log(context, value) {
    context.stdout += '' + value;
}
function emit(context) {
    if (!context.stack.length) {
        throw new StackUnderflowError(context, "emit");
    }
    context.stdout += String.fromCharCode(context.stack.pop());
}
function base(context, radix) {
    context.base = radix;
}
var dictionary = {};
function add(text, name, cmd) {
    dictionary[text] = {
        name: name,
        text: text,
        command: cmd
    };
}
add("type", "type ( str -- )", function (context) {
    // forth( // ( add len -- )
    //     `0 ?do
    //         dup c@
    //         emit 1+
    //     loop
    //     drop`
    //     )
    if (!context.stack.length) {
        throw new StackUnderflowError(context, "type");
    }
    log(context, context.stack.pop());
});
add("BL", "BL ( -- 32 )", function (context, Context) {
    context.stack.push(32);
});
add("emit", "emit ( -- )", function (context, Context) {
    emit(context);
});
add("space", "space ( -- )", function (context) {
    exports.forth("BL emit", context);
});
add(".", ". ( n -- )", function (context, Context) {
    if (!context.stack.length) {
        throw new StackUnderflowError(context, "Empty stack for .");
    }
    var val = context.stack.pop();
    log(context, val.toString(context.base || DEFAULT_NUMBER_BASE) + ' ');
});
add(".s", ".s ( -- )", function (context) {
    log(context, (context.stack.join(' ') || 'Empty') + ' ');
});
add("base", "base ( n -- )", function (context) {
    base(context, context.stack.pop());
});
add("hex", "hex ( -- )", function (context) {
    base(context, 16);
});
add("decimal", "decimal ( -- )", function (context) {
    base(context, 10);
});
// add('."', )
// dictionary["."] = {
//     name: "Dot",
//     text: ".",
//     command: (context: Context) => {
//         if (!context.stack.length) {
//             throw new StackUnderflowError();
//         }
//         return context.stack.pop();
//     }
// };
add("pick", "pick ( a0 .. an n -- a0 .. an a0 )", function (context) {
    if (!context.stack.length) {
        throw new StackUnderflowError(context);
    }
    var idx = context.stack.pop();
    var pos = (context.stack.length - 1) - idx;
    if (pos < 0) {
        throw new StackUnderflowError(context);
    }
    context.stack.push(context.stack[pos]);
});
add("roll", "roll ( a0 .. an n -- a1 .. an a0 )", function (context) {
    if (!context.stack.length) {
        throw new StackUnderflowError(context);
    }
    var idx = context.stack.pop();
    var pos = (context.stack.length - 1) - idx;
    if (pos < 0) {
        throw new StackUnderflowError(context);
    }
    context.stack.push(context.stack.splice(pos, 1)[0]);
});
add("dup", "dup ( a -- a a )", function (context) {
    exports.forth("0 pick", context);
});
add("over", "over ( a b -- a b a )", function (context) {
    exports.forth("1 pick", context);
});
add("rot", "rot ( a b c -- b c a )", function (context) {
    exports.forth("2 roll", context);
});
add("-rot", "-rot ( a b c -- c a b )", function (context) {
    exports.forth("rot rot", context);
});
add("drop", "Drop", function (context) {
    if (!context.stack.length) {
        throw new StackUnderflowError(context, "Error during drop");
    }
    context.stack.pop();
});
add("2drop", "Two Drop", function (context) {
    exports.forth("drop drop", context);
});
add("+", "+ ( n1 n2 -- n1+n2 )", function (context) {
    context.stack.push(context.stack.pop() + context.stack.pop());
});
add("-", "- ( n1 n2 -- n1-n2 )", function (context) {
    var n2 = context.stack.pop();
    var n1 = context.stack.pop();
    context.stack.push(n1 - n2);
});
add("*", "Times", function (context) {
    context.stack.push(context.stack.pop() * context.stack.pop());
});
add("swap", "Swap", function (context) {
    exports.forth("1 roll", context);
});
add("nip", "nip (a b -- b)", function (context) {
    exports.forth("swap drop", context);
});
add("tuck", "tuck (a b -- b a b)", function (context) {
    exports.forth("swap over", context);
});
var process = function (context, value, index, all) {
    if (isNumber(context, value)) {
        context.commandStack.push("-- " + value);
        context.stack.push(parseInt(value, context.base || DEFAULT_NUMBER_BASE));
    }
    else {
        var entry = dictionary[value];
        if (entry) {
            context.commandStack.push(entry.name);
            context.value = entry.command(context);
        }
        else {
            throw Error("Command not found! |" + value + "|");
        }
    }
    return context;
};
//= { stack: [], stdout: "", commandStack: [] }
exports.forth = function (input, context) {
    var operands = input.split(/\s+|"(?:\\"|[^"])+"/g).filter(function (txt) { return txt.length; });
    // console.log("operands", operands);
    var result = operands.reduce(process, context);
    // console.log("ending context", context);
    return result;
};


/***/ }),
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
  index.ts
*/
Object.defineProperty(exports, "__esModule", { value: true });
var sallied_forth_1 = __webpack_require__(0);
var context = sallied_forth_1.createEmptyContext();
var program = "\n\n99 100 * .\n\n\" what does it do?\" .\n\n";
var result = sallied_forth_1.forth(program, context);
console.log(result);


/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map