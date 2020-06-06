interface CallMappings {
   number: number;
   string: string;
}

type CallTypes = keyof CallMappings;

declare function luaFactory(): Promise<{
   HEAPU8: Uint8Array;
   ccall<T extends CallTypes>(
      func: string,
      retType: T,
      argTypes: CallTypes[],
      args: CallMappings[CallTypes][]
   ): CallMappings[T];
}>;

export = luaFactory;
