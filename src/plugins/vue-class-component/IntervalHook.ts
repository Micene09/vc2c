import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'
import { isInternalHook, copySyntheticComments, getInternalHookNewName } from '../../utils'

export const convertIntervalHook: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  const intervalHookName = node.name.getText()

  if (isInternalHook(intervalHookName)) {
    const tsModule = options.typescript
    const removeIntervalHooks = ['created', 'beforeCreate']
    const internalNewName = getInternalHookNewName(intervalHookName);
    const needNamedImports = [`on${internalNewName.slice(0, 1).toUpperCase()}${internalNewName.slice(1)}`]
    if (removeIntervalHooks.includes(intervalHookName)) {
      needNamedImports.splice(0, 1)
    }

    const outputNode = (needNamedImports.length > 0)
      ? tsModule.createExpressionStatement(tsModule.createCall(
        tsModule.createIdentifier(needNamedImports[0]),
        undefined,
        [tsModule.createArrowFunction(
          node.modifiers,
          undefined,
          [],
          node.type,
          tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
          node.body ?? tsModule.createBlock([])
        )]
      )) : node.body?.statements

    if (!outputNode) {
      return false
    }

    const nodes: ts.Statement[] = (needNamedImports.length > 0)
      ? [copySyntheticComments(tsModule, outputNode as ts.Statement, node)]
      : (outputNode as ts.NodeArray<ts.Statement>).map((el, index) => {
        if (index === 0) {
          return copySyntheticComments(tsModule, el, node)
        }
        return el
      })

    return {
      tag: 'IntervalHook',
      kind: ASTResultKind.COMPOSITION,
      attributes: (needNamedImports.length > 0) ? needNamedImports : [],
      imports: [{
        named: needNamedImports,
        external: 'vue'
      }],
      reference: ReferenceKind.NONE,
      nodes
    }
  }

  return false
}
