import * as vscode from 'vscode';

export class StatusBarUi {
    private static _statusBarItem: vscode.StatusBarItem;
    private static get statusBarItem() {
        if (!StatusBarUi._statusBarItem) {
            StatusBarUi._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
            this.statusBarItem.show();
        }
        return StatusBarUi._statusBarItem;
    }

    static init() {
        let config = vscode.workspace.getConfiguration("search-online");
        let engine = config.get<string>("search-engine");
        StatusBarUi.working("Starting...");
        setTimeout(function () {
            engine && StatusBarUi.setEngine(engine);
            config.set("search-engine", engine);
        }, 1000);
    }

    static setEngine(engine: string) {
        StatusBarUi.statusBarItem.text = `$(eye) Search Engine: ${engine}`;
        StatusBarUi.statusBarItem.color = 'inherit';
        StatusBarUi.statusBarItem.command = 'extension.search-engine';
        StatusBarUi.statusBarItem.tooltip = 'Switch Search Engine';
    }


    static working(workingMsg: string = "Working on it...") {
        StatusBarUi.statusBarItem.text = `$(pulse) ${workingMsg}`;
        StatusBarUi.statusBarItem.tooltip = 'In case if it takes long time, Show output window and report.';
        StatusBarUi.statusBarItem.command = undefined;
    }

    static dispose() {
        StatusBarUi.statusBarItem.dispose();
    }
}