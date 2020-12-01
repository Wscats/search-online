'use strict';
import * as 释义处理 from './翻译/处理'
import * as 词典常量 from './翻译/词典相关常量'
import * as 功用库 from './功用库';
import * as 查词 from './查词';

import * as vscode from 'vscode';

export default class 整文件翻译 implements vscode.TextDocumentContentProvider {

	static scheme = 'references';
	private 原命名列表: string[] = [];

	dispose() {
	}

	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
		// TODO: 如果没有当前活跃编辑器, 返回空
		let textEditor = vscode.window.activeTextEditor;
		// @ts-ignore
		return vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', textEditor.document.uri)
			.then(
				// @ts-ignore
				(symbols: Array<vscode.DocumentSymbol>) => {
					for (var 标识符 of symbols) {
						this.原命名列表.push(释义处理.消除英文小括号内容(标识符.name));
						for (var 子标识符 of 标识符.children) {
							this.原命名列表.push(释义处理.消除英文小括号内容(子标识符.name));
						}
					}

					// 长词先查释义, 以免出现一个命名"xxxxyyyy"先替换了yyyy而xxxx未替换的情况
					this.原命名列表.sort(function (a, b) { return b.length - a.length });

					// @ts-ignore
					var 新内容 = textEditor.document.getText();
					for (var 原命名 of this.原命名列表) {
						let 中文释义 = 查词.取释义(原命名).释义;
						let 翻译 = 释义处理.取字段中所有词(原命名).length > 1
							? 中文释义
							: 释义处理.首选(中文释义, 词典常量.词性_计算机);
						if (翻译) {
							新内容 = this._replaceAll(新内容, 原命名, 翻译);
						}
					}
					return 新内容;
				}
			)
	}

	// @ts-ignore
	private _replaceAll(str, find, replace) {
		return str.replace(new RegExp(find, 'g'), replace);
	}
}

let seq = 0;

export function encodeLocation(uri: vscode.Uri, pos: vscode.Position): vscode.Uri {
	const query = JSON.stringify([uri.toString(), pos.line, pos.character]);
	let 文件名 = 功用库.取文件名(uri.path);
	return vscode.Uri.parse(`${整文件翻译.scheme}:翻译${文件名}?${query}#${seq++}`);
}
