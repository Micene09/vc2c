import { getSingleFileProgram } from './parser'
import { convertAST } from './convert'
import { InputVc2cOptions, getDefaultVc2cOptions, mergeVc2cOptions } from './options'
import { format } from './format'
import path from 'path'
import { readVueSFCOrTsFile, existsFileSync, FileInfo } from './file'
import { setDebugMode } from './debug'
import * as BuiltInPlugins from './plugins/builtIn'
import { importsClear } from './utils'

export function convert (content: string, inputOptions: InputVc2cOptions): string {
  importsClear()
  const options = mergeVc2cOptions(getDefaultVc2cOptions(inputOptions.typescript), inputOptions)
  const { ast, program } = getSingleFileProgram(content, options)

  return format(convertAST(ast, options, program), options)
}

export function convertFile (filePath: string, root: string, config: string): { file: FileInfo, result: string } {
  root = (typeof root === 'string')
    ? (
      path.isAbsolute(root) ? root : path.resolve(process.cwd(), root)
    )
    : process.cwd()
  config = (typeof config === 'string') ? config : '.vc2c.js'
  if (config.endsWith('.ts')) {
    require('ts-node/register')
  }
  const inputOptions: InputVc2cOptions = existsFileSync(path.resolve(root, config))
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ? require(path.resolve(root, config)) as InputVc2cOptions
    : {}
  const options = mergeVc2cOptions(getDefaultVc2cOptions(inputOptions.typescript), inputOptions)
  options.root = root

  if (options.debug) {
    setDebugMode(true)
  }

  const file = readVueSFCOrTsFile(filePath, options)
  return {
    file,
    result: convert(file.content, options)
  }
}

interface IGlobConvertOptions extends InputVc2cOptions {
  globSelector: string | string[]
}
export function convertGlob (options: IGlobConvertOptions) {
  import("fast-glob").then((fg) => {
    import("fs").then((fs) => {
      const files = fg.sync(options.globSelector)
      return files.map(async filePath => {
        const encoding = "utf-8"
        const content = fs.readFileSync(filePath, { encoding })
        const result = await convert(content, options)
        fs.writeFileSync(filePath, result, { encoding })
    
        return { filePath, result, success: Boolean(result) }
      })
    });
  });
}

export * from './plugins/types'
export { BuiltInPlugins }
export * from './utils'
export { getDefaultVc2cOptions } from './options'
export type { Vc2cOptions } from './options'
