/**
 * Copyright © 1998 - 2020 Tencent. All Rights Reserved.
 *
 * @author enoyao
 */

import * as vscode from "vscode";
import { StatusBarUi } from './status';
import { openBrowser, getSelectedText, getEngines, Iengine, setEngines, getLanguageCode } from './util';
import { workspace, languages, window, commands, ExtensionContext, Disposable, StatusBarAlignment } from 'vscode';
import 内容提供器, { encodeLocation } from './offline/整文件翻译';
import * as 模型 from './offline/翻译/数据类型'
import * as 查词 from './offline/查词';

interface SearchType {
	searchType: string;
};

export function activate(context: vscode.ExtensionContext) {
	const searchOnline = vscode.commands.registerTextEditorCommand("extension.search-online", () => { search({ searchType: "default" }) });
	const switchSearchOnline = vscode.commands.registerTextEditorCommand("extension.search-switch", () => { search({ searchType: "switch" }) });
	const searchTranslate = vscode.commands.registerTextEditorCommand("extension.search-translate", () => { search({ searchType: "translate" }) });
	const searchEngine = vscode.commands.registerCommand("extension.search-engine", engine);

	const 提供器 = new 内容提供器();

	const 提供器注册 = Disposable.from(
		workspace.registerTextDocumentContentProvider(内容提供器.scheme, 提供器)
	);

	const 命令注册 = commands.registerTextEditorCommand('editor.批量翻译标识符', 编辑器 => {
		const uri = encodeLocation(编辑器.document.uri, 编辑器.selection.active);
		// @ts-ignore
		return workspace.openTextDocument(uri).then(代码文件 => window.showTextDocument(代码文件, 编辑器.viewColumn + 1));
	});

	const 状态框 = window.createStatusBarItem(StatusBarAlignment.Right, 100);
	状态框.command = 'extension.翻译选中文本';
	context.subscriptions.push(
		提供器,
		命令注册,
		提供器注册,
		状态框
	);

	context.subscriptions.push(window.onDidChangeActiveTextEditor(e => 更新状态栏(状态框)));
	context.subscriptions.push(window.onDidChangeTextEditorSelection(e => 更新状态栏(状态框)));
	context.subscriptions.push(window.onDidChangeTextEditorViewColumn(e => 更新状态栏(状态框)));
	context.subscriptions.push(workspace.onDidOpenTextDocument(e => 更新状态栏(状态框)));
	context.subscriptions.push(workspace.onDidCloseTextDocument(e => 更新状态栏(状态框)));

	context.subscriptions.push(commands.registerCommand('extension.翻译选中文本', async () => {
		// TODO: 避免重复查询(状态框查询一次即可?)
		let 文本 = 取选中文本();
		if (文本) {
			// const translateEngines = await vscode.window.showQuickPick(["Google Translate", "Baidu Translate"]);
			search({ searchType: "translate" });
			let 显示 = 显示字段信息(查询词条(文本));
			window.showInformationMessage(显示词条(显示, 1000));
		}
	}));

	更新状态栏(状态框);

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

// @ts-ignore
function 更新状态栏(状态框) {
	let 文本 = 取选中文本();
	if (文本) {
		状态框.text = "$(megaphone) " + 显示词条(显示简要信息(查询词条(文本)), 30);
		状态框.show();
	} else {
		状态框.hide();
	}
}

// @ts-ignore
function 取选中文本(): string {
	const 当前编辑器 = window.activeTextEditor;
	if (当前编辑器) {
		const 选中部分 = 当前编辑器.selection;
		return 当前编辑器.document.getText(选中部分);
	}
}

function 查询词条(英文: string): 模型.字段释义 {
	return 查词.取释义(英文);
}

function 显示词条(显示: any, 最大长度: number): string {
	return 显示.length > 最大长度 ? 显示.substring(0, 最大长度 - 1) + "..." : 显示;
}

function 显示简要信息(查字段结果: 模型.字段释义): string {
	if (!查字段结果.释义) {
		return "查无结果: " + 查字段结果.原字段;
	}
	if (查字段结果.各词.length == 1) {
		return 取单词条信息(查字段结果.各词[0], false);
	} else {
		return 查字段结果.释义;
	}
}

function 显示字段信息(查字段结果: 模型.字段释义): string {
	// 长度必大于0
	if (查字段结果.各词.length == 1) {
		return 取单词条信息(查字段结果.各词[0], true);
	} else {
		let 翻译 = "";
		for (let 单词结果 of 查字段结果.各词) {
			翻译 += 取单词条信息(单词结果, true, false);
		}
		return 翻译;
	}
}

function 取单词条信息(查词结果: 模型.单词条, 显示原词: boolean = false, 显示词形: boolean = true): string {
	let 显示 = 显示原词 ? "【" + 查词结果.词 + "】" : "";
	let 释义 = 查词结果.释义;
	if (释义) {
		显示 += " " + 释义.split('\\n').join(" ");
	}

	let 词形 = 查词结果.词形;
	if (显示词形 && 词形.length > 0) {
		let 词形显示 = "";
		for (let 某词形 of 词形) {
			词形显示 += 某词形.类型 + ": " + 某词形.变化 + "; ";
		}
		显示 += "  " + 词形显示;
	}
	return 显示;
}