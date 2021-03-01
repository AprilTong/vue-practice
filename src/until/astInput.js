let str_arr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const typeObj = {
    NUMBER: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    STRING: str_arr,
    SIGN: ['+', '-', '*', '/'],
    SPACE: [' ', '\r', '\n'],
    DOT: ['.'],
}

export class CharState {
    /**
     * @desc 初始化，确定状态机类型
     * @param prev - 上一个字符状态机
     * @param char - 当前单个字符
     * @param i - 当前字符的索引
     */
    constructor(prev, char, i) {
        this.prev = prev
        Object.keys(typeObj).forEach((key) => {
            if (typeObj[key].includes(char)) {
                this.type = key
            }
        })
    }
    /**
     * @desc 读取下一个字符，如果下一个字符符合连接规则，返回true，否则返回false
     */
    join(char, i) {
        switch (this.type) {
            case 'NUMBER':
                return this.numberJoin(char, i)
            case 'STRING':
                return this.stringJoin(char, i)
            case 'SIGN':
                return this.signJoin(char, i)
            case 'SPACE':
                return this.spaceJoin(char, i)
            case 'DOT':
                return this.dotJoin(char, i)
        }
    }
    // 数字连接
    numberJoin() {}
}
