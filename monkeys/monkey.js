module.exports = function infiniteJSMonkey({types: t}) {
    return {
        visitor: {
            // https://babeljs.io/docs/en/babel-types
            Program(path, state){

                console.log('monkeys!');

                //console.log(Object.keys(t).filter(key => key == 'nullLiteral'));

                // https://github.com/babel/babel/blob/main/packages/babel-types/src/ast-types/generated/index.ts this is just str8 up the emca grammar
                // points to https://github.com/babel/babel/blob/main/packages/babel-types/scripts/generators/ast-types.js
                // which (i'm pretty sure) comes from here https://github.com/babel/babel/blob/main/packages/babel-types/src/index.ts

                // we start by declaring a single js variable
                let rootVarName = "us_toast";
                let toast = t.variableDeclaration(
                    "let", 
                    [t.variableDeclarator(t.identifier(rootVarName))]
                );
                path.node.body = [toast];

                // now we can add more lines to the program by pushing them onto path.node.body
                // path.node.body.push();



            }
        }
    };
}