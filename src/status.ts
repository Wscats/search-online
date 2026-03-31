/**
 * Copyright © 1998 - 2020 Tencent. All Rights Reserved.
 * Search Online - Status bar UI management.
 *
 * @author enoyao
 */

import * as vscode from 'vscode';

/**
 * Manages the Search Online status bar item in VS Code.
 * Displays the currently selected search engine.
 */
export class StatusBarUi {
  private static _statusBarItem: vscode.StatusBarItem;

  private static get statusBarItem(): vscode.StatusBarItem {
    if (!StatusBarUi._statusBarItem) {
      StatusBarUi._statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        200,
      );
      StatusBarUi._statusBarItem.show();
    }
    return StatusBarUi._statusBarItem;
  }

  /** Initialize the status bar with the current search engine. */
  static init(): void {
    const config = vscode.workspace.getConfiguration("search-online");
    const engine = config.get<string>("search-engine");
    StatusBarUi.working("Starting...");
    setTimeout(() => {
      if (engine) {
        StatusBarUi.setEngine(engine);
      }
    }, 1000);
  }

  /** Set the status bar to display the given search engine name. */
  static setEngine(engine: string): void {
    StatusBarUi.statusBarItem.text = `$(eye) Search Engine: ${engine}`;
    StatusBarUi.statusBarItem.color = 'inherit';
    StatusBarUi.statusBarItem.command = 'extension.search-engine';
    StatusBarUi.statusBarItem.tooltip = 'Switch Search Engine';
  }

  /** Set the status bar to "working" state. */
  static working(workingMsg: string = "Working on it..."): void {
    StatusBarUi.statusBarItem.text = `$(pulse) ${workingMsg}`;
    StatusBarUi.statusBarItem.tooltip =
      'In case if it takes long time, Show output window and report.';
    StatusBarUi.statusBarItem.command = undefined;
  }

  /** Dispose the status bar item. */
  static dispose(): void {
    StatusBarUi.statusBarItem.dispose();
  }
}