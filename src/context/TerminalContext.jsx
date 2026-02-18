/**
 * Terminal context — virtual file-system state and command execution.
 *
 * Provides a Unix-like terminal emulator backed by a static JSON file-system
 * (`data/fileSystem.json`). The file-system is pre-processed at module load to
 * inject dynamic values (e.g. `[LATEST_VERSION]` → current version string).
 *
 * Consumers receive:
 * - `history` — ordered array of output lines tagged by type
 *   ('system' | 'command' | 'response' | 'error')
 * - `path`    — current working directory as a path-segment array
 * - `executeCommand(cmdString)` — parse and run a command string, updating history
 *
 * @module TerminalContext
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import patchNotes from '../data/patchNotes.json';
import rawFileSystem from '../data/fileSystem.json';
import { COMMANDS } from '../utils/terminalCommands';

const TerminalContext = createContext();

export const useTerminal = () => useContext(TerminalContext);

const latestVersion = patchNotes.length > 0 ? patchNotes[0].version : "1.0.0";

/**
 * Recursively walks the raw file-system tree and replaces placeholder tokens
 * with runtime values. Currently substitutes `[LATEST_VERSION]` in file content.
 *
 * @param {Object} node - A file-system node (type 'file' | 'dir')
 * @returns {Object} Processed node with resolved content strings
 */
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
    { type: 'system', content: `Welcome to CareerOS v${latestVersion}` },
    { type: 'system', content: "Type 'help' to see available commands." }
  ]);

  const [path, setPath] = useState(['root']);

  const executeCommand = useCallback((cmdString) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    const displayPath = path.length === 1 ? '~' : `~/${path.slice(1).join('/')}`;
    setHistory(prev => [...prev, { type: 'command', path: displayPath, content: trimmed }]);

    const [cmd, ...args] = trimmed.split(' ');
    const commandName = cmd.toLowerCase();

    if (COMMANDS[commandName]) {
      const result = COMMANDS[commandName](args, {
        fileSystem: INITIAL_FILE_SYSTEM,
        currentPath: path
      });

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
