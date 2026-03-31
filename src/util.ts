/**
 * Copyright © 1998 - 2020 Tencent. All Rights Reserved.
 * Search Online - Utility functions.
 *
 * @author enoyao
 */

import * as vscode from 'vscode';
import * as fs from "fs";
import * as os from "os";
import opn from './open';
import { languageConfig } from "./language";
import { browserConfig } from './browser';

export interface Iengine {
  name: string;
  url: string;
}

/**
 * Get the list of available search engines (built-in + user-added).
 */
export const getEngines = (): string[] => {
  const config = vscode.workspace.getConfiguration("search-online");
  const engineAddedConfig = config.get<Iengine[]>("add-search-engine");

  const builtInEngines = [
    "Google", "Bing", "Baidu", "Npm", "Github",
    "Stack Overflow", "Google Translate", "Yahoo",
    "Wiki", "Code Pen", "Code Sandbox",
  ];

  const userEngines = engineAddedConfig
    ?.filter((item: Iengine) => item?.name && item?.url)
    .map((item: Iengine) => item.name) ?? [];

  return [...builtInEngines, ...userEngines, "➕ Add Search Engine"];
};

/**
 * Prompt the user to add a new custom search engine.
 */
export const setEngines = async (): Promise<{ newEngine: Iengine; newEngines: Iengine[] } | undefined> => {
  const config = vscode.workspace.getConfiguration("search-online");
  const engineAddedConfig = config.get<Iengine[]>("add-search-engine");

  const engineName = await vscode.window.showInputBox({
    prompt: "Set your search engine name -> like: Google",
  });
  const engineUrl = await vscode.window.showInputBox({
    prompt: "Set your search engine address -> like: https://www.google.com/search?q=%SELECTION%",
  });

  if (!engineName || !engineUrl) {
    return undefined;
  }

  const newEngine: Iengine = { name: engineName, url: engineUrl };
  const newEngines = engineAddedConfig ? [newEngine, ...engineAddedConfig] : [newEngine];
  config.update("add-search-engine", newEngines);
  return { newEngine, newEngines };
};

// ── Browser Utilities ────────────────────────────────────────────────────────

/** Standardize a browser name to its platform-specific executable name. */
export const standardizedBrowserName = (name: string = ''): string => {
  const normalizedName = name.toLowerCase();
  const browser = browserConfig.browsers.find(
    item => item.acceptName.indexOf(normalizedName) !== -1,
  );
  return browser ? browser.standardName : '';
};

/** Get the default browser from VS Code configuration. */
export const defaultBrowser = (): string => {
  const config = vscode.workspace.getConfiguration(browserConfig.app);
  return config ? config.default : '';
};

/** Open a path in the specified browser. */
export const open = (targetPath: string, browser: string | string[]): void => {
  opn(targetPath, { app: browser }).catch((_err: unknown) => {
    vscode.window.showErrorMessage(
      `Open browser failed!! Please check if you have installed the browser ${String(browser)} correctly!`,
    );
  });
};

/** Open a path in the user's default browser. */
export const openBrowser = (targetPath: string): void => {
  const browser = standardizedBrowserName(defaultBrowser());
  open(targetPath, browser);
};

// ── Docker / WSL Detection ───────────────────────────────────────────────────

let isDockerCached: boolean | undefined;

/** Detect whether the current environment is running inside a Docker container. */
export const docker = (): boolean => {
  if (isDockerCached !== undefined) {
    return isDockerCached;
  }

  const hasDockerEnv = (): boolean => {
    try {
      fs.statSync('/.dockerenv');
      return true;
    } catch {
      return false;
    }
  };

  const hasDockerCGroup = (): boolean => {
    try {
      return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
    } catch {
      return false;
    }
  };

  isDockerCached = hasDockerEnv() || hasDockerCGroup();
  return isDockerCached;
};

/** Detect whether the current environment is WSL. */
const detectWsl = (): boolean => {
  if (process.platform !== 'linux') {
    return false;
  }
  if (os.release().toLowerCase().includes('microsoft')) {
    return !docker();
  }
  try {
    return fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')
      ? !docker()
      : false;
  } catch {
    return false;
  }
};

export const wsl: boolean | (() => boolean) = process.env.__IS_WSL_TEST__
  ? detectWsl
  : detectWsl();

// ── Editor Utilities ─────────────────────────────────────────────────────────

/** Get the currently selected text in the active editor. */
export const getSelectedText = (): string => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return "";
  }

  const documentText = editor.document.getText();
  const activeSelection = editor.selection;

  if (activeSelection.isEmpty) {
    return "";
  }

  const selectStartOffset = editor.document.offsetAt(activeSelection.start);
  const selectEndOffset = editor.document.offsetAt(activeSelection.end);

  let selectedText = documentText.slice(selectStartOffset, selectEndOffset).trim();
  selectedText = selectedText.replace(/\s\s+/g, " ");
  return selectedText;
};

/** Get the language code for a given language key (e.g., "English/英语" → "en"). */
export const getLanguageCode = (languageKey: string): string => {
  return languageConfig[languageKey] || languageKey;
};