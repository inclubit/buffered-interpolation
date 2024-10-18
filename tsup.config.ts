import { defineConfig } from 'tsup';
import { globalExternals } from '@fal-works/esbuild-plugin-global-externals';
import GlobalsPlugin from 'esbuild-plugin-globals'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
  onSuccess: 'tsc --emitDeclarationOnly --declaration --declarationMap',
  // external: ['three'],
  esbuildPlugins: [
    // globalExternals({
    //   'THREE': {
    //     varName: 'three',
    //     defaultExport: true,
    //     type: 'esm'
    //   }
    // })
    // GlobalsPlugin({
    //   three: 'THREE',
    // })
    importAsGlobals({
      'three': 'THREE',
    })
  ]
})

function importAsGlobals(mapping) {
  // https://stackoverflow.com/a/3561711/153718
  // const escRe = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  // const filter = new RegExp(
  //   Object.keys(mapping)
  //     .map((mod) => `^${escRe(mod)}$`)
  //     .join("|"),
  // );

  return {
    name: "global-imports",
    setup(build) {
      build.onResolve({ filter: /^three$/ }, (args) => {

        console.log('resolve called', args);
        if (!mapping[args.path]) {
          throw new Error("Unknown global: " + args.path);
        }
        return {
          path: args.path,
          namespace: "external-global",
        };
      });

      build.onLoad(
        {
          filter: /^three$/,
          namespace: "external-global",
        },
        async (args) => {
          console.log('load called', args);
          const global = mapping[args.path];
          return {
            contents: `module.exports = ${global};`,
            loader: "js",
          };
        },
      );
    },
  };
}