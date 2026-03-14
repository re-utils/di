import { cd, exec, LIB } from './utils.js';

cd(LIB);
await exec`npm publish --access=public --otp=${prompt('OTP:')}`;
