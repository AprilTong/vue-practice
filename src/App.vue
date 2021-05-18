<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" />
        <template v-if="v">
            <MyInput></MyInput>
            <Select />
            <myAst></myAst>
            <Formula></Formula>
        </template>
        <Move></Move>
        <Popover></Popover>
        <HelloWorld v-show="v" msg="Welcome to Your Vue.js App" />
    </div>
</template>

<script>
    import HelloWorld from './components/HelloWorld.vue'
    // import Select from './components/Select'
    // import Password from './components/Password'
    // import April from './components/April'
    import MyInput from './components/myInput'
    import myAst from './components/ast'
    import Formula from './components/formula'
    import Popover from './components/popover'
    import Move from './components/move'
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
            Formula,
            Popover,
            Move,
        },
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
