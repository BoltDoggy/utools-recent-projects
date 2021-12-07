import {execFileSync} from 'child_process'
import {isEmpty, isNil, reverse, unique} from 'licia'
import {
    ApplicationCacheConfigAndExecutorImpl,
    ApplicationConfigState,
    ApplicationImpl,
    DatetimeProjectItemImpl,
    Group,
    GroupName,
    InputSettingItem,
    PlainSettingItem,
    Platform,
    SettingItem,
    UtoolsExecutor,
} from '../../Types'
import {parseSqliteDefaultResult} from '../../utils/sqlite/ParseResult'
import {Context} from '../../Context'
import {generatePinyinIndex} from '../../utils/index-generator/PinyinIndex'
import {systemUser} from '../../Utils'
import {i18n, sentenceKey} from '../../i18n'
import {parse} from 'path'

const EVERNOTE_MAC: string = 'evernote-mac'
const EVERNOTE_WIN: string = 'evernote-win'

export class EvernoteMacProjectItemImpl extends DatetimeProjectItemImpl {}

export class EvernoteMacApplicationImpl extends ApplicationCacheConfigAndExecutorImpl<EvernoteMacProjectItemImpl> {
    constructor() {
        super(
            EVERNOTE_MAC,
            '印象笔记',
            'icon/evernote.png',
            EVERNOTE_MAC,
            [Platform.darwin],
            Group[GroupName.notes],
            () => `${i18n.t(sentenceKey.configFileAt)} ${this.defaultConfigPath()}, 其中 xxx 是用户 id, 如果只登录过一个账号, 那么只会有一个文件夹, 根据实际情况选择`,
            true,
            'LocalNoteStore.sqlite')
    }

    override defaultConfigPath(): string {
        return `/Users/${systemUser()}/Library/Application Support/com.yinxiang.Mac/accounts/app.yinxiang.com/xxx/localNoteStore/LocalNoteStore.sqlite`
    }

    // sqlite3
    override defaultExecutorPath(): string {
        return ``
    }

    async generateCacheProjectItems(context: Context): Promise<Array<EvernoteMacProjectItemImpl>> {
        let items: Array<EvernoteMacProjectItemImpl> = []
        let userId = parse(parse(parse(this.config).dir).dir).name
        if (isNil(userId) || isEmpty(userId)) return items
        // language=SQLite
        let sql = 'select n.ZGUID                 as id,\n       n.ZTITLE                as title,\n       n.ZUPDATESEQUENCENUMBER as seq,\n       tm.name                 as tag,\n       n.ZSMARTTAGS            as smart_tag,\n       nb.ZNAME                as level_one,\n       nb.ZSTACK               as level_two\nfrom ZENNOTE n,\n     ZENNOTEBOOK nb\n         left join (select n.ZGUID as guid, group_concat(t.ZNAME) as name\n                    from ZENNOTE n,\n                         Z_10TAGS tm,\n                         ZENTAG t\n                    where n.ZACTIVE = 1\n                      and n.Z_PK = tm.Z_10NOTES\n                      and t.Z_PK = tm.Z_23TAGS\n                    group by n.ZGUID) tm on n.ZGUID = tm.guid\nwhere n.ZNOTEBOOK = nb.Z_PK\n  and n.ZACTIVE = 1\norder by n.ZUPDATESEQUENCENUMBER desc'
        let result = execFileSync(this.executor, [this.config, sql, '-readonly'], {
            encoding: 'utf-8',
            maxBuffer: 20971520,
        })
        if (!isEmpty(result)) {
            let array = parseSqliteDefaultResult(result, ['id', 'title', 'n/seq', 'tag', 'smart_tag', 'level_one', 'level_two'])
            array.forEach(i => {
                let title: string = i['title'] ?? '',
                    id: string = i['id'] ?? '',
                    description: string = '',
                    tagText = i['tag'] ?? '',
                    smartTagText = i['smart_tag'] ?? ''

                if (!isEmpty(i['level_one'])) {
                    description = `[${i['level_one']}${!isEmpty(i['level_two']) ? ` → ${i['level_two']}` : ''}]`
                }
                if (!isEmpty(tagText)) {
                    let tags = tagText.split(',')
                    description += ` [标签：${tags.join('，')}]`
                }
                if (!isEmpty(smartTagText)) {
                    let tags = JSON.parse(smartTagText) as Array<string>
                    description += ` [AI 标签：${tags.join('，')}]`
                }
                items.push({
                    id: '',
                    title: title,
                    description: description,
                    icon: this.icon,
                    searchKey: unique([
                        ...generatePinyinIndex(context, title),
                        ...generatePinyinIndex(context, description),
                        title,
                        description,
                    ]),
                    exists: true,
                    command: new UtoolsExecutor(`evernote:///view/${userId}/s0/${id}/${id}/`),
                    datetime: i['seq'] ?? 0,
                })
            })
        }
        return items
    }

    override generateSettingItems(context: Context, nativeId: string): Array<SettingItem> {
        return [
            this.enabledSettingItem(context, nativeId),
            this.configSettingItem(context, nativeId),
            new InputSettingItem(
                this.executorId(nativeId),
                i18n.t(sentenceKey.sqlite3),
                this.executor,
                i18n.t(sentenceKey.sqlite3Desc),
            ),
        ]
    }
}

