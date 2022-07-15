import * as monaco from 'monaco-editor';
import { ScriptTarget } from 'typescript'
import { convert } from '../src/index'

(self as any).MonacoEnvironment = {
	getWorker: function (workerId: string, label: string) {
		const getWorkerModule = (moduleUrl: string, label: string) => {
			return new Worker((self as any).MonacoEnvironment.getWorkerUrl(moduleUrl), {
				name: label,
				type: 'module'
			});
		};

		switch (label) {
			case 'json':
				return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
			case 'css':
			case 'scss':
			case 'less':
				return getWorkerModule('/monaco-editor/esm/vs/language/css/css.worker?worker', label);
			case 'html':
			case 'handlebars':
			case 'razor':
				return getWorkerModule('/monaco-editor/esm/vs/language/html/html.worker?worker', label);
			case 'typescript':
			case 'javascript':
				return getWorkerModule('/monaco-editor/esm/vs/language/typescript/ts.worker?worker', label);
			default:
				return getWorkerModule('/monaco-editor/esm/vs/editor/editor.worker?worker', label);
		}
	}
};

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
  msg = 'Vetur means "Winter" in icelandic.' //foo

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

const vc2cConfig = {
	compatible: false
}

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
	module: "esnext" as any,
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
	theme: 'vs-dark'
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

const compatibleCheckbox = document.getElementById('compatible') as HTMLInputElement
compatibleCheckbox.addEventListener('change', () => {
	vc2cConfig.compatible = compatibleCheckbox.checked
	setOutput()
})
