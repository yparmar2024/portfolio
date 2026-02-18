import React, { createContext, useContext, useState, useCallback } from 'react';
import patchNotes from '../data/patchNotes.json';
import rawFileSystem from '../data/fileSystem.json';
import { COMMANDS } from '../utils/terminalCommands'; // Import the logic

const TerminalContext = createContext();

export const useTerminal = () => useContext(TerminalContext);

const latestVersion = patchNotes.length > 0 ? patchNotes[0].version : "1.0.0";

// --- Helper to inject variables (same as before) ---
const processFileSystem = (node) => {
  if (node.type === 'file') {
    return {
      ...node,
      content: node.content.replace('[LATEST_VERSION]', `v${latestVersion}`)
    };
  }
  if (node.type === 'dir') {
    const newChildren = {};
    Object.keys(node.children).forEach(key => {
      newChildren[key] = processFileSystem(node.children[key]);
    });
    return { ...node, children: newChildren };
  }
  return node;
};

const INITIAL_FILE_SYSTEM = processFileSystem(rawFileSystem.root);

export const TerminalProvider = ({ children }) => {
  const [history, setHistory] = useState([
    { type: 'system', content: `Welcome to YashOS v${latestVersion}` },
    { type: 'system', content: "Type 'help' to see available commands." }
  ]);
  
  const [path, setPath] = useState(['root']);

  const executeCommand = useCallback((cmdString) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    // 1. Add the command itself to history
    const displayPath = path.length === 1 ? '~' : `~/${path.slice(1).join('/')}`;
    setHistory(prev => [...prev, { type: 'command', path: displayPath, content: trimmed }]);

    // 2. Parse command
    const [cmd, ...args] = trimmed.split(' ');
    const commandName = cmd.toLowerCase();

    // 3. Execute logic from external file
    if (COMMANDS[commandName]) {
      const result = COMMANDS[commandName](args, { 
        fileSystem: INITIAL_FILE_SYSTEM, 
        currentPath: path 
      });

      // Handle results
      if (result.type === 'clear') {
        setHistory([]);
      } else {
        if (result.type && result.content) {
          setHistory(prev => [...prev, { type: result.type, content: result.content }]);
        }
        if (result.newPath) {
          setPath(result.newPath);
        }
      }
    } else {
      setHistory(prev => [...prev, { type: 'error', content: `Unknown command: ${commandName}` }]);
    }
  }, [path]);

  return (
    <TerminalContext.Provider value={{ history, path, executeCommand }}>
      {children}
    </TerminalContext.Provider>
  );
};