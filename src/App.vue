<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <template v-if="v">
      <MyInput></MyInput>
      <Select />
      <myAst></myAst>
    </template>
    <Formula></Formula>
    <HelloWorld v-show="v" msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
// import Select from './components/Select'
// import Password from './components/Password'
// import April from './components/April'
import MyInput from "./components/myInput";
import myAst from "./components/ast";
import Formula from "./components/formula";
export default {
  name: "App",
  data() {
    return {
      v: false,
    };
  },
  components: {
    HelloWorld,
    // Select,
    // Password,
    // April,
    MyInput,
    myAst,
    Formula,
  },
};
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
