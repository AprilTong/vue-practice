<template>
    <div class="content-box">
        <div class="content">
            <!--数组渲染到富文本层-->
            <span class="is-number">100</span>
            <span class="is-operator">+</span>
            <span class="is-number">100.01</span>
        </div>
        <div class="cursor"></div>
        <input />
    </div>
</template>
<script>
    export default {
        data() {
            return {}
        },
    }
</script>
<style lang="less" scoped>
    .content-box {
        position: relative;
        .content {
            width: 200px;
            .is-number {
                background-color: #f0f2f5;
                color: #67729d;
            }
            .is-operator {
                margin: 0 6px;
            }
        }
        .cursor {
            position: absolute;
            height: 2px;
            width: 1px;
            border-left: 1px solid #333;
            animation: fade 1s infinite;
        }
    }
    @keyframes fade {
        from {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
        to {
            opacity: 1;
        }
    }
</style>
