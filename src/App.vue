<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" />
        <div v-show="v">
            <myAst></myAst>
            <MyInput></MyInput>
            <Select />
            <Test></Test>
        </div>
        <!-- <April></April> -->
        <!-- <Password /> -->
        <HelloWorld msg="Welcome to Your Vue.js App" />
    </div>
</template>

<script>
    import HelloWorld from './components/HelloWorld.vue'
    // import Select from './components/Select'
    // import Password from './components/Password'
    // import April from './components/April'
    import MyInput from './components/myInput'
    import myAst from './components/ast'
    import Test from './components/test.vue'
    export default {
        name: 'App',
        data() {
            return {
                v: false,
            }
        },
        components: {
            HelloWorld,
            // Select,
            // Password,
            // April,
            MyInput,
            myAst,
            Test,
        },
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
