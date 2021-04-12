import Vue from 'vue'
import moment from 'moment'
import _ from 'lodash'
import { Component } from 'vue-property-decorator'
import { listEventApi, loadPropQuotasApi, loadFiltPropsApi, eventAnalysisApi, getSelectDataApi } from '@/api/action/event'
import { reportsaveApi } from '@/api/dataView/index'
import { eventCacheDelApi } from '@/api/dataView/index'
import Project from '@/mixins/project.vue'
import DateSelect from '@/components/select/dateSelect.vue'
import LineEchart from '@/components/echarts/lineEchart.vue'
import ReportDrawer from '@/components/drawer/reportDrawer.vue'
import ClassSelect from '@/components/select/classSelect.vue'
import FilterSelect from '@/components/select/filterSelect.vue'
import AddReport from '@/components/dialog/addReportDia.vue'
import Pagination from '@/components/pagination.vue'
import EchartGroup from '@/components/echarts/echartGroup.vue'
import unixTime from './unixTime.vue'
import FilterSearch from '@/components/common/filter.vue'
import { colorList } from '../event/const'
import { getReportlistApi } from '@/api/dataView/index'
import { reportsearchApi } from '@/api/common'

interface group {
    name: string
    checked: boolean
}
interface tableColObj {
    label: string
    prop: string
    type: string
}
@Component({
    name: 'retainAnalyze',
    mixins: [Project],
    components: { FilterSelect, ClassSelect, DateSelect, unixTime, Pagination, LineEchart, AddReport, EchartGroup, ReportDrawer, FilterSearch },
})
export default class extends Vue {
    public get projectId(): number {
        return this.$store.state.projectId
    }
    // 是否编辑
    public get isEdit(): boolean {
        return Number(this.$route.query.id) !== -1 ? true : false
    }
    // 表格总页数
    public get totalPage(): number {
        return Math.ceil(this.tableData.totalNum / this.pageSize)
    }
    // 分组项可选项
    public get showGroupOptions(): Array<dynamicObj> {
        return this.groupList.length > 1 ? this.groupOptions.slice(1) : this.groupOptions
    }
    // 是否有分组项，false为没有，默认没有
    public get isHaveGroup(): boolean {
        const temp_data = this.groupList
        if (temp_data.length === 1 && temp_data[0].quotDesc === '总体') {
            return false
        }
        return true
    }
    // promoteText
    public get promoteText(): string {
        return this.retainType === 0 ? '留存' : '流失'
    }
    // 分组详情
    public get computedGroup(): Array<group> {
        const temp_data = this.activeEchart === 'L1' ? this.lineRenderData : this.upLineRenderData
        const result = temp_data.map((item) => {
            const { name, checked } = item
            return {
                name,
                checked,
            }
        })
        return result
    }
    // 是否展示分组详情
    public get showEchartGroup(): boolean {
        if (this.xaxisData.length > 0) {
            if (this.isHaveGroup) {
                return true
            } else {
                return this.activeEchart === 'L2'
            }
        }
        return false
    }
    // 初始事件
    private analyzeList: Array<dynamicObj> = []
    // 分析对象可选项
    private listEventOptions: Array<dynamicObj> = []
    // 回访事件
    private visitEventList: Array<dynamicObj> = []
    // 是否显示报表
    private reportDrawerShow = false
    private reportType = 1
    private reportList = []
    private originReportList = []
    // 更新时间
    private lastUpdateTime = ''
    // 分组项数据
    private groupList: Array<dynamicObj> = []
    // 分组项的筛选数据
    private groupOptions: Array<dynamicObj> = []
    // 筛选数据
    private eventFilterList: Array<dynamicObj> = []
    // 筛选数据的可选项数据
    private eventOptions: Array<dynamicObj> = []
    private eventRelation = 1
    // 同时展示
    private isShowSame = false
    // 同时展示数据
    private showSameList: Array<dynamicObj> = []
    // 分析时段数据
    private echartDatePopver = false
    private echartDate = {
        selectDate: '过去7天',
        recentDay: '1-7',
        time: [moment().add(-7, 'days').format('YYYY-MM-DD'), moment().add(-1, 'days').format('YYYY-MM-DD')],
        firstDayOfWeek: 1,
    }
    private selectedDate = {
        label: '7日',
        value: 'day3',
        type: 'T1',
        unitNum: 7,
    }
    // 是否为留存：0是留存1是流失
    private retainType = 0
    // 1是比例2是人数
    private echartType = 1
    // 接口返回的初始横坐标数据
    private originX: string[] = []
    // 图表横坐标数据
    private xaxisData: string[] = []
    // 每日留存横坐标
    private allXaxisData: string[] = []
    // 图表展示
    private activeEchart = 'L0'
    // 表格相关数据
    private tableColList: Array<tableColObj> = []
    private pageNumber = 1
    private pageSize = 10
    private tableData: dynamicObj = {
        list: [],
        totalNum: 0,
    }
    // 添加报表数据
    private dialogVisible = false
    private form = {
        reportName: '',
        desc: '',
    }
    private qpParams: dynamicObj = {}
    // 折线图
    private lineRenderData: Array<dynamicObj> = []
    private upLineRenderData: Array<dynamicObj> = []
    // 后端接口返回的图表原始数据
    private originData: dynamicObj = {}
    // 只看同时展示数据 是否选中
    private checkedSame = false
    // 弹框数据
    private dialogTitle = ''
    private dialogTableVisible = false
    private dialogData: dynamicObj = {
        list: [],
        totalNum: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPage: 1,
    }
    private dialogColList: dynamicObj[] = []
    // 存储暂时的分组数据
    private tempGroupData: dynamicObj[] = []
    // 图表设置分组数据
    // 分组详情是否默认展示
    private defaultSelect = true
    created(): void {
        const { id } = this.$route.params
        // 如果是从数据看板跳转过来，需要回显
        if (Number(id) !== -1) {
            this.getReportDetail()
        } else {
            this.getListEvent()
        }
        // this.getListEvent()
        this.getReportlist()
    }
    // 获取所有报表表数据
    private async getReportlist() {
        const { data } = await getReportlistApi({
            projectId: this.projectId,
        })
        if (data.ret === 1) {
            this.reportList = data.data.filter((item: { reportModel: number }) => item.reportModel === this.reportType)
            this.originReportList = data.data.copy()
        }
    }
    // 报表搜索
    private handleWatchSearch(val: string) {
        if (val) {
            this.reportList = this.originReportList.filter(
                (item: { reportName: string; reportModel: number }) => item.reportName.indexOf(val) > 0 && item.reportModel === this.reportType,
            )
        } else {
            this.reportList = this.originReportList.filter((item: { reportModel: number }) => item.reportModel === this.reportType)
        }
    }
    // 报表分类
    private handleChangeType(val: number) {
        this.reportType = val
        if (val === -1) {
            this.reportList = this.originReportList
        } else {
            this.reportList = this.originReportList.filter((item: { reportModel: number }) => item.reportModel === this.reportType)
        }
    }
    // 看板详情
    private async getReportDetail() {
        const { id } = this.$route.params
        const { data } = await reportsearchApi({
            projectId: this.projectId,
            reportId: id,
            searchSource: 'model_search',
        })
        if (data.ret === 1) {
        }
    }
    // 查询分析对象列表
    private async getListEvent() {
        const { data } = await listEventApi({
            projectId: this.projectId,
        })
        if (data.ret === 1) {
            this.listEventOptions = data.data.map((item: dynamicObj) => {
                return {
                    ...item,
                    events: item.events.filter((event: { show: boolean }) => event.show === true),
                }
            })
            if (data.data.length === 0) return
            if (this.listEventOptions[0].events.length === 0) {
                this.$message.warning('暂无可用事件，请检查权限或项目账单')
                return
            }
            const { eventName, eventDesc, eventType } = this.listEventOptions[0].events[0]
            this.$set(this.analyzeList, 0, {
                eventDesc,
                eventName,
                eventType,
                popoverVisible: false,
                customFilters: [],
                relation: 1,
                type: '',
                quota: '',
                quotaDesc: '',
            })
            this.$set(this.visitEventList, 0, {
                eventDesc,
                eventName,
                eventType,
                popoverVisible: false,
                customFilters: [],
                relation: 1,
                type: '',
                quota: '',
                quotaDesc: '',
            })
            this.loadOneFiltProps({ eventName, eventType }, 0, true)
        }
    }
    // 获取过滤指标
    private async loadOneFiltProps(params: { eventName: string; eventType: string }, index: number, isInit?: boolean) {
        const { data } = await loadFiltPropsApi({
            data: {
                events: [params],
                commonHeader: {
                    projectId: this.projectId,
                },
            },
        })
        if (data.ret === 1) {
            // 进行分类
            const temp_type_list = data.data.map((item: { tableType: string }) => item.tableType).single()
            const temp_data: Array<any> = []
            temp_type_list.forEach((one: string) => {
                const temp_obj: dynamicObj = {
                    tableType: one,
                }
                temp_obj.props = data.data.filter((item: { tableType: string; hide: number }) => item.tableType === one && item.hide === 0)
                temp_data.push(temp_obj)
            })
            this.eventOptions = temp_data
            const temp_arr = [{ tableType: '', props: [{ quotDesc: '总体', quot: '' }] }]
            this.groupOptions = temp_arr.concat(temp_data)
            this.groupList = []
            // 分组项初始化值
            this.groupList.push({
                popoverVisible: false,
                quot: this.groupOptions[0].props[0].quot,
                quotDesc: this.groupOptions[0].props[0].quotDesc,
            })
            this.$set(this.analyzeList, index, {
                ...this.analyzeList[index],
                filterOptions: temp_data.filter((item: dynamicObj) => item.tableType === '0'),
            })
            if (isInit) {
                this.$set(this.visitEventList, index, {
                    ...this.visitEventList[index],
                    filterOptions: temp_data.filter((item: dynamicObj) => item.tableType === '0'),
                })
            }
            // 获取同时展示数据
            this.showSameList = this.analyzeList.copy()
            const { eventName, eventType } = this.showSameList[0]
            this.getShowSameData({ eventName, eventType })
        }
    }
    // 同时展示数据
    private async getShowSameData(params: { eventName: string; eventType: string }) {
        const { projectId } = this
        const { eventName, eventType } = params
        const { data } = await loadPropQuotasApi({
            data: {
                commonHeader: {
                    projectId,
                },
                events: [
                    {
                        eventName,
                        eventType,
                    },
                ],
                eventModel: 1,
            },
        })
        if (data.ret === 1) {
            const { props, staidQuots } = data.data
            const result: dynamicObj = []
            Object.keys(staidQuots).forEach((key) => {
                result.push({
                    value: key,
                    label: staidQuots[key],
                })
            })
            props.forEach((item: dynamicObj) => {
                const children: Array<{ value: string; label: string }> = []
                if (!item.analysis) return
                Object.keys(item.analysis).forEach((key) => {
                    children.push({
                        value: key,
                        label: item.analysis[key],
                    })
                })
                if (item.hide === 0) {
                    result.push({
                        value: item.quot,
                        label: item.quotDesc,
                        children,
                    })
                }
            })
            this.showSameList[0].propOptions = result
            this.showSameList[0].analysis = [result[0].value]
            this.showSameList[0].analysisDesc = result[0].label
        }
    }
    private async getSameFit(params: { eventName: string; eventType: string }, index: number, type: string) {
        const resp = await loadFiltPropsApi({
            data: {
                events: [params],
                commonHeader: {
                    projectId: this.projectId,
                },
            },
        })
        if (resp.data.ret === 1) {
            // 进行分类
            const temp_type_list = resp.data.data.map((item: { tableType: string }) => item.tableType).single()
            const temp_data: Array<any> = []
            temp_type_list.forEach((one: string) => {
                const temp_obj: dynamicObj = {
                    tableType: one,
                }
                temp_obj.props = resp.data.data.filter((item: { tableType: string; hide: number }) => item.tableType === one && item.hide === 0)
                temp_data.push(temp_obj)
            })
            const temp_result = temp_data.filter((item: dynamicObj) => item.tableType === '0')
            if (type === 'visit') {
                this.visitEventList[index].filterOptions = temp_result
            }
            if (type === 'same') {
                this.showSameList[index].filterOptions = temp_result
            }
        }
    }
    // 计算选择框是多选还是单选
    private computedIsMultiple(value: string) {
        // 包括不包括正则匹配正则不匹配为单选
        if (value === 'C07' || value === 'C07' || value === 'C11' || value === 'C12') {
            return false
        }
        return true
    }
    // 初始事件选择
    private async handleSelectAna(value: dynamicObj, index: number) {
        const { eventDesc, eventName, eventType } = value
        this.$set(this.analyzeList, index, {
            relation: 1,
            eventDesc,
            eventName,
            eventType,
            popoverVisible: false,
            customFilters: [],
        })
        this.loadOneFiltProps({ eventName, eventType }, index, false)
    }
    // 添加筛选条件
    private hanleAddFilter(rowIndex: number) {
        if (this.analyzeList[rowIndex].filterOptions.length === 0) {
            this.$message.warning('暂无可筛选数据')
            return
        }
        const temp_data = this.analyzeList[rowIndex].filterOptions[0].props[0]
        const { calcuSymbol } = temp_data
        this.analyzeList[rowIndex].customFilters.push({
            ...temp_data,
            calcuSymbol: Object.keys(calcuSymbol)[0],
            ftv: '',
            popoverVisible: false,
            myCalcuSymbol: calcuSymbol,
            timeRelative: 'range',
            timeUnit: 'day',
            options: [],
        })
        this.$forceUpdate()
    }
    // 更改分析对象的关系
    private changeAnaRelation(index: number) {
        const { relation } = this.analyzeList[index]
        this.analyzeList[index].relation = relation === 1 ? 0 : 1
    }
    // 分析对象筛选，获取下拉框数据
    private async hanleFocusFilter(e: MouseEvent, filterIndex: number, rowIndex: number) {
        const { quot, ftv, hasValue } = this.analyzeList[rowIndex].customFilters[filterIndex]
        if (!hasValue) return
        if (ftv && ftv.length > 0) return
        const { data } = await getSelectDataApi({
            dimName: quot,
            projectId: this.projectId,
        })
        if (data.ret === 1) {
            this.analyzeList[rowIndex].customFilters[filterIndex].options = data.data
        }
    }
    // 删除分析对象的过滤
    private handleDeleteFilter(rowIndex: number, filterIndex: number) {
        this.analyzeList[rowIndex].customFilters.splice(filterIndex, 1)
        // this.$forceUpdate()
    }
    // 选中指定过滤维度
    private handleSelectAnaFilter(val: dynamicObj, rowIndex: number, filterIndex: number) {
        const { calcuSymbol } = val
        this.$set(this.analyzeList[rowIndex].customFilters, filterIndex, {
            ...this.analyzeList[rowIndex].customFilters[filterIndex],
            ...val,
            calcuSymbol: Object.keys(calcuSymbol)[0],
            ftv: '',
            popoverVisible: false,
            myCalcuSymbol: calcuSymbol,
            timeRelative: 'range',
            timeUnit: 'day',
        })
    }
    // 选择回访事件
    private async handleSelectVisit(value: dynamicObj, index: number) {
        const { eventDesc, eventName, eventType } = value
        this.$set(this.visitEventList, index, {
            relation: 1,
            eventDesc,
            eventName,
            eventType,
            popoverVisible: false,
            customFilters: [],
        })
        const { data } = await loadFiltPropsApi({
            data: {
                events: [{ eventName, eventType }],
                commonHeader: {
                    projectId: this.projectId,
                },
            },
        })
        if (data.ret === 1) {
            // 进行分类,只查看事件属性
            const temp_type_list = data.data
                .map((item: { tableType: string }) => item.tableType)
                .single()
                .filter((type: string) => type === '0')
            const temp_data: Array<any> = []
            temp_type_list.forEach((one: string) => {
                const temp_obj: dynamicObj = {
                    tableType: one,
                }
                temp_obj.props = data.data.filter((item: { tableType: string; hide: number }) => item.tableType === one && item.hide === 0)
                temp_data.push(temp_obj)
            })
            this.$set(this.visitEventList, index, {
                ...this.visitEventList[index],
                filterOptions: temp_data,
            })
        }
    }
    // 添加回访事件的筛选条件
    private hanleAddVisitFilter(rowIndex: number) {
        if (this.visitEventList[rowIndex].filterOptions.length === 0) {
            this.$message.warning('暂无可筛选数据')
            return
        }
        const temp_data = this.visitEventList[rowIndex].filterOptions[0].props[0]
        const { calcuSymbol } = temp_data
        this.visitEventList[rowIndex].customFilters.push({
            ...temp_data,
            calcuSymbol: Object.keys(calcuSymbol)[0],
            ftv: '',
            popoverVisible: false,
            myCalcuSymbol: calcuSymbol,
            timeRelative: 'range',
            timeUnit: 'day',
            options: [],
        })
    }
    // 更改回访事件过滤的关系
    private changeVisitRelation(index: number) {
        const { relation } = this.visitEventList[index]
        this.visitEventList[index].relation = relation === 1 ? 0 : 1
    }
    // 回访事件筛选，获取下拉框数据
    private async hanleFocusVisitFilter(e: MouseEvent, filterIndex: number, rowIndex: number) {
        const { quot, ftv, hasValue } = this.visitEventList[rowIndex].customFilters[filterIndex]
        if (!hasValue) return
        if (ftv && ftv.length > 0) return
        const { data } = await getSelectDataApi({
            dimName: quot,
            projectId: this.projectId,
        })
        if (data.ret === 1) {
            this.visitEventList[rowIndex].customFilters[filterIndex].options = data.data
        }
    }
    // 回访事件过滤删除
    private handleDeleteVisitFilter(rowIndex: number, filterIndex: number) {
        this.visitEventList[rowIndex].customFilters.splice(filterIndex, 1)
    }
    // 回访事件选中指定过滤维度
    private handleSelectVisitFilter(val: dynamicObj, rowIndex: number, filterIndex: number) {
        const { calcuSymbol } = val
        this.$set(this.visitEventList[rowIndex].customFilters, filterIndex, {
            ...this.visitEventList[rowIndex].customFilters[filterIndex],
            ...val,
            calcuSymbol: Object.keys(calcuSymbol)[0],
            ftv: '',
            popoverVisible: false,
            myCalcuSymbol: calcuSymbol,
            timeRelative: 'range',
            timeUnit: 'day',
        })
    }
    // 同时展示
    private handleShowSame() {
        this.isShowSame = true
    }
    // 选择同时展示事件
    private handleSelectSame(value: dynamicObj, index: number) {
        const { eventDesc, eventName, eventType } = value
        this.$set(this.showSameList, index, {
            eventDesc,
            relation: 1,
            eventName,
            eventType,
            popoverVisible: false,
            customFilters: [],
        })
        this.getShowSameData({ eventName, eventType })
        this.getSameFit({ eventName, eventType }, index, 'same')
    }
    // 同时展示添加
    private hanleAddSameFilter(rowIndex: number) {
        if (this.showSameList[rowIndex].filterOptions.length === 0) {
            this.$message.warning('暂无可筛选数据')
            return
        }
        const temp_data = this.showSameList[rowIndex].filterOptions[0].props[0]
        const { calcuSymbol } = temp_data
        this.showSameList[rowIndex].customFilters.push({
            ...temp_data,
            calcuSymbol: Object.keys(calcuSymbol)[0],
            ftv: '',
            popoverVisible: false,
            myCalcuSymbol: calcuSymbol,
            timeRelative: 'range',
            timeUnit: 'day',
            options: [],
        })
    }
    // 更改同时展示的条件
    private changeSameRelation(index: number) {
        const { relation } = this.showSameList[index]
        this.showSameList[index].relation = relation === 1 ? 0 : 1
    }
    private handleSelectSameFilter(val: dynamicObj, rowIndex: number, filterIndex: number) {
        const { calcuSymbol } = val
        this.$set(this.showSameList[rowIndex].customFilters, filterIndex, {
            ...this.showSameList[rowIndex].customFilters[filterIndex],
            ...val,
            calcuSymbol: Object.keys(calcuSymbol)[0],
            ftv: '',
            popoverVisible: false,
            myCalcuSymbol: calcuSymbol,
            timeRelative: 'range',
            timeUnit: 'day',
        })
    }
    // 聚焦同时展示数据筛选
    private async hanleFocusSameFilter(e: MouseEvent, filterIndex: number, rowIndex: number) {
        const { quot, ftv, hasValue } = this.showSameList[rowIndex].customFilters[filterIndex]
        if (!hasValue) return
        if (ftv && ftv.length > 0) return
        const { data } = await getSelectDataApi({
            dimName: quot,
            projectId: this.projectId,
        })
        if (data.ret === 1) {
            this.showSameList[rowIndex].customFilters[filterIndex].options = data.data
        }
    }
    // 删除同时展示事件过滤
    private handleDeleteSameFilter(rowIndex: number, filterIndex: number) {
        this.showSameList[rowIndex].customFilters.splice(filterIndex, 1)
    }
    // 选择时间确定
    private handleDateConfirm(selectDate: string, recentDay: string, time: Array<string>, activeIndex: number) {
        this.echartDatePopver = false
        this.echartDate = {
            ...this.echartDate,
            recentDay,
            time,
            selectDate,
        }
        if (activeIndex === 1) {
            this.echartDate.recentDay = ''
        }
    }
    private handleSelectedDate(result: { label: string; value: string; type: string; unitNum: number }) {
        this.selectedDate = {
            ...result,
        }
        this.handleComputed(false)
    }
    // 开始计算
    private async handleComputed(isRefresh: boolean) {
        let check = false
        // 初始事件
        const temp_data1 = this.analyzeList.map((item) => {
            const { eventName, eventDesc, eventType, relation, customFilters } = item
            const filts = customFilters.map((el: dynamicObj) => {
                const { calcuSymbol, quotDesc, quot, columnIndex, columnType, selectType, tableType, ftv, timeRelative, timeUnit, num1, num2 } = el

                let temp_ftv: Array<string> = Array.isArray(ftv) ? ftv : ftv.split(',')
                // 有值没值没有输入框
                if (calcuSymbol !== 'C04' && calcuSymbol !== 'C05') {
                    if (calcuSymbol === 'C13' || calcuSymbol === 'C14' || (columnType !== 'timestamp' && calcuSymbol === 'C06')) {
                        if (!num1 || !num2) {
                            check = true
                        }
                        temp_ftv = [num1, num2]
                    } else {
                        if (!Array.isArray(ftv)) {
                            !ftv && (check = true)
                        }
                    }
                }
                temp_ftv.length === 0 && (check = true)
                return {
                    calcuSymbol,
                    columnDesc: quotDesc,
                    columnName: quot,
                    columnIndex,
                    columnType,
                    selectType,
                    tableType,
                    ftv: temp_ftv,
                    timeRelative,
                    timeUnit,
                }
            })
            return {
                eventName,
                eventDesc,
                eventType,
                eventNameDisplay: '',
                relation,
                relationUser: 1,
                filts,
                type: 0,
            }
        })
        // 回访事件
        const temp_data2 = this.visitEventList.map((item) => {
            const { eventName, eventDesc, eventType, relation, customFilters } = item
            const filts = customFilters.map((el: dynamicObj) => {
                const { calcuSymbol, quotDesc, quot, columnIndex, columnType, selectType, tableType, ftv, timeRelative, timeUnit, num1, num2 } = el

                let temp_ftv: Array<string> = Array.isArray(ftv) ? ftv : ftv.split(',')
                // 有值没值没有输入框
                if (calcuSymbol !== 'C04' && calcuSymbol !== 'C05') {
                    if (calcuSymbol === 'C13' || calcuSymbol === 'C14' || (columnType !== 'timestamp' && calcuSymbol === 'C06')) {
                        if (!num1 || !num2) {
                            check = true
                        }
                        temp_ftv = [num1, num2]
                    } else {
                        if (!Array.isArray(ftv)) {
                            !ftv && (check = true)
                        }
                    }
                }
                temp_ftv.length === 0 && (check = true)
                return {
                    calcuSymbol,
                    columnDesc: quotDesc,
                    columnName: quot,
                    columnIndex,
                    columnType,
                    selectType,
                    tableType,
                    ftv: temp_ftv,
                    timeRelative,
                    timeUnit,
                }
            })
            return {
                eventName,
                eventDesc,
                eventType,
                eventNameDisplay: '',
                relation,
                relationUser: 1,
                filts,
                type: 1,
            }
        })
        let events: Array<dynamicObj> = [...temp_data1, ...temp_data2]
        // 同时展示
        if (this.isShowSame) {
            const temp_data3 = this.showSameList.map((item) => {
                const { eventName, eventDesc, eventType, analysis, relation, customFilters } = item
                const filts = customFilters.map((el: dynamicObj) => {
                    const { calcuSymbol, quotDesc, quot, columnIndex, columnType, selectType, tableType, ftv, timeRelative, timeUnit, num1, num2 } = el

                    let temp_ftv: Array<string> = Array.isArray(ftv) ? ftv : ftv.split(',')
                    // 有值没值没有输入框
                    if (calcuSymbol !== 'C04' && calcuSymbol !== 'C05') {
                        if (calcuSymbol === 'C13' || calcuSymbol === 'C14' || (columnType !== 'timestamp' && calcuSymbol === 'C06')) {
                            if (!num1 || !num2) {
                                check = true
                            }
                            temp_ftv = [num1, num2]
                        } else {
                            if (!Array.isArray(ftv)) {
                                !ftv && (check = true)
                            }
                        }
                    }
                    temp_ftv.length === 0 && (check = true)
                    return {
                        calcuSymbol,
                        columnDesc: quotDesc,
                        columnName: quot,
                        columnIndex,
                        columnType,
                        selectType,
                        tableType,
                        ftv: temp_ftv,
                        timeRelative,
                        timeUnit,
                    }
                })
                return {
                    eventName,
                    eventDesc,
                    eventType,
                    analysis: analysis[analysis.length - 1],
                    analysisDesc: this.findOne(item.propOptions, analysis[analysis.length - 1]).label,
                    quota: analysis.length > 1 ? this.findOne(item.propOptions, analysis[0]).value : '',
                    quotaDesc: analysis.length > 1 ? this.findOne(item.propOptions, analysis[0]).label : '',
                    eventNameDisplay: '',
                    relation,
                    subTableType: '',
                    filts,
                    relationUser: 1,
                    type: 2,
                }
            })
            events = [...events, ...temp_data3]
        }
        const { recentDay, time } = this.echartDate
        const { type, unitNum } = this.selectedDate
        const eventView = {
            startTime: time[0],
            endTime: time[1],
            recentDay,
            timeParticleSize: type,
            unitNum,
            statType: 'retention',
            rtnRateOrNum: 'R1',
            comparedStartTime: '',
            comparedEndTime: '',
            comparedRecentDay: '',
            comparedByTime: false,
            startToNow: -1,
            comparedType: '',
            compareStartToNow: -1,
            simStatDisplay: false,
            retentionLineType: 'rate',
            retentionType: 'retention',
            relation: this.eventRelation,
        }
        let groupBy: Array<any> = []
        // 考虑默认总体的情况
        if (this.groupList.length === 1 && !this.groupList[0].quot) {
            groupBy = []
        } else {
            groupBy = this.groupList.map((item) => {
                const { quotDesc, columnIndex, quot, columnType, selectType, tableType } = item
                return {
                    columnDesc: quotDesc,
                    columnIndex,
                    columnName: quot,
                    columnType,
                    selectType,
                    tableType,
                    propertyRange: '',
                    propertyRangeType: '',
                    subTableType: '',
                    timeTypeColumnFormart: '',
                    arrayGroupType: '',
                }
            })
        }
        const filts = this.eventFilterList.map((item) => {
            const { calcuSymbol, columnIndex, quotDesc, quot, columnType, ftv, selectType, tableType, timeRelative, timeUnit, num1, num2 } = item

            let temp_ftv: Array<string> = Array.isArray(ftv) ? ftv : ftv.split(',')
            if (calcuSymbol !== 'C04' && calcuSymbol !== 'C05' && calcuSymbol !== 'C20' && calcuSymbol !== 'C21') {
                if (calcuSymbol === 'C13' || calcuSymbol === 'C14' || (columnType !== 'timestamp' && calcuSymbol === 'C06')) {
                    if (!num1 || !num2) {
                        check = true
                    }
                    temp_ftv = [num1, num2]
                } else {
                    if (!Array.isArray(ftv)) {
                        !ftv && (check = true)
                    }
                }
            }
            temp_ftv.length === 0 && (check = true)
            return {
                calcuSymbol,
                columnDesc: quotDesc,
                columnIndex,
                columnName: quot,
                columnType,
                ftv: temp_ftv,
                selectType,
                tableType,
                subTableType: '',
                timeRelative,
                timeUnit,
            }
        })
        if (check) {
            this.$message.warning('查询参数有误，请正确输入')
            return
        }
        const query = {
            events,
            eventView: {
                ...eventView,
                groupBy,
                filts,
            },
        }
        const params = {
            projectId: this.projectId,
            eventModel: this.reportType,
            searchSource: 'model_search',
            querySource: 'module',
            qp: JSON.stringify(query),
            requestId: 1,
        }
        this.qpParams = query
        if (isRefresh) {
            if (!this.lastUpdateTime) {
                this.$message.warning('请先进行计算之后再刷新')
                return
            }
            const refreshData = await eventCacheDelApi(params)
            if (refreshData.data.ret === 1) {
                this.getData(params)
            }
        } else {
            this.getData(params)
        }
    }
    private async getData(params: dynamicObj) {
        const loading = this.$loading({
            lock: true,
            body: true,
            text: '正在计算，请耐心等候。复杂查询可能需要3~5分钟...',
            background: 'rgba(255, 255, 255, 0.5)',
            target: 'body',
            customClass: 'create-isLoading',
        })
        const resp = await eventAnalysisApi(params)
        const { data, status } = resp
        if (status !== 200) {
            loading.close()
            this.$message.error('请求超时,当前集群计算资源紧张 请稍后在试')
            return
        }
        if (data.ret === 1) {
            loading.close()
            this.originData = data.data
            this.hadleShowData()
        } else {
            loading.close()
        }
    }

