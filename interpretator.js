const performOperation = (operator, a, b) => {
  switch (operator) {
    case "*":
      return a * b;
    case "^":
      return Math.pow(a, b);
    case "%":
      return a % b;
    case "/":
      return a / b;
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "<":
      return a < b;
    case ">":
      return a > b;
    case ">=":
      return a >= b;
    case "<=":
      return a <= b;
    case "==":
      return a === b;
    case "!=":
      return a !== b;
    case "&&":
      return a && b;
    case "||":
      return a || b;

    default:
      throw Error("Unknown Operator " + operator);
  }
};

const interpret = (node) => {
  const printList = [];
  const storage = {
    print: (x) => printList.push(x),
    alert: (x) => alert(x),
  };

  const traverse = (node) => {
    //  console.log(storage);

    if (!node) return;

    switch (node.token.type) {
      case "operator":
        return performOperation(
          node.token.value,
          traverse(
            node.left || (node.left = new Node({ value: "0" })) || node.left
          ),
          traverse(node.right)
        );
      case "number":
        return parseInt(node.token.value);
      case "string":
        return node.token.value.replace(/\"/g, "");
      case "assign":
        return (storage[node.left.token.value] = traverse(node.right));
      case "id":
        return storage[node.token.value];
      case "func":
        if (node.right) {
          return storage[node.left.token.value](traverse(node.right));
        }
        return storage[node.left.token.value]();
      case "cond_compr":
        return traverse(node.center)
          ? traverse(node.left)
          : traverse(node.right);
      case "while_loop":
        while (traverse(node.left)) {
          traverse(node.right);
        }
        break;
      case "statement":
        traverse(node.left);
        return traverse(node.right);
      default:
        return;
    }
  };
  traverse(node);
  return { printList, storage };
};
