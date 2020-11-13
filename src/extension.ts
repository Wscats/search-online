/**
 * Copyright © 1998 - 2020 Tencent. All Rights Reserved.
 *
 * @author enoyao
 */

import * as vscode from "vscode";
import { StatusBarUi } from './status';
import { openBrowser, getSelectedText, getEngines, Iengine, setEngines, getLanguageCode } from './util';

interface SearchType {
	searchType: string;
};

export function activate(context: vscode.ExtensionContext) {
	const searchOnline = vscode.commands.registerTextEditorCommand("extension.search-online", () => { search({ searchType: "default" }) });
	const switchSearchOnline = vscode.commands.registerTextEditorCommand("extension.search-switch", () => { search({ searchType: "switch" }) });
	const searchTranslate = vscode.commands.registerTextEditorCommand("extension.search-translate", () => { search({ searchType: "translate" }) });
	const searchEngine = vscode.commands.registerCommand("extension.search-engine", engine);

	context.subscriptions.push(searchEngine);
	context.subscriptions.push(switchSearchOnline);
	context.subscriptions.push(searchOnline);
	context.subscriptions.push(searchTranslate);
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
	let traslateIutput: string | undefined;
	let traslateOutput: string | undefined;
	let traslateIntputCode: string = "en";
	let traslateOutputCode: string = "zh-CN";
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
		case "translate":
			engine = 'Google Translate';
			traslateIutput = config.get<string>("Google Translate Input Language");
			traslateOutput = config.get<string>("Google Translate Output Language");
			traslateIntputCode = traslateIutput ? getLanguageCode(traslateIutput) : "en";
			traslateOutputCode = traslateOutput ? getLanguageCode(traslateOutput) : "zh-CN";
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
		const url = uriTemplate?.replace("%SELECTION%", urlQuery).replace("%INPUT_LANGUAGE%", traslateIntputCode).replace("%OUTPUT_LANGUAGE%", traslateOutputCode);
		openBrowser(url);
	} else {
		const uriTemplate: string | undefined = engine && config.get<string>(engine);
		const url = uriTemplate?.replace("%SELECTION%", urlQuery).replace("%INPUT_LANGUAGE%", traslateIntputCode).replace("%OUTPUT_LANGUAGE%", traslateOutputCode);
		url && openBrowser(url);
	}
}
