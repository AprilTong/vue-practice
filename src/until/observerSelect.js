class ObserverSelect {
    constructor(selector) {
        this.selector = selector;
        this.observerSelectLists = [];
        this.observerSelectVm = [];
        this.init();
    }
    init() {
        let { selector, observerSelectLists, setObserver } = this;
        try {
            observerSelectLists = Array.from(
                document.body.querySelectorAll(selector)
            );
        } catch (error) {
            console.log('invalid selector');
            console.log({ error });
        }
        this.observerSelectVm = observerSelectLists.map((selectEl) => {
            return setObserver(selectEl);
        });
    }

    update() {
        this.destroyed();
        this.init();
    }
    destroyed() {
        this.observerSelectVm.forEach((vm) => {
            vm?.disconnect();
        });
    }
    setObserver(selectEl) {
        const inputEl = selectEl.querySelector('.el-input');
        // 这两个元素设置最大宽度，前者是控制整体select的宽度，不会超过父元素宽度(就可以换行了)。后者是控制input不会超过select展示。
        selectEl.style.maxWidth = '100%';
        inputEl && (inputEl.style.maxWidth = '100%');
        const selectTagEl = selectEl.querySelector('.el-select__tags');

        // 是一个向开发者提供监听DOM树变化的接口
        // 参考1: https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
        // 参考2: https://javascript.ruanyifeng.com/dom/mutationobserver.html
        let mutationOBserver = new MutationObserver(callback);
        mutationOBserver.observe(selectTagEl, {
            childList: true,
            subtree: true,
        });

        /**
         *
         * @param {Element} selectEl el-select 渲染的dom；
         */
        const setInputWidth = (selectEl) => {
            const inputEl = selectEl.querySelector('.el-input');
            const selectInputEl = selectEl.querySelector('.el-select__input');
            let tags = selectEl.querySelectorAll('.el-tag');
            tags = tags ? Array.from(tags) : [];

            // console.log(tags);
            let inputWidth = tags.reduce(
                (sum, cur) => sum + cur.clientWidth + 8,
                0
            );
            selectInputEl && (inputWidth += 60);
            // console.log({ inputWidth });
            inputEl &&
                (inputEl.style.width = inputWidth
                    ? `${inputWidth + 33}px`
                    : 'inherit');
        };

        /**
         *
         * @param {MutationObserver[]} list  描述所有被触发改动的 MutationRecord 对象数组
         * @param {MutationObserver} obj 调用该函数的MutationObserver 对象
         */
        function callback(list, obj) {
            // console.log({ list, obj });
            // 啊哈哈，下面这两行只是为了参数没使用而报警告
            typeof list;
            typeof obj;
            setInputWidth(selectEl);
        }

        // 返回实例，便于后续的销毁
        return mutationOBserver;
    }
}

export default ObserverSelect;
