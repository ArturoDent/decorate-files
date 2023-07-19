import * as vscode from 'vscode';
import { DecoratorSettings } from './extension';


export async function getAllSettingsObject(): Promise<DecoratorSettings> {
  
  let applyTo: vscode.WorkspaceConfiguration | undefined = await vscode.workspace.getConfiguration().get('decorateFiles.decorations.apply');
  let filePaths: vscode.WorkspaceConfiguration | undefined = await vscode.workspace.getConfiguration().get('decorateFiles.filePaths');
  let badges: vscode.WorkspaceConfiguration | undefined = await vscode.workspace.getConfiguration().get('decorateFiles.badges');


  return {
    readonlyEnabled: applyTo?.enableReadonly,
    nonWorkspaceFilesEnabled: applyTo?.enableNonWorkspaceFiles,
    filePathsEnabled: applyTo?.enableFilePaths,
    multirootEnabled: applyTo?.enableMultirootWorkspaces,
    foldersEnabled: applyTo?.enableFolders,
    badgesEnabled: applyTo?.enableBadges,
    filePaths,
    badges
  };
}