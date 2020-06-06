#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include "src/lua.h"
#include "src/lauxlib.h"

static struct {
   size_t size;
   size_t capacity;
   void* data;
} buffer;

static int luaWriter(lua_State* L, const void* data, size_t size, void* user) {
   size_t newSize = buffer.size + size;
   size_t newCapacity = buffer.capacity;
   while (newSize > newCapacity) {
      newCapacity *= 2;
   }
   if (buffer.capacity != newCapacity) {
      buffer.data = realloc(buffer.data, newCapacity);
      buffer.capacity = newCapacity;
   }
   memcpy(buffer.data + buffer.size, data, size);
   buffer.size = newSize;
   return 0;
}

EMSCRIPTEN_KEEPALIVE const void* compileLua(const char* name, const char* code) {
   lua_State* L = luaL_newstate();
   if (luaL_loadbuffer(L, code, strlen(code), name)) {
      EM_ASM(
         throw new Error(UTF8ToString($0)),
         lua_tostring(L, -1)
      );
   }

   buffer.capacity = 1024;
   buffer.data = malloc(buffer.capacity);
   lua_dump(L, luaWriter, NULL);
   return buffer.data;
}
