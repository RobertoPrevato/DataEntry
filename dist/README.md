This folder contains distribution files.

## JS
The file `dataentry.js` is minified and transpiled from ES6 source code, it can be included in projects in classic way (i.e. downloading it and loading it using a script tag). To work with ES6 source code, look at [https://github.com/RobertoPrevato/DataEntry/tree/master/source/gulp](https://github.com/RobertoPrevato/DataEntry/tree/master/source/gulp).

## CSS
CSS files are organized inside the `styles` folder.

The file `DataEntry.css` contains all themes. It is recommended to optimize your solution, by using the file: `DataEntry.core.css`, which includes only the basic "flatwhite" theme; and eventually add the specific `.css` files of the desired themes.

## Open Iconic
Open Iconic fonts ([GitHub page](https://github.com/iconic/open-iconic)) are a dependency of DataEntry styles. The folder `fonts` contains a copy of the font, used for the published demos. CSS rules for the fonts are already included inside DataEntry .css files.

## DataEntry plugins
This folder also contains optional plugins. Refer to [dedicated wiki page for detailed information](https://github.com/RobertoPrevato/DataEntry/wiki/Plugins).

| File | Description |
|---------|-------------|
| DataEntry.xlsx.js | Plugin to support client side export in Excel (xlsx) files. |
