CC = emcc
AR = emar
RANLIB = emranlib
CFLAGS = -O3
LDFLAGS = $(CFLAGS) \
	-s ALLOW_MEMORY_GROWTH \
	-s MODULARIZE \
	-s NO_NODEJS_CATCH_EXIT \
	-s NO_NODEJS_CATCH_REJECTION \
	-s EXTRA_EXPORTED_RUNTIME_METHODS='[ccall]'

all:
	$(MAKE) -C src liblua.a \
		CC=$(CC) \
		AR='$(AR) rc' \
		RANLIB=$(RANLIB) \
		CFLAGS='$(CFLAGS)'
	$(CC) -o index.js main.c src/liblua.a $(LDFLAGS)

clean:
	$(MAKE) -C src clean
	rm index.js index.wasm

.PHONY: all clean
