/**
 * Detect project dependencies using simplified sniff functionality
 */
export declare function detectProjectDependencies(configPath?: string): Promise<string[]>;
// Simple semver range implementation for Node.js compatibility
declare class SemverRange {
  constructor(range: string);
  toString(): string;
}
// Simple path utility for Node.js
declare class SimplePath {
  string: string;
  constructor(path: string);
  isDirectory(): boolean;
  read(): string;
  *ls(): Generator<[SimplePath, { name: string, isFile: boolean, isSymlink: boolean, isDirectory: boolean }]>;
}
