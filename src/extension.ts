import * as vscode from "vscode";
import { StatusBarUi } from './status';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerTextEditorCommand(
		"extension.searchOnline", search
	);
	let compileHeroOn = vscode.commands.registerCommand(
		"compile-hero.compileHeroOn",
		() => {
			let config = vscode.workspace.getConfiguration("compile-hero");
			config.update("disable-compile-files-on-did-save-code", true);
			StatusBarUi.notWatching();
		}
	);

	let compileHeroOff = vscode.commands.registerCommand(
		"compile-hero.compileHeroOff",
		() => {
			let config = vscode.workspace.getConfiguration("compile-hero");
			config.update("disable-compile-files-on-did-save-code", false);
			StatusBarUi.watching();
		}
	);

	context.subscriptions.push(compileHeroOn);
	context.subscriptions.push(compileHeroOff);
	console.log(StatusBarUi);
	context.subscriptions.push(disposable);
	StatusBarUi.init("true");
}

export function deactivate() { StatusBarUi.dispose(); }

async function search() {
	const selectedText = getSelectedText();
	if (!selectedText) {
		return;
	}
	const uriText = encodeURI(selectedText);
	const searchOnlineConfiguration = vscode.workspace.getConfiguration("searchOnline");

	const engine = await vscode.window.showQuickPick(["google", "baidu", "bing", "npm", "github", "pypi"]);
	const queryTemplate: string | undefined = engine && searchOnlineConfiguration.get(engine);
	const query = queryTemplate?.replace("%SELECTION%", uriText);
	console.log(engine);
	query && vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(query));
}

function getSelectedText() {
	const documentText = vscode.window.activeTextEditor?.document.getText();
	if (!documentText) {
		return "";
	}
	const activeSelection = vscode.window.activeTextEditor?.selection;
	if (activeSelection?.isEmpty) {
		return "";
	}
	const selStartoffset = vscode.window.activeTextEditor?.document.offsetAt(
		activeSelection?.start as vscode.Position
	);
	const selEndOffset = vscode.window.activeTextEditor?.document.offsetAt(
		activeSelection?.end as vscode.Position
	);

	let selectedText = documentText.slice(selStartoffset, selEndOffset).trim();
	selectedText = selectedText.replace(/\s\s+/g, " ");
	return selectedText;
}
