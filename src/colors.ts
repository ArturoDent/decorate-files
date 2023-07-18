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

  // const builtins = _makeColorsFromBuiltinPackageColors();
  
	const settingsColors: ThemeColor[] = await _makePackageColorsFromSettings(settings);
  if (!_colorArraysAreEquivalent(settingsColors, packageColors)) {

    // below is incorrect; s/b built-in colors concat settingsColors
		// packageJSON.contributes.colors = packageColors.concat(settingsColors);

    const builtins = getColorsFromBuiltinPackageColors();

		packageJSON.contributes.colors = builtins.concat(settingsColors);

    // const encoder = new vscode.TextEncoder();
    // const data = encoder.encode(JSON.stringify(packageJSON));

		// await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), 'package.json'), Uint8Array.from(JSON.stringify(packageJSON, null, 1)));
		fs.writeFileSync(vscode.Uri.joinPath(vscode.Uri.file(context.extensionPath), 'package.json').fsPath, JSON.stringify(packageJSON, null, 1));
	}
}

/**
 * Transform the built-in commands into package.json-style colors
 * @returns {Array<import("vscode").Colors>} - package.json form of builtin 'contributes.colors'
 */
// async function _makeColorsFromBuiltinPackageColors()  {

// 	let builtins = [	{
// 			"command": "find-and-transform.searchInFile",
// 			"title": "Search in this File",
// 			"category": "Find-Transform"
// 		},
// 		{
// 			"command": "find-and-transform.searchInFolder",
// 			"title": "Search in this Folder",
// 			"category": "Find-Transform"
// 		},
// 		{
// 			"command": "find-and-transform.searchInResults",
// 			"title": "Search in the Results Files",
// 			"category": "Find-Transform"
// 		}
// 	];

// 	let builtinCommandsArray = [];

// 	for (const builtin: vscode.ThemeColor of builtins) {

// 		let newColor: vscode.ThemeColor = {
//       id = builtin.id;
//       description = builtin.description;
//       defaults = builtin.defaults;
//     }

// 		builtinCommandsArray.push(newColor);
// 	};
// 	return builtinCommandsArray;
// };


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

  // check if any settingsColors not in package.json already TODO

  let settingsColorThemes: ThemeColor[] = [];

  if (settings.filePaths) {

    for (let [path, color] of Object.entries(settings?.filePaths)) {

      path = await utilities.makeColorThemeFromPath(path);

      // if (path.startsWith('.')) path = `extension${path}`;
      // else if (path.endsWith('/')) path = `folder.${path.replaceAll('/', '')}`;
      // // else if (path.endsWith('/**')) path = `folder.${path.replaceAll('/**', '_')}`;
      // else if (path.endsWith('/**')) path = `folder.${path.replaceAll('/**', '_++')}`;
      // else path = `path.${path}`;

      // path = await utilities.sanitizeColorThemeID(path);

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

	// subtract 5 for builtin colors
  if (settingsColors.length !== (packageColors.length-5)) return false;

  const builtinIds = [
    "decorateFiles.readOnlyFiles",
    "decorateFiles.nonWorkspaceFiles",
    "decorateFiles.folderColors",
    "decorateFiles.workspaceFolderOdd",
    "decorateFiles.workspaceFolderEven"
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
      "id": "decorateFiles.workspaceFolderOdd",
      "description": "Color for the 2nd/4th/6th/etc. root folders.",
      "defaults": {
       "dark": "#f00",
       "light": "#f00",
       "highContrast": "#f00",
       "highContrastLight": "#f00"
      }
     },
     {
      "id": "decorateFiles.workspaceFolderEven",
      "description": "Color for the 1st/3rd/5th/etc. root folders.",
      "defaults": {
       "dark": "#00f",
       "light": "#00f",
       "highContrast": "#00f",
       "highContrastLight": "#00f"
      }
     }
  ];
}