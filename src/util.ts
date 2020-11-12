import Config from './config';
import * as vscode from 'vscode';
import opn from './browser';
import * as fs from "fs";
import * as os from "os";

export const engines = ["Google", "Baidu", "Bing", "Npm", "Github", "Pypi"];
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