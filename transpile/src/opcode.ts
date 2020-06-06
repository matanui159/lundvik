export enum LuaOpcode {
   MOVE,
   LOADK,
   LOADKX,
   LOADBOOL,
   LOADNIL,
   GETUPVAL,
   GETTABUP,
   GETTABLE,
   SETTABUP,
   SETUPVAL,
   SETTABLE,
   NEWTABLE,
   SELF,
   ADD,
   SUB,
   MUL,
   DIV,
   MOD,
   POW,
   UNM,
   NOT,
   LEN,
   CONCAT,
   JMP,
   EQ,
   LT,
   LE,
   TEST,
   TESTSET,
   CALL,
   TAILCALL,
   RETURN,
   FORLOOP,
   FORPREP,
   TFORCALL,
   TFORLOOP,
   SETLIST,
   CLOSURE,
   VARARG,
   EXTRAARG
}

export interface LuaInstruction {
   value: number;
   op: LuaOpcode;
   opname: string;
   a: number;
   b: number;
   c: number;
   ax: number;
   bx: number;
   sbx: number;
}
