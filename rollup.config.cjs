const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const json = require('@rollup/plugin-json');


module.exports = {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.js', format: 'esm' },
    { file: 'dist/index.umd.js', format: 'umd', name: 'ReactiveXComponent' }
  ],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      tslib: require.resolve('tslib')
    })
  ]
};
