import * as vscode from 'vscode';
import * as fs from 'fs';

import { DecoratorSettings } from './extension';
import * as utilities from './utilities';


type fileDecoration = {
  badge?: string,
  color: vscode.ThemeColor,
  propagate: boolean,
  tooltip: string
};

export class FileDecorator {
  
  private settingsObj: DecoratorSettings;
  private badgesEnabled: boolean = false;

  // private static readonlyBadge: string = "";
  private static nonWorkSpaceFilesBadge: string = "";

  private disposables: vscode.Disposable[] = [];

  constructor(settingsObject: DecoratorSettings) {

    this.settingsObj = settingsObject;
    this.badgesEnabled = settingsObject.badgesEnabled;

    // if (this.badgesEnabled && settingsObject.badges && Object.values(settingsObject.badges).length > 0) 
    //   FileDecorator.readonlyBadge = Object.values(settingsObject.badges)[0];

    if (this.badgesEnabled && settingsObject.badges && Object.values(settingsObject.badges).length > 0) 
      FileDecorator.nonWorkSpaceFilesBadge = Object.values(settingsObject.badges)[0];
  }

  // async refresh(): Promise<void> {
	// 	this._onDidChangeFileDecorations.fire([]);
	// }

 
  /**
   * @memberof FileDecorationProvider
   **/
  async provideFileDecoration(uri: vscode.Uri): Promise<fileDecoration | undefined> {

    // private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri[]>();
    // readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

    // ignore settings.json, keybindings.json, Keyboard Shortcuts and the Settings UI
    if (uri.scheme === 'vscode-userdata' || uri.scheme === 'vscode-settings') return;
    let decoration: fileDecoration | undefined = undefined;

    // readonly decorations, since first this will have priority over subsequent decorators
    if (this.settingsObj.readonlyEnabled) {
      decoration = await this.decorateReadonlyFiles(uri);
    }

    // non-workspaceFiles decorations
    if (!decoration && this.settingsObj.nonWorkspaceFilesEnabled && Object.keys(this.settingsObj.nonWorkspaceFilesEnabled)) {
      decoration = await this.decorateNonWorkspaceFiles(uri);
    }

    let filePathKeys: string[] = []; 

    // filePaths decorations
    if (!decoration && this.settingsObj.filePathsEnabled && this.settingsObj.filePaths && Object.keys(this.settingsObj.filePaths)) {
      filePathKeys = Object.keys(this.settingsObj.filePaths);

      const filePath = filePathKeys.find(filePathKey =>
        _getPathKey(uri, filePathKey)
      );
        if (filePath) decoration = await this.decorateFilePaths(uri, filePath);
    }

    // folder decorations
    if (!decoration && this.settingsObj.foldersEnabled && Object.keys(this.settingsObj.foldersEnabled)) {
      decoration = await this.decorateFolders(uri);
    }

    // multiroot decorations
    if (!decoration && this.settingsObj.multirootEnabled && Object.keys(this.settingsObj.multirootEnabled)) {
      decoration = await this.decorateMultirootResources(uri);
    }

    return decoration;
  }
    
  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.dispose();
  }
  

    // decorate fileNames
  private async decorateFilePaths(uri: vscode.Uri, pathKey: string): Promise<fileDecoration | undefined> {
    
    const path = await utilities.makeColorThemeFromPath(pathKey);

    return {
      // badge: "",
      color: new vscode.ThemeColor(`decorateFiles.${path}`),
      propagate: false,
      tooltip: `Decorate-Files: path =   ${pathKey}`
    };
  }

  private async decorateReadonlyFiles(uri: vscode.Uri): Promise<fileDecoration | undefined> {

    const stats: fs.Stats = fs.statSync(uri.fsPath);

    // const stat: vscode.FileStat = await vscode.workspace.fs.stat(uri);  // works but of no help
    // if (stat.permissions === vscode.FilePermission.Readonly) {  // doesn't work

    if (stats.mode === 33060) {  // OS fs.Stats.mode for read-only files
      return {
        // badge: "\u1F512",  // lock icon: doesn't work, this unicode block not supported
        // badge: FileDecorator.readonlyBadge,
        color: new vscode.ThemeColor("decorateFiles.readOnlyFiles"),
        propagate: false,
        tooltip: "Decorate-Files: read-only file"
      };
    }
  }
  
  // decorate all folders with a special color
  private async decorateFolders(uri: vscode.Uri): Promise<fileDecoration | undefined> {

    const stat: vscode.FileStat = await vscode.workspace.fs.stat(uri);

    if (stat.type === vscode.FileType.Directory) { // FileType.Directory = 2
      return {
        // badge: "",
        color: new vscode.ThemeColor("decorateFiles.folderColors"),
        propagate: false,
        tooltip: "Decorate-Files: folders"
      };
    }
  }
  
  // decorate non-workSpace files (and folders?)
  private async decorateNonWorkspaceFiles(uri: vscode.Uri): Promise<fileDecoration | undefined> {

    // returns undefined if the uri doesn't match any workspaceFolder
    const folder = vscode.workspace.getWorkspaceFolder(uri);

    if (!folder)
      return {
        badge: FileDecorator.nonWorkSpaceFilesBadge,
        color: new vscode.ThemeColor("decorateFiles.nonWorkspaceFiles"),
        tooltip: "Decorate-Files: file not in workspace.",
        propagate: false
      };
    }

   // decorate all folders with a special color
   private async decorateMultirootResources(uri: vscode.Uri): Promise<fileDecoration | undefined> {

    let rootIndex:number = 0;
    const thisWSFolder = vscode.workspace.getWorkspaceFolder(uri);

    if (thisWSFolder?.index !== undefined)
      rootIndex = thisWSFolder?.index  + 1;
    else return undefined;

    if (rootIndex % 2 === 1) { // so rootFolder 0/2/4/etc.
      return {
        // badge: "",
        color: new vscode.ThemeColor("decorateFiles.workspaceFolderOdd"),
        propagate: false,
        tooltip: "Root folder is odd-numbered root in a multi-root workspace."
      };
    }
    else  {  // will be root 1/3/5/etc.
      return {
        // badge: "",
        color: new vscode.ThemeColor("decorateFiles.workspaceFolderEven"),
        propagate: true,
        tooltip: "Root folder is even-numbered root in a multi-root workspace."
      };
    }
  }
}


function _getPathKey(uri: vscode.Uri, path: string) {

  let escapedPath = path;

  if (path.endsWith('/')) {
    escapedPath = path.replaceAll('/', '') + "$";
  }
  else if (path.endsWith('/**')) {
    // so must be preceded by path separator
    escapedPath = "[\\\\/\\\\]" + path.replaceAll('/**', '') + "\\b";
  }

  if (escapedPath.includes('/')) escapedPath = escapedPath.replaceAll(/\//g, '\\\\');
  // so can use regex $, so .c does not match .css for example
  if (escapedPath.includes('.')) escapedPath = escapedPath.replaceAll(/\./g, '\\.') + "$";

      // zzzz\\\\test\.bat$
      // "c:\\Users\\Mark\\OneDrive\\Test Bed\\zzzz\\test.bat"
  const re = new RegExp(escapedPath, "gm");
  return uri.fsPath.match(re);
}
