# babel-random-ast
A [Babel](https://github.com/babel/babel/) plugin that generates random javascript based on the Babel AST. Similar to [shift-ast](https://shift-ast.org/).

The code in this project is largely based off the [script](https://github.com/babel/babel/blob/main/packages/babel-types/scripts/generators/docs.js) that generates the [docs](https://babeljs.io/docs/en/babel-types) for Babel's AST.

## Useful Resources
- https://babeljs.io/docs/en/babel-types, why is this so hard to find on google?
- https://astexplorer.net/
- https://lihautan.com/manipulating-ast-with-javascript/

## Run It:
```npm install --save-dev babel-cli```

```./node_modules/.bin/babel empty.js --out-file random.js```

## Bonus
Here's a random code generator for Python: https://github.com/radomirbosak/random-ast