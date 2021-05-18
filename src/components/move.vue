<template>
    <div>
        <table id="itxst">
            <!-- 需要在元素上加data-id表示唯一-->
            <tr data-id="1">
                <td>1111111111111</td>
            </tr>
            <tr data-id="2">
                <td>2222222222222</td>
            </tr>
            <tr data-id="3">
                <td>33333333333333</td>
            </tr>
            <tr data-id="4">
                <td>444444444444444</td>
            </tr>
        </table>
    </div>
</template>

<script>
    import Sortable from 'sortablejs'
    export default {
        data() {
            return {}
        },
        mounted() {
            this.drag()
        },
        methods: {
            drag() {
                var el = document.getElementById('itxst')

                //设置配置
                var ops = {
                    animation: 100,
                    //拖动结束
                    onEnd: () => {
                        //获取拖动后的排序
                        var arr = sortable.toArray()
                        //输出的数组中的元素是每个对应的data-id的值
                        console.log(JSON.stringify(arr))
                    },
                }
                //初始化
                var sortable = Sortable.create(el, ops)
            },
        },
    }
</script>
