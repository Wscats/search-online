/**
 * Copyright © 1998 - 2020 Tencent. All Rights Reserved.
 * Search Online - VSCode Extension entry point.
 * Supports online search, translation, and offline dictionary lookup.
 *
 * @author enoyao
 */

import * as vscode from "vscode";
import { StatusBarUi } from './status';
import { openBrowser, getSelectedText, getEngines, Iengine, setEngines, getLanguageCode } from './util';
import { workspace, languages, window, commands, ExtensionContext, Disposable, StatusBarAlignment } from 'vscode';
import ContentProvider, { encodeLocation } from './offline/整文件翻译';
import * as Model from './offline/翻译/数据类型';
import * as DictLookup from './offline/查词';

interface SearchType {
  searchType: string;
}

/**
 * Called when the extension is activated.
 * Registers search, translate, and engine-switch commands.
 */
export function activate(context: vscode.ExtensionContext): void {
  const searchOnline = vscode.commands.registerTextEditorCommand(
    "extension.search-online",
    () => { search({ searchType: "default" }); },
  );
  const switchSearchOnline = vscode.commands.registerTextEditorCommand(
    "extension.search-switch",
    () => { search({ searchType: "switch" }); },
  );
  const searchTranslate = vscode.commands.registerTextEditorCommand(
    "extension.search-translate",
    () => { search({ searchType: "translate" }); },
  );
  const searchEngine = vscode.commands.registerCommand(
    "extension.search-engine",
    engine,
  );

  const provider = new ContentProvider();

  const providerRegistration = Disposable.from(
    workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider),
  );

  const translateCommand = commands.registerTextEditorCommand(
    'editor.批量翻译标识符',
    (editor) => {
      const uri = encodeLocation(editor.document.uri, editor.selection.active);
      return workspace.openTextDocument(uri).then(doc =>
        window.showTextDocument(doc, (editor.viewColumn ?? 1) + 1),
      );
    },
  );

  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  statusBarItem.command = 'extension.翻译选中文本';

  context.subscriptions.push(
    provider,
    translateCommand,
    providerRegistration,
    statusBarItem,
  );

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(() => updateStatusBar(statusBarItem)),
    window.onDidChangeTextEditorSelection(() => updateStatusBar(statusBarItem)),
    window.onDidChangeTextEditorViewColumn(() => updateStatusBar(statusBarItem)),
    workspace.onDidOpenTextDocument(() => updateStatusBar(statusBarItem)),
    workspace.onDidCloseTextDocument(() => updateStatusBar(statusBarItem)),
  );

  context.subscriptions.push(
    commands.registerCommand('extension.翻译选中文本', async () => {
      const text = getSelectedTextFromEditor();
      if (text) {
        search({ searchType: "translate" });
        const result = DictLookup.取释义(text);
        const display = formatFieldInfo(result);
        window.showInformationMessage(truncateText(display, 1000));
      }
    }),
  );

  updateStatusBar(statusBarItem);

  context.subscriptions.push(searchEngine);
  context.subscriptions.push(switchSearchOnline);
  context.subscriptions.push(searchOnline);
  context.subscriptions.push(searchTranslate);
  StatusBarUi.init();
}

/** Called when the extension is deactivated. */
export function deactivate(): void {
  StatusBarUi.dispose();
}

/** Show a quick pick to switch the search engine. */
async function engine(): Promise<void> {
  const selectedEngine = await vscode.window.showQuickPick(getEngines());
  if (selectedEngine === "➕ Add Search Engine") {
    setEngines();
  } else {
    const config = vscode.workspace.getConfiguration("search-online");
    config.update("search-engine", selectedEngine);
    if (selectedEngine) {
      StatusBarUi.setEngine(selectedEngine);
    }
  }
}

