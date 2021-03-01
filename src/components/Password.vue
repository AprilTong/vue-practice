<template>
    <div class="password">
        <div class="four-password">
            <div class="title">四位密码</div>
            <div class="content">
                <div class="item" v-for="(_, v) in passwordCount" :key="v">
                    <span class="item-label">{{ password[v] }}</span>
                    <input
                        ref="inputs"
                        :data-ref="'inputs'"
                        type="text"
                        v-model="password[v]"
                        maxlength="1"
                        @click="findCursorIndex"
                        @keyup.delete="delPassword"
                        class="item-input"
                    />
                </div>
            </div>
        </div>
        <div class="input-select">
            <el-input></el-input>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Password',
        props: {},
        data() {
            return {
                passwordCount: 4,
                password: [],
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
                let cursorIndex = 0
                if (this.password.length < this.passwordCount) {
                    cursorIndex = this.password.length
                } else {
                    const i = this.password.findIndex((v) => v === '')
                    cursorIndex = i !== -1 ? i : this.passwordCount - 1
                }

                this.$refs.inputs[cursorIndex].focus()
            },
            delPassword() {
                if (this.password.length > 0) {
                    this.password.pop()
                    this.findCursorIndex()
                }
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
        }
    }
</style>
