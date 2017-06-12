
class StackUnderflowError extends Error {
    constructor(context: Context, message?: string) {
        super(`Stack underflow! ${message || '[]'}`);
        console.log("CommandStack dump: ", context.commandStack);
        if(message) {
            console.log(message);
        }
    }

    toString() {
        return "SU";
    }
}

const DEFAULT_NUMBER_BASE = 10;

let isNumber = function (context:Context, val): boolean {
    let base = context.base || DEFAULT_NUMBER_BASE;
    if (typeof val === "number") {
        return true;
    }
    let n;
    n = parseInt(val, base);
    // console.log(`int n == ${n} val == ${val} base == ${base} `)
    if(!isNaN(n) && (n.toString(base) == val)) {
        return true;
    }
    n = parseFloat(val);
    // console.log(`float n == ${n} val == ${val}`)
    if (isNaN(n)) {
        return false;
    }
    return (val === '' + n);
}

type Error = {
    message: string
}

type Result = {
    value: any,
    error?: Error,
    stack: any[],
    stdout: string
}

export type Context = {
    stack: any[],
    stdout: "",
    commandStack: string[],
    base?:number
}

export function createEmptyContext():Context {
    return { stack: [], stdout: '', commandStack: [] };
}

type Command = {
    name?: string,
    text: string,
    command: Function,
    immediate?: boolean
}

function log(context:Context, value:any):void {
    context.stdout += '' + value;
}

function emit(context:Context):void {
    if(!context.stack.length) {
        throw new StackUnderflowError(context, "emit");
    }
    context.stdout += String.fromCharCode( context.stack.pop() );
}

function base(context:Context, radix:number):void {
    context.base = radix;
}

let dictionary: Object = {};

function add(text: string, name: string, cmd: Function) {
    dictionary[text] = {
        name: name,
        text: text,
        command: cmd
    }
}

add("type", "type ( str -- )", (context: Context) => {
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

add("BL", "BL ( -- 32 )", (context, Context) => {
    context.stack.push(32);
})

add("emit", "emit ( -- )", (context, Context) => {
    emit(context);
})

add("space", "space ( -- )", (context: Context) => {
    forth("BL emit", context);
})

add(".", ". ( n -- )", (context, Context) => {
    if(!context.stack.length) {
        throw new StackUnderflowError(context, "Empty stack for .");
    }
    let val = context.stack.pop();
    log(context, val.toString(context.base || DEFAULT_NUMBER_BASE) + ' ');
});

add(".s", ".s ( -- )", (context:Context) => {
    log(context, (context.stack.join(' ') || 'Empty') + ' ');
});

add("base", "base ( n -- )", (context:Context) => {
    base(context, context.stack.pop());
});

add("hex", "hex ( -- )", (context: Context) => {
    base(context, 16);
});

add("decimal", "decimal ( -- )", (context: Context) => {
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

add("pick", "pick ( a0 .. an n -- a0 .. an a0 )", (context: Context) => {
    if (!context.stack.length) {
        throw new StackUnderflowError(context);
    }
    let idx = context.stack.pop();
    let pos = (context.stack.length - 1) - idx;
    if (pos < 0) {
        throw new StackUnderflowError(context);
    }
    context.stack.push(context.stack[pos]);
})

add("roll", "roll ( a0 .. an n -- a1 .. an a0 )", (context: Context) => {
    if (!context.stack.length) {
        throw new StackUnderflowError(context);
    }
    let idx = context.stack.pop();
    let pos = (context.stack.length - 1) - idx;
    if (pos < 0) {
        throw new StackUnderflowError(context);
    }
    context.stack.push(context.stack.splice(pos, 1)[0]);
})

add("dup", "dup ( a -- a a )", (context: Context) => {
    forth("0 pick", context);
})

add("over", "over ( a b -- a b a )", (context: Context) => {
    forth("1 pick", context);
})

add("rot", "rot ( a b c -- b c a )", (context) => {
    forth("2 roll", context);
})

add("-rot", "-rot ( a b c -- c a b )", (context) => {
    forth("rot rot", context);
})

add("drop", "Drop", (context: Context) => {
    if (!context.stack.length) {
        throw new StackUnderflowError(context, "Error during drop");
    }
    context.stack.pop();
})

add("2drop", "Two Drop", (context:Context) => {
    forth("drop drop", context);
})

add("+", "+ ( n1 n2 -- n1+n2 )", (context: Context) => {
    context.stack.push(context.stack.pop() + context.stack.pop());
})

add("-", "- ( n1 n2 -- n1-n2 )", (context: Context) => {
    let n2 = context.stack.pop();
    let n1 = context.stack.pop();
    context.stack.push(n1 - n2);
})

add("*", "Times", (context: Context) => {
    context.stack.push(context.stack.pop() * context.stack.pop());
})

add("swap", "Swap", (context: Context) => {
    forth("1 roll", context);
})

add("nip", "nip (a b -- b)", (context: Context) => {
    forth("swap drop", context);
})

add("tuck", "tuck (a b -- b a b)", (context: Context) => {
    forth("swap over", context);
})

let process = function (context, value, index, all): Context {
    if (isNumber(context, value)) { // push numbers on the stack
        context.commandStack.push(`-- ${value}`);
        context.stack.push(parseInt(value, context.base || DEFAULT_NUMBER_BASE));
    } else {
        let entry = dictionary[value];
        if (entry) {
            context.commandStack.push(entry.name);
            context.value = entry.command(context);
        } else {
            throw Error(`Command not found! |${value}|`);
        }
    }
    return context;
}

//= { stack: [], stdout: "", commandStack: [] }
export const forth = (input: string, context: Context): Result => {
    let operands = input.split(/\s+|"(?:\\"|[^"])+"/g).filter((txt)=> txt.length);
    // console.log("operands", operands);
    let result = operands.reduce(process, context);
    // console.log("ending context", context);
    return result;
}

