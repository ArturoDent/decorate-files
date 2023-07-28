import { extensions, Uri, workspace, ThemeColor } from 'vscode';
import * as path from 'path';


/**
 * Get the package.json of this extension  
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
  else pathKey = `path.${pathKey}`;

  return await _sanitizeColorThemeID(pathKey);
};

/**
 *  Remove [^a-zA-Z0-9.] from pathKey to get a valid ColorTheme id
 */
async function _sanitizeColorThemeID(pathKey: string): Promise<string> {

  pathKey = pathKey.replaceAll(/[\/]/g, '___').replaceAll(/-/g, '__');
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

/**
 * 
 * @param path - 
 */
export function colorThemeType(path: string): string {
  
  // path.package
  // folderAndFiles.select__a__range
  // extension.md
  // folderName.test

  // path = "folderAndFiles.select__a__range"
  // descriptionPath = "folderAndFiles.select-a-range"
  // userInput = "select-a-range"
  const descriptionPath = path.replaceAll(/___/g, '/').replaceAll(/__/g, '-');
  const userInput = descriptionPath.replaceAll(/^.*?\./gm, '');  // gets rid of 'decorateFiles.'
  
  // const type = descriptionPath.startsWith("path");
  
  switch (true) {
    
    case descriptionPath.startsWith("folderAndFiles"):
      return `Decorate this folder and its descendants: '${ userInput }'.`;
      break;
    
    case descriptionPath.startsWith("path"):
      return `Decorate folders or files with '${ userInput }' as part of the file path.`;
      break;
    
    case descriptionPath.startsWith("folderName"):
      return `Decorate this folder name: '${ userInput }'.`;
      break;
    
    case descriptionPath.startsWith("extension"):
      return `Decorate files with the '.${ userInput }' extension.`;
      break;
  
    default:
      break;
  }
  
  return '';
}