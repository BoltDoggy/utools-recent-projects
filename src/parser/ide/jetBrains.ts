import {Application, ApplicationImpl, Executor, NohupShellExecutor, Platform, ProjectItemImpl} from '../../types'
import {readFile} from 'fs/promises'
import {isEmpty, isNil} from 'licia'
import {parse} from 'path'
import {existsOrNot} from '../../utils'
import $ = require('licia/$')

const JETBRAINS: string = 'jetbrains'

export class JetBrainsProjectItemImpl extends ProjectItemImpl {
    datetime: number

    constructor(id: string, title: string, description: string, icon: string, searchKey: string, exists: boolean, command: Executor, datetime: number) {
        super(id, title, description, icon, searchKey, exists, command)
        this.datetime = datetime
    }
}

/**
 * JetBrains 系列应用实现
 */
export class JetBrainsApplicationImpl extends ApplicationImpl<JetBrainsProjectItemImpl> {
    constructor(id: string, name: string, icon: string, platform: Array<Platform> = [Platform.win32, Platform.darwin, Platform.linux], configFilename: string = 'recentProject.xml', description: string = '', beta: boolean = false) {
        super(id, name, icon, JETBRAINS, platform, 'JetBrains', configFilename, description, beta)
    }

    async generateProjectItems(): Promise<Array<JetBrainsProjectItemImpl>> {
        let items: Array<JetBrainsProjectItemImpl> = []
        let buffer = await readFile(this.config)
        if (!isNil(buffer)) {
            let content = buffer.toString()
            $('#root').append(`<div id=${this.id} style="display: none">${content}</div>`)
            $(`#${this.id} application option[name=additionalInfo] entry`).each((index, element) => {
                let path = $(element).attr('key')
                let datetime = $(element).find('option[name=projectOpenTimestamp]').attr('value')
                if (!isEmpty(path)) {
                    let home = utools.getPath('home')
                    path = path!.replace('$USER_HOME$', home)
                    let parseObj = parse(path)
                    let { exists, description, icon } = existsOrNot(path, {
                        description: path,
                        icon: this.icon,
                    })
                    items.push({
                        id: '',
                        title: parseObj.name,
                        description: description,
                        icon: icon,
                        searchKey: parseObj.name,
                        exists: exists,
                        command: new NohupShellExecutor(`"${this.executor}" "${path}"`),
                        datetime: parseInt(`${datetime}`),
                    })
                }
            })
            $(`#${this.id}`).remove()
        }
        return items
    }
}

export const applications: Array<Application<JetBrainsProjectItemImpl>> = [
    new JetBrainsApplicationImpl('android', 'Android Studio', 'icon/jetbrains-android.png'),
    new JetBrainsApplicationImpl('appcode', 'AppCode', 'icon/jetbrains-appcode.png', [Platform.darwin]),
    new JetBrainsApplicationImpl('clion', 'CLion', 'icon/jetbrains-clion.png'),
    new JetBrainsApplicationImpl('datagrip', 'DataGrip', 'icon/jetbrains-datagrip.png'),
    new JetBrainsApplicationImpl('goland', 'GoLand', 'icon/jetbrains-goland.png'),
    new JetBrainsApplicationImpl('idea', 'Intellij IDEA Ultimate', 'icon/jetbrains-idea.png'),
    new JetBrainsApplicationImpl('idea-ce', 'Intellij IDEA Community Edition', 'icon/jetbrains-idea-ce.png'),
    new JetBrainsApplicationImpl('idea-edu', 'Intellij IDEA Edu', 'icon/jetbrains-idea-edu.png'),
    new JetBrainsApplicationImpl('mps', 'MPS', 'icon/jetbrains-mps.png'),
    new JetBrainsApplicationImpl('phpstorm', 'PhpStorm', 'icon/jetbrains-phpstorm.png'),
    new JetBrainsApplicationImpl('pycharm', 'PyCharm Professional', 'icon/jetbrains-pycharm.png'),
    new JetBrainsApplicationImpl('pycharm-ce', 'PyCharm Community', 'icon/jetbrains-pycharm-ce.png'),
    new JetBrainsApplicationImpl('pycharm-edu', 'PyCharm Edu', 'icon/jetbrains-pycharm-edu.png'),
    new JetBrainsApplicationImpl('rider', 'Rider', 'icon/jetbrains-rider.png', undefined, 'recentSolution.xml'),
    new JetBrainsApplicationImpl('rubymine', 'RubyMine', 'icon/jetbrains-rubymine.png'),
    new JetBrainsApplicationImpl('webstorm', 'WebStorm', 'icon/jetbrains-webstorm.png'),
]
