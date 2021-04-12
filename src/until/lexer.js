const T_ERROR = 1
const T_EMPTY = 0

const T_SPACE = 2
const T_NUMBER = 10
const T_DOT = 20
const T_OPERATOR = 30

const T_WORD = 50

const TypeToLabel = new Map()
TypeToLabel.set(T_SPACE, '空格')
TypeToLabel.set(T_NUMBER, '数字')
TypeToLabel.set(T_DOT, '小数点')
TypeToLabel.set(T_OPERATOR, '运算符')
TypeToLabel.set(T_WORD, '字符')

class CharState {
    type = T_EMPTY // 类型
    charType = T_EMPTY // 当前字符类型
    start = -1 // 状态机的包含字符的起始位置
    end = -1 // 状态机的包含字符的结束位置
    isFloat = false
    value = ''
    // prev: CharState;

    // 每次初始化，都是这次状态机的初始化，根据char确定这次状态机的状态。
    constructor(prev, char, i) {
        // 状态机的起始位置。
        this.start = i

        // 1. 得出char的type。
        this.type = this.getType(char)

        // 2. 重置prev？

        // this.prev = prev;
    }

    // 读取这一个字符，如果这个字符符合状态机的状态转移，则返回true，否则返回false。
    // 如 状态机是T_WORD，这一个字符char是：a，则符合。返回true
    // 如果不符合，则
    join(char, i) {
        this.value = char
        switch (this.type) {
            case T_NUMBER:
                return this.numberJoin(char, i)
            case T_DOT:
                return this.dotJoin(char, i)
            case T_OPERATOR:
                return this.operatorJoin(char, i)
            case T_SPACE:
                return this.spaceJoin(char, i)
            case T_WORD:
                return this.wordJoin(char, i)
        }
        return false
    }

    numberJoin(char, i) {
        this.charType = this.getType(char)
        // 如果当前字符是 .

        if (this.charType === T_DOT) {
            if (this.isFloat) {
                throw new Error('不能出现 .. ')
            } else {
                this.isFloat = true
            }
            this.end = i + 1
            return true
        }
        this.end = this.charType === this.type ? i + 1 : i
        return this.charType === this.type
    }
    floatNumberJoin(char, i) {
        this.charType = this.getType(char)
        // if (this.charType === T_DOT) {
        // }
        this.end = i
        return this.charType === this.type
    }
    dotJoin(char, i) {
        this.charType = this.getType(char)
        if (this.charType === T_NUMBER) {
            this.type = T_NUMBER
            this.isFloat = true
            return this.numberJoin(char, i)
        }
        this.end = i
        return this.charType === this.type
    }
    operatorJoin(char, i) {
        this.end = i
        return false
    }
    spaceJoin(char, i) {
        this.charType = this.getType(char)
        this.end = this.charType === this.type ? i + 1 : i
        return this.charType === this.type
    }
    wordJoin(char, i) {
        this.charType = this.getType(char)
        this.end = i
        if (this.charType === T_NUMBER || this.charType === T_WORD) {
            this.end = i + 1
            return true
        }
        return false
    }

    getType(char) {
        if (['+', '-', '*', '/', '(', ')'].includes(char)) {
            return T_OPERATOR
        } else if (char === ' ') {
            return T_SPACE
        } else if (/[a-zA-Z_]/.test(char)) {
            return T_WORD
        } else if (/[0-9]/.test(char)) {
            return T_NUMBER
        } else if (char === '.') {
            return T_DOT
        } else {
            return T_ERROR
        }
    }
}

function parse(code) {
    let list = []
    for (let i = 0; i < code.length; i++) {
        let char = code[i]
        let last = list[list.length - 1]
        if (last && last.join(char, i)) {
            continue
        }
        list.push(new CharState(last, char, i))
    }
    return list
    // console.log(list)

    // const str = list.reduce((s, cur) => {
    //     let endIndex = cur.end !== -1 ? cur.end : code.length

    //     const item = `{${TypeToLabel.get(cur.type)}:${code.substring(cur.start, endIndex)}}  `
    //     s += item

    //     return s
    // }, '')
    // console.log(code.length)
    // return str
}

parse('w.w + 22 + 3.3')
