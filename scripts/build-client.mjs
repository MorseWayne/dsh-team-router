import { build } from 'esbuild';

await build({
  entryPoints: ['src/client.tsx'],
  outfile: 'lib/client.js',
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: 'es2022',
  external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  banner: { js: 'window.__ModuleLoader__.load({id:"dsh-team-router",factory(require){var module={exports:{}};var exports=module.exports;' },
  footer: { js: ';return module.exports;}});' },
  sourcemap: true,
  metafile: true,
}).then((result) => {
  const runtimeImports = Object.values(result.metafile.outputs).flatMap((output) => output.imports);
  if (runtimeImports.some((entry) => !['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'].includes(entry.path))) {
    throw new Error('Client bundle contains a non-baseline external import');
  }
});