    // 处理数据
    private hadleShowData() {
        const { x, y, state_avg, result_generate_time } = this.originData
        this.lastUpdateTime = result_generate_time
        const { type } = this.selectedDate
        if (x.length === 0) return
        this.originX = x
        this.xaxisData = x
        const { eventDesc } = this.analyzeList[0]
        const text = type === 'T1' ? '日' : type === 'T2' ? '周' : '月'
        const temp_col = [
            {
                label: '日期',
                prop: 'date',
                type: 'date',
            },
            {
                label: `${eventDesc}用户数`,
                prop: 'initNum',
                type: 'normal',
            },
            {
                label: `当${text}`,
                prop: 'current',
                type: 'number',
            },
        ]
        const temp_col2 = state_avg[this.retainType][0].values.slice(2).map((item: string, index: number) => {
            return {
                label: `第${index + 1}${text}`,
                prop: `xdate${index + 1}`,
                type: 'number',
            }
        })
        this.tableColList = [...temp_col, ...temp_col2]
        // 所有的tableData
        const temp_table_data: Array<dynamicObj> = []
        // 0 是留存 1 是流失 2 是全部展示
        x.forEach((item: string) => {
            const { initNum, values } = y[this.retainType][item][0]
            let sameValues: string[] = []
            const num = Number((Number(values[1]) / initNum).toFixed(3))
            const one_obj: dynamicObj = {
                date: item,
                // 初始事件用户数
                initNum: values[0],
                // 当日
                current: values[1],
                currentpercent: values[1] === '-' ? '-' : Math.round(num * 100),
                type: 'normal',
            }
            if (this.isShowSame) {
                sameValues = y[2][item][0].values
                one_obj.currentsame = sameValues[1]
            }
            values.slice(2).forEach((val: string, index: number) => {
                const temp_prop = `xdate${index + 1}`
                one_obj[temp_prop] = val
                const num = Number((Number(val) / initNum).toFixed(5))
                one_obj[`${temp_prop}percent`] = val === '-' ? '-' : Math.round(num * 10000) / 100
                // 同时展示
                if (this.isShowSame) {
                    one_obj[`${temp_prop}same`] = sameValues.slice(2)[index]
                }
            })

            temp_table_data.push(one_obj)
        })
        // 均值的数据
        const temp_values = state_avg[this.retainType][0].values
        const temp_avg: dynamicObj = {
            date: '阶段均值',
            initNum: temp_values[0],
            current: '-',
            currentpercent: temp_values[1] === '-' ? '-' : Math.round(temp_values[1] * 100),
            type: 'avg',
        }
        if (this.isShowSame) {
            temp_avg.currentsame = state_avg[2][0].values[1]
        }
        temp_values.slice(2).forEach((val: string, index: number) => {
            const temp_prop = `xdate${index + 1}`
            temp_avg[temp_prop] = '-'
            temp_avg[`${temp_prop}percent`] = val === '-' ? '-' : Math.round(Number(val) * 100)
            // 同时展示
            if (this.isShowSame) {
                const temp_same_values = state_avg[2][0].values
                temp_avg.currentsame = temp_same_values[1]
                temp_avg[`${temp_prop}same`] = temp_same_values.slice(2)[index]
            }
        })
        this.tableData.list = [temp_avg, ...temp_table_data]
        // 默认查看的是比例以及单个
        this.lineRenderData = []
        const temp_line_data: Array<dynamicObj> = []
        this.tableData.list.forEach((item: dynamicObj) => {
            // 总共几日
            const { unitNum } = this.selectedDate
            const prop = `xdate${unitNum}`
            if (item[prop] !== '-') {
                temp_line_data.push({
                    date: item.date,
                    num: item[prop],
                    numPercent: item[`${prop}percent`],
                })
            }
        })
        this.tableData.totalNum = this.tableData.list.length
        this.xaxisData = temp_line_data.map((item) => item.date)

        // 数据重新计算就重新渲染图表
        this.handleChangeEchartType()
    }
    private changeRetainType() {
        this.hadleShowData()
        this.checkedSame = false
    }
    // 查看比例还是人数
    private handleChangeEchartType() {
        if (this.activeEchart === 'L0') return
        if (this.activeEchart === 'L1') {
            this.showOneData()
        } else {
            this.showAllData()
        }
    }
    // 只展示一个数据
    private showOneData() {
        if (this.originX.length === 0) return
        // 默认查看的是比例以及单个
        const temp_line_data: Array<dynamicObj> = []
        this.tableData.list.forEach((item: dynamicObj) => {
            // const prop = this.originX[this.originX.length - 1]
            const { unitNum } = this.selectedDate
            const prop = `xdate${unitNum}`
            if (item[prop] !== '-') {
                temp_line_data.push({
                    date: item.date,
                    num: item[prop],
                    numPercent: item[`${prop}percent`],
                    numSame: item[`${prop}same`],
                })
            }
        })
        this.xaxisData = temp_line_data.map((item) => item.date)
        let temp_data: number[] = []
        // 看同时
        if (this.checkedSame) {
            temp_data = temp_line_data.map((item) => item.numSame)
        } else {
            // 1 是比例2 是人数
            if (this.echartType === 1) {
                temp_data = temp_line_data.map((item) => item.numPercent)
            } else {
                temp_data = temp_line_data.map((item) => item.num)
            }
        }
        this.lineRenderData = []
        if (this.isHaveGroup) {
            const { x, y, state_avg } = this.originData
            const temp_data = state_avg[this.retainType].map((item: dynamicObj, index: number) => {
                return {
                    name: item.groupCols.join(','),
                    type: 'line',
                    data: [],
                    checked: index < 8 ? true : false,
                    color: colorList[index],
                    percentData: [],
                }
            })
            x.forEach((item: string) => {
                temp_data.forEach((el: dynamicObj) => {
                    const temp_result = y[this.retainType][item].find((one: dynamicObj) => one.groupCols.join(',') === el.name)
                    if (temp_result) {
                        // 默认是比例
                        const val = temp_result.values[temp_result.values.length - 1]
                        const { initNum } = temp_result
                        const num = Number((Number(val) / initNum).toFixed(5))
                        const result = val === '-' ? '-' : Math.round(num * 10000) / 100
                        el.percentData.push(result)
                        el.data.push(val)
                    } else {
                        el.percentData.push('-')
                        el.data.push('-')
                    }
                })
            })
            this.xaxisData = x
            this.tempGroupData = temp_data.copy()
            // 1是比例2是人数
            if (this.echartType === 1) {
                this.lineRenderData = temp_data.map((item: dynamicObj) => {
                    const { name, type, checked, color, percentData } = item
                    return {
                        name,
                        type,
                        checked,
                        color,
                        data: percentData,
                    }
                })
            } else {
                this.lineRenderData = temp_data.map((item: dynamicObj) => {
                    const { name, type, checked, color, data } = item
                    return {
                        name,
                        type,
                        checked,
                        color,
                        data,
                    }
                })
            }
        } else {
            this.groupList.forEach((item, index) => {
                this.lineRenderData.push({
                    name: item.quotDesc,
                    type: 'line',
                    color: colorList[index],
                    checked: index < 8 ? true : false,
                    data: temp_data,
                })
            })
        }
        this.activeEchart = 'L1'
    }
    // 展示所有的数据
    private showAllData() {
        if (this.originX.length === 0) return
        this.activeEchart = 'L2'
        if (this.originX.length === 0) return
        this.allXaxisData = this.tableColList.slice(2).map((item) => item.label)
        // 有分组项和无分组项不同处理
        if (this.isHaveGroup) {
            const { state_avg } = this.originData
            this.upLineRenderData = this.tempGroupData.map((item) => {
                const { name, type, color, checked } = item
                const find_one = state_avg[this.retainType].find((el: dynamicObj) => el.groupCols.join(',') === name)
                const temp_data = find_one.values.slice(1).map((el: string) => {
                    return el === '-' ? '-' : Math.round(Number(el) * 100)
                })
                return {
                    name,
                    type,
                    color,
                    checked,
                    data: temp_data,
                }
            })
            // 只能查看比例
            this.echartType = 1
        } else {
            // 处理均值数据
            let temp_avg: number[] = []
            const el = this.tableData.list[0]
            // 1是比例2是人数
            if (this.echartType === 1) {
                const result: string[] = []
                Object.keys(el).forEach((key) => {
                    if (key.indexOf('percent') > -1 && key.indexOf('current') < 0) {
                        result.push(el[key])
                    }
                })
                temp_avg = [el.currentpercent, ...result]
                // temp_avg = [el.currentpercent, ...this.originX.map((item) => el[`${item}percent`])]
            } else {
                const result: string[] = []
                Object.keys(el).forEach((key) => {
                    if (key.indexOf('xdate') > -1 && key.indexOf('percent') < 0 && key.indexOf('current') < 0) {
                        result.push(el[key])
                    }
                })
                temp_avg = [el.current, ...result]
            }
            this.upLineRenderData = [
                {
                    name: '阶段均值',
                    type: 'line',
                    color: colorList[0],
                    checked: true,
                    data: temp_avg,
                },
            ]
            this.originX.forEach((item, index) => {
                // 符合横坐标的数据
                const currentOne = this.tableData.list.find((one: dynamicObj) => one.date === item)
                let rowData = []
                if (this.checkedSame) {
                    const result: string[] = []
                    Object.keys(currentOne).forEach((key) => {
                        if (key.indexOf('same') > -1) {
                            result.push(currentOne[key])
                        }
                    })
                    rowData = [currentOne.currentsame, ...result]
                } else {
                    // this: 1是比例2是人数
                    if (this.echartType === 1) {
                        const result: string[] = []
                        Object.keys(currentOne).forEach((key) => {
                            if (key.indexOf('percent') > -1 && key.indexOf('current') < 0) {
                                result.push(currentOne[key])
                            }
                        })
                        rowData = [currentOne.currentpercent, ...result]
                    } else {
                        const result: string[] = []
                        Object.keys(currentOne).forEach((key) => {
                            if (key.indexOf('xdate') > -1 && key.indexOf('percent') < 0 && key.indexOf('current') < 0) {
                                result.push(currentOne[key])
                            }
                        })
                        rowData = [currentOne.current, ...result]
                    }
                }
                this.upLineRenderData.push({
                    name: item,
                    type: 'line',
                    color: colorList[index + 1],
                    // 默认显示7个
                    checked: index < 8 ? true : false,
                    data: rowData,
                })
            })
        }
    }
    // 关闭新增报表弹框
    private handleCloseDialog() {
        this.dialogVisible = false
        this.form = {
            reportName: '',
            desc: '',
        }
    }
    // 保存报表
    private handleSaveReport() {
        if (!this.lastUpdateTime) {
            this.$message.warning('请先进行计算之后再保存报表')
            return
        }
        this.dialogVisible = true
        const { eventDesc } = this.analyzeList[0]
        const eventDesc2 = this.visitEventList[0].eventDesc
        this.form = {
            ...this.form,
            reportName: `先${eventDesc}，后${eventDesc2}的留存分析`,
        }
    }
    // 弹框保存报表
    private async handleSaveDialog(value: { reportDesc: string; reportName: string }) {
        const { reportDesc, reportName } = value
        const { projectId, activeEchart } = this
        let groups = []
        // 考虑默认总体的情况
        if (this.groupList.length === 1 && !this.groupList[0].quot) {
            groups = []
        } else {
            groups = this.groupList.map((item: dynamicObj) => item.quotDesc)
        }
        this.qpParams = {
            ...this.qpParams,
            eventView: {
                ...this.qpParams.eventView,
                retentionLineType: this.echartType === 1 ? 'rate' : 'num',
            },
        }
        const { data } = await reportsaveApi({
            reportDesc,
            reportName,
            projectId,
            reportModel: this.reportType,
            reportGraphShape: activeEchart,
            qp: JSON.stringify(this.qpParams),
            groups: groups.join(','),
        })
        if (data.ret === 1) {
            this.dialogVisible = false
            this.$message.success('保存成功')
            this.form = {
                reportName: '',
                desc: '',
            }
            // this.getReportlist()
        }
    }
    // 更改筛选条件的关系
    private changeEventRelation() {
        this.eventRelation = this.eventRelation === 1 ? 0 : 1
    }
    // 添加事件筛选
    private handleAddEventFilter() {
        if (this.eventOptions.length === 0) {
            this.$message.warning('暂无可筛选数据')
            return
        }
        const temp_data = this.eventOptions[0].props[0]
        const { calcuSymbol } = temp_data
        this.eventFilterList.push({
            ...temp_data,
            calcuSymbol: Object.keys(calcuSymbol)[0],
            ftv: '',
            popoverVisible: false,
            myCalcuSymbol: calcuSymbol,
            timeRelative: 'range',
            timeUnit: 'day',
            options: [],
            // customFilters: [],
        })
    }
    // 全局筛选删除
    private handleDeleteEventFilter(index: number) {
        this.eventFilterList.splice(index, 1)
    }
    // 全局筛选选中指定过滤维度
    private handleSelectEventFilter(val: dynamicObj, index: number) {
        const { calcuSymbol } = val
        this.$set(this.eventFilterList, index, {
            ...val,
            calcuSymbol: Object.keys(calcuSymbol)[0],
            ftv: '',
            popoverVisible: false,
            myCalcuSymbol: calcuSymbol,
        })
    }
    // 全局筛选聚焦
    private async hanleFocusFilterEvent(e: MouseEvent, filterIndex: number) {
        const { quot, ftv, hasValue } = this.eventFilterList[filterIndex]
        if (!hasValue) {
            this.eventFilterList[filterIndex].options = []
            return
        }
        if (ftv && ftv.length > 0) return
        const { data } = await getSelectDataApi({
            dimName: quot,
            projectId: this.projectId,
        })
        if (data.ret === 1) {
            this.eventFilterList[filterIndex].options = data.data
            this.$forceUpdate()
        }
    }
    // 添加分组项
    private handleAddGroup() {
        const temp_data = this.showGroupOptions[1].props[0]
        this.groupList.push({
            popoverVisible: false,
            ...temp_data,
        })
    }
    // 分组项选择
    private handleSelectGroup(val: dynamicObj, index: number) {
        this.$set(this.groupList, index, {
            popoverVisible: false,
            ...val,
        })
    }
    // 表格操作
    private goPage(page: number) {
        this.pageNumber = page
    }
    private changeSize(pageSize: number) {
        this.pageSize = pageSize
        this.pageNumber = 1
    }
    // 表格颜色设置
    private tableCellStyle(params: dynamicObj) {
        if (this.checkedSame) return
        const { row, column, columnIndex } = params
        if (columnIndex === 0 || columnIndex === 1) {
            return
        } else {
            const { property } = column
            if (row[`${property}percent`] === '-') return
            const count = row[`${property}percent`] / 10
            return 'colorcal' + parseInt(String(count))
        }
    }
    // 更改只展示同时
    private handleCheckSame(val: boolean) {
        if (val) {
            this.echartType = 2
        }
        this.handleChangeEchartType()
    }
    // 递归查找符合条件的元素
    private findOne(options: Array<any>, val: string) {
        const queue = [...options]
        while (queue.length) {
            const o = queue.shift()
            if (o.value === val) return o
            queue.push(...(o.children || []))
        }
    }
    // 查看分组详情
    private handleWatchDetail(row: dynamicObj) {
        const { eventDesc } = this.analyzeList[0]
        const { type } = this.selectedDate
        const { y, state_avg } = this.originData
        const text = type === 'T1' ? '日' : type === 'T2' ? '周' : '月'
        const temp_group_col = this.groupList.map((item) => {
            const { quot, quotDesc } = item
            return {
                label: quotDesc,
                prop: quot,
                type: 'normal',
            }
        })
        const temp_col = [
            {
                label: `${eventDesc}用户数`,
                prop: 'initNum',
                type: 'normal',
            },
            {
                label: `当${text}`,
                prop: 'current',
                type: 'number',
            },
        ]
        const temp_col2 = state_avg[this.retainType][0].values.slice(2).map((item: string, index: number) => {
            return {
                label: `第${index + 1}${text}`,
                prop: `xdate${index + 1}`,
                type: 'number',
            }
        })
        this.dialogColList = [...temp_group_col, ...temp_col, ...temp_col2]

        const { date } = row
        this.dialogTitle = `${date}的分组详情`
        // 两种情况：阶段均值和普通日期
        if (row.type === 'avg') {
            // 会有精度丢失问题，通过四舍五入解决
            const temp_data = state_avg[this.retainType].slice(1)
            this.dialogData.list = []
            temp_data.forEach((item: dynamicObj) => {
                const { values, groupCols } = item
                const temp_obj: dynamicObj = {
                    initNum: values[0],
                    current: '-',
                    currentpercent: values[1] === '-' ? '-' : Math.round(Number(values[1]) * 100),
                }
                groupCols.forEach((el: dynamicObj, index: number) => {
                    const { quot } = this.groupList[index]
                    temp_obj[quot] = el
                })
                values.slice(2).forEach((val: string, index: number) => {
                    const temp_prop = `xdate${index + 1}`
                    temp_obj[temp_prop] = '-'
                    temp_obj[`${temp_prop}percent`] = val === '-' ? '-' : Math.round(Number(val) * 100)
                })
                this.dialogData.list.push(temp_obj)
            })
        } else {
            const temp_data = y[this.retainType][date].slice(1)
            this.dialogData.list = []
            temp_data.forEach((item: dynamicObj) => {
                const { values, groupCols, initNum } = item
                const num = Number((Number(values[1]) / initNum).toFixed(3))
                const temp_obj: dynamicObj = {
                    initNum: values[0],
                    current: values[1],
                    currentpercent: values[1] === '-' ? '-' : Math.round(num * 100),
                }
                temp_obj.initNum = initNum
                groupCols.forEach((el: dynamicObj, index: number) => {
                    const { quot } = this.groupList[index]
                    temp_obj[quot] = el
                })
                values.slice(2).forEach((val: string, index: number) => {
                    const temp_prop = `xdate${index + 1}`
                    temp_obj[temp_prop] = val
                    const num = Number((Number(val) / initNum).toFixed(5))
                    temp_obj[`${temp_prop}percent`] = val === '-' ? '-' : Math.round(num * 10000) / 100
                })
                this.dialogData.list.push(temp_obj)
            })
        }
        this.dialogTableVisible = true
        const { list, pageSize } = this.dialogData
        this.dialogData = {
            ...this.dialogData,
            totalNum: list.length,
            totalPage: Math.ceil(list.length / pageSize),
        }
    }
    // 列表分页
    private goDialogPage(page: number) {
        this.dialogData.pageNumber = page
    }
    private changeDialogSize(pageSize: number) {
        this.dialogData.pageSize = pageSize
        this.dialogData.pageNumber = 1
    }
    // 图表的分组设置
    private handleChangeGroup(e: boolean, name: string) {
        const temp_line = this.lineRenderData.find((item) => item.name === name)
        const temp_up_line = this.upLineRenderData.find((item) => item.name === name)
        if (temp_line) {
            temp_line.checked = e
        }
        if (temp_up_line) {
            temp_up_line.checked = e
        }
        const temp_data: number[] = []
        this.lineRenderData.forEach((item, index) => {
            if (item.checked) {
                temp_data.push(index)
            }
        })
        // 生成数组[0, 1,2,3,4]
        this.defaultSelect = _.isEqual(
            temp_data,
            new Array(8).fill(0).map((item, index) => index),
        )
    }
    // 只看当前选项
    private hanldeSeeOne(name: string) {
        this.defaultSelect = false
        this.lineRenderData.forEach((item) => {
            item.checked = item.name === name
        })
        this.upLineRenderData.forEach((item) => {
            item.checked = item.name === name
        })
    }
    // 默认
    private handleSetDefault(e: boolean) {
        this.defaultSelect = e
        this.lineRenderData.forEach((item, index) => {
            if (e && index < 8) {
                item.checked = true
            } else {
                item.checked = false
            }
        })
        this.upLineRenderData.forEach((item, index) => {
            if (e && index < 8) {
                item.checked = true
            } else {
                item.checked = false
            }
        })
    }
}
