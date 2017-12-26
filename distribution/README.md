# Distribution files
These files are bundled and minified, ready to be downloaded directly and used with _script_ elements.

## Note
**Only import one of the JavaScript files**, as each of them includes the core classes and is designed to be used independently. Programmers who prefer to let other frameworks handle DOM manipulation (such as Vue.js, React or Knockout) should either use `dataentry.js` and implement their own classes for decorator and marker ([see classes documentation](https://github.com/RobertoPrevato/DataEntry/wiki/Core-classes-and-design)) or evaluate and try to use the built-in `dataentry-context.js` file. While programmers who don't mind having the library handling DOM manipulation and setting event handlers, can use `dataentry-dom.js` and `dataentry.css` files.

|         File         |                                                        Description                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| dataentry.js         | Core classes only: DataEntry, Validator and Formatter (require custom implementation of _harvester_ and _marker_ objects) |
| dataentry-dom.js     | Core classes with built-in features involving DOM manipulation                                                            |
| dataentry-context.js | Core classes with built-in features to work with in-memory objects only                                                   |
| dataentry.css        | Css rules for built-in DOM classes                                                                                        |

## npm alternative
For more control, install instead the npm package with the command: 
```bash
npm install dataentry
```
