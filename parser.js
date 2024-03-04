/**
 *
 * <statement> -> <declaration> <statement> | <condition> <statement> | <while_loop_expr> <statement> | <end>
 *
 * <declaration> -> <type> <action> | <action>
 * <action> -> <id> ( <param> ) | <id> (  ) | <id> = <cond_expr> | <id>
 * TODO <param> -> <cond_expr>, <param> | <cond_expr>
 *
 * <while_loop_expr> -> while <cond_expr> : <statement> ;
 *
 * <condition> ->  cond <cond_statement>
 * <cond_statement> ->  <cond_expr> ? <statement> ; | <cond_expr> ? <statement> : <cond_else>
 * <cond_else> ->  <cond_statement> | <statement> ;
 *
 * <id> -> [^0-9][a-zA-Z]
 * <type> -> def
 *
 * <cond_expr> -> <cond_expr> ||<cond_expr_compr>  | <cond_expr> && <cond_expr_compr> || <cond_expr_compr>
 *
 * <cond_expr_compr> -> <cond_expr_compr> > <expr> | <cond_expr_compr> < <expr>  | <cond_expr_compr> <= <expr>  | <cond_expr_compr> >= <expr> |
 * <cond_expr_compr> == <expr> |  <expr>
 *
 * <expr> -> <expr> + <term> | <expr> - <term> | <term>
 * <term> -> <term> * <unary> | <term> / <unary> | <unary>
 * <unary> -> + <factor> | - <factor> | <factor>
 * <factor> -> ( <expr> ) | <id> | <const>
 */

function Node(token, left, right, center) {
  this.left = left;
  this.token = token;
  this.right = right;
  this.center = center;
}

Array.prototype.peek = function () {
  return this[this.length - 1];
};

/**
 *
 * @param {*} tokens
 * @param {*} trace
 */