/** Perform a search or translation based on the search type. */
async function search({ searchType }: SearchType): Promise<void> {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return;
  }

  const urlQuery = encodeURI(selectedText);
  const config = vscode.workspace.getConfiguration("search-online");

  let engineName: string | undefined;
  let engineAddedConfig: Iengine[] | undefined;
  let translateInputCode: string = "en";
  let translateOutputCode: string = "zh-CN";

  switch (searchType) {
    case "switch": {
      engineName = await vscode.window.showQuickPick(getEngines());
      if (engineName === "➕ Add Search Engine") {
        const newEngineConfig = await setEngines();
        engineName = newEngineConfig?.newEngine.name;
        engineAddedConfig = newEngineConfig?.newEngines;
      }
      if (!engineName) {
        return;
      }
      break;
    }
    case "translate": {
      engineName = 'Google Translate';
      const inputLang = config.get<string>("Google Translate Input Language");
      const outputLang = config.get<string>("Google Translate Output Language");
      translateInputCode = inputLang ? getLanguageCode(inputLang) : "en";
      translateOutputCode = outputLang ? getLanguageCode(outputLang) : "zh-CN";
      break;
    }
    default:
      engineName = config.get<string>("search-engine");
      break;
  }

  if (!engineAddedConfig) {
    engineAddedConfig = config.get<Iengine[]>("add-search-engine");
  }

  const matchedEngine = engineAddedConfig?.find(
    (item: Iengine) => item.name === engineName,
  );

  if (matchedEngine) {
    const url = matchedEngine.url
      ?.replace("%SELECTION%", urlQuery)
      .replace("%INPUT_LANGUAGE%", translateInputCode)
      .replace("%OUTPUT_LANGUAGE%", translateOutputCode);
    if (url) {
      openBrowser(url);
    }
  } else {
    const uriTemplate: string | undefined = engineName
      ? config.get<string>(engineName)
      : undefined;
    const url = uriTemplate
      ?.replace("%SELECTION%", urlQuery)
      .replace("%INPUT_LANGUAGE%", translateInputCode)
      .replace("%OUTPUT_LANGUAGE%", translateOutputCode);
    if (url) {
      openBrowser(url);
    }
  }
}

// ── Offline Dictionary Helpers ───────────────────────────────────────────────

/** Update the status bar with the translation of the selected text. */
function updateStatusBar(statusBarItem: vscode.StatusBarItem): void {
  const config = vscode.workspace.getConfiguration("search-online");
  const isShowStatusBar = config.get<boolean>("show-status-bar");
  if (!isShowStatusBar) {
    statusBarItem.hide();
    return;
  }

  const text = getSelectedTextFromEditor();
  if (text) {
    const result = DictLookup.取释义(text);
    statusBarItem.text = "$(megaphone) " + truncateText(formatBriefInfo(result), 30);
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}

/** Get the selected text from the active editor. */
function getSelectedTextFromEditor(): string {
  const editor = window.activeTextEditor;
  if (!editor) {
    return "";
  }
  const selection = editor.selection;
  return editor.document.getText(selection);
}

/** Truncate a string to a maximum length, appending "..." if truncated. */
function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength
    ? text.substring(0, maxLength - 1) + "..."
    : text;
}

/** Format brief info for a dictionary lookup result. */
function formatBriefInfo(result: Model.字段释义): string {
  if (!result.释义) {
    return "查无结果: " + result.原字段;
  }
  if (result.各词.length === 1 && result.各词[0]) {
    return formatSingleEntry(result.各词[0], false);
  }
  return result.释义;
}

/** Format detailed field info for a dictionary lookup result. */
function formatFieldInfo(result: Model.字段释义): string {
  if (result.各词.length === 1 && result.各词[0]) {
    return formatSingleEntry(result.各词[0], true);
  }

  let translation = "";
  for (const entry of result.各词) {
    translation += formatSingleEntry(entry, true, false);
  }
  return translation;
}

/**
 * Format a single dictionary entry.
 *
 * @param entry - The dictionary entry.
 * @param showOriginal - Whether to show the original word.
 * @param showForms - Whether to show word forms (conjugations, etc.).
 */
function formatSingleEntry(
  entry: Model.单词条,
  showOriginal: boolean = false,
  showForms: boolean = true,
): string {
  let display = showOriginal ? "【" + entry.词 + "】" : "";

  if (entry.释义) {
    display += " " + entry.释义.split('\\n').join(" ");
  }

  if (showForms && entry.词形.length > 0) {
    let formsDisplay = "";
    for (const form of entry.词形) {
      formsDisplay += form.类型 + ": " + form.变化 + "; ";
    }
    display += "  " + formsDisplay;
  }

  return display;
}