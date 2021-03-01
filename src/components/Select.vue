<template>
    <div class="content">
        <span>这里前面的title：</span>
        <el-select
            class="my-select"
            multiple
            allow-create
            filterable
            default-first-option
            placeholder="请选择"
            v-model="value1"
            @change="changeSelect"
            @remove-tag="removeTag"
        >
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
        </el-select>

        <div>
            <el-select
                class="my-select"
                multiple
                placeholder="请选择"
                v-model="value2"
                @change="changeSelect"
                @remove-tag="removeTag"
            >
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
            </el-select>
        </div>

        <div class="cancel">
            <el-button @click="cancel">cancel observer</el-button>
            <el-button @click="add">add Select</el-button>
        </div>

        <div class="new-select" v-for="(s, i) in newSelectList" :key="i">
            <el-select
                class="my-select"
                multiple
                placeholder="请选择"
                v-model="s[i]"
            >
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
            </el-select>
        </div>
    </div>
</template>

<script>
import ObserverSelect from '../until/observerSelect';
export default {
    name: 'Select',
    props: {},
    data() {
        return {
            options: [],
            value1: ['value1', 'value2', 'value3'],
            value2: [],
            observerSelect: null,
            newSelectList: [],
        };
    },
    created() {
        this.options = Array(10)
            .fill('')
            .map((item, i) => {
                return {
                    value: 'value' + i,
                    label: '这是一个填充的字符串' + i,
                };
            });
    },
    mounted() {
        this.observerSelect = new ObserverSelect('.my-select');
    },
    methods: {
        changeSelect() {
            this.$nextTick(() => {
                // this.setInputWidth(this.selectEl);
            });
        },
        removeTag() {
            this.$nextTick(() => {
                // this.setInputWidth(this.selectEl);
            });
        },
        cancel() {
            this.observerSelect.destroyed();
        },
        add() {
            this.newSelectList.push([]);
            this.$nextTick(() => {
                this.observerSelect.update();
            });
        },
    },
};
</script>
<style scoped>
.content {
    width: 80%;
    border: 1px solid red;
    border-radius: 8px;
    margin: 0 auto;
    padding: 10px 8px;
    text-align: left;
}
</style>
