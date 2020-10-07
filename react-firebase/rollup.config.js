import resolve from '@rollup/plugin-node-resolve';

export default {
  input: './pub/react-firebase/index.js',
  output: {
    dir: './pub/react-firebase/cjs',
    format: 'cjs',
    name: '@protrex/react-firebase'
  },
  external: id => !id.startsWith('.'),
  plugins: [resolve()]
};
