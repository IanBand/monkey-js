module.exports = function generateGrammar({types: t}) {
    return {
        visitor: {
            // https://babeljs.io/docs/en/babel-types
            Program(path, state){
                // https://github.com/babel/babel/blob/main/packages/babel-types/src/ast-types/generated/index.ts this is just str8 up the emca grammar
                console.log('generating grammar!');
            }
        }
    };
}