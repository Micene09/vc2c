import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import * as monaco from 'monaco-editor'
import { ScriptTarget } from 'typescript'
import { convert, Vc2cOptions } from '../src/index'

export default function (code: string, options: Partial<Vc2cOptions>) {
	self.MonacoEnvironment = {
	  getWorker(_, label) {
		if (label === 'typescript' || label === 'javascript') {
		  return new tsWorker()
		}
		return new editorWorker()
	  }
	}
	monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
	  experimentalDecorators: true,
	  noResolve: true,
	  target: ScriptTarget.ESNext,
	  allowNonTsExtensions: true,
	  noSemanticValidation: true,
	  noSyntaxValidation: true,
	  noImplicitAny: false,
	  noEmit: true,
	  lib: [
		'esnext',
		'dom',
		'dom.iterable',
		'scripthost'
	  ],
	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	  module: 'esnext' as any,
	  strict: false,
	  esModuleInterop: true,
	  resolveJsonModule: true
	})
	
	const editor = monaco.editor.create(document.getElementById('editor')!, {
	  value: code,
	  language: 'typescript',
	  theme: 'vs-dark',
	  minimap: {
		enabled: false
	  }
	})
	
	const output = monaco.editor.create(document.getElementById('output')!, {
	  value: convert(code, options),
	  language: 'typescript',
	  theme: 'vs-dark',
	  minimap: {
		enabled: false
	  }
	})
	
	const setOutput = () => {
		try {
			output.setValue(convert(editor.getValue(), options))
		} catch (error) {}
	}
	editor.onDidChangeModelContent(() => {
	  setOutput()
	})
	
	window.addEventListener('resize', () => {
	  editor.layout()
	  output.layout()
	})
}