function parse(tokens, trace) {
  //pre defined function
  const storage = new Set(["print", "alert"]);

  let i = 0,
    currToken = tokens[i];

  /**
   *
   * @param {*} type
   * @param {*} str
   */
  const pushTrace = (type, str) =>
    trace.push(`token "${currToken && currToken.value}" -> ${type} \`${str}\``);

  /**
   *
   * @param {*} message
   */
  const error = (message) => {
    trace.push(message + " ERROR!!");
    throw Error(message);
  };

  /**
   *
   * @param {*} type
   *
   */
  const eat = (type) => {
    pushTrace("execute", "eat " + type);
    if (peekNext(type)) {
      var tempCurr = currToken;

      do currToken = tokens[++i];
      while (peekNext("comment"));

      return tempCurr;
    }
    error("Syntax Error");
  };

  const peekNext = (type, next) => {
    if (!next) {
      return currToken && currToken.type === type;
    }
    const nextsToken = tokens[i + next];
    return nextsToken && nextsToken.type === type;
  };

  const token = (value, type) => ({ value, type: type || value });

  /**
   * <statement> -> <declaration> <statement> | <condition> <statement> | <end>
   */
  const statement = () => {
    if (!currToken) return;

    pushTrace("execute", "statement");
    let node;

    if (
      (node = declaration()) ||
      (node = condition() || (node = while_loop_expr()))
    ) {
      return new Node(token("statement"), node, statement());
    }
    // error("Syntax error");
    return false;
  };

  /**
   *  <while_loop_expr> -> while <cond_expr> : <statement> ;
   */
  const while_loop_expr = () => {
    pushTrace("execute", "while loop");
    if (peekNext("while_loop")) {
      pushTrace("match", "while_loop");
      const token = eat("while_loop");
      const compr = cond_expr();
      eat("cond_chain");
      const stmt = statement();
      eat("end");
      return new Node(token, compr, stmt);
    }
    return false;
  };

  /**
   * <condition> ->  cond <cond_statement>
   * <cond_statement> ->  <cond_expr> ? <statement> ; | <cond_expr> ? <statement> : <cond_else>
   * <cond_else> -> <statement> | <cond_statement> ;
   */
  const condition = () => {
    pushTrace("execute", "condition");
    if (peekNext("cond_start")) {
      pushTrace("match", "cond");
      eat("cond_start");
      return cond_statement();
    }
    return false;
  };

  const cond_statement = () => {
    const compr = cond_expr();
    const token = eat("cond_compr");
    const stmt = statement();
    if (peekNext("end")) {
      eat("end");
      return new Node(token, stmt, undefined, compr);
    } else if ("cond_chain") {
      eat("cond_chain");
      return new Node(token, stmt, cond_else(), compr);
    }
    return false;
  };

  const cond_else = () => {
    const node = statement();
    console.log(node);
    if (node) {
      eat("end");
      return node;
    }
    return cond_statement();
  };

  /**
   * <declaration> -> <type> <action> | <action>
   */
  const declaration = () => {
    pushTrace("execute", "declaration");

    if (peekNext("type")) {
      pushTrace("match", "type action");

      //todo: define types
      eat("type");
      const id = currToken.value;
      if (!storage.has(id)) {
        storage.add(id);
      } else error(`${id} is already declared`);
    }

    return action();
  };

  /**
   * <action> ->  <id> ( <cond_expr ) | <id> ( ) | <id> = <cond_expr> | <id>
   */
  const action = () => {
    pushTrace("execute", "action");

    if (peekNext("id")) {
      if (currToken) {
        if (peekNext("lparen", 1)) {
          const idNode = id();
          eat("lparen");
          const node = new Node(token("func"), idNode);

          if (currToken.type !== "rparen") {
            pushTrace("match", "id ( cond_expr )");
            node.right = cond_expr();
          } else {
            pushTrace("match", "id ( )");
          }

          eat("rparen");
          return node;
        }

        if (peekNext("assign", 1)) {
          const idNode = id();
          pushTrace("match", "id = cond_expr");

          return new Node(eat("assign"), idNode, cond_expr());
        }
      }

      console.log(peekNext("operator", 1));
      if (peekNext("operator", 1)) {
        return false;
      }
      return new Node(token("=", "assign"), id(), defaultVal());
    }

    return false;
  };

  const defaultVal = () => new Node(token(0, "number"));

  const id = () => {
    pushTrace("execute", "id");
    const idToken = eat("id");
    if (!storage.has(idToken.value)) error(`${idToken.value} is not declared`);

    return new Node(idToken);
  };

  /**
   *
   */
  const cond_expr = () => {
    pushTrace("execute", "cond_expr");
    let node = cond_expr_compr();
    if (currToken && currToken.value.match(/\&\&|\|\|/)) {
      pushTrace("match", "cond_expr */ term");
      node = new Node(eat("operator"), node, cond_expr());
    }
    return node;
  };

  const cond_expr_compr = () => {
    pushTrace("execute", "cond_expr");
    let node = expr();
    while (currToken && currToken.value.match(/[\>\<\!]\=?|\={2}/)) {
      pushTrace("match", "cond_expr */ term");
      node = new Node(eat("operator"), node, expr());
    }
    return node;
  };

  /**
   *
   */
  const expr = () => {
    pushTrace("execute", "expr");
    let node = term();
    while (currToken && currToken.value.match(/[\+\-]/)) {
      pushTrace("match", "expr +- term");
      node = new Node(eat("operator"), node, term());
    }
    return node;
  };

  /**
   *
   */
  const term = () => {
    pushTrace("execute", "term");

    let node = unary();
    while (currToken && currToken.value.match(/[\*\/\%\^]/)) {
      pushTrace("match", "term */ unary");
      node = new Node(eat("operator"), node, unary());
    }
    return node;
  };

  /**
   *
   */
  const unary = () => {
    pushTrace("execute", "unary");
    if (currToken && currToken.value.match(/[\+\-]/)) {
      pushTrace("match", "+- factor");
      return new Node(eat("operator"), defaultVal(), factor());
    }
    return factor();
  };

  /**
   *
   */
  const factor = () => {
    pushTrace("execute", "factor");
    if (currToken) {
      if (peekNext("number")) {
        pushTrace("match", "const number");
        return new Node(eat("number"));
      } else if (peekNext("string")) {
        pushTrace("match", "const string");
        return new Node(eat("string"));
      } else if (peekNext("lparen")) {
        pushTrace("match", "( expr )");
        eat("lparen");
        const node = cond_expr();
        eat("rparen");
        return node;
      } else if (peekNext("id")) {
        if (!storage.has(currToken.value)) {
          error(`${currToken.value} is not declared`);
        }
        return id();
      }
    }
    error("Syntax Error");
  };

  return statement() || error("Syntax Error");
}
