import {
    ApplicationConfigState,
    ApplicationImpl,
    DatetimeProjectItemImpl,
    ElectronExecutor,
    Group,
    GroupName,
    InputSettingItem,
    Platform,
    SettingItem,
} from '../../../Types'
import {SqliteBrowserApplicationImpl} from '../index'
import {execFileSync} from 'child_process'
import {isEmpty, unique} from 'licia'
import {removeAllQueryFromUrl, systemHome} from '../../../Utils'
import {Context} from '../../../Context'
import {existsSync} from 'fs'
import {i18n, sentenceKey} from '../../../i18n'
import {generatePinyinIndex} from '../../../utils/index-generator/PinyinIndex'
import {generateHostIndex} from '../../../utils/index-generator/HostIndex'
import {parseSqliteDefaultResult} from '../../../utils/sqlite/ParseResult'
import {getSqliteExecutor, isEmptySqliteExecutor} from '../../../utils/sqlite/CheckSqliteExecutor'
import {generateFullUrlIndex} from '../../../utils/index-generator/FullUrlIndex'

const SAFARI: string = 'safari'

export class SafariHistoryProjectItemImpl extends DatetimeProjectItemImpl {}

export class SafariHistoryApplicationImpl extends SqliteBrowserApplicationImpl<SafariHistoryProjectItemImpl> {
    constructor() {
        super(
            `${SAFARI}-history`,
            'Safari',
            `icon/browser-${SAFARI}.png`,
            SAFARI,
            [Platform.darwin],
            Group[GroupName.browserHistory],
            undefined,
            false,
            'History.db',
        )
    }

    override defaultConfigPath(): string {
        return `${systemHome()}/Library/Safari/History.db`
    }

    async generateCacheProjectItems(context: Context): Promise<Array<SafariHistoryProjectItemImpl>> {
        let items: Array<SafariHistoryProjectItemImpl> = []
        if (isEmptySqliteExecutor(context, this.executor)) return items
        let configPath = `${utools.getPath('home')}/Library/Safari/History.db`
        if (!existsSync(configPath)) {
            return []
        }
        // language=SQLite
        let sql = 'select i.url                                                                                         as url,\n       v.title                                                                                       as title,\n       cast(strftime(\'%s\', datetime(v.visit_time + 978307200, \'unixepoch\', \'localtime\')) as numeric) as timestamp\nfrom history_items i,\n     history_visits v\nwhere i.id = v.history_item\ngroup by i.url\norder by timestamp desc\nlimit ' + context.browserHistoryLimit
        let result = ''
        await this.copyAndReadFile(configPath, path => {
            result = execFileSync(getSqliteExecutor(context, this.executor), [path, sql, '-readonly'], { encoding: 'utf-8', maxBuffer: 20971520 })
        })
        if (!isEmpty(result)) {
            let array = parseSqliteDefaultResult(result, ['url', 'title', 'n/timestamp'])
            array.forEach(i => {
                let title: string = i['title'] ?? ''
                let url: string = i['url'] ?? ''
                items.push({
                    id: '',
                    title: title,
                    description: url,
                    icon: this.ifGetFavicon(removeAllQueryFromUrl(url), context),
                    searchKey: unique([
                        ...generatePinyinIndex(context, title),
                        ...generateHostIndex(context, url),
                        ...generateFullUrlIndex(context, url),
                        title,
                    ]),
                    exists: true,
                    command: new ElectronExecutor(url),
                    datetime: i['timestamp'] ?? 0,
                })
            })
        }
        return items
    }

    override generateSettingItems(context: Context, nativeId: string): Array<SettingItem> {
        return [
            new InputSettingItem(
                this.executorId(nativeId),
                i18n.t(sentenceKey.sqlite3),
                this.executor,
                i18n.t(sentenceKey.sqlite3Desc),
            ),
        ]
    }

    override isFinishConfig(context: Context): ApplicationConfigState {
        if (this.disEnable())
            return ApplicationConfigState.empty
        if (isEmpty(this.executor)) {
            if (isEmpty(context.sqliteExecutorPath)) {
                return ApplicationConfigState.undone
            } else if (this.nonExistsPath(context.sqliteExecutorPath)) {
                return ApplicationConfigState.error
            }
            return ApplicationConfigState.done
        } else {
            if (this.nonExistsPath(this.executor)) {
                return ApplicationConfigState.error
            }
            return ApplicationConfigState.done
        }
    }
}

export const applications: Array<ApplicationImpl<SafariHistoryProjectItemImpl>> = [
    new SafariHistoryApplicationImpl(),
]
