<template>
    <div class="formula-input-wrapper" ref="wrapperRef">
        <div
            ref="formulaRef"
            class="formula-input"
            :contentEditable="true"
            placeholder="请输入公式"
            @click="(e) => e.stopPropagation()"
            @keydown="onKeyDown"
            @keyup="onKeyUp"
            @blur="setValue"
            @cut="stopNativeEvent"
            @paste="stopNativeEvent"
            @copy="stopNativeEvent"
        >
            <div
                :class="['formula-input-selection', showSelection ? 'visible' : '']"
                ref="selectionRef"
                @click="(e) => e.stopPropagation()"
            >
                <el-select :value="undefined" placeholder="请选择" ref="selectRef" @change="changeSelect">
                    <el-option v-for="item in options" :key="item.field" :label="item.name" :value="item.field">
                    </el-option>
                </el-select>
            </div>
        </div>
    </div>
</template>
<script>
    import { getHTMLList, str2dom, dom2str, isHTML, validKeys, setFocus, getDiffIndex } from '../until/util'
    export default {
        data() {
            return {
                options: [
                    {
                        field: 'superman',
                        name: 'ClarkKent',
                    },
                    {
                        field: 'batman',
                        name: 'BruceWayne',
                    },
                    {
                        field: 'theflash',
                        name: 'BarryAllen',
                    },
                    {
                        field: 'wonderwoman',
                        name: 'DianaPrince',
                    },
                    {
                        field: 'aquaman',
                        name: 'ArthurCurry',
                    },
                    {
                        field: 'cyborg',
                        name: 'VictorStone',
                    },
                    {
                        field: 'greenlantern',
                        name: 'HalJordan',
                    },
                ],
                formData: {
                    formula: '1+superman+2-batman+3*aquaman+4/wonderwoman',
                    vars: {
                        superman: 'ClarkKent',
                        batman: 'BruceWayne',
                        aquaman: 'ArthurCurry',
                        wonderwoman: 'DianaPrince',
                    },
                },
                // 是否显示下拉框
                showSelection: false,
            }
        },
        mounted() {
            this.initDisplay()
        },
        methods: {
            // 设置编辑框的值
            setValue() {
                let formula = ''
                const vars = {}
                const text = this.$refs.formulaRef.innerHTML.replace(/\sdata-spm-anchor-id=".*?"/g, '')
                const list = getHTMLList({
                    text,
                    prefix: '<div contenteditable="false">',
                    suffix: '</div>',
                })
                list.forEach((item) => {
                    const [v1, v2] = getHTMLList({
                        text: item,
                        prefix: '<span>',
                        suffix: '</span>',
                    })
                    if (v2) {
                        formula += v2
                        vars[v2] = v1
                    } else {
                        formula += v1
                    }
                })
                this.formData = {
                    formula,
                    vars,
                }
            },
            // 重制显示，把@符号设置为空
            resetDisplay(from, to = '') {
                console.log('to', to)
                let text = this.$refs.formulaRef.innerHTML
                if (text.includes(from)) {
                    text = text.replace(new RegExp(from, 'g'), to)
                    this.$refs.formulaRef.innerHTML = text
                }
                this.setValue()
            },
            removeSelection(e) {
                this.showSelection = false
                window.removeEventListener('click', this.removeSelection)
                e && this.resetDisplay('@')
            },
            onEsc(e) {
                if (e.key === 'Escape') {
                    window.removeEventListener('keydown', this.onEsc)
                    const index = this.$refs.formulaRef.innerHTML.indexOf('@')
                    const target = this.$refs.formulaRef
                    this.resetDisplay('@', '')
                    this.showSelection = false
                    setFocus(target, index)
                }
            },
            addEventListener() {
                // 添加全局click监听
                window.addEventListener('click', this.removeSelection)
                window.addEventListener('keydown', this.onEsc)
            },
            // 释放键盘按钮时
            onKeyUp() {
                const target = this.$refs.formulaRef
                const originStr = target.innerHTML
                let list = str2dom(originStr)
                list = list.map((v) =>
                    isHTML(v)
                        ? dom2str(v)
                        : v.data
                              .split('')
                              .filter((v) => validKeys.includes(v))
                              .join('')
                )
                const filteredStr = list.join('')
                console.log('originStr', originStr)
                console.log('filteredStr', filteredStr)
                if (originStr !== filteredStr) {
                    const index = getDiffIndex(originStr, filteredStr)
                    this.$refs.formulaRef.innerHTML = filteredStr
                    console.log('ha', index)
                    setFocus(this.$refs.formulaRef, index)
                }
            },
            // 打开下拉选择框
            openSelection() {
                this.showSelection = true
                setTimeout(() => {
                    // append to wrapper
                    this.$refs.wrapperRef.appendChild(this.$refs.selectionRef)
                    // 绑定监听
                    this.addEventListener()
                    // 焦点到下拉框filter input中
                    this.$refs.selectRef.focus()
                }, 0)
            },
            // 按下按键时执行
            onKeyDown(e) {
                const { key } = e
                switch (key) {
                    // 禁止回车
                    case 'Enter':
                        e.preventDefault()
                        break
                    case '@':
                    case 'Process': // 中文输入法的 @
                        this.onKeyUp()
                        this.openSelection()
                        break
                    default:
                }
            },
            // 选中数据变量时
            optionClick(item) {
                const { name, field } = item
                const res = `<div contenteditable="false">${name}<span>${field}</span></div>`
                const index = this.$refs.formulaRef.innerHTML.indexOf('@')
                const { length } = res
                this.resetDisplay('@', res)
                setTimeout(() => {
                    this.showSelection = false
                    const target = this.$refs.formulaRef
                    setFocus(target, index + length)
                }, 0)
            },
            // 初始化显示数据
            initDisplay() {
                const { vars, formula } = this.formData
                let result = formula
                Reflect.ownKeys(vars).forEach((key) => {
                    const rule = new RegExp(key, 'g')
                    const name = `<div contenteditable="false">${vars[key]}<span>${key}</span></div>`
                    result = result.replace(rule, (v, index, string) => {
                        const { length } = v
                        const str = string.slice(index - 1, length + index + 1)
                        if (str.startsWith('_') || str.endsWith('_')) {
                            return key
                        } else {
                            return name
                        }
                    })
                })
                this.$refs.formulaRef.innerHTML = result
            },
            // 阻止默认的复制粘贴⌚️
            stopNativeEvent(e) {
                e.preventDefault()
                return false
            },
            // 下拉选择处理
            changeSelect(v) {
                const value = this.options.find((item) => item.field === v)
                this.optionClick(value)
            },
        },
    }
