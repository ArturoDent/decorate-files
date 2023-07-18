// import * as vscode from 'vscode';
import { extensions, Uri, workspace, ThemeColor } from 'vscode';
import * as path from 'path';


/**
 * Get the full path to this extension  
 */
export async function getPackageJSON(): Promise<object | undefined> {

	const extensionPath: string | undefined = extensions.getExtension('ArturoDent.decorate-files-and-folders')?.extensionPath;
  
  if (extensionPath) {
    const packageJSONUri = Uri.file(path.join(extensionPath, 'package.json'));
    const packageContents = (await workspace.fs.readFile(packageJSONUri)).toString();
    const packageJSON = JSON.parse(packageContents);
	  return packageJSON;
  }
  else return undefined;
};

/**
 *  Remove [^a-zA-Z0-9.] from pathKey to get a valid ColorTheme id
 */
export async function makeColorThemeFromPath(pathKey: string): Promise<string> {

  if (pathKey.startsWith('.')) pathKey = `extension${pathKey}`;
  else if (pathKey.endsWith('/')) pathKey = `folderName.${pathKey.replaceAll('/', '')}`;
  else if (pathKey.endsWith('/**')) pathKey = `folderAndFiles.${pathKey.replaceAll('/**', '')}`;
  // else if (pathKey.endsWith('/**')) pathKey = `folder.${pathKey.replaceAll('/**', '_++')}`;
  else pathKey = `path.${pathKey}`;

  // return pathKey;
  return await _sanitizeColorThemeID(pathKey);
};

/**
 *  Remove [^a-zA-Z0-9.] from pathKey to get a valid ColorTheme id
 */
async function _sanitizeColorThemeID(pathKey: string): Promise<string> {

  pathKey = pathKey.replaceAll(/[\/]/g, '__');
  return pathKey.replaceAll(/^a-zA-Z0-9./g, '');
};

/**
 * 
 * @param value - the hex value from the 'decorateFiles.filePaths' setting
 */
export function validateHexValue(value:string): boolean {

  if ( typeof value !== "string") return false;
  if ( !value.startsWith('#')) return false;

  const re = new RegExp(/^#(([A-Fa-f0-9]{8})|([A-Fa-f0-9]{6})|([A-Fa-f0-9]{3,4}))$/, "gm");
  if (!value.match(re)) return false;

  return true;
}