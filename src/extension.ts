import * as vscode from "vscode";
import { StatusBarUi } from './status';
import { openBrowser, getSelectedText, engines } from './util';

interface SearchType {
	searchType: string;
};

export function activate(context: vscode.ExtensionContext) {
	const searchOnline = vscode.commands.registerTextEditorCommand("extension.search-online", () => { search({ searchType: "default" }) });
	const switchSearchOnline = vscode.commands.registerTextEditorCommand("extension.search-switch", () => { search({ searchType: "switch" }) });
	const searchEngine = vscode.commands.registerCommand("extension.search-engine", engine);

	context.subscriptions.push(searchEngine);
	context.subscriptions.push(switchSearchOnline);
	context.subscriptions.push(searchOnline);
	StatusBarUi.init();
}

export function deactivate() { StatusBarUi.dispose() };

async function engine() {
	const engine = await vscode.window.showQuickPick(engines);
	const config = vscode.workspace.getConfiguration("search-online");
	config.update("search-engine", engine);
	engine && StatusBarUi.setEngine(engine);
}

async function search({ searchType }: SearchType) {
	const selectedText = getSelectedText();
	if (!selectedText) {
		return;
	}
	const urlQuery = encodeURI(selectedText);
	const config = vscode.workspace.getConfiguration("search-online");
	let engine;
	switch (searchType) {
		case "switch":
			engine = await vscode.window.showQuickPick(engines);
			break;
		default:
			engine = config.get<string>("search-engine");
			break;
	};
	const uriTemplate: string | undefined = engine && config.get(engine);
	const url = uriTemplate?.replace("%SELECTION%", urlQuery);
	url && openBrowser(url);
}