</script>
<style lang="less">
    @theme-color: #1890ff;
    @input-border: 1px solid #dcdfe6;

    .formula-input-wrapper {
        position: relative;

        > .formula-input {
            border-radius: 4px;
            border: 1px solid #dcdfe6;
            white-space: nowrap;
            padding: 4px 11px;
            outline: none;
            font-size: 14px;
            transition: border 0.3s;
            overflow: scroll;
            -ms-overflow-style: none;

            &.large {
                padding: 6.5px 11px;
                font-size: 16px;
            }

            &.small {
                padding: 0 7px;
                font-size: 14px;
            }

            &::-webkit-scrollbar {
                display: none;
            }

            &[contenteditable='false'] {
                background-color: #f5f7fa;
                border-color: #e4e7ed;
                color: #c0c4cc;
                cursor: not-allowed;
            }

            &.error {
                border: 1px solid @theme-color;
            }

            &:empty::before {
                content: attr(placeholder);
                color: #c0c4cc;
            }

            br {
                display: none;
            }

            & * {
                display: inline;
                white-space: nowrap;
            }

            &:focus {
                border: 1px solid @theme-color;
            }

            div {
                color: @theme-color;
                padding: 0 8px;
                background-color: #f0f2f5;
                margin: 0 5px;
                span {
                    display: none;
                }
            }
        }

        > .hint {
            color: @theme-color;
            font-size: 12px;
        }
    }

    .formula-input-selection {
        position: absolute;
        font-size: 12px;
        width: 100%;
        z-index: 10000;
        background: #fff;
        border: @input-border;
        margin-top: -1px;
        box-sizing: border-box;
        border-radius: 4px;
        transition: top 300ms, left 300ms;
        display: none;

        &.visible {
            display: inherit;
        }

        .el-input {
            &__inner {
                border-radius: 0;
                border: none;
                border-bottom: @input-border;

                &:focus {
                    border-bottom: @input-border;
                }
            }
        }

        .options {
            max-height: 200px;
            overflow-y: scroll;

            .option {
                background-color: #f5f7fa;
                padding: 5px 15px;
                border-radius: 100px;
                margin: 5px;
                white-space: nowrap;
                cursor: pointer;
                display: inline-block;
            }
        }

        .empty {
            text-align: center;
            padding: 20px 0;
        }
    }
</style>
