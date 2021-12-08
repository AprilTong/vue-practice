<template>
    <div class="formula">
        <div class="content" ref="content" @keydown.left="handleKeyDown" @click.prevent="handleClickContent">
            <template v-for="(item, index) in tokens">
                <span :key="index" v-if="item.type === 1" class="is-box">
                    {{ item.value }}
                </span>
                <span v-if="item.type === 2" :key="index" class="is-string">
                    {{ item.value }}
                </span>
            </template>
        </div>
        <div class="cursor" ref="cursor"></div>
        <input v-model="inputVal" ref="input" @blur="handleBlur" @input="handleInput" @keyup="handleKeyUp" />
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
                    },
                    {
                        value: '1',
                        type: 2,
                    },
                    {
                        value: '2',
                        type: 2,
                    },
                ],
                inputVal: '1 + 2',
            }
        },
        // watch: {
        //     inputVal(newVal) {
        //         if (newVal) {
        //             this.tokens = parse(newVal).map((item) => {
        //                 const { start, end } = item
        //                 return {
        //                     ...item,
        //                     value: end === -1 ? newVal.substring(start) : newVal.substring(start, end),
        //                 }
        //             })
        //         }
        //     },
        // },
        mounted() {
            // const { inputVal } = this
            // this.tokens = parse(inputVal).map((item) => {
            //     const { start, end } = item
            //     return {
            //         ...item,
            //         value: end === -1 ? inputVal.substring(start) : inputVal.substring(start, end),
            //     }
            // })
        },
        methods: {
            // 点击div的时候处理焦点
            handleClickContent() {
                let selection = window.getSelection()
                let range = selection.getRangeAt(0)
                const { startContainer, endContainer, startOffset } = range
                console.log('range1', startContainer.start)
                let startNode = startContainer
                let endNode = endContainer
                // 拿文本节点的父节点
                if (startNode.parentNode._prevClass === 'is-box' && endNode.parentNode._prevClass === 'is-box') {
                    startNode = startNode.parentNode
                    range.selectNode(endNode.parentNode)
                    range.collapse(true)
                    console.log('range12', range)
                }
                console.log('hah', startNode.start)
                let start = startOffset + startNode.start
                let input = this.$refs.input
                // 设置input选中文本的起始和结束位置
                input.setSelectionRange(start, start)

                console.log('result', result)
                let result = range.getBoundingClientRect()
                const { left } = result
                input.style.left = `${left}px`
                // 真实光标
                input.focus()
                // 设置虚拟光标的位置
                this.$refs.cursor.style.left = `${left}px`
                this.$refs.cursor.style.visibility = 'visible'
                // // 如果content没有值
                // if (!this.inputVal) {
                //     this.$refs.cursor.style.height = `15px`
                //     this.$refs.cursor.style.left = `5px`
                // }
            },
            // input失去焦点时隐藏光标
            handleBlur() {
                this.$refs.cursor.style.visibility = 'hidden'
            },
            handleInput() {
                //   this.updateRange();
            },
            handleKeyUp(e) {
                console.log('e', e)
            },
            updateRange() {
                let input = this.$refs.input
                let start = input.selectionStart
                let end = input.selectionEnd
                let i = this.tokens.findIndex((item) => {
                    return end <= item.end
                })
                console.log('i', start, end)
                let node = this.$refs.content.children[i]
                console.log('hahah', this.$refs.content.children)
                let content = node.firstChild
                if (content.nodeType !== 3) {
                    content = node.querySelector('[data-content]')
                    content = content.firstChild
                }
                let selection = window.getSelection()
                let range = selection.getRangeAt(0)
                range.setStart(content, end - node.start)
                range.collapse(true)
                let result = range.getBoundingClientRect()
                const { left, height } = result
                this.$refs.cursor.style.left = `${left}px`
                this.$refs.cursor.style.height = `${height}px`
                this.$refs.cursor.style.visibility = 'visible'
            },
            handleKeyDown(e) {
                console.log(e.keyCode)
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
        }
        input {
            position: absolute;
            top: 0;
            left: 0;
            width: 1px;
            height: 1px;
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
