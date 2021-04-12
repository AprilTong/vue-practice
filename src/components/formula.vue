<template>
  <div class="formula">
    <div class="content" @click.prevent="handleClickContent" ref="content">
      <template v-for="(item, index) in tokens">
        <span :key="index" v-if="item.type === 10" class="is-number">
          {{ item.value }}
        </span>
        <span v-if="item.type === 30" :key="index" class="is-operator">
          {{ item.value }}
        </span>
      </template>
    </div>
    <div class="cursor" ref="cursor"></div>
    <input
      v-model="inputVal"
      ref="input"
      @blur="handleBlur"
      @input="handleInput"
      @keyup="handleKeyUp"
    />
  </div>
</template>
<script>
import { parse } from "@/until/lexer.js";
export default {
  data() {
    return {
      tokens: [],
      inputVal: "",
    };
  },
  watch: {
    inputVal(newVal) {
      if (newVal) {
        this.tokens = parse(newVal).map((item) => {
          const { start, end } = item;
          return {
            ...item,
            value:
              end === -1
                ? newVal.substring(start)
                : newVal.substring(start, end),
          };
        });
      }
    },
  },
  mounted() {
    const { inputVal } = this;
    this.tokens = parse(inputVal).map((item) => {
      const { start, end } = item;
      return {
        ...item,
        value:
          end === -1
            ? inputVal.substring(start)
            : inputVal.substring(start, end),
      };
    });
  },
  methods: {
    // 点击div的时候处理焦点
    handleClickContent() {
      console.log("点击");
      let selection = window.getSelection();
      let range = selection.getRangeAt(0);
      const { startContainer, endContainer, startOffset } = range;
      let startNode = startContainer;
      let endNode = endContainer;
      // 拿文本节点的父节点
      if (startNode.nodeType === 3) {
        startNode = startNode.parentNode;
      }
      if (endNode.nodeType === 3) {
        endNode = endNode.parentNode;
      }
      // 找到纯文本坐标
      let start = startOffset + startNode.start;
      let input = this.$refs.input;
      input.setSelectionRange(start, start);
      let result = range.getBoundingClientRect();
      const { left, height } = result;
      console.log("result", result);
      input.style.left = `${left}px`;
      input.style.height = `${height}px`;
      this.$refs.cursor.style.left = `${left}px`;
      this.$refs.cursor.style.height = `${height}px`;
      input.focus();
      this.$refs.cursor.style.visibility = "visible";
      // 如果content没有值
      if (!this.inputVal) {
        this.$refs.cursor.style.height = `15px`;
        this.$refs.cursor.style.left = `5px`;
      }
    },
    // input失去焦点时隐藏光标
    handleBlur() {
      this.$refs.cursor.style.visibility = "hidden";
    },
    handleInput() {
      //   this.updateRange();
    },
    handleKeyUp() {
      //   this.updateRange();
    },
    updateRange() {
      let input = this.$refs.input;
      let start = input.selectionStart;
      let end = input.selectionEnd;
      let i = this.tokens.findIndex((item) => {
        return end <= item.end;
      });
      console.log("i", start, end);
      let node = this.$refs.content.children[i];
      console.log("hahah", this.$refs.content.children);
      let content = node.firstChild;
      if (content.nodeType !== 3) {
        content = node.querySelector("[data-content]");
        content = content.firstChild;
      }
      let selection = window.getSelection();
      let range = selection.getRangeAt(0);
      range.setStart(content, end - node.start);
      range.collapse(true);
      let result = range.getBoundingClientRect();
      const { left, height } = result;
      this.$refs.cursor.style.left = `${left}px`;
      this.$refs.cursor.style.height = `${height}px`;
      this.$refs.cursor.style.visibility = "visible";
    },
  },
};
</script>
<style scoped lang="less">
.formula {
  position: sticky;
  .content {
    border-bottom: 1px solid #3d90ff;
    min-height: 20px;
    .is-number {
      color: #3d90ff;
      margin: 0 5px;
    }
  }
  .cursor {
    position: absolute;
    width: 1px;
    height: 15px;
    animation: fade 1000ms infinite;
    background-color: black;
    top: 4px;
    left: 0px;
  }
  input {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    opacity: 0;
    padding: 0px;
    border-width: 0px;
  }
}
@keyframes fade {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@-webkit-keyframes fade {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
