# Decorate Files and Folders

This vscode extension will highlight the editor tab and Explorer fileName of various files.  The tab will be have a unique color which can be configured.  

The colors used are custom `ThemeColors`.  They are configurable.  In your `settings.json` add this `colorCustomiztion`:  

```jsonc
  "workbench.colorCustomizations": {
    
    "decorateFiles.nonWorkspaceFiles": "#91ff00"  // a wonderful lime green, the default
  }
```

Any hex color can be used including those with opacity like `#91ff0060`: the last two digits are for opacity.

----------------

## Known Issues

* After modifying this extension's settings, you will have to **reload** vscode to activate those changes. This is unavoidable since `ThemeColors` are created and stored in the extension's files.  

* VS Code does not support all possible unicode blocks in a badge.  

* VS Code does not provide a way for an extension to determine if the user set an editor to read-only (via the command `workbench.action.files.setActiveEditorReadonlyInSession` and related read-only commands).  So this extension can only decorate files as read-only that have been set via the OS.  

-----------  

## Built-in global settings for badges and color decorators  

To enable the **editor tab** color and badges the following two of vscode's built-in settings must be enabled - they control all file color and badge decorations whatever the source:  

```jsonc
  Workbench > Editor > Decorations: Badges  
  // Controls whether editor file decorations should use badges.  
  "workbench.editor.decorations.badges": true,

  Workbench > Editor > Decorations: Colors  
  // Controls whether editor file decorations should use colors.  
  "workbench.editor.decorations.colors": true,
```

To enable the file **Explorer** colors and badges these settings must be enabled:  
  
```jsonc
  Explorer > Decorations: Badges  
  // Controls whether file decorations should use badges.  
  "explorer.decorations.badges": true,

  Explorer > Decorations: Badges  
  // Controls whether file decorations should use colors.  
  "explorer.decorations.colors": true,
```

----------------

This setting `Problems > Decorations: Enabled` will take precedence over the file decorations of this extension.  So, if this setting is enabled even a file decorated by this extension, if it has problems in it, will be colored according to whatever the Problems decorations color is and not by this extension's decorators.  There is no way to avoid that precedence of the `Problems` decoration other than by disabling the following setting:  

```jsonc
  Problems > Decorations: Enabled
  // Show Errors & Warnings on files and folder.
  "problems.decorations.enabled": true,
```
  
----------------

## Contributed Settings  

This extension contributes four settings:

```plaintext
Decorate Files > Decorations > Global Enable   (in the Settings UI), defaults are disabled/false
  ✅  Enable all color decorations.  
  ✅  Enable all badge decorations.  
```

The above is a global enable/disable for all color or badge decorations provided by this extension.  

```plaintext
Decorate Files > Decorations > Apply   (in the Settings UI), defaults are disabled/false  
  ✅  Decorate read-only files.  
  ✅  Decorate non-workspace files.  
  ✅  Decorate folders and fileNames containing some string.  
  ✅  Decorate each folder.  
  ✅  Decorate each folder of a multiroot workspace.  
```

The above setting's defaults are disabled/false, so you will have to opt-in to enable decorating colors for these types of files.  

* It is important to note that any file or folder might fall into more than one of the above categories.  For example, a file might be read-only AND contain some path that you designated to be decorated.  The decorators are applied in the above order in the setting and stop once there is a match.  So in the example just given, that file would be decorated as `read-only` and nothing else (assuming that the `read-only` option above is enabled).  

```plaintext
Decorate Files > Decorations : Badges   (in the Settings UI)
   read-only files  
   non-workspace files  
```

There are default badges supplied by this extension for these two types of files.  These are currently the only files to which you can add a badge.

```plaintext
Decorate Files: File Paths  
```

This setting takes any number of item/value pairs.  It can color decorate folders and files by their path.  More on this below.

----------------  

## COMMANDS  

There is one command contributed by this extension:

```plaintext
decorateFiles.clearColors
Delete user-defined colors in all settings
```

Triggering this command will delete all colors you created in the file paths setting whether those are user or workspace or workspace folder settings and the associated item/value pairs.  Use this if you run into trouble or have a lot of file paths you want to delete all at once.  

