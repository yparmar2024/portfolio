/**
 * Virtual terminal command implementations.
 *
 * Each command is a pure function that accepts `(args, context)` and returns
 * a result descriptor consumed by `TerminalContext.executeCommand`.
 *
 * Result shapes:
 * - `{ type: 'response', content: string }` — normal output
 * - `{ type: 'error',    content: string }` — red error line
 * - `{ type: 'clear' }`                     — wipe history
 * - `{ newPath: string[] }`                 — change working directory
 * - `{ type, content, newPath }`            — combined output + path update
 *
 * @module terminalCommands
 */

/**
 * Traverses the in-memory file-system tree along a path array, returning the
 * node at that path or `null` if any segment does not exist.
 *
 * The first segment in `path` is always `'root'` and is used as the starting
 * node, so traversal begins from index 1.
 *
 * @param {Object}   fileSystem - Root file-system node from TerminalContext
 * @param {string[]} path       - Array of path segments (e.g. ['root', 'projects'])
 * @returns {Object|null} The target node, or `null` if the path is invalid
 */
export const getDirectory = (fileSystem, path) => {
  let current = fileSystem;
  for (let i = 1; i < path.length; i++) {
    if (current.children && current.children[path[i]]) {
      current = current.children[path[i]];
    } else {
      return null;
    }
  }
  return current;
};

/** @type {Record<string, (args: string[], context: Object) => Object>} */
export const COMMANDS = {
  help: () => ({
    type: 'response',
    content: 'Available commands:\n  ls\t\tList directory contents\n  cd [dir]\tChange directory\n  cat [file]\tRead file content\n  clear\t\tClear terminal\n  whoami\tCurrent user info'
  }),

  whoami: () => ({
    type: 'response',
    content: 'admin'
  }),

  clear: () => ({
    type: 'clear'
  }),

  pwd: (args, { currentPath }) => {
    if (currentPath.length === 1) {
      return { type: 'response', content: '/' };
    }
    return { type: 'response', content: `/${currentPath.slice(1).join('/')}` };
  },

  ls: (args, { fileSystem, currentPath }) => {
    const currentDir = getDirectory(fileSystem, currentPath);
    if (currentDir && currentDir.children) {
      const files = Object.keys(currentDir.children).map(name => {
        const isDir = currentDir.children[name].type === 'dir';
        return isDir ? `${name}/` : name;
      });
      return { type: 'response', content: files.join('     ') };
    }
    return { type: 'error', content: 'Error: Cannot list contents here.' };
  },

  cd: (args, { fileSystem, currentPath }) => {
    const target = args[0];

    if (!target || target === '~') {
      return { newPath: ['root'] };
    }

    if (target === '..') {
      if (currentPath.length > 1) {
        return { newPath: currentPath.slice(0, -1) };
      }
      return {};
    }

    const currentDir = getDirectory(fileSystem, currentPath);
    if (currentDir.children && currentDir.children[target] && currentDir.children[target].type === 'dir') {
      return { newPath: [...currentPath, target] };
    }
    return { type: 'error', content: `cd: no such directory: ${target}` };
  },

  cat: (args, { fileSystem, currentPath }) => {
    const fileName = args[0];
    if (!fileName) {
      return { type: 'error', content: 'usage: cat [filename]' };
    }

    const currentDir = getDirectory(fileSystem, currentPath);
    if (currentDir.children && currentDir.children[fileName] && currentDir.children[fileName].type === 'file') {
      return { type: 'response', content: currentDir.children[fileName].content };
    }
    return { type: 'error', content: `cat: ${fileName}: No such file` };
  }
};
