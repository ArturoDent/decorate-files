import * as vscode from 'vscode';
import * as settings from './settings';
import * as colors from './colors';
import { FileDecorator } from './decorator';
import * as utilities from './utilities';
import * as fs from 'fs';

export interface DecoratorSettings {
  readonlyEnabled: boolean,
  nonWorkspaceFilesEnabled: boolean,
  multirootEnabled: boolean,
  foldersEnabled: boolean,
  filePathsEnabled: boolean,
  badgesEnabled: boolean,
  filePaths: object | undefined,
  badges: object | undefined
};

export interface ThemeColor {
  id: string,
  description: string,
  defaults: {
    dark: string,
    light: string,
    highContrast: string,
    highContrastLight: string
  }
};

export async function activate(context: vscode.ExtensionContext) {
  
  let decClass: FileDecorator;

  const settingsObject: DecoratorSettings = await settings.getAllSettingsObject();
  await _loadSettingsAsColors(context);
if (Object.values(settingsObject).some(setting => typeof setting === 'boolean' && setting )) {
    decClass = new FileDecorator(settingsObject);
    context.subscriptions.push(vscode.window.registerFileDecorationProvider(decClass));
  } 

  // ---------------------------------------------------------------------------------------------
	// remove from package.json any user-defined colors and badges and reset all settings to their defaults
	
  let clearUserDefinedColors = vscode.commands.registerCommand('decorateFiles.clearColors', async (...commandArgs) => {

    // commandArgs is undefined if coming from Command Palette or keybinding with no args

    const packageJSON: any = await utilities.getPackageJSON();
    const builtins = colors.getColorsFromBuiltinPackageColors();
    packageJSON.contributes.colors = builtins;
		fs.writeFileSync(vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), 'package.json').fsPath, JSON.stringify(packageJSON, null, 1));

    const filePathConfiguration = vscode.workspace.getConfiguration('decorateFiles');

    // TODO check overrideInLanguage option
    if (filePathConfiguration) filePathConfiguration?.update('filePaths', undefined, true);  // user/global settings
    if (filePathConfiguration) filePathConfiguration?.update('filePaths', undefined, false); // workspace settings
    if (filePathConfiguration) filePathConfiguration?.update('filePaths', undefined, null);  // workspace folder settings
	});
	context.subscriptions.push(clearUserDefinedColors);


  // ---------------------------------------------------------------------------------------------

  const configChange = vscode.workspace.onDidChangeConfiguration(async (event) => {
    
    if (event.affectsConfiguration("decorateFiles")) {

      const settingsObject: DecoratorSettings = await settings.getAllSettingsObject();
      let invalid: string = "";

      if (event.affectsConfiguration("decorateFiles.filePaths")) {

        const pathsSettings = settingsObject?.filePaths;
        if (pathsSettings) {
          invalid = Object.values(pathsSettings).find(hexValue => !utilities.validateHexValue(hexValue));
        }
        if (invalid) 
          vscode.window
            .showErrorMessage(`This hex value '${invalid}' for the 'decorateFiles.filePaths' setting is invalid.`,
              ...['Fix setting', 'Ignore'])   // two buttons
            .then(selected => {
              if (selected === 'Go to setting') vscode.commands.executeCommand('workbench.action.openSettings', 'decorate file paths');
              else vscode.commands.executeCommand('leaveEditorMessage');
            });
      }

      if (!invalid) {
        await _loadSettingsAsColors(context);
        decClass = new FileDecorator(settingsObject);
        // decClass.onDidChangeFileDecorations(decClass.refresh([]));
        // context.subscriptions.push(vscode.window.registerFileDecorationProvider(decClass));

        vscode.window
        .showInformationMessage("Reload vscode to make the changes you made effective.",
          ...['Reload vscode', 'Do not Reload'])   // two buttons
        .then(selected => {
          if (selected === 'Reload vscode') vscode.commands.executeCommand('workbench.action.reloadWindow');
          else vscode.commands.executeCommand('leaveEditorMessage');
        });
      }
    }
  });
  context.subscriptions.push(configChange);
}

/**
 * 
 */
async function _loadSettingsAsColors(context: vscode.ExtensionContext) {

	const colorSettings: DecoratorSettings = await settings.getAllSettingsObject();

	if (colorSettings) {
    await colors.loadColors(colorSettings, context);
	}
}

export function deactivate() {}