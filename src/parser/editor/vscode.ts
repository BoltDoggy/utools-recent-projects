import {
    ApplicationConfigAndExecutorImpl,
    ApplicationImpl,
    Group,
    GroupName,
    Platform,
    ProjectItemImpl,
    SettingItem,
    ShellExecutor,
    SwitchSettingItem,
} from '../../types'
import {readFile} from 'fs/promises'
import {isEmpty, isNil, Url} from 'licia'
import {parse} from 'path'
import {existsOrNot, generateStringByOS} from '../../utils'
import {Context} from '../../context'

const VSCODE: string = 'vscode'

export class VscodeProjectItemImpl extends ProjectItemImpl {}

export class VscodeApplicationImpl extends ApplicationConfigAndExecutorImpl<VscodeProjectItemImpl> {
    openInNew: boolean = false
    private isWindows: boolean = utools.isWindows()

    constructor() {
        super(
            'vscode',
            'Visual Studio Code',
            'icon/ms-visual-studio-code.png',
            VSCODE,
            [Platform.win32, Platform.darwin, Platform.linux],
            Group[GroupName.editor],
            `数据文件通常放在 ${generateStringByOS({
                win32: 'C:\\Users\\Administrator\\AppData\\Roaming\\Code\\storage.json',
                darwin: '/Users/xxx/Library/Application Support/Code/storage.json',
                linux: '/home/xxx/.config/Code/storage.json',
            })}, 可执行程序通常放在 ${generateStringByOS({
                win32: 'C:\\Users\\Administrator\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
                darwin: '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
                linux: '(不同发行版安装路径差异较大, 自行使用 which 命令找到 code 命令所在路径作为可执行文件路径)',
            })}`,
            undefined,
            'storage.json',
        )
    }

    async generateProjectItems(context: Context): Promise<Array<VscodeProjectItemImpl>> {
        let items: Array<VscodeProjectItemImpl> = []
        let buffer = await readFile(this.config)
        if (!isNil(buffer)) {
            let content = buffer.toString()
            let storage = JSON.parse(content)
            let entries = storage?.openedPathsList?.entries
            if (!isNil(entries)) {
                for (let element of entries) {
                    let folderUri = element['folderUri']
                    let fileUri = element['fileUri']
                    let uri
                    let args = this.openInNew ? '-n' : ''
                    if (!isEmpty(folderUri)) {
                        uri = folderUri
                    } else if (!isEmpty(fileUri)) {
                        uri = fileUri
                    } else {
                        continue
                    }
                    let uriParsed = decodeURIComponent(uri)
                    let urlParsed = Url.parse(uriParsed)
                    let path = urlParsed.pathname
                    if (this.isWindows) {
                        path = path.substring(1)
                    }
                    let parser = parse(path)
                    let { exists, description, icon } = existsOrNot(path, {
                        description: path,
                        icon: context.enableGetFileIcon ? utools.getFileIcon(path) : this.icon,
                    })
                    items.push({
                        id: '',
                        title: parser.name,
                        description: description,
                        icon: icon,
                        searchKey: path,
                        exists: exists,
                        command: new ShellExecutor(`"${this.executor}" ${args} "${path}"`),
                    })
                }
            }
        }
        return items
    }

    openInNewId(nativeId: string) {
        return `${nativeId}/${this.id}-open-in-new`
    }

    override update(nativeId: string) {
        super.update(nativeId)
        this.openInNew = utools.dbStorage.getItem(this.openInNewId(nativeId)) ?? false
    }

    override generateSettingItems(nativeId: string): Array<SettingItem> {
        let superSettings = super.generateSettingItems(nativeId)
        superSettings.splice(1, 0, new SwitchSettingItem(
            this.openInNewId(nativeId),
            '新窗口打开',
            this.openInNew,
            '如果打开的是文件夹, 无论是否打开该选项, 都将在新窗口打开',
        ))
        return superSettings
    }
}

export const applications: Array<ApplicationImpl<VscodeProjectItemImpl>> = [
    new VscodeApplicationImpl(),
]
