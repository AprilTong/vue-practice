<template>
    <div>
        <p>{{ outPut }}</p>
        <div>
            <span v-for="(item, index) in tokens" :key="index" class="one">{{ item.value }}</span>
        </div>
        <el-input v-model="inputValue" size="mini" placeholder="请输入"></el-input>
    </div>
</template>
<script>
    import { Lexer } from '../until/ast'
    export default {
        data() {
            return {
                outPut: '1.3+2',
                addTokens: [],
                tokens: [],
                Lexer: new Lexer(),
                inputValue: '',
            }
        },
        mounted() {
            this.getTokenList()
        },
        methods: {
            getTokenList() {
                for (let i = 0; i < this.outPut.length; i++) {
                    let str = this.outPut[i]
                    const temp_token = this.Lexer.push(str)
                    this.addTokens = [...temp_token]
                    if (temp_token.length > 0) {
                        this.tokens = [...this.tokens, ...temp_token]
                    }
                    // 如果是最后一个字符，需要执行end
                    if (i === this.outPut.length - 1) {
                        this.tokens = [...this.tokens, ...this.Lexer.end()]
                    }
                }
            },
        },
    }
</script>
<style lang="less">
    .one {
        display: inline-block;
        width: 20px;
        height: 20px;
        background-color: antiquewhite;
        margin-right: 10px;
    }
</style>
