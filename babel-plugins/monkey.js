var _t = require("@babel/types/lib/definitions/index.js");
//console.log(_t);
var seedrandom = require('seedrandom');
var rng = seedrandom('a'); 

module.exports = function infiniteJSMonkey({types: t}) {
    return {
        visitor: {
            Program(path, state){
                //console.log(_t.PLACEHOLDERS_ALIAS);
                //console.log('monkey!', t);
                //console.log(_t.NODE_FIELDS.ArrayPattern)
                //console.log(_t.NODE_FIELDS.ArrayPattern.elements.validate.chainOf)
                //console.log(); // VariableDeclaration
                console.log(randomParametersForNode("ClassMethod", t));
                return;

                let rootVarName = "us_toast";
                let toast = t.variableDeclaration(
                    "let", 
                    [t.variableDeclarator(t.identifier(rootVarName))]
                );
                //path.node.body = [toast];

                path.node.body = [
                    //t.variableDeclaration(...randomParametersForNode("VariableDeclaration", t))
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
      computed: false,//"'false'",
    },
    ClassPrivateProperty: {
      computed: false,//"'false'",
    },
};

/**
 * randomParametersForNode()
 * 
 * this function is based on https://github.com/babel/babel/blob/main/packages/babel-types/scripts/generators/docs.js#L71
 * which generates the webpage https://babeljs.io/docs/en/babel-types
 * essentially, the flow of this function can be thought of as the following:
 * loop through parent node's possible childeren (instead of a loop its a map())
 *      select random valid node for that child
 * 
 * @param {String} key name of node type
 * @param {Object} builder 
 * @returns {[parameter]} list of random parameters for node
 */
function randomParametersForNode(key, builder, DEBUG_NODE_DEPTH = 0){

    if(customTypes[key]){
        return customTypes[key]
    }

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

            const fieldIgnoreList = ["decorators"];

            const useOptionalField = rng() < 0.5;

            

            // this conditional must be the first, dont put one before it          
            if (_t.BUILDER_KEYS[key].indexOf(field) < 0) {
                return "excluded from builder function";
            }

            if(fieldIgnoreList.includes(field)){
                return null;
            }

            
            if(_t.NODE_FIELDS[key][field].optional && !useOptionalField){
                return null;
            }
            
            if (customTypes[key] && customTypes[key][field]) {
                return {type: "valueForCustomType"};
            } 

            if (validator) {
                return getRandomValuesFromValidator(validator, builder, DEBUG_NODE_DEPTH);
            }

            // failsafe
            console.error('Failsafe hit!', key, field, validator);
            return null;

        }
    )
    .filter(arg => arg !== "excluded from builder function");
}

/**
 * based on https://github.com/babel/babel/blob/b05dad7fed07672514fa6d0d21ce4c1e2c3a6f79/packages/babel-types/scripts/utils/stringifyValidator.js#L1
 * @param {*} validator 
 * @param {*} nodePrefix 
 * @returns 
 */
function getRandomValuesFromValidator(validator, builder, DEBUG_NODE_DEPTH) {

    // these naming conventions are dogshit
    // 'each' means array of args while 'chainOf' means nothing???

    if (validator === undefined) {
        return null;
    }

    if (validator.each) {
        // this number right below........ here, is the max number of sibling child nodes that will be generated
        return [...Array(Math.ceil(rng() * 2)).keys()].map( _ => getRandomValuesFromValidator(validator.each, builder, DEBUG_NODE_DEPTH));
    }

    if (validator.chainOf) {
        // honestly why the fuck is this called the 'chainOf' property
        return getRandomValuesFromValidator(validator.chainOf[1], builder, DEBUG_NODE_DEPTH);
    }

    if (validator.oneOf) {
        // return random choice
        return validator.oneOf[Math.floor(rng() * validator.oneOf.length)];
    }

    if (validator.oneOfNodeTypes) {

        // we pick a random node type from the oneOfNodeTypes list
        // if the chosen node type is an alias, we then pick a random node type with that alias
        const randomNodeKey = keyOrAliasToRandomKey(
            validator.oneOfNodeTypes[Math.floor(rng() * validator.oneOfNodeTypes.length)]
        );

        // log the AST as its generated
        console.log(...[...Array(DEBUG_NODE_DEPTH).keys()].map(() => "-"), randomNodeKey);

        const nodeCreateFunc = randomNodeKey.charAt(0).toLowerCase() + randomNodeKey.slice(1);

        return builder[nodeCreateFunc](...randomParametersForNode(randomNodeKey, builder, DEBUG_NODE_DEPTH + 1)); 
    }

    // TODO: solve this case
    if (validator.oneOfNodeOrValueTypes) {
        return null; validator.oneOfNodeOrValueTypes
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

    //  looks like this is only used for the TemplateElement node. 
    // why did they not throw this case in the customTypes array?
    if (validator.shapeOf) {
        return { raw: "doggin", cooked: "myBrain"};
    }

    console.error("getRandomValuesFromValidator() failed:", validator);
}
  
/**
 * Heuristic to decide whether or not the given type is a value type (eg. "null")
 * or a Node type (eg. "Expression").
 */
function isValueType(type) {
    return type.charAt(0).toLowerCase() === type.charAt(0);
}

function keyOrAliasToRandomKey(keyOrAlias){
    /*
    return  _t.FLIPPED_ALIAS_KEYS[keyOrAlias] ?  
            _t.FLIPPED_ALIAS_KEYS[keyOrAlias][Math.floor( rng() * _t.FLIPPED_ALIAS_KEYS[keyOrAlias].length)] : 
            keyOrAlias;
    */
    if(!_t.FLIPPED_ALIAS_KEYS[keyOrAlias]){
        return keyOrAlias;
    }
    const jsOnlyList = _t.FLIPPED_ALIAS_KEYS[keyOrAlias].filter(key => 
        key.slice(0,2) !== "TS"  && 
        key.slice(0,3) !== "JSX"
    );

    return jsOnlyList[Math.floor(rng() * jsOnlyList.length)];
}