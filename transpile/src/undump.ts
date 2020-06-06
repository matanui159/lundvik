/* eslint-disable no-param-reassign, no-bitwise */

import { LuaInstruction, LuaOpcode } from "./opcode";

interface LoadState {
   buffer: Uint8Array;
   index: number;
}

export type LuaValue = undefined | boolean | number | string;

export interface LuaUpvalue {
   name?: string;
   index: number;
   stack: boolean;
}

export interface LuaVarInfo {
   name?: string;
   start: number;
   end: number;
}

export interface LuaFunction {
   args: number;
   vararg: boolean;
   maxStack: number;
   code: LuaInstruction[];
   constants: LuaValue[];
   children: LuaFunction[];
   upvalues: LuaUpvalue[];
   lineInfo: number[];
   varInfo: LuaVarInfo[];
}

function loadBlock(state: LoadState, size: number): Uint8Array {
   const oldIndex = state.index;
   // console.log(state.index, state.buffer.byteLength);
   state.index += size;
   return state.buffer.subarray(oldIndex, state.index);
}

function loadByte(state: LoadState): number {
   return loadBlock(state, 1)[0];
}

function loadInt(state: LoadState): number {
   const data = new Uint8Array(loadBlock(state, 4));
   return new Uint32Array(data.buffer)[0];
}

function loadNumber(state: LoadState): number {
   const data = new Uint8Array(loadBlock(state, 8));
   return new Float64Array(data.buffer)[0];
}

function loadBoolean(state: LoadState): boolean {
   return loadByte(state) !== 0;
}

function loadString(state: LoadState): string | undefined {
   const size = loadInt(state);
   if (size === 0) {
      return undefined;
   }
   const data = loadBlock(state, size - 1);
   loadByte(state); // null terminator
   return String.fromCharCode(...data);
}

function loadArray<T>(state: LoadState, loadItem: (state: LoadState) => T): T[] {
   const count = loadInt(state);
   const array: T[] = [];
   for (let i = 0; i < count; i += 1) {
      array.push(loadItem(state));
   }
   return array;
}

function loadCode(state: LoadState, func: LuaFunction): void {
   func.code = loadArray(state, () => {
      const value = loadInt(state);
      const op = value & 0x3F;
      const ax = value >>> 6;
      const bx = value >>> 14;
      return {
         value,
         op: op as LuaOpcode,
         opname: LuaOpcode[op],
         a: ax & 0xFF,
         b: value >>> 23,
         c: bx & 0x1FF,
         ax,
         bx,
         sbx: bx - 0x1FFFF
      };
   });
}

function loadConstants(state: LoadState, func: LuaFunction): void {
   func.constants = loadArray(state, () => {
      const type = loadByte(state);
      switch (type) {
         case 0: // LUA_TNIL
            return undefined;
         case 1: // LUA_TBOOLEAN
            return loadBoolean(state);
         case 3: // LUA_TNUMBER
            return loadNumber(state);
         case 4: // LUA_TSTRING
            return loadString(state);
         default:
            throw new Error(`Unknown lua type: ${type}`);
      }
   });

   // eslint-disable-next-line @typescript-eslint/no-use-before-define
   func.children = loadArray(state, loadFunction);
}

function loadUpvalues(state: LoadState, func: LuaFunction): void {
   func.upvalues = loadArray(state, () => ({
      stack: loadBoolean(state),
      index: loadByte(state),
   }));
}

function loadDebug(state: LoadState, func: LuaFunction): void {
   loadString(state); // source
   func.lineInfo = loadArray(state, loadInt);
   func.varInfo = loadArray(state, () => ({
      name: loadString(state),
      start: loadInt(state),
      end: loadInt(state),
   }));

   const upvalueNames = loadArray(state, loadString);
   upvalueNames.forEach((name, index) => {
      func.upvalues[index].name = name;
   });
}

function loadFunction(state: LoadState): LuaFunction {
   const func: LuaFunction = {
      args: 0,
      vararg: false,
      maxStack: 0,
      code: [],
      constants: [],
      children: [],
      upvalues: [],

      lineInfo: [],
      varInfo: [],
   };

   loadInt(state); // linedefined
   loadInt(state); // lastlinedefined
   func.args = loadByte(state);
   func.vararg = loadBoolean(state);
   func.maxStack = loadByte(state);
   loadCode(state, func);
   loadConstants(state, func);
   loadUpvalues(state, func);
   loadDebug(state, func);
   return func;
}

export default function undumpLua(buffer: Uint8Array): LuaFunction {
   return loadFunction({
      buffer,
      index: 18, // LUAC_HEADERSIZE
   });
}
