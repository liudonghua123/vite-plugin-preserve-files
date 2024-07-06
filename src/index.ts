import { Plugin } from 'vite';
import { resolve, relative, dirname } from 'path';
import { promises as fs } from 'fs';

interface Options {
  fileTypes?: string[];
  include?: string[];
  exclude?: string[];
}

export default function preserveFilesPlugin(options: Options = {}): Plugin {
  const { fileTypes = [], include = [], exclude = [] } = options;
  let config: any;  // Store the resolved Vite config

  async function findFiles(dir: string, fileTypes: string[], include: string[], exclude: string[], outDir: string, filesToCopy: string[]) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      const isOutDir = fullPath.startsWith(resolve(outDir));

      if (entry.isDirectory()) {
        if (!isOutDir) {  // Exclude outDir from search
          await findFiles(fullPath, fileTypes, include, exclude, outDir, filesToCopy);
        }
      } else if (
        fileTypes.some(type => entry.name.endsWith(type)) &&
        (!include.length || include.some(p => fullPath.includes(p))) &&
        !exclude.some(p => fullPath.includes(p)) &&
        !isOutDir  // Exclude files in outDir
      ) {
        filesToCopy.push(fullPath);
      }
    }
  }

  return {
    name: 'vite-plugin-copy-files',
    apply: 'build',
    configResolved(resolvedConfig) {
      // Store the resolved configuration
      config = resolvedConfig;
    },
    async writeBundle() {
      
      // the plugin configResolved/writeBundle will be called twice
      // the config.build.outDir of the latter one will have .temp ended, so we need to check it here
      // Even configured `configFile: false`, it still will be called twice, why?
      // See also https://github.com/dai-shi/waku/pull/341
      if (config.build.outDir.endsWith(".temp")) {
        return;
      }

      const filesToCopy: string[] = [];

      await findFiles(config.root, fileTypes, include, exclude, config.build.outDir, filesToCopy);

      await Promise.all(
        filesToCopy.map(async (file) => {
          const relativePath = relative(config.root, file);
          const destPath = resolve(config.build.outDir, relativePath);
          await fs.mkdir(dirname(destPath), { recursive: true });
          await fs.copyFile(file, destPath);
        })
      );
    },
    configureServer(server) {
      server.watcher.on('add', async (file) => {
        if (fileTypes.some(type => file.endsWith(type)) &&
            (!include.length || include.some(p => file.includes(p))) &&
            !exclude.some(p => file.includes(p))) {
          const relativePath = relative(config.root, file);
          const destPath = resolve(config.build.outDir, relativePath);
          await fs.mkdir(dirname(destPath), { recursive: true });
          await fs.copyFile(file, destPath);
        }
      });
    }
  };
}
