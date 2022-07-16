import * as monaco from 'monaco-editor'
import { ScriptTarget } from 'typescript'
import { convert } from '../src/index'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const defaultCode = `import Vue from 'vue'
import { Prop, Component, Ref, Model, Provide, Inject } from 'vue-property-decorator'

const symbol = Symbol('baz')

/**
 * My basic tag
 */
@Component({
  name: 'oao',
  props: ['bar', 'qaq', 'cac'],
  data () {
    const a = 'pa';
    return {
      a: a
    }
  }
})
export default class BasicPropertyClass extends Vue {
  @Ref() readonly anotherComponent!: HTMLElement
  @Model('change', { type: Boolean }) readonly checked!: boolean
  /**
   * My foo
   */
  @Prop({ type: Boolean, default: false }) foo: any

  @Provide() foa = 'foo'
  @Provide('bar') baz = 'bar'

  @Inject() readonly foai!: string
  @Inject('bar') readonly bari!: string
  @Inject({ from: 'optional', default: 'default' }) readonly optional!: string
  @Inject(symbol) readonly bazi!: string

  /**
   * My msg
   */
  msg: string | null = null;

  /**
   * My count
   */
  get count () {
    return this.$store.state.count
  }

  /**
   * My greeting
   */
  hello () {
    console.log(this.msg)
  }
}`

const vc2cConfig = {}

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  experimentalDecorators: true,
  noResolve: true,
  target: ScriptTarget.ESNext,
  allowNonTsExtensions: true,
  noEmit: true,
  lib: [
    'esnext',
    'dom',
    'dom.iterable',
    'scripthost'
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: 'esnext' as any,
  strict: true,
  esModuleInterop: true,
  resolveJsonModule: true
})

const editor = monaco.editor.create(document.getElementById('editor')!, {
  value: defaultCode,
  language: 'typescript',
  theme: 'vs-dark',
  minimap: {
    enabled: false
  }
})

const output = monaco.editor.create(document.getElementById('output')!, {
  value: convert(defaultCode, vc2cConfig),
  language: 'typescript',
  theme: 'vs-dark',
  minimap: {
    enabled: false
  }
})

const setOutput = () => {
  output.setValue(convert(editor.getValue(), vc2cConfig))
}

editor.onDidChangeModelContent(() => {
  setOutput()
})

window.addEventListener('resize', () => {
  editor.layout()
  output.layout()
})
