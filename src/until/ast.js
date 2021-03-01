export const EOF = Symbol('EOF')
// 数字list
const numberList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
export class Lexer {
    constructor() {
        // 临时的token字符存储
        this.token = []
        // 正式的tokenlist
        this.tokens = []
        // state默认是start状态，后面通过push实现状态转移
        this.state = this.start
        this.id = 0
    }
    // 开始状态
    start(char) {
        // 数字
        if (numberList.includes(char)) {
            this.token.push(char)
            return this.inInt
        }
        // 小树点
        if (char === '.') {
            this.token.push(char)
            return this.inFloat
        }
        // 符号
        if (['+', '-', '*', '/', '(', ')', '[', ']', ',', '<', '>'].includes(char)) {
            this.emmitToken('SIGN', char)
            return this.start
        }
        if (char === EOF) {
            this.emmitToken('EOF', EOF)
            return this.start
        }
        // 空白字符
        if ([' ', '\r', '\n'].includes(char)) {
            return this.start
        }
    }

    inInt(char) {
        if (numberList.includes(char)) {
            this.token.push(char)
            return this.inInt
        } else if (char === '.') {
            this.token.push(char)
            return this.inFloat
        } else {
            this.emmitToken('NUMBER', this.token.join(''))
            this.token = []
            return this.start(char) // put back char
        }
    }
    inFloat(char) {
        if (numberList.includes(char)) {
            this.token.push(char)
            return this.inFloat
        } else if (char === '.') {
            throw new Error('不能出现点..')
        } else {
            if (this.token.length === '1' && this.token[0] === '.') throw new Error('不能单独出现.')
            this.emmitToken('NUMBER', this.token.join(''))
            this.token = []
            return this.start(char)
        }
    }
    emmitToken(type, value) {
        this.tokens.push({
            id: this.id++,
            type,
            value,
        })
    }

    push(char) {
        this.state = this.state(char)
        return this.check()
    }
    end() {
        this.state(' ')
        return this.check()
    }
    // end() {
    //     this.state(EOF)
    //     return this.check()
    // }
    check() {
        const _token = [...this.tokens]
        this.tokens = []
        return _token
    }
    clear() {
        this.token = []
        this.tokens = []
        this.state = this.start
    }
}
