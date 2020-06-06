import compileLua from './compile';
import undumpLua from './undump';

compileLua('test.lua', `
local x = 0
local y = x + 1
print(y)
`).then((buffer) => {
   // eslint-disable-next-line no-console
   console.log(undumpLua(buffer));
});
