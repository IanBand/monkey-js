module.exports = function infiniteJSMonkey({types: t}) {
    return {
        visitor: {
            // https://babeljs.io/docs/en/babel-types
            Program(path, state){

                //console.log(Object.keys(t).filter(key => key == 'nullLiteral'));

                //console.log(path.node.body[0].declarations[0]);


                let test = t.variableDeclaration(
                    "let", 
                    [t.variableDeclarator(t.identifier("toast"))]
                );

                //path.insertBefore(test);
                path.node.body[0] = test;

                //console.log(t['nullLiteral'])
            }
        }
    };
}