var defs = require("@babel/types/lib/definitions/index.js");

module.exports = function infiniteJSMonkey({types: t}) {
    return {
        visitor: {
            Program(path, state){

                console.log('monkey!');
                console.log(defs.NODE_FIELDS.ObjectExpression);
                console.log(randomChildNodes("ObjectExpression"));


                let rootVarName = "us_toast";
                let toast = t.variableDeclaration(
                    "let", 
                    [t.variableDeclarator(t.identifier(rootVarName))]
                );
                path.node.body = [toast];

                /*
                let testNode = t.expressionStatement(
                    t.assignmentExpression(
                        "=",
                        t.identifier(rootVarName),

                    )
                )
                */

                // now we can add more lines to the program by pushing them onto path.node.body
                // path.node.body.push();
            }
        }
    };
}

function randomChildNodes(parentNodeType){

    // loop through parent node's possible childeren
        // select random valid node for that child

    return Object.keys(defs.NODE_FIELDS[parentNodeType]).map(
        child => {

            // if child has a default value, do we use it? 50% chance
            // if child is optional, do we include it? 50% chance
            // if child is chainOf (an array of) nodes, how many nodes should we have? random n in [1..10]
            // if child is oneOfNodeTypes, which node type do we choose? a random one

            // ObjectPattern seems to be a good test case?
            //if(defs.NODE_FIELDS[parentNodeType][child].default)
                return defs.NODE_FIELDS[parentNodeType][child].default; // for now

            //if(defs.NODE_FIELDS[
            //return;
        }
    )
}