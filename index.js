document.addEventListener("DOMContentLoaded", function () {
  const lexRegex = new RegExp(
    rules.map((r) => "(" + r.lexeme.source.substring(1) + ")").join("|"),
    "g"
  );

  const input = document.getElementById("input");
  const highlight = document.getElementById("highlight");
  const background = document.getElementById("background");
  input.value = localStorage.getItem("input");
  applyHighlights();

  input.oninput = applyHighlights;

  function applyHighlights() {
    const highlighted = input.value
      .replace(/\n$/g, "\n\n")
      .replace(lexRegex, function (str) {
        for (var i = 1; i <= rules.length; i++) {
          if (arguments[i]) {
            return `<span style="color:${rules[i - 1].color}">${str}</span>`;
          }
        }
        return str;
      });
    highlight.innerHTML = highlighted;
  }

  input.onscroll = function () {
    background.scrollTop = input.scrollTop;
  };

  const output = document.getElementById("output");
  const virtual = document.getElementById("virtual");
  const traceList = document.getElementById("traceList");
  const varContainer = document.getElementById("var");

  document.getElementById("run").onclick = function () {
    const code = input.value;
    localStorage.setItem("input", code);
    const trace = [];

    try {
      const lex = lexer(code);
      console.log("lexical analysis", lex);

      const ast = parse(lex, trace);
      virtual.innerHTML = "";
      virtual.append(displayAST(ast, 0));
      console.log("abstract syntax tree", ast);
      //console.log("trace", trace)

      const { printList, storage } = interpret(ast);
      varContainer.innerHTML = JSON.stringify(
        storage,
        (key, value) =>
          typeof value === "function" ? value.toString() : value,
        "\t"
      );
      const result = printList.join("\n");
      output.style.color = "white";
      output.value = result;
    } catch (e) {
      virtual.innerHTML = "";
      varContainer.innerHTML = "";
      console.error(e);
      output.style.color = "red";
      output.value = e.message;
    }
    createTraceList(traceList, trace);
  };
});

function createTraceList(traceList, trace = []) {
  traceList.innerHTML = "";

  trace.forEach((t) => {
    var li = document.createElement("li");
    li.innerHTML = t;
    traceList.appendChild(li);
  });
}

function displayAST(node, level, arr) {
  const li = document.createElement("li");
  const text = document.createElement("span");
  text.textContent = "  " + node.token.value;
  li.appendChild(text);
  if (node.left || node.right) {
    const innerList = document.createElement("ul");

    if (node.center) {
      innerList.append(displayAST(node.center));
    }
    if (node.left) {
      innerList.append(displayAST(node.left));
    }

    if (node.right) {
      innerList.append(displayAST(node.right));
    }
    li.appendChild(innerList);
    li.onclick = function (e) {
      e.stopPropagation();
      if (innerList.style.display === "none") {
        innerList.style.display = "block";
      } else {
        innerList.style.display = "none";
      }
    };
  }

  text.onmouseenter = function (e) {
    e.stopPropagation();
    li.style.background = "lightgray";
    li.style.color = "black";
  };
  text.onmouseleave = function (e) {
    e.stopPropagation();
    li.style.background = "inherit";
    li.style.color = "inherit";
  };

  return li;
}
