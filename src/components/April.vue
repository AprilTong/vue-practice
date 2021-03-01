<template>
    <div class="password">
        <div class="four-password">
            <div class="title">四位密码</div>
            <el-button size="mini" @click="passwordCount++">添加</el-button>
            <div class="content">
                <!-- <div class="item item-my" v-if="allData.length > 0">
                    <span class="item-label">{{ first }}</span>
                    <input
                        ref="inputs"
                        :data-ref="'inputs'"
                        type="text"
                        v-model="first"
                        @click="findCursorIndex"
                        @keyup="handleOneKey"
                        class="item-input"
                    />
                </div> -->
                <div class="item" v-for="(item, index) in allData" :key="index">
                    <template v-if="item.type === 1">
                        <span>{{ item.value }}</span>
                    </template>
                    <template v-if="item.type === 2">
                        <span class="item-label">{{ item.value }}</span>
                        <input
                            :ref="`inputs${index}`"
                            :data-ref="`inputs${index}`"
                            type="text"
                            v-model="item.value"
                            @click="findCursorIndex"
                            @keydown="(e) => handleKeyDown(e, index)"
                            class="item-input"
                        />
                    </template>
                    <template v-if="item.type === 3">
                        <el-select v-model="item.value" placeholder="请选择" size="mini">
                            <el-option label="数据一" value="1"> </el-option>
                            <el-option label="数据二" value="2"> </el-option>
                        </el-select>
                    </template>
                </div>
            </div>
        </div>
        <!-- <div class="input-select">
            <el-input></el-input>
        </div> -->
    </div>
</template>

<script>
    // const DataType = {
    //     Input: 2,
    //     Select: 1,
    // }
    export default {
        name: 'Password',
        props: {},
        data() {
            return {
                passwordCount: 1,
                password: [],
                first: '',
                allData: [
                    {
                        // 空的输入框
                        type: 2,
                        value: '',
                    },
                    {
                        // 事件筛选
                        type: 1,
                        value: '测试事件',
                    },
                    {
                        // 输入框
                        type: 2,
                        value: '.',
                    },
                    {
                        // 下拉框
                        type: 3,
                        value: '1',
                    },
                    {
                        // 空的输入框
                        type: 2,
                        value: '',
                    },
                ],
            }
        },
        created() {},
        watch: {
            password() {
                this.findCursorIndex()
            },
        },
        methods: {
            findCursorIndex() {
                // let cursorIndex = 0
                // if (this.password.length < this.passwordCount) {
                //     cursorIndex = this.password.length
                // } else {
                //     const i = this.password.findIndex((v) => v === '')
                //     cursorIndex = i !== -1 ? i : this.passwordCount - 1
                // }
                // this.$refs.inputs[cursorIndex].focus()
            },
            delPassword() {
                if (this.password.length > 0) {
                    this.password.pop()
                    this.findCursorIndex()
                }
            },
            handleOneKey(e) {
                console.log(e)
                if (e.keyCode === 39) {
                    console.log('hah', this.$refs.inputs)
                    this.$refs.inputs[0].focus()
                }
            },
            handleKeyDown(e, index) {
                console.log('e', e, index)
                let selection = window.getSelection()
                let range = selection.getRangeAt(0)
                let startNode = range.startContainer
                let endNode = range.endContainer
                let startOffset = range.startOffset
                let endOffset = range.endOffset
                console.log('startNode', startNode, endNode)
                console.log('startOffset', startOffset, endOffset)
                // 拿文本节点的父节点
                if (startNode.nodeType === 3) {
                    startNode = startNode.parentNode
                }
                if (endNode.nodeType === 3) {
                    endNode = endNode.parentNode
                }

                // 找到纯文本坐标
                let start = startOffset + startNode.start
                console.log('start', start)
                // input.setSelectionRange(start, start)
                // input.focus()
                // console.log('key up e', e)
                // // 获取当前input元素的光标位置
                // let cur_input = this.$refs[`inputs${index}`][0]
                // console.log('val', this.allData[index].value.length)
                // let focus_condition = cur_input.selectionStart === 0 && cur_input.selectionEnd === 0
                // console.log('光标位置', cur_input.selectionStart, cur_input.selectionEnd)
                // // 右键
                // if (e.keyCode === 39) {
                //     for (let i = index + 1; i < this.allData.length; i++) {
                //         const { value } = this.allData[index]
                //         if (this.allData[i].type === DataType.Input && cur_input.selectionStart === value.length) {
                //             this.$refs[`inputs${i}`][0].focus()
                //             return
                //         }
                //     }
                // }
                // // 左键
                // if (e.keyCode === 37) {
                //     for (let i = index - 1; i >= 0; i--) {
                //         if (this.allData[i].type === DataType.Input && focus_condition) {
                //             this.$refs[`inputs${i}`][0].focus()
                //             return
                //         }
                //     }
                // }
                // // 删除
                // if (e.keyCode === 8) {
                //     if (focus_condition && index !== 0) {
                //         this.allData.splice(index - 1, 1)
                //     }
                // }
            },
        },
    }
</script>

<style lang="less" scoped>
    .four-password {
        .title {
            text-align: center;
        }
        .content {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;

            .item {
                // width: 30px;
                height: 30px;
                border: 1px solid #ccc;
                margin-right: 10px;
                position: relative;

                .item-label {
                    display: inline-block;
                    width: 30px;
                    height: 30px;
                    text-align: center;
                    line-height: 30px;
                }
                .item-input {
                    position: absolute;
                    display: inline-block;
                    width: 30px;
                    height: 30px;
                    text-align: center;
                    z-index: 2;
                    outline: none;
                    border: none;
                    top: 0;
                    left: 0;
                    padding: 0;
                }
            }
            .item-my {
                border: none;
            }
        }
    }
</style>
