import {Action, Args, Callback, Feature} from '../types'
import {ApplicationUI} from './Root'
import {initLanguage, platformFromUtools} from '../utils'
import {Context} from '../context'

export class SettingUIArgsImpl implements Args<any> {
    enter(action: Action, callback: Callback<any>): void {
        import('../inits')
            .then(reports => {
                reports.report(utools.getUser()?.nickname, action.code, utools.getNativeId(), platformFromUtools().toString())
            })
            .catch(error => console.log(error?.message ?? ''))
        utools.setExpendHeight(520)

        let context = Context.get()
        // 语言设置
        initLanguage(context)

        let applicationUI = new ApplicationUI()
        applicationUI.render(context, document.documentElement)
    }
}

export class SettingUIFeature implements Feature<any> {
    args: Args<any>
    mode: 'list' | 'none'

    constructor() {
        this.args = new SettingUIArgsImpl()
        this.mode = 'none'
    }
}
