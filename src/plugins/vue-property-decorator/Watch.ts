import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'
import { copySyntheticComments, createIdentifier } from '../../utils'

const watchDecoratorName = 'Watch'

export const convertWatch: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  if (!node.decorators) {
    return false
  }
  const decorator = node.decorators.find((el) => (el.expression as ts.CallExpression).expression.getText() === watchDecoratorName)
  if (decorator) {
    const tsModule = options.typescript
    const decoratorArguments = (decorator.expression as ts.CallExpression).arguments
    if (decoratorArguments.length > 0) {
      const keyName = (decoratorArguments[0] as ts.StringLiteral).text
      const watchHandler = tsModule.createArrowFunction(
        node.modifiers,
        node.typeParameters,
        node.parameters,
        node.type,
        tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
        node.body ?? tsModule.createBlock([], false)
      )
      const watchComposableArgs: any[] = [
        tsModule.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
          tsModule.createPropertyAccess(
            tsModule.createThis(),
            createIdentifier(tsModule, keyName)
          )
        ),
        watchHandler
      ]
      if (decoratorArguments[1] && tsModule.isObjectLiteralExpression(decoratorArguments[1])) {
        const watchOptions: ts.PropertyAssignment[] = [];
        (decoratorArguments[1] as any).properties.forEach((el) => {
          if (!tsModule.isPropertyAssignment(el)) return
          watchOptions.push(el)
        })
        watchComposableArgs.push(tsModule.createObjectLiteral(watchOptions))
      }

      return {
        tag: 'Watch',
        kind: ASTResultKind.COMPOSITION,
        imports: [{
          named: ['watch'],
          external: 'vue'
        }],
        reference: ReferenceKind.NONE,
        attributes: [],
        nodes: [
          tsModule.createExpressionStatement(
            copySyntheticComments(
              tsModule,
              tsModule.createCall(
                tsModule.createIdentifier('watch'),
                undefined,
                watchComposableArgs
              ),
              node
            )
          )
        ] as ts.Statement[]
      }
    }
  }

  return false
}
