/*
  index.ts
*/

import { forth, Context, createEmptyContext } from "./sallied-forth";

let context:Context = createEmptyContext();

let program = `

99 100 * .

" what does it do?" .

`

let result = forth(program, context);

console.log(result);