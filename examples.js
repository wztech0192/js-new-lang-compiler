const examples = [
  {
    name: "Hello & arithmetic",
    code: `// Variables must be declared with def before use
def name = "World"
print("Hello, " + name + "!")

def x = 7
def y = 3
print(x + y)   // 10
print(x - y)   // 4
print(x * y)   // 21
print(x % y)   // 1
print(x ^ y)   // 343 (power)
print(-x + 2 * (y + 1))   // 1
`,
  },
  {
    name: "Conditions (cond)",
    code: `// cond <test> ? <then> ;
// cond <test> ? <then> : <else> ;
// cond <a> ? ... : <b> ? ... : ... ;   (else-if chain)
def temp = 23

cond temp > 30 ? print("hot") ;

cond temp >= 18 && temp <= 25
  ? print("comfortable")
  : print("not comfortable") ;

cond temp < 0 ? print("freezing")
  : temp < 15 ? print("cold")
  : temp < 25 ? print("mild")
  : print("warm") ;
`,
  },
  {
    name: "While loop",
    code: `// while <test> : <statements> ;
def n = 5
while n > 0 :
  print(n)
  n = n - 1
;
print("Liftoff!")
`,
  },
  {
    name: "FizzBuzz",
    code: `def i = 1
while i <= 15 :
  cond i % 15 == 0 ? print("FizzBuzz")
    : i % 3 == 0 ? print("Fizz")
    : i % 5 == 0 ? print("Buzz")
    : print(i) ;
  i = i + 1
;
`,
  },
  {
    name: "Factorial",
    code: `def n = 10
def result = 1
def k = 1
while k <= n :
  result = result * k
  k = k + 1
;
print(n + "! = " + result)
`,
  },
  {
    name: "Fibonacci",
    code: `/* First 10 Fibonacci numbers */
def a = 0
def b = 1
def next = 0
def count = 0
while count < 10 :
  print(a)
  next = a + b
  a = b
  b = next
  count = count + 1
;
`,
  },
  {
    name: "Primes (nested loops)",
    code: `// Print every prime up to 30
def n = 2
def d = 0
def isPrime = 0
while n <= 30 :
  isPrime = 1
  d = 2
  while d * d <= n :
    cond n % d == 0 ? isPrime = 0 ;
    d = d + 1
  ;
  cond isPrime == 1 ? print(n) ;
  n = n + 1
;
`,
  },
  {
    name: "Collatz sequence",
    code: `def n = 27
def steps = 0
while n != 1 :
  cond n % 2 == 0 ? n = n / 2 : n = 3 * n + 1 ;
  steps = steps + 1
;
print("27 reaches 1 after " + steps + " steps")
`,
  },
  {
    name: "Greatest common divisor",
    code: `// Euclid's algorithm
def a = 1071
def b = 462
def t = 0
while b != 0 :
  t = b
  b = a % b
  a = t
;
print("gcd = " + a)
`,
  },
];

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("input");
  const select = document.getElementById("examples");
  const runButton = document.getElementById("run");

  examples.forEach((ex, i) => select.add(new Option(ex.name, i)));

  function load(ex) {
    input.value = ex.code;
    input.dispatchEvent(new Event("input")); // re-highlight
    runButton.click();
  }

  select.onchange = function () {
    if (select.value === "") return;
    const isExample = examples.some((ex) => ex.code === input.value);
    if (input.value.trim() && !isExample && !confirm("Replace your code with this example?")) {
      select.value = "";
      return;
    }
    load(examples[select.value]);
    select.value = "";
  };

  // First visit: start with an example instead of a blank editor
  if (!input.value.trim()) load(examples[0]);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runButton.click();
    } else if (e.key === "Tab") {
      e.preventDefault();
      input.setRangeText("  ", input.selectionStart, input.selectionEnd, "end");
      input.dispatchEvent(new Event("input"));
    }
  });

  // Syntax-highlight the snippets in the syntax reference
  document.querySelectorAll("code.hl").forEach((el) => {
    el.innerHTML = el.textContent.replace(
      new RegExp(rules.map((r) => "(" + r.lexeme.source.substring(1) + ")").join("|"), "g"),
      function (str) {
        for (let i = 1; i <= rules.length; i++) {
          if (arguments[i]) return `<span style="color:${rules[i - 1].color}">${escapeHtml(str)}</span>`;
        }
        return escapeHtml(str);
      }
    );
  });
});
