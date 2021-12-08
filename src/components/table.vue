<template>
    <div>
        <p title="我是提示信息">我是一段文本</p>
        <vxe-table :align="allAlign" :data="tableData" v-if="showTable">
            <vxe-table-column type="seq" width="60"></vxe-table-column>
            <vxe-table-column
                v-for="item in tableColList"
                :key="item.prop"
                :field="item.prop"
                :title="item.title"
                :fixed="item.fixed"
            >
                <template #header="{ column }">
                    <span>{{ column.title }}</span>
                    <el-dropdown trigger="click" @command="(e) => handleCommand(e, column)">
                        <i class="el-icon-caret-bottom"></i>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item icon="el-icon-lock" command="a" :disabled="item.fixed === 'left'">
                                固定在左侧
                            </el-dropdown-item>
                            <el-dropdown-item icon="el-icon-lock" command="b" :disabled="item.fixed === 'null'">
                                取消固定
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </vxe-table-column>
        </vxe-table>
    </div>
</template>
<script>
    import Vue from 'vue'
    import XEUtils from 'xe-utils'
    import { VXETable, Header, Column, Table } from 'vxe-table'
    import zhCN from 'vxe-table/lib/locale/lang/zh-CN'
    VXETable.setup({
        i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(zhCN, key), args),
    })

    Vue.use(Header)
        .use(Column)
        .use(Table)
    export default {
        data() {
            return {
                allAlign: 'center',
                showTable: true,
                tableData: [
                    {
                        id: 10001,
                        name: 'Test1',
                        role: 'Develop',
                        sex: 'Man',
                        age: 28,
                        address: 'vxe-table 从入门到放弃',
                    },
                    { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
                    { id: 10003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
                    { id: 10004, name: 'Test4', role: 'Designer', sex: 'Women', age: 24, address: 'Shanghai' },
                ],
                tableColList: [
                    {
                        prop: 'name',
                        title: 'Name',
                        fixed: 'null',
                    },
                    {
                        prop: 'sex',
                        title: 'Sex',
                        fixed: 'null',
                    },
                    {
                        prop: 'age',
                        title: 'Age',
                        fixed: 'null',
                    },
                ],
            }
        },
        methods: {
            handleCommand(e, column) {
                const { property } = column
                this.tableColList = this.tableColList.map((item) => {
                    return {
                        ...item,
                        fixed: item.prop === property ? (e === 'a' ? 'left' : 'null') : item.fixed,
                    }
                })
                this.showTable = false
                this.$nextTick(() => {
                    this.showTable = true
                })
            },
        },
    }
</script>
