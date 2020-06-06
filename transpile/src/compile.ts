import luaFactory from '../lua';

export default async function compileLua(
   name: string,
   code: string
): Promise<Uint8Array> {
   const lua = await luaFactory();
   const ptr = lua.ccall(
      'compileLua',
      'number',
      ['string', 'string'],
      [`@${name}`, code]
   );
   return lua.HEAPU8.subarray(ptr);
}
