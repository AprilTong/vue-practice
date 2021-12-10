<template>
    <div class="formula">
        <div class="content" ref="content" @keydown.left="handleKeyDown" @click.prevent="handleClickContent">
            <template v-for="(item, index) in tokens">
                <span :key="index" v-if="item.type === 1" class="is-box" :dataIndex="index" :dataType="item.type">
                    {{ item.value }}
                </span>
                <span v-if="item.type === 2" :key="index" class="is-string" :dataIndex="index" :dataType="item.type">
                    {{ item.value }}
                </span>
            </template>
        </div>
        <div class="cursor" ref="cursor"></div>
        <input
            v-model="inputVal"
            ref="input"
            @blur="handleBlur"
            @input="(val) => handleInput(val)"
            @keyup="handleKeyUp"
        />
    </div>
</template>
<script>
    // import { parse } from '@/until/lexer.js'
    export default {
        data() {
            return {
                tokens: [
                    {
                        value: '日期',
                        type: 1,
                        start: 0,
                        end: 2,
                    },
                    {
                        value: '1',
                        type: 2,
                        start: 2,
                        end: 3,
                    },
                    {
                        value: '2',
                        type: 2,
                        start: 3,
                        end: 4,
                    },
                    {
                        value: '姓名',
                        type: 1,
                        start: 5,
                        end: 7,
                    },
                ],
                inputVal: '',
                cursorIndex: null,
            }
        },
        methods: {
            // 点击div的时候处理焦点
            handleClickContent(e) {
                this.cursorIndex = e.target.getAttribute('dataindex')
                console.log(e.target.getAttribute('dataindex'), this.cursorIndex)
                let selection = window.getSelection()
                let range = selection.getRangeAt(0)
                const { startContainer, endContainer, startOffset } = range
                console.log('startOffset', range, startOffset)
                let startNode = startContainer
                let endNode = endContainer
                // 拿文本节点的父节点
                if (startNode.nodeType === 3) {
                    startNode = startNode.parentNode
                }
                if (endNode.nodeType === 3) {
                    endNode = endNode.parentNode
                }
                range.selectNode(startNode)
                let result = range.getBoundingClientRect()
                // range.collapse(false)
                let input = this.$refs.input
                console.log('reqult', e.target.getAttribute('datatype'))
                if (e.target.getAttribute('datatype') === '1') {
                    const { x } = result
                    input.style.left = `${42 + x}px`
                    input.focus()
                    this.$refs.cursor.style.left = `${42 + x}px`
                } else {
                    const { x } = result
                    input.style.left = `${x}px`
                    input.focus()
                    this.$refs.cursor.style.left = `${x}px`
                }
                this.$refs.cursor.style.visibility = 'visible'
            },
            // input失去焦点时隐藏光标
            handleBlur() {
                this.$refs.cursor.style.visibility = 'hidden'
            },
            handleInput(val) {
                this.updateRange(val.data)
            },
            handleKeyUp() {
                // console.log('e', e)
            },
            updateRange(val) {
                const { end } = this.tokens[this.cursorIndex]
                this.tokens.splice(this.cursorIndex, 0, {
                    type: 2,
                    value: val,
                    start: end,
                    end: end + 1,
                })
                this.tokens.forEach((item, index) => {
                    if (index === 0) {
                        item = {
                            ...item,
                            start: 0,
                            end: item.value.length,
                        }
                    } else {
                        const { end } = this.tokens[index - 1]
                        item = {
                            ...item,
                            start: end,
                            end: end + item.value.length,
                        }
                    }
                })

                let realNode = []
                let childNodes = this.$refs.content.childNodes
                let len = childNodes.length
                console.log('childNodes', childNodes)
                for (let i = 0; i <= len - 1; i++) {
                    console.log('i', i)
                    if (childNodes[i].nodeType === 1) {
                        console.log(i, childNodes[i])
                        realNode.push(childNodes[i])
                    }
                }

                console.log('this.$refs.content', realNode)
                // let selection = window.getSelection()
                // let range = selection.getRangeAt(0)
                // range.selectNode(this.$refs.content.children[this.cursorIndex + 1])
                // let result = range.getBoundingClientRect()
                // console.log('result', result)
                // let input = this.$refs.input
                // let cursorStart = input.selectionStart
                // let cursorEnd = input.selectionEnd
                console.log('cursorStart', this.$refs.content)
                // let node = this.$refs.content.children[start]
                // console.log('hahah', this.$refs.content.children)
                // let content = node.firstChild
                // if (content.nodeType !== 3) {
                //     content = node.querySelector('[data-content]')
                //     content = content.firstChild
                // }
                // // 最后一个
                // let last = this.$refs.content.children[this.$refs.content.children.length - 1]
                // let selection = window.getSelection()
                // let range = selection.getRangeAt(0)
                // range.setStart(last, 0)
                // range.collapse(true)
                // let result = range.getBoundingClientRect()
                // console.log('result', last)
                // const { left } = result
                // input.style.left = `${left}px`
                // input.focus()
                // console.log(input)
                // let result = range.getBoundingClientRect()
                // const { left } = result
                // this.$refs.cursor.style.left = `${left}px`
                this.$refs.cursor.style.visibility = 'visible'
            },
            handleKeyDown() {
                // console.log(e.keyCode)
            },
        },
    }
</script>
<style scoped lang="less">
    .formula {
        position: sticky;
        .content {
            border: 1px solid #3d90ff;
            min-height: 40px;
            line-height: 40px;
            .is-box {
                margin: 0 5px;
                width: fit-content;
                background-color: #3d90fb;
                border-radius: 20px;
                color: #fff;
                font-size: 14px;
                height: 30px;
                line-height: 30px;
                display: inline-block;
                padding: 0 10px;
                box-sizing: border-box;
            }
            .is-string {
                display: inline-block;
            }
        }
        .cursor {
            position: absolute;
            width: 1px;
            height: 33px;
            animation: fade 1000ms infinite;
            background-color: black;
            top: 4px;
            left: 5px;
            visibility: hidden;
        }
        input {
            position: absolute;
            top: 4px;
            left: 5px;
            width: 1px;
            height: 40px;
            opacity: 0;
            padding: 0px;
            border-width: 0px;
        }
    }
    @keyframes fade {
        0%,
        100% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }

    @-webkit-keyframes fade {
        0%,
        100% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }
</style>
