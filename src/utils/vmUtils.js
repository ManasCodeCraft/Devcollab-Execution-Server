const estraverse = require('estraverse');
const esprima = require('esprima');

module.exports.getResetCode = syncHandler((code) => {
  const ast = esprima.parseScript(code);

  const variableNames = new Set();

  estraverse.traverse(ast, {
    enter(node) {
      if (node.type === "VariableDeclarator" ) {
        variableNames.add(node.id.name);
      }
      if (node.type === "FunctionDeclaration") {
        variableNames.add(node.id.name);
      }
      if (
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression"
      ) {
        node.params.forEach((param) => {
          if (param.type === "Identifier") {
            variableNames.add(param.name);
          } else if (
            param.type === "ObjectPattern" ||
            param.type === "ArrayPattern"
          ) {
            param.elements.forEach((element) => {
              if (element.type === "Identifier") {
                variableNames.add(element.name);
              }
            });
          }
        });
      }
    },
  });

  let resetCode = "";
  variableNames.forEach((name) => {
    resetCode += ` try { ${name} = undefined } catch(e){} \n`;
  });

  return resetCode;
});


module.exports.terminateProgramFunctionString = syncHandler((code)=>{
    const resetcode = module.exports.getResetCode(code)
    const str = `
       ${resetcode}
       // throw new Error('Program stopped');
    `
    return str;
})