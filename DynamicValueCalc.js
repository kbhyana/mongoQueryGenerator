let mongo = require('./mapQuery');
const response = {
    "stat": "NPS",
    "type": "Overall",
    "formula": "((count(@recommendComapny > 6) - count(@recommendComapny <=6))/count(@recommendComapany))*100",
    "columns": ['recommendCompany'],
    "query": '--------',
    "createdBy": "",
    "createdDate": "",
    "modifiedBy": "",
    "modifiedDate": ""
};

const functions = [
    "count",
    "sum",
    "avg"
]

function Stack() {
    this.stack = new Array();
}

Stack.prototype = {
    isEmpty: function () {
        return this.stack.length == 0;
    },

    pop: function () {
        return this.stack.pop();
    },

    peek: function () {
        return this.stack[this.stack.length - 1];
    },

    push: function (o) {
        this.stack.push(o);
    },

    size: function () {
        return this.stack.length;
    }
}
function BinaryTreeNode(d) {
    this.data = d;
    this.left = null;
    this.right = null;
}

function Operator(t) {
    this.sign = t;
    return this;
}

Operator.prototype = {
    lessOrEqualInPrecedenceTo: function (o) {
        return this.value <= o.value;
    }
}

let createOperator = function (t) {
    switch (t) {
        case '+': return new Plus(t);
        case '-': return new Minus(t);
        case '/': return new Divide(t);
        case '*': return new Multiply(t);
        default: return null;
    }
}

function Plus(t) {
    Operator.call(this, t);
    this.value = 0;
    this.applyFunction = function (arg1, arg2) {

        return arg1 + arg2;
    }
}

Plus.prototype = Object.create(Operator.prototype);

function Minus(t) {
    Operator.call(this, t);
    this.value = 0;
    this.applyFunction = function (arg1, arg2) {
        return arg1 - arg2;
    }
}

Minus.prototype = Object.create(Operator.prototype);

function Divide(t) {
    Operator.call(this, t);
    this.value = 1;
    this.applyFunction = function (arg1, arg2) {
        return arg1 / arg2;
    }
}

Divide.prototype = Object.create(Operator.prototype);

function Multiply(t) {
    Operator.call(this, t);
    this.value = 1;
    this.applyFunction = function (arg1, arg2) {
        return arg1 * arg2;
    }
}

Multiply.prototype = Object.create(Operator.prototype);

let infixToBinaryTree = async  function (input) {
    if (input.length == 0) return null;
    if (input.length == 1) return input[0];

    let head = null,
        outputStack = new Stack(),
        operatorStack = new Stack();

    let updateTree = function () {
        let operator = operatorStack.pop(),
            output = outputStack.pop();
        if (head == null) {
            head = new BinaryTreeNode(operator);
            left = outputStack.pop();
            head.left = left instanceof BinaryTreeNode ? left : new BinaryTreeNode(left);
            head.right = output instanceof BinaryTreeNode ? output : new BinaryTreeNode(output);
        } else {
            let subtree = head;
            head = new BinaryTreeNode(operator);
            head.left = output instanceof BinaryTreeNode ? output : new BinaryTreeNode(output);
            head.right = subtree;
        }
    }

    let createSubtree = function createSubtree(operator, tree) {
        if (tree == null) {
            let right = outputStack.pop(),
                left = outputStack.pop();
            tree = new BinaryTreeNode(operator);
            tree.right = right instanceof BinaryTreeNode ? right : new BinaryTreeNode(right);
            tree.left = left instanceof BinaryTreeNode ? left : new BinaryTreeNode(left);
        } else {
            let subtree = tree,
                left = outputStack.pop();
            tree = new BinaryTreeNode(operator);
            tree.right = subtree;
            tree.left = left instanceof BinaryTreeNode ? left : new BinaryTreeNode(left);
        }

        if (!operatorStack.isEmpty() && operator.lessOrEqualInPrecedenceTo(operatorStack.peek())) {
            return createSubtree(operatorStack.pop(), tree);
        } else {
            return tree;
        }
    }

    for (let s = 0; s < input.length;) {
        let token;
        if (isLetter(input[s])) {
            let arrayLength = functions.length;
            for (let i = 0; i < arrayLength; i++) {
                if (input.substr(s, functions[i].length) === functions[i]) {
                    let jumpingIndex = findClosingBracketMatchIndex(input, s + functions[i].length);
                    let token1 = await mongo.getDataFromMongo(i, input.substring(s + functions[i].length + 1, jumpingIndex));
                    token1 = Math.round(token1);
                    console.log("token : ",i,":", token1);
                    input = input.replace(input.substr(s, jumpingIndex - s + 1), token1);
                    console.log(input)
                    console.log(input[s])
                }
            }
        }
        if (isNaN(input[s]) && !isLetter(input[s])) {
            token = input[s];
            s += 1;
        }
        
        else {
            let i = s + 1;
            while (i < input.length && !isNaN(input[i])) {
                i += 1;
            }
            token = input.substring(s, i);
            s = i;
        }
        if (token == '(') {
            operatorStack.push(token);
        } else if (token == ')') {
            while (operatorStack.peek() != '(') {
                let subtree = createSubtree(operatorStack.pop(), null);
                outputStack.push(subtree);
            }
            operatorStack.pop();
        } else if (token.length == 1 && isNaN(token) && !isLetter(token)) { // token length can be taken out
            let operator = createOperator(token);
            if (!operatorStack.isEmpty() && operator.lessOrEqualInPrecedenceTo(operatorStack.peek())) {
                let subtree = createSubtree(operatorStack.pop(), null);
                outputStack.push(subtree);
            }
            operatorStack.push(operator);
        } else {
            outputStack.push(parseFloat(token));
        }
    }

    while (!operatorStack.isEmpty()) {
        updateTree();
    }

    if (head == null && outputStack.size() == 1 && outputStack.peek() instanceof BinaryTreeNode) {
        head = outputStack.pop();
    }
    return head;
}
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

let evaluate = function (node) {
    let token = node.data;
    if (token instanceof Operator) {
        return token.applyFunction(evaluate(node.left), evaluate(node.right));
    }
    else {
        // console.log(token + 'as')
        return token;
    }
}
function findClosingBracketMatchIndex(str, pos) {
    if (str[pos] != '(') {
        throw new Error("No '(' at index " + pos);
    }
    let depth = 1;
    for (let i = pos + 1; i < str.length; i++) {
        switch (str[i]) {
            case '(':
                depth++;
                break;
            case ')':
                if (--depth == 0) {
                    return i;
                }
                break;
        }
    }
    return -1;    // No matching closing parenthesis
}
infixToBinaryTree('( sum(@recommendCompany>2) +2 )'.replace(/\s/g, '')).then((result)=>{
    console.log(evaluate(result));
})
// console.log(evaluate()));
