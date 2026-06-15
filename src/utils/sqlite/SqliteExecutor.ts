import {readFileSync} from 'fs'
import {dirname, join} from 'path'
import {isEmpty, isNil} from 'licia'
import sqlInit, {Database, Statement} from 'sql.js'

let SQL

function loadWasmBinary(): Uint8Array {
    // uTools 生产环境中 sql.js 自动定位 wasm 会失败, 直接读取 wasm 文件更可靠
    let sqlJsMain = require.resolve('sql.js')
    let wasmPath = join(dirname(sqlJsMain), 'sql-wasm.wasm')
    return readFileSync(wasmPath)
}

export const queryFromSqlite: (databaseFilePath: string, sql: string) => Promise<Array<any>> = async (databaseFilePath, sql) => {
    if (isEmpty(databaseFilePath)) return []
    if (isNil(SQL)) SQL = await sqlInit({wasmBinary: loadWasmBinary()})
    let database: Database | undefined, statement: Statement | undefined
    try {
        database = new SQL.Database(readFileSync(databaseFilePath))
        statement = database!.prepare(sql)
        let result: Array<any> = []
        while (statement.step()) {
            result.push(statement.getAsObject())
        }
        return result
    } finally {
        if (!isNil(statement))
            statement!.free()
        if (!isNil(database))
            database!.close()
    }
    return []
}
