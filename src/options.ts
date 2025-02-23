import ts from 'typescript'
import { ASTConvertPlugins } from './plugins/types'
import { getDefaultPlugins } from './plugins'
import * as vueTemplateCompiler from 'vue-template-compiler'

export interface Vc2cOptions {
  root: string
  debug: boolean
  setupPropsKey: string
  setupContextKey: string
  typescript: typeof ts
  vueTemplateCompiler: typeof vueTemplateCompiler
  instancePluginConverter: InstancePluginConverter
  ignoreMixins: "*" | string[]
  eslintConfigFile: string
  plugins: ASTConvertPlugins
}

export type InputVc2cOptions = Partial<Vc2cOptions>
export type InstancePluginConverter = Record<string, {
  composable: string
  importsFrom: string
  isPureFunction?: boolean
  mapToInternalFunction?: string
}>

export function getDefaultVc2cOptions (tsModule: typeof ts = ts): Vc2cOptions {
  return {
    root: 'process' in globalThis ? process.cwd() : '',
    debug: false,
    setupPropsKey: 'props',
    setupContextKey: 'context',
    typescript: tsModule,
    vueTemplateCompiler: vueTemplateCompiler,
    instancePluginConverter: {},
    ignoreMixins: [],
    eslintConfigFile: '.eslintrc.js',
    plugins: getDefaultPlugins(tsModule)
  }
}

export function mergeVc2cOptions (original: Vc2cOptions, merged: InputVc2cOptions): Vc2cOptions {
  return {
    ...original,
    ...merged
  }
}
