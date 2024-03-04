const rules = [
  {
    lexeme:
      /^(?:(?:\/\*(?:[^*]|[\r\n]|(?:\*+(?:[^*\/]|[\r\n])))*\*\/+)|\/\/.*)/,
    glex: /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*\/+)|\/\/.*/g,
    type: "comment",
    color: "green",
  },
  {
    lexeme: /^\".*?\"/,
    type: "string",
    color: "navajowhite",
  },
  {
    lexeme: /^[0-9]*\.?[0-9]+/,
    type: "number",
    color: "palegreen",
  },
  {
    lexeme: /^(?:[\+\-\*\/\%\^]|[\>\<\!]=?|={2}|\&\&|\|\|)/,
    type: "operator",
    color: "white",
  },
  {
    lexeme: /^\(/,
    type: "lparen",
    color: "orchid",
  },
  {
    lexeme: /^\)/,
    type: "rparen",
    color: "orchid",
  },
  {
    lexeme: /^def\b/,
    type: "type",
    color: "violet",
  },
  {
    lexeme: /^=/,
    type: "assign",
    color: "white",
  },
  {
    lexeme: /^cond/,
    type: "cond_start",
    color: "violet",
  },
  {
    lexeme: /^\?/,
    type: "cond_compr",
    color: "violet",
  },
  {
    lexeme: /^\:/,
    type: "cond_chain",
    color: "violet",
  },
  {
    lexeme: /^while/,
    type: "while_loop",
    color: "violet",
  },
  {
    lexeme: /^;/,
    type: "end",
    color: "violet",
  },
  {
    lexeme: /^[^\d\W][\w]*\b/,
    type: "id",
    color: "lightblue",
  },
];

const op = [
  { val: ["(", ")"], associativity: "left" },
  { val: ["*", "%", "/"], associativity: "left" },
  { val: ["+", "-"], associativity: "left" },
].reduce((acc, ops, i) => {
  for (let op of ops.val) {
    acc[op] = {
      precedence: i + 1,
      associativity: ops.associativity,
    };
  }
  return acc;
}, {});

const findMatch = (word) => {
  let match;
  for (let rule of rules) {
    if ((match = word.match(rule.lexeme))) {
      return {
        type: rule.type,
        value: match[0],
      };
    }
  }
  return false;
};

const validParenthesis = (type, parens) => {
  if (type === "lparen") {
    parens.push(type);
  } else if (type === "rparen") {
    if (parens.length <= 0) {
      return false;
    }
    parens.pop();
  }
  return true;
};

const lexer = (string) => {
  const arr = [],
    parens = [];
  //delete comments, make >> nextline
  string = string.replace(/\>\>/g, "\n");
  let trimStr, match;
  while (string) {
    trimStr = string.trim();
    match = findMatch(trimStr);
    if (!match) {
      throw Error(`Unknown symbol "${trimStr.split(" ")[0]}"`);
    } else if (!validParenthesis(match.type, parens)) {
      throw Error("Extra parenthesis error");
    } else {
      arr.push(match);
      string = trimStr.substring(match.value.length);
    }
  }
  if (parens.length > 0) {
    throw Error("Unclose parenthesis error");
  }
  return arr;
};
