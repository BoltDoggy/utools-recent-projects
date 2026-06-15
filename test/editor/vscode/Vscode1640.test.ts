import {Vscode1640ApplicationImpl} from '../../../src/parser/editor/Vscode'
import {Context} from '../../../src/Context'

test('vscode1640ProjectItems fallback to menubar storage', async () => {
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/1640/state.vscdb`
    ;(app as any).executor = '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'

    let items = await app.generateCacheProjectItems(Context.get())
    expect(items.length).toEqual(9)
    // 菜单缓存优先级最高
    expect(items[0].title).toEqual('notes')
    expect(items[1].title).toEqual('notes(文件)')
    expect(items[2].title).toEqual('notes(工作区)')
    // backupWorkspaces 次之
    expect(items[3].title).toEqual('backup(工作区)')
    expect(items[4].title).toEqual('project(工作区)')
    expect(items[4].command.command).toContain('--file-uri')
    expect(items[5].title).toEqual('backup')
    expect(items[6].title).toEqual('project')
    expect(items[6].command.command).toContain('--folder-uri')
    // profileAssociations 兜底
    expect(items[7].title).toEqual('profile-workspace(工作区)')
    expect(items[8].title).toEqual('profile-project')
})
