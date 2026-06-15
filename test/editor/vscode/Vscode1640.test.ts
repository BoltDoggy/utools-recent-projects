import {Vscode1640ApplicationImpl} from '../../../src/parser/editor/Vscode'
import {Context} from '../../../src/Context'

test('vscode1640ProjectItems fallback to menubar storage', async () => {
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/1640/state.vscdb`
    ;(app as any).executor = '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'

    let items = await app.generateCacheProjectItems(Context.get())
    expect(items.length).toEqual(2)
    expect(items[0].title).toEqual('notes')
    expect(items[1].title).toEqual('notes(文件)')
})
