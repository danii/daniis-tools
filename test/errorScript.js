const env = null;

//Used to make stack traces.

function namedFunction() {
  function namedArrowFunction() {
    eval(
      "function doubleEvalFunction() {\n" +
      "  eval('throw new Error(\"Example " + env + " Error\");');\n" +
      "}\n" +
      "\n" +
      "doubleEvalFunction();"
    );
  };

  (function() {
    namedArrowFunction();
  })();
}

try {
  namedFunction();
} catch (error) {
  console.log(error.stack);
  window.stack = error.stack;
}