export class EvernoteWinProjectItemImpl extends DatetimeProjectItemImpl {}

export class EvernoteWinApplicationImpl extends ApplicationCacheConfigAndExecutorImpl<EvernoteWinProjectItemImpl> {
    private user: string = ''

    constructor() {
        super(
            EVERNOTE_WIN,
            '印象笔记',
            'icon/evernote.png',
            EVERNOTE_WIN,
            [Platform.darwin],
            Group[GroupName.notes],
            () => `${i18n.t(sentenceKey.configFileAt)} ${this.defaultConfigPath()} 其中 xxx 是用户标识`,
            true,
            'xxx#app.yinxiang.com.exb')
    }

    override defaultConfigPath(): string {
        return `C:\\Users\\${systemUser()}\\Yinxiang Biji\\Databases\\xxx#app.yinxiang.com.exb`
    }

    // sqlite3
    override defaultExecutorPath(): string {
        return ``
    }

    private readonly regex = /[\da-f]{2}/ig

    private doubleReverse(text: string): string {
        return reverse(text.match(this.regex) ?? []).join('')
    }

    private convertGuid(guid: string): string {
        if (isEmpty(guid)) return ''
        let source = guid,
            prefix = source.substring(0, 16),
            suffix = source.substring(16, 32),
            block1 = prefix.substring(0, 8),
            block2 = prefix.substring(8, 12),
            block3 = prefix.substring(12, 16),
            block4 = suffix.substring(0, 4),
            block5 = suffix.substring(4, 16)
        return `${this.doubleReverse(block1)}-${this.doubleReverse(block2)}-${this.doubleReverse(block3)}-${block4}-${block5}`.toLowerCase()
    }

    async generateCacheProjectItems(context: Context): Promise<Array<EvernoteWinProjectItemImpl>> {
        let items: Array<EvernoteWinProjectItemImpl> = []
        // language=SQLite
        let sql = 'select hex(i.guid)    as guid,\n       n.title        as title,\n       n.date_updated as seq,\n       n.tags         as tag,\n       nb.name        as level_one,\n       nb.stack       as level_two\nfrom note_attr n,\n     notebook_attr nb,\n     items i\nwhere n.uid = i.uid\n  and n.notebook_uid is not null\n  and n.notebook_uid = nb.uid\n  and n.is_deleted is null\norder by n.date_updated desc'
        let result = execFileSync(this.executor, [this.config, sql, '-readonly'], {
            encoding: 'utf-8',
            maxBuffer: 20971520,
        })
        if (!isEmpty(result)) {
            let array = parseSqliteDefaultResult(result, ['guid', 'title', 'n/seq', 'tag', 'level_one', 'level_two'])
            array.forEach(i => {
                let title: string = i['title'] ?? '',
                    id: string = this.convertGuid(i['guid'] ?? ''),
                    description: string = '',
                    tagText = i['tag'] ?? ''

                if (!isEmpty(i['level_one'])) {
                    description = `[${i['level_one']}${!isEmpty(i['level_two']) ? ` → ${i['level_two']}` : ''}]`
                }
                if (!isEmpty(tagText)) {
                    let tags = tagText.split(',')
                    description += ` [标签：${tags.join('，')}]`
                }
                items.push({
                    id: '',
                    title: title,
                    description: description,
                    icon: this.icon,
                    searchKey: unique([
                        ...generatePinyinIndex(context, title),
                        ...generatePinyinIndex(context, description),
                        title,
                        description,
                    ]),
                    exists: true,
                    command: new UtoolsExecutor(`evernote:///view/${this.user}/s0/${id}/${id}/`),
                    datetime: i['seq'] ?? 0,
                })
            })
        }
        return items
    }

    private userId(nativeId: string) {
        return `${nativeId}/${this.id}-user`
    }

    override update(nativeId: string) {
        super.update(nativeId)
        this.user = utools.dbStorage.getItem(this.userId(nativeId)) ?? ''
    }

    override isFinishConfig(): ApplicationConfigState {
        let superState = super.isFinishConfig()
        if (isEmpty(this.user)) {
            if (superState === ApplicationConfigState.empty) {
                return ApplicationConfigState.empty
            } else if (superState === ApplicationConfigState.done) {
                return ApplicationConfigState.undone
            } else {
                return superState
            }
        } else {
            if (superState === ApplicationConfigState.empty) {
                return ApplicationConfigState.undone
            } else {
                return superState
            }
        }
    }

    override generateSettingItems(context: Context, nativeId: string): Array<SettingItem> {
        return [
            this.enabledSettingItem(context, nativeId),
            new PlainSettingItem(
                this.userId(nativeId),
                '用户 ID',
                this.user,
                '用户 ID',
            ),
            this.configSettingItem(context, nativeId),
            new InputSettingItem(
                this.executorId(nativeId),
                i18n.t(sentenceKey.sqlite3),
                this.executor,
                i18n.t(sentenceKey.sqlite3Desc),
            ),
        ]
    }
}

export const applications: Array<ApplicationImpl<EvernoteMacProjectItemImpl>> = [
    // new EvernoteMacApplicationImpl(),
    new EvernoteWinApplicationImpl(),
]
