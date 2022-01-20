var defs = require("@babel/types/lib/definitions/index.js");

module.exports = function infiniteJSMonkey({types: t}) {
    return {
        visitor: {
            Program(path, state){

                console.log('monkey!');
                console.log(defs.NODE_FIELDS.ObjectPattern.typeAnnotation.validate.oneOfNodeTypes);
                console.log(defs.NODE_FIELDS.BindExpression.object.validate.oneOfNodeTypes);
                //console.log(defs.NODE_FIELDS.ObjectPattern.typeAnnotation.validate);

                //console.log(Object.keys(t).filter(key => key == 'nullLiteral'));
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