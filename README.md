generate random valid js

idk i'm bored lol


- https://babeljs.io/docs/en/babel-types, why is this so hard to find on google?
- https://astexplorer.net/


need this: 

```npm install --save-dev babel-cli```


generate the grammar: 

```./node_modules/.bin/babel index.ts --out-file grammar.js```


run it: 

```./node_modules/.bin/babel empty.js --out-file random.js```