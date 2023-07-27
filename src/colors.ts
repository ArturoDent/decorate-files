import * as vscode from 'vscode';
import * as utilities from './utilities';
import { DecoratorSettings, ThemeColor } from './extension';
import * as fs from 'fs';



/**
 * Write the settings colors to package.json,
 *
 */
export async function loadColors(settings: DecoratorSettings, context: vscode.ExtensionContext) {

  let packageColors: ThemeColor[] = [];
  
  const packageJSON: any = await utilities.getPackageJSON();

	if (packageJSON?.contributes) packageColors = packageJSON?.contributes?.colors;

	const settingsColors: ThemeColor[] = await _makePackageColorsFromSettings(settings);
  if (!_colorArraysAreEquivalent(settingsColors, packageColors)) {

    const builtins = getColorsFromBuiltinPackageColors();

		packageJSON.contributes.colors = builtins.concat(settingsColors);

    // const encoder = new vscode.TextEncoder(); 
    // const data = encoder.encode(JSON.stringify(packageJSON));

		// await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), 'package.json'), Uint8Array.from(JSON.stringify(packageJSON, null, 1)));
		fs.writeFileSync(vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), 'package.json').fsPath, JSON.stringify(packageJSON, null, 1));
	}
}


// @returns { Array < vscode.Color > | Array; } - package.json form of 'contributes.colors'
/**
 * Transform the settings into package.json-style colors 
 */
async function _makePackageColorsFromSettings(settings: DecoratorSettings): Promise<ThemeColor[] > {
  // {
  //   "id": "decorateFiles.folderColors",
  //   "description": "Color for a non-workspace editor label",
  //   "defaults": {
  //     "dark": "#00b7ff",
  //     "light": "#00b7ff",
  //     "highContrast": "#00b7ff",
  //     "highContrastLight": "#00b7ff"
  //   }
  // }

  let settingsColorThemes: ThemeColor[] = [];

  if (settings.filePaths) {

    for (let [path, color] of Object.entries(settings?.filePaths)) {

      path = await utilities.makeColorThemeFromPath(path);

      let newColor: ThemeColor = {

        id: `decorateFiles.${ path }`,
        description: `Decorate all files with '${ path }' as part of the file path.` ,
        defaults: {
          dark: color,
          light: color,
          highContrast: color,
          highContrastLight: color
        }
      };
      settingsColorThemes.push(newColor);
    };
  }
  return settingsColorThemes;
};

/**
 * Are the settings colors and package.json colors the same?
 *
 */
function _colorArraysAreEquivalent(settingsColors: ThemeColor[], packageColors: ThemeColor[]): boolean {

	// subtract 6 for builtin colors
  if (settingsColors.length !== (packageColors.length-5)) return false;

  const builtinIds = [
    "decorateFiles.readOnlyFiles",
    "decorateFiles.nonWorkspaceFiles",
    "decorateFiles.folderColors",
    "decorateFiles.workspaceFolder.1",
    "decorateFiles.workspaceFolder.2",
    "decorateFiles.workspaceFolder.3"
  ];

  return settingsColors.every(sColor => packageColors.some((pColor: ThemeColor) => {
    if ( !builtinIds.includes( pColor.id ))  {
			return (pColor.id === sColor.id) && (pColor.description === sColor.description) &&
      (JSON.stringify(pColor.defaults) === JSON.stringify(sColor.defaults));
		}
  }));
}

export function getColorsFromBuiltinPackageColors() {
  return [
    {
      "id": "decorateFiles.folderColors",
      "description": "Color for a non-workspace editor label",
      "defaults": {
       "dark": "#00b7ff",
       "light": "#00b7ff",
       "highContrast": "#00b7ff",
       "highContrastLight": "#00b7ff"
      }
     },
     {
      "id": "decorateFiles.nonWorkspaceFiles",
      "description": "Color for a non-workspace editor label",
      "defaults": {
       "dark": "#ff00ee",
       "light": "#ff00ee",
       "highContrast": "#ff00ee",
       "highContrastLight": "#ff00ee"
      }
     },
     {
      "id": "decorateFiles.readOnlyFiles",
      "description": "Color for a read-only editor label and Explorer fileName",
      "defaults": {
       "dark": "#c99703",
       "light": "#c99703",
       "highContrast": "#c99703",
       "highContrastLight": "#c99703"
      }
     },
     {
      "id": "decorateFiles.workspaceFolder.1",
      "description": "Color for the 2nd/4th/6th/etc. root folders.",
      "defaults": {
       "dark": "#f00",
       "light": "#f00",
       "highContrast": "#f00",
       "highContrastLight": "#f00"
      }
     },
     {
      "id": "decorateFiles.workspaceFolder.2",
      "description": "Color for the 1st/3rd/5th/etc. root folders.",
      "defaults": {
       "dark": "#00f",
       "light": "#00f",
       "highContrast": "#00f",
       "highContrastLight": "#00f"
      }
     },
     {
      "id": "decorateFiles.workspaceFolder.3",
      "description": "Color for the 1st/3rd/5th/etc. root folders.",
      "defaults": {
       "dark": "#00ff37",
       "light": "#00ff37",
       "highContrast": "#00ff37",
       "highContrastLight": "#00ff37"
      }
     }
  ];
}