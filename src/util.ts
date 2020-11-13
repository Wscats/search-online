/**
 * Copyright © 1998 - 2020 Tencent. All Rights Reserved.
 *
 * @author enoyao
 */

import Config from './config';
import * as vscode from 'vscode';
import opn from './browser';
import * as fs from "fs";
import * as os from "os";
import { languageConfig } from "./language";

export interface Iengine { name: string, url: string }

export const getEngines = (): string[] => {
    const config = vscode.workspace.getConfiguration("search-online");
    const engineAddedConfig = config.get<Iengine[]>("add-search-engine");
    const engineAdded = engineAddedConfig?.filter((engineItem: Iengine) => {
        if (engineItem?.name && engineItem?.url) {
            return engineItem;
        }
    }).map((engineItem: Iengine) => {
        return engineItem.name;
    })
    if (engineAdded) {
        return ["Google", "Bing", "Baidu", "Npm", "Github", "Google Translate", ...engineAdded, "➕ Add Search Engine"];
    } else {
        return ["Google", "Bing", "Baidu", "Npm", "Github", "Google Translate", "➕ Add Search Engine"];
    }

};

export const setEngines = async () => {
    const config = vscode.workspace.getConfiguration("search-online");
    const engineAddedConfig = config.get<Iengine[]>("add-search-engine");
    const engineName = await vscode.window.showInputBox({
        "prompt": "Set your search engine name -> like: Google"
    });
    const engineUrl = await vscode.window.showInputBox({
        "prompt": "Set your search engine address -> like: https://www.google.com/search?q=%SELECTION%"
    });
    if (!engineName || !engineUrl) {
        return;
    }
    const newEngine: Iengine = { name: engineName, url: engineUrl };
    const newEngines = engineAddedConfig && [newEngine, ...engineAddedConfig];
    config.update("add-search-engine", newEngines);
    return { newEngine, newEngines };
}

export const standardizedBrowserName = (name: string = ''): string => {
    let _name = name.toLowerCase();
    const browser = Config.browsers.find(item => {
        return item.acceptName.indexOf(_name) !== -1;
    });
    return browser ? browser.standardName : '';
};

export const defaultBrowser = (): string => {
    const config = vscode.workspace.getConfiguration(Config.app);
    return config ? config.default : '';
};

export const open = (path: string, browser: string | string[]) => {
    opn(path, { app: browser }).catch((err: any) => {
        vscode.window.showErrorMessage(`Open browser failed!! Please check if you have installed the browser ${browser} correctly!`);
    });
};

export const openBrowser = (path: any): void => {
    const browser = standardizedBrowserName(defaultBrowser());
    open(path, browser);
};

let isDocker: boolean;
export const docker = () => {
    const hasDockerEnv = () => {
        try {
            fs.statSync('/.dockerenv');
            return true;
        } catch (_) {
            return false;
        }
    }
    const hasDockerCGroup = () => {
        try {
            return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
        } catch (_) {
            return false;
        }
    }
    if (isDocker === undefined) {
        isDocker = hasDockerEnv() || hasDockerCGroup();
    }
    return isDocker;
};

const wsll = () => {
    if (process.platform !== 'linux') {
        return false;
    }
    if (os.release().toLowerCase().includes('microsoft')) {
        if (docker()) {
            return false;
        }
        return true;
    }
    try {
        return fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft') ?
            !docker() : false;
    } catch (_) {
        return false;
    }
};

export const wsl = process.env.__IS_WSL_TEST__ ? wsll : wsll();

export const getSelectedText = () => {
    const documentText = vscode.window.activeTextEditor?.document.getText();
    if (!documentText) {
        return "";
    }
    const activeSelection = vscode.window.activeTextEditor?.selection;
    if (activeSelection?.isEmpty) {
        return "";
    }
    const selectStartOffset = vscode.window.activeTextEditor?.document.offsetAt(
        activeSelection?.start as vscode.Position
    );
    const selectEndOffset = vscode.window.activeTextEditor?.document.offsetAt(
        activeSelection?.end as vscode.Position
    );

    let selectedText = documentText.slice(selectStartOffset, selectEndOffset).trim();
    selectedText = selectedText.replace(/\s\s+/g, " ");
    return selectedText;
}

export const getLanguageCode = (languageKey: string) => {
    return languageConfig[languageKey];
}