--------------  

## FILE PATHS

With the `Decorate Files: File Paths` setting you can create any number of item/value pairs to decorate certain types of folders and files.

Here are some examples:

| item           | value     |  |
|----------------|-----------|--|
| .c                | #f00       | all files with the `.c` extension will be red |
| someFolderA/      | #0f0       | the folder name only will be green |
| someFolderB/**    | #0f0       | the folder name and all its descendants will be green |
| someFile          |#00f        | any file path containing `someFile` will be blue |
|folderA/subFolder2/someFile.ts |  #f00 | that file in those folders will be red |

* Note that at present you should use the forward slash `/` as the path separator (that will be relaxed later).  

The values must be valid css-like hex colors, so `#123`, `#1234`, `#123456`, and `#12345678` all work.  That is: 3, 4, 6 or 8 `[a-fA-F0-9]` all work.  If you attempt to provide an invalid hex number you will get an error notification and the setting will not be accepted.  

--------------  

## BADGES

The setting `Decorate Files: Badges` can take 1-2 characters as a `badge`, which will appear at the end of the editor tab label and Explorer fileName.  In the `Settings UI` the characters can be unicode characters, like `⏹`, but not the actual unicode, i.e., `\u23F9`, because that is seen as more than two characters.  But in your `settings.json` this does work:  

```jsonc
 "decorateFiles.badges": {
    "non-workspace files": "NS",
    // "read-only files": "⏹⏹", // or the below
    "read-only files": "\u23F9\u23F9",
  }
  ```

 It is only in the Settings UI that you must use the actual character `⏹`.

----------------

## CHANGE the Colors

The colors you set in `Decorate Files: File Paths` and the built-in colors can be changed in the `settings.json` `colorCustomization` setting.  Upon typing `decorateFiles` you should get intellisense suggestions for all available ThemeColors.  

Here are the extension's built-in ThemeColors which you can change:  

| setting               | ThemeColor    | |
|-----------------------|---------------|-|
| read-only files       | decorateFiles.readOnlyFiles      |  |
| non-workspacefiles    | decorateFiles.nonWorkspaceFiles  |  |
| folder names          | decorateFiles.folderColors       |  |
| multiroot workspaces  | decorateFiles.workspaceFolderOdd |decorateFiles.workspaceFolderEven |

And here are examples of ThemeColors created by this extension for entries from the `File Paths` setting:  

| item              | ThemeColor   | |
|-------------------|-----------|----|
| .c                | decorateFiles.extension.c       | starts with a `.` decorate files with this extension |
| someFolderA/      | decorateFiles.folderName.someFolderA       |ends with `/` decorate just the folder name  |
| someFolderB/**    | decorateFiles.folderAndFiles.someFolderB       |ends with `/**` decorate folder and descendants  |
| someFile          |decorateFiles.path.someFile        | simple path |
|folderA/sub2/someFile.ts |  decorateFiles.path.folderA__sub2__somefile.ts | `/`'s replaced with `__` (2 underscores) |

1. Any item that **starts** with a `.` will create a ThemeColor called `decorateFiles.extension.<yourExtension>`.  
2. Any item that **ends** with a `/` will create a ThemeColor called `decorateFiles.folderName.<yourFolder>`.  
3. Any item that **ends** with a `/**` will create a ThemeColor called `decorateFiles.folderAndFiles.<yourFolder>`.  
4. Simple paths will create a ThemeColor called `decorateFiles.path.<yourPath>`.  
5. For a path that include `/`'s, the slashes will be replaced by 2 underscores `__` - which indicates a path separator.  

Look for these patterns in the `colorCustomization` setting.  

* `ThemeColors` can only contain <a-zA-Z0-9._> so anything else will be removed from the path to create the `ThemeColor`.  Obviously if your paths already include `__` that will create a problem translating to a `ThemeColor`.  

---------------

## TODO  

* Support other path separators `\` and `\\`.  
* Support `!` negation in paths.  
* Support globs in paths.  
* Find a lock icon for read-only badge.  

## Release Notes

* 0.0.1 Initial preview release.  
