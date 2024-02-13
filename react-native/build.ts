// add to all function a "worklet" directive at the first line with jscodeshift
// to make the lib compatible with react-native-reanimated

import { Transform } from 'jscodeshift';

const functionsToTransform = ['fastFloor', 'createNoise2D', 'createNoise3D', 'createNoise4D', 'buildPermutationTable'];
const returnFunctionsToTransform = ['noise2D', 'noise3D', 'noise4D'];

const transform: Transform = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // find all function declarations
  root.find(j.FunctionDeclaration).forEach((path) => {
    if (path.value.id?.name && functionsToTransform.includes(path.value.id.name)) {
      path.value.body.body.unshift(
        j.expressionStatement(j.identifier('\'worklet\''))
      );
    }
  });

  // find all return functions statements
  root.find(j.FunctionExpression).forEach((path) => {
    if (path.value.id?.name && returnFunctionsToTransform.includes(path.value.id.name)) {
      path.value.body.body.unshift(
        j.expressionStatement(j.identifier('\'worklet\''))
      );
    }
  });

  return root.toSource();
};

export default transform;
