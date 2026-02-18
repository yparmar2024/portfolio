// Helper to traverse the file system based on a path array
export const getDirectory = (fileSystem, path) => {
  let current = fileSystem;
  // Skip 'root' (index 0)
  for (let i = 1; i < path.length; i++) {
    if (current.children && current.children[path[i]]) {
      current = current.children[path[i]];
    } else {
      return null;
    }
  }
  return current;
};

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
    type: 'clear' // Special signal to empty history
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
    } else {
      return { type: 'error', content: 'Error: Cannot list contents here.' };
    }
  },

  cd: (args, { fileSystem, currentPath }) => {
    const target = args[0]; // "folderName"

    // 1. go to root
    if (!target || target === '~') {
      return { newPath: ['root'] };
    }
    
    // 2. go back
    if (target === '..') {
      if (currentPath.length > 1) {
        return { newPath: currentPath.slice(0, -1) };
      }
      return {}; // Do nothing if already at root
    }

    // 3. go into folder
    const currentDir = getDirectory(fileSystem, currentPath);
    
    if (currentDir.children && currentDir.children[target] && currentDir.children[target].type === 'dir') {
      return { newPath: [...currentPath, target] };
    } else {
      return { type: 'error', content: `cd: no such directory: ${target}` };
    }
  },

  cat: (args, { fileSystem, currentPath }) => {
    const fileName = args[0];
    const currentDir = getDirectory(fileSystem, currentPath);

    if (!fileName) {
      return { type: 'error', content: 'usage: cat [filename]' };
    }

    if (currentDir.children && currentDir.children[fileName] && currentDir.children[fileName].type === 'file') {
      return { type: 'response', content: currentDir.children[fileName].content };
    } else {
      return { type: 'error', content: `cat: ${fileName}: No such file` };
    }
  }
};