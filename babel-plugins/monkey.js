var _t = require("@babel/types/lib/definitions/index.js");
//console.log(_t);
var seedrandom = require('seedrandom');
var rng = seedrandom('hello.');

module.exports = function infiniteJSMonkey({types: t}) {
    return {
        visitor: {
            Program(path, state){
                console.log('monkey!', t);
                console.log(_t.NODE_FIELDS.VariableDeclaration);
                console.log(randomParametersForNode("VariableDeclaration", t));


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

// for now, have computed always be false, and all the methods be Expressions
// TODO: convert this into an engine that can implement this logic
const customTypes = {
    ClassMethod: {
      key: "if computed then `Expression` else `Identifier | Literal`",
    },
    Identifier: {
      name: "`string`",
    },
    MemberExpression: {
      property: "if computed then `Expression` else `Identifier`",
    },
    ObjectMethod: {
      key: "if computed then `Expression` else `Identifier | Literal`",
    },
    ObjectProperty: {
      key: "if computed then `Expression` else `Identifier | Literal`",
    },
    ClassPrivateMethod: {
      computed: "'false'",
    },
    ClassPrivateProperty: {
      computed: "'false'",
    },
};

/**
 * randomParametersForNode()
 * 
 * this function is based on https://github.com/babel/babel/blob/main/packages/babel-types/scripts/generators/docs.js#L71
 * which generates the webpage https://babeljs.io/docs/en/babel-types
 * 
 * @param {String} key name of node type
 * @param {Object} t node generator object
 * @returns {[parameter]} list of random parameters for node
 */
function randomParametersForNode(key, t){

    // essentially, the flow of this function can be thought of as the following:
    // loop through parent node's possible childeren (instead of a loop its a map())
    //      select random valid node for that child

    
    return Object.keys(_t.NODE_FIELDS[key])
    .sort( (fieldA, fieldB) => {
        const indexA = _t.BUILDER_KEYS[key].indexOf(fieldA);
        const indexB = _t.BUILDER_KEYS[key].indexOf(fieldB);
        if (indexA === indexB) return fieldA < fieldB ? -1 : 1;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    })
    .map( (field) => {
            const defaultValue = _t.NODE_FIELDS[key][field].default;
            const validator = _t.NODE_FIELDS[key][field].validate;

            const useDefaultValue  = rng() > 0.5;
            const useOptionalField = rng() > 0.5;

            
            if (customTypes[key] && customTypes[key][field]) {
                return "customTypeValue";
            } 
            else if (validator) {
                try {
                    getRandomValuesFromValidator(validator, "")
                } catch (ex) {
                    if (ex.code === "UNEXPECTED_VALIDATOR_TYPE") {
                    console.log(
                        "Unrecognised validator type for " + key + "." + field
                    );
                    console.dir(ex.validator, { depth: 10, colors: true });
                    }
                }
            }

            if(_t.NODE_FIELDS[key][field].optional && useOptionalField){

            }
            else if((defaultValue !== null) && useDefaultValue){

            }
            else /* field is required, or we choose to randomly populate it */{

            }


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

                const nodeCreateFunc = randomValidNodeType.charAt(0).toLowerCase() + randomValidNodeType.slice(1)
                /*
                if(!t[nodeCreateFunc]){
                    return t[child.validate.oneOfNodeTypes[0]];
                }
                */

                console.log('returning oneOfNodeTypes', field);
                // could also use .apply() but the spread operator is nicer 
                //...may have an issue with the args not being applied in the right order
                return t[nodeCreateFunc](...randomParametersForNode(randomValidNodeType)); 
                
            }

            // failsafe
            console.log('failsafe hit', child.validate);
            return null;

        }
    )
}

/**
 * TODO: port to getRandomValuesFromValidator
 * based on https://github.com/babel/babel/blob/b05dad7fed07672514fa6d0d21ce4c1e2c3a6f79/packages/babel-types/scripts/utils/stringifyValidator.js#L1
 * @param {*} validator 
 * @param {*} nodePrefix 
 * @returns 
 */
function getRandomValuesFromValidator(validator, nodePrefix) {
    if (validator === undefined) {
        return "any";
    }

    if (validator.each) {
        return `Array<${getRandomValuesFromValidator(validator.each, nodePrefix)}>`;
    }

    if (validator.chainOf) {
        return getRandomValuesFromValidator(validator.chainOf[1], nodePrefix);
    }

    if (validator.oneOf) {
        return validator.oneOf.map(JSON.stringify).join(" | ");
    }

    if (validator.oneOfNodeTypes) {
        return validator.oneOfNodeTypes.map(_ => nodePrefix + _).join(" | ");
    }

    if (validator.oneOfNodeOrValueTypes) {
        return validator.oneOfNodeOrValueTypes
        .map(_ => {
            return isValueType(_) ? _ : nodePrefix + _;
        })
        .join(" | ");
    }

    if (validator.type) {
        return validator.type;
    }

    if (validator.shapeOf) {
        return (
        "{ " +
        Object.keys(validator.shapeOf)
            .map(shapeKey => {
            const propertyDefinition = validator.shapeOf[shapeKey];
            if (propertyDefinition.validate) {
                const isOptional =
                propertyDefinition.optional || propertyDefinition.default != null;
                return (
                shapeKey +
                (isOptional ? "?: " : ": ") +
                getRandomValuesFromValidator(propertyDefinition.validate)
                );
            }
            return null;
            })
            .filter(Boolean)
            .join(", ") +
        " }"
        );
    }
    return ["any"];
}
  
/**
 * Heuristic to decide whether or not the given type is a value type (eg. "null")
 * or a Node type (eg. "Expression").
 */
function isValueType(type) {
    return type.charAt(0).toLowerCase() === type.charAt(0);
}