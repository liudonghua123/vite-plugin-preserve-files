# Vite Plugin preserve Files

A Vite plugin to preserve specified files to the build directory while maintaining their original paths.

## Installation

```bash
npm install vite-plugin-preserve-files --save-dev
```

## Usage

### Vite Configuration

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import preserveFilesPlugin from 'vite-plugin-preserve-files';

export default defineConfig({
  plugins: [
    preserveFilesPlugin({
      fileTypes: [], // Add any file extensions you want to preserve
      include: [],                  // Optional: include specific paths
      exclude: []                   // Optional: exclude specific paths
    })
  ]
});
```

### Options

- `fileTypes` (optional): An array of file extensions to preserve. Defaults to `[]`.
- `include` (optional): An array of paths to include. If empty, all paths are included. Defaults to `[]`.
- `exclude` (optional): An array of paths to exclude. Defaults to `[]`.

### Example

```typescript
import { defineConfig } from 'vite';
import preserveFilesPlugin from 'vite-plugin-preserve-files';

export default defineConfig({
  plugins: [
    preserveFilesPlugin({
      fileTypes: ['.yaml', '.yml', '.json'],
      include: ['src/config'],
      exclude: ['src/config/temp']
    })
  ]
});
```

## License

MIT License. See [LICENSE](LICENSE) for details.
