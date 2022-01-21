var defs = require("@babel/types/lib/definitions/index.js");
var seedrandom = require('seedrandom');
var rng = seedrandom('hello.');

module.exports = function infiniteJSMonkey({types: t}) {
    return {
        visitor: {
            Program(path, state){

                console.log('monkey!');
                console.log(defs.NODE_FIELDS.VariableDeclaration);
                console.log(randomChildNodes("VariableDeclaration", t));


                let rootVarName = "us_toast";
                let toast = t.variableDeclaration(
                    "let", 
                    [t.variableDeclarator(t.identifier(rootVarName))]
                );
                //path.node.body = [toast];

                path.node.body = [

                ]
                

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

function randomChildNodes(parentNodeType, t){

    // essentially, the flow of this function can be thought of as the following:
    // loop through parent node's possible childeren (instead of a loop its a map())
    //      select random valid node for that child

    //...may have an issue with the args not being applied in the right order
    return Object.keys(defs.NODE_FIELDS[parentNodeType]).map(
        childNodeName => {

            const child = defs.NODE_FIELDS[parentNodeType][childNodeName];

            



            // useful? https://babeljs.io/docs/en/babel-types#typescript

            // if child is optional, do we include it?
            if(child.optional){
                // if(rng() > 0.5) return null; // chance of including an optional node
                // ignore these common optional nodes: const ignoreList = ['typeAnnotation', 'decorators' ... ];
                console.log('returning default');
                return null;
            }
            // if child has a default value, do we use it?
            if(child.default){
                // if(rng() > 0.5) return child.default; // chance of using a node's default value
                console.log('returning default');
                return child.default;
            }


            if(child.validate.type){
                switch(child.validate.type){
                    case "string":  return "test";
                    case "boolean": return false;
                    default: return "default";
                }
            }
            if(child.validate.oneOf){
                return child.validate.oneOf[Math.floor(rng() * child.validate.oneOf.length)];
            }
            // if child is chainOf (an array of) nodes, how many nodes should we have? random n in [1..10]
            if(child.validate.chainOf){
                const chainNumber = Math.floor(rng() * 10);
                //console.log(child.validate.chainOf)
                console.log('returning chainOf');
                return [];
                
            }
            // if child is oneOfNodeTypes, which node type do we choose? a random one
            if(child.validate.oneOfNodeTypes){
                //console.log(child.validate.oneOfNodeTypes)

                const randomValidNodeType = child.validate.oneOfNodeTypes[Math.floor(rng() * child.validate.oneOfNodeTypes.length)];

                const nodeCreateFunc = randomValidNodeType[0].toLowerCase() + randomValidNodeType.slice(1)
                /*
                if(!t[nodeCreateFunc]){
                    return t[child.validate.oneOfNodeTypes[0]];
                }
                */

                console.log('returning oneOfNodeTypes', childNodeName);
                // could also use .apply() but the spread operator is nicer 
                //...may have an issue with the args not being applied in the right order
                return t[nodeCreateFunc](...randomChildNodes(randomValidNodeType)); 
                
            }

            // failsafe
            console.log('failsafe hit', child.validate);
            return null;

        }
    )
}