import * as vscode from "vscode";
import { StatusBarUi } from './status';
import { openBrowser, getSelectedText, getEngines, Iengine, setEngines } from './util';

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
	const engine = await vscode.window.showQuickPick(getEngines());
	if (engine === "➕ Add Search Engine") {
		setEngines();
	} else {
		const config = vscode.workspace.getConfiguration("search-online");
		config.update("search-engine", engine);
		engine && StatusBarUi.setEngine(engine);
	}
}

async function search({ searchType }: SearchType) {
	const selectedText = getSelectedText();
	if (!selectedText) {
		return;
	}
	const urlQuery = encodeURI(selectedText);
	const config = vscode.workspace.getConfiguration("search-online");
	let engine: string | undefined;
	let engineAddedConfig: Iengine[] | undefined;
	switch (searchType) {
		case "switch":
			engine = await vscode.window.showQuickPick(getEngines());
			if (engine === "➕ Add Search Engine") {
				const newEngineConfig = await setEngines();
				engine = newEngineConfig?.newEngine.name;
				engineAddedConfig = newEngineConfig?.newEngines;
			}
			if (!engine) {
				return;
			}
			break;
		default:
			engine = config.get<string>("search-engine");
			break;
	};
	if (!engineAddedConfig) {
		engineAddedConfig = config.get<Iengine[]>("add-search-engine");
	}
	const engineAddedFilter = engineAddedConfig?.filter((engineItem: Iengine) => {
		if (engineItem.name === engine) {
			return engineItem;
		}
	})
	if (engineAddedFilter && engineAddedFilter?.length > 0) {
		const uriTemplate = engineAddedFilter[0].url;
		const url = uriTemplate?.replace("%SELECTION%", urlQuery);
		openBrowser(url);
	} else {
		const uriTemplate: string | undefined = engine && config.get<string>(engine);
		const url = uriTemplate?.replace("%SELECTION%", urlQuery);
		url && openBrowser(url);
	}
}
