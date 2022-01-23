var _t = require("@babel/types/lib/definitions/index.js");
//console.log(_t);
var seedrandom = require('seedrandom');
var rng = seedrandom('hello.');

module.exports = function infiniteJSMonkey({types: t}) {
    return {
        visitor: {
            Program(path, state){
                //console.log(_t.PLACEHOLDERS_ALIAS);
                //console.log('monkey!', t);
                console.log(_t.NODE_FIELDS.VariableDeclaration); // VariableDeclaration Identifier
                //console.log(randomParametersForNode("VariableDeclaration", t));
                //return;

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
 * @param {Object} builder 
 * @returns {[parameter]} list of random parameters for node
 */
function randomParametersForNode(keyOrAlias, builder){

    // essentially, the flow of this function can be thought of as the following:
    // loop through parent node's possible childeren (instead of a loop its a map())
    //      select random valid node for that child

    // if the supplied key is an alias, pick a random key with that alias
    // i.e. if the supplied node type is a class of nodes, pick a random node type that is a member of the class
    const key = _t.FLIPPED_ALIAS_KEYS[keyOrAlias] ?  
        _t.FLIPPED_ALIAS_KEYS[keyOrAlias][Math.floor( rng() * _t.FLIPPED_ALIAS_KEYS[keyOrAlias].length)]
        : 
        keyOrAlias;

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

            const useOptionalField = rng() < 0.5;

            //TODO: if a field is "excluded from builder function", return the string literal "excluded from builder function"
            if(_t.NODE_FIELDS[key][field].optional && !useOptionalField){
                return null;
            }
            
            if (customTypes[key] && customTypes[key][field]) {
                return "valueForCustomType";
            } 
            else if (validator) {
                return getRandomValuesFromValidator(validator, "", builder);
                /*
                try {
                } catch (ex) {
                    if (ex.code === "UNEXPECTED_VALIDATOR_TYPE") {
                    console.log(
                        "Unrecognised validator type for " + key + "." + field
                    );
                    console.dir(ex.validator, { depth: 10, colors: true });
                    }
                }
                */
            }

            // failsafe
            console.log('Failsafe hit!', key, field, validator);
            return null;

        }
    )
    .filter(arg => arg !== "excluded from builder function");
}

/**
 * TODO: port to getRandomValuesFromValidator
 * based on https://github.com/babel/babel/blob/b05dad7fed07672514fa6d0d21ce4c1e2c3a6f79/packages/babel-types/scripts/utils/stringifyValidator.js#L1
 * @param {*} validator 
 * @param {*} nodePrefix 
 * @returns 
 */
function getRandomValuesFromValidator(validator, nodePrefix, builder) {
    if (validator === undefined) {
        return null;
    }

    if (validator.each) {
        return "each";//`Array<${getRandomValuesFromValidator(validator.each, nodePrefix)}>`;
    }

    // use _t.FLIPPED_ALIAS_KEYS to check if node type is an alias, and pick randomly from the family of aliases
    // may also need to use _t.PLACEHOLDERS, _t.PLACEHOLDERS_ALIAS, _t.PLACEHOLDERS_FLIPPED_ALIAS
    if (validator.chainOf) {
        //console.log(validator.chainOf);

        // assumes validator.chainOf[0].type === "array";
        return [...Array(Math.ceil(rng() * 2)).keys()].map( _ => getRandomValuesFromValidator(validator.chainOf[1].each, nodePrefix,builder));
    }

    if (validator.oneOf) {
        // return random choice
        return validator.oneOf[Math.floor(rng() * validator.oneOf.length)];
    }

    if (validator.oneOfNodeTypes) {

        console.log(validator.oneOfNodeTypes);

        const randomNodeKey = validator.oneOfNodeTypes[Math.floor(rng() * validator.oneOfNodeTypes.length)];

        const nodeCreateFunc = randomNodeKey.charAt(0).toLowerCase() + randomNodeKey.slice(1);


        return t[nodeCreateFunc](...randomParametersForNode(randomNodeKey, builder)); 
    }

    if (validator.oneOfNodeOrValueTypes) {
        return validator.oneOfNodeOrValueTypes
        /*
        .map(_ => {
            return isValueType(_) ? _ : nodePrefix + _;
        })
        .join(" | ");
        */
    }

    if (validator.type) {
        // need a special case for regex...
        switch(validator.type){
            case "string":
                return "tempID"; //TODO: gen random id or pull from pool of random identifiers or something
            case "boolean": 
                return rng() < 0.5;
            case "number": 
                return rng();
            default: 
                return "default";
        }
    }

    // looks like this is only used for a TemplateElement node
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