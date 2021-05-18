<template>
    <div>
        <el-popover placement="right" width="400" trigger="click">
            <el-select v-model="value" filterable placeholder="请选择" allow-create>
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>

            <el-button slot="reference">click 激活</el-button>
        </el-popover>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                value: '',
                options: [
                    {
                        value: '选项1',
                        label: '黄金糕',
                    },
                    {
                        value: '选项2',
                        label: '双皮奶',
                    },
                    {
                        value: '选项3',
                        label: '蚵仔煎',
                    },
                    {
                        value: '选项4',
                        label: '龙须面',
                    },
                    {
                        value: '选项5',
                        label: '北京烤鸭',
                    },
                ],
            }
        },
    }
</script>
