const madge = require('madge');

// Path to the entry file or directory of your project
const pathToAnalyze = './src';

madge(pathToAnalyze)
  .then((res) => {
    const circularDependencies = res.circular();

    if (circularDependencies.length) {
      console.log('Circular dependencies found:');
      console.log(circularDependencies);
    } else {
      console.log('No circular dependencies found.');
    }
  })
  .catch((err) => {
    console.error('Error analyzing dependencies:', err);
  });
