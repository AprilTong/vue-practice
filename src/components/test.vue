<template>
    <div class="test_home">
        <div class="formula-code-root" v-if="!fristShow && codeItemList.length === 0">
            <div class="formula-code-placeholder" @click="fristShowClick">直接输入运算符或点击选择事件</div>
        </div>
        <!-- <div class="formula-code-root active" @click="fristShowClick" v-if="fristShow && codeItemList.length === 0">
            <div class="formula-code-items select1">
                <div class="formula-code-item">
                    <span class="formula-code-span formula-code-spanx"></span>
                    <el-input v-model="fristInput" placeholder="" ref="fristInput"></el-input>
                </div>
                <div class="position_select1">
                    <div v-for="(item, index) in select1List" :key="index" class="position_select1_f">
                        <div class="position_select1_title">{{ item.eventGroupName }}</div>
                        <div class="position_select1_con">
                            <div
                                v-for="i in item.events"
                                :key="i.eventName"
                                class="position_select1_child_con"
                                @click="selectOneClick(i.eventDesc)"
                            >
                                <div class="">{{ i.eventDesc }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> -->

        <div class="select2_active">
            <div class="select2_active_items">
                <!-- 位置判断 class="select2_active_item" 四个同类名框，位置判断显示哪一种-->
                <!-- 第一个位置框 父级选择条件框-->
                <div class="select2_active_item">
                    <div class="select2_active_item_con">
                        <span
                            class="select2_active_item_span"
                            v-if="codeItemList.length > 0"
                            @click="fristShowClick(index)"
                            >{{ codeItemList[0] }}</span
                        >

                        <el-input v-model="fristInput" placeholder="" ref="fristInput" v-else></el-input>
                        <!-- 这里模仿点击出的弹框 test -->
                        <div class="position_select1" v-if="fristShow">
                            <div v-for="(item, index) in select1List" :key="index" class="position_select1_f">
                                <div class="position_select1_title">{{ item.eventGroupName }}</div>
                                <div class="position_select1_con">
                                    <div
                                        v-for="i in item.events"
                                        :key="i.eventName"
                                        class="position_select1_child_con"
                                        @click="selectOneClick(i.eventDesc)"
                                    >
                                        <div class="">{{ i.eventDesc }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="select2_active_item_con_icon">
                        <span class="select2_active_item_span">$$</span>
                    </div>
                </div>
                <!-- 第二个位置框 点符号框-->
                <div class="select2_active_item">
                    <div class="select2_active_item_d">
                        <span v-if="select2Input_markShow" @click="select2InputMarkBlur('span')">.</span>
                        <el-input
                            v-else
                            v-model="select2Input_mark"
                            placeholder=""
                            ref="select2Input_mark"
                            @blur="select2InputMarkBlur('input')"
                        ></el-input>
                    </div>
                </div>
                <!-- 第三个位置框 子级下拉选择框-->
                <div class="select2_active_item">
                    <div>
                        <span
                            class="select2_active_item_span"
                            @click="select2InputBlur('span')"
                            v-if="select2Input_show"
                            >触发用户数</span
                        >
                        <el-input
                            v-model="select2Input"
                            placeholder=""
                            ref="select2Input"
                            @blur="select2InputBlur('input')"
                            v-else
                        ></el-input>
                    </div>
                </div>
                <!-- 第四个位置 符号框 -->
                <div class="select2_active_item">
                    <div class="select2_active_item_selfinput">
                        <span v-if="select2Input_mark1Show" @click="select2InputMark1Blur('span')">+</span>
                        <el-input
                            v-model="select2Input_mark1"
                            placeholder=""
                            ref="select2Input_mark1"
                            @blur="select2InputMark1Blur('input')"
                            v-else
                        ></el-input>
                    </div>
                </div>

                <!-- 重复 -->
                <div class="select2_active_item">
                    <div class="select2_active_item_con">
                        <span class="select2_active_item_span">用户登出</span>
                    </div>
                    <div class="select2_active_item_con_icon">
                        <span class="select2_active_item_span">$$</span>
                    </div>
                </div>
                <div class="select2_active_item">
                    <div>.</div>
                </div>
                <div class="select2_active_item">
                    <div>
                        <span class="select2_active_item_span">触发用户数</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // import moment from 'moment'
    // import { getTeamApi } from '@/api/promote/optimizer'
    // // import { getUserListApi } from '@/api/common'
    // import { zenAppList } from '@/api/aidTools/kwaiFuApply'
    // import { getSumUserApi, getTeamMemberApi } from '@/api/homePage/index'
    // // import Pagination from '../../components/pagination'
    // import costChart from './costChart'
    // import adEffectChart from './adEffectChart'
    // import createChart from './createChart'
    // import mtlCountChart from './mtlCountChart'
    // import homeDrawer from './homeDrawer'
    // import homeTop from './homeTop'
    export default {
        name: 'test_home',
        // components: { homeDrawer, adEffectChart, costChart, homeTop, createChart, mtlCountChart },
        data() {
            return {
                fristShow: false,
                fristInput: '',
                select2Input: '触发用户数',
                select2Input_mark: '',
                select2Input_mark1: '',
                select2Input_show: true,
                select2Input_markShow: true,
                select2Input_mark1Show: true,
                codeItemList: [],
                codeItemAcitveIndex: null,
                select1List: [
                    {
                        eventGroupName: '基础事件',
                        events: [
                            {
                                eventDesc: '用户登录',
                                eventName: 'login',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '用户注册',
                                eventName: 'register',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '用户登出',
                                eventName: 'logout',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '成本事件',
                                eventName: 'cost',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '付费事件',
                                eventName: 'payment',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: 'VIP等级提升',
                                eventName: 'vip_levelup',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '升级事件',
                                eventName: 'level_up',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                        ],
                    },
                    {
                        eventGroupName: '主要玩法',
                        events: [
                            {
                                eventDesc: '开始战斗',
                                eventName: 'battle_start',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '战斗胜利',
                                eventName: 'battle_win',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '战斗失败',
                                eventName: 'battle_lost',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '战斗结算',
                                eventName: 'ta@battle_result',
                                eventType: 'event_v',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '参与竞技场',
                                eventName: 'attend_arena',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '参与活动',
                                eventName: 'activity_attend',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '爬塔玩法',
                                eventName: 'tower_challenge',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                        ],
                    },
                    {
                        eventGroupName: '卡牌分析',
                        events: [
                            {
                                eventDesc: '抽卡事件',
                                eventName: 'draw_card',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '英雄升级',
                                eventName: 'hero_upgrade',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '英雄升星',
                                eventName: 'hero_star_up',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                        ],
                    },
                    {
                        eventGroupName: '资源消耗获取',
                        events: [
                            {
                                eventDesc: '商城购买',
                                eventName: 'shop_buy',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '钻石获取',
                                eventName: 'diamond_get',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '钻石消耗',
                                eventName: 'diamond_consume',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '金币获取',
                                eventName: 'gold_get',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '金币消耗',
                                eventName: 'gold_consume',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                        ],
                    },
                    {
                        eventGroupName: '公会玩法',
                        events: [
                            {
                                eventDesc: '加入公会',
                                eventName: 'add_guild',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '参与公会玩法',
                                eventName: 'guild_activity',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '离开公会',
                                eventName: 'leave_guild',
                                eventType: 'event',
                                isDisPlay: 1,
                            },
                        ],
                    },
                    {
                        eventGroupName: '默认分组',
                        events: [
                            {
                                eventDesc: '核心行为',
                                eventName: 'ta@hecihexinxingwei',
                                eventType: 'event_v',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '资源消耗',
                                eventName: 'ta@cost',
                                eventType: 'event_v',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '资源消耗',
                                eventName: 'ta@test',
                                eventType: 'event_v',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '商城购买参与活动',
                                eventName: 'ta@cindy',
                                eventType: 'event_v',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '钻石存量',
                                eventName: 'ta@current_zuanshi',
                                eventType: 'event_v',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '参与活动或充值',
                                eventName: 'ta@multi_event',
                                eventType: 'event_v',
                                isDisPlay: 1,
                            },
                            {
                                eventDesc: '玩法类型',
                                eventName: 'ta@wanfa',
                                eventType: 'event_v',
                                isDisPlay: 1,
                            },
                        ],
                    },
                ],
                select2List: [
                    {
                        id: 1,
                        childName: '总次数',
                    },
                    {
                        id: 2,
                        childName: '时间偏移',
                    },
                    {
                        id: 3,
                        childName: '用户等级',
                    },
                ],
            }
        },
        created() {
            // Promise.all([this.getAppList(), this.getUserList(), this.getTeamList()]).then(() => {
            //     this.$refs.adEffectChart.adEffect()
            // })
        },
        mounted() {},
        methods: {
            //首次点击出现出入框
            fristShowClick(index) {
                console.log('fristShowClick')
                this.fristShow = !this.fristShow
                if (index) this.codeItemAcitveIndex = index
                this.$nextTick(() => {
                    console.log('2222', this.$refs['fristInput'])
                    this.fristShow && this.$refs['fristInput'] && this.$refs['fristInput'].focus()
                })
            },
            //父级弹框点击选择值
            selectOneClick(clickE) {
                console.log(this.codeItemList)
                this.codeItemList.push(clickE)
                this.fristShow = false
                console.log(this.codeItemList)
            },
            //父级选中后的子集
            selectTwoClick(clickT) {
                console.log('clickT', clickT)
            },

            //小数点监听
            select2InputMarkBlur() {
                console.log('11111111')
                // this.select2Input_markShow = !this.select2Input_markShow
                this.selectInputFn('select2Input_markShow', 'select2Input_mark')
            },

            //子集文字换框
            select2InputBlur() {
                this.selectInputFn('select2Input_show', 'select2Input')
                // this.select2Input_show = !this.select2Input_show

                // console.log('this.$refs[select2Input]', this.$refs['select2Input'])
                // this.$nextTick(() => {
                //     !this.select2Input_show && this.$refs['select2Input'] && this.$refs['select2Input'].focus()
                // })
            },

            //符号监听
            select2InputMark1Blur() {
                this.selectInputFn('select2Input_mark1Show', 'select2Input_mark1')
            },
            selectInputFn(show, refName) {
                this[show] = !this[show]
                this.$nextTick(() => {
                    !this[show] && this.$refs[refName] && this.$refs[refName].focus()
                })
            },
        },
    }
</script>

<style lang="less" scoped>
    .test_home {
        padding: 30px 100px;
    }
    .formula-code-root {
        width: 100%;
        min-height: 36px;
        line-height: 28px;
        border-bottom: 1px solid transparent;
        cursor: text;
        transition: all 0.3s;
    }
    .formula-code-root .formula-code-placeholder {
        padding: 4px 0;
        color: var(--widget-tip-color);
        font-size: 13px;
        line-height: 28px;
        // pointer-events: none;
    }
    .select1,
    .select2 {
        position: relative;
    }
    .position_select1 {
        position: absolute;
        top: 40px;
        left: 0;
        width: 560px;
        height: 440px;
        padding: 15px 30px;
        box-sizing: border-box;
        background-color: #fff;
        border-radius: 2px;
        overflow: auto;
    }
    .position_select1_title {
        color: #000;
        font-weight: 500;
        font-size: 14px;
    }
    .position_select1_con {
        padding-left: 10px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
    }
    .position_select1_child_con {
        cursor: pointer;
        width: 50%;
    }

    .position_select2 {
        position: absolute;
        top: 40px;
        left: 0;
        padding: 10px;
        box-sizing: border-box;
        background-color: #fff;
    }
    .position_select2_con {
        cursor: pointer;
    }
    //active
    .formula-code-root.active {
        border-color: var(--primary-color);
    }

    //自定义
    .select2_active {
    }
    .select2_active_items {
        display: flex;
    }
    .select2_active_item {
        display: flex;
    }
    .select2_active_item_span {
        display: inline-block;
        max-width: 360px;
        height: 28px;
        padding: 0 6px;
        overflow: hidden;
        color: #67729d;
        font-size: 13px;
        line-height: 28px;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: top;
        background-color: #ccc;
    }
    .select2_active_item_con {
        position: relative;
    }
    .select2_active_item_con_icon {
        // width: 40px;
        height: 28px;
        margin: 0 0 0 2px;
        text-align: center;
        vertical-align: top;
    }
    .select2_active_item_d {
        font-size: 13px;
        white-space: nowrap;
        padding: 0 4px;
    }
    .select2_active_item_selfinput {
        //     position: absolute;
        // top: 0;
        // left: 0;
        width: 100%;
        min-width: 13px;
        height: 28px;
        padding: 0 6px;
        font-size: 13px;
        line-height: 28px;
        background-color: transparent;
        border: 0;
        outline: 0;
    }
    //输入框
    .formula-code-root .formula-code-item .formula-code-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        min-width: 13px;
        height: 28px;
        padding: 0 6px;
        font-size: 13px;
        line-height: 28px;
        background-color: transparent;
        border: 0;
        outline: 0;
    }

    .el-input {
        min-width: 40px;
        max-width: 360px;
    }
    /deep/ .el-input__inner {
        width: 90px;
        height: 28px;
        line-height: 28px;
        padding: 0 5px;
        border-radius: 2px;
        cursor: pointer;
    }
</style>
