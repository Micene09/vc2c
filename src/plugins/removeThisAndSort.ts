import { ASTTransform, ASTResult, ReferenceKind, ASTResultKind } from './types'
import type ts from 'typescript'
import { addTodoComment, copySyntheticComments, importsAdd } from '../utils'

export const removeThisAndSort: ASTTransform = (astResults, options) => {
  const tsModule = options.typescript
  const getReferences = (reference: ReferenceKind) => astResults
    .filter((el) => el.reference === reference)
    .map((el) => el.attributes)
    .reduce((array, el) => array.concat(el), [])

  const refVariables = getReferences(ReferenceKind.VARIABLE_VALUE)
  const domeRefVariables = getReferences(ReferenceKind.VARIABLE_NON_NULL_VALUE)
  const propVariables = getReferences(ReferenceKind.PROPS)
  const variables = getReferences(ReferenceKind.VARIABLE)

  const pluginConverter = options.instancePluginConverter
  const composableMethods = Object.keys(pluginConverter)

  const convertContextKey = (key: string) => {
    const contextKey = new Map([
      ['$attrs', 'attrs'],
      ['$slots', 'slots'],
      ['$parent', 'parent'],
      ['$root', 'root'],
      ['$listeners', 'listeners'],
      ['$emit', 'emit']
    ])

    return contextKey.get(key)
  }

  let dependents: string[] = []

  const transformer: () => ts.TransformerFactory<ts.Node> = () => {
    return (context) => {
      const removeThisVisitor: ts.Visitor = (node) => {
        if (tsModule.isPropertyAccessExpression(node)) {
          if (node.expression.kind === tsModule.SyntaxKind.ThisKeyword) {
            const propertyName = node.name.getText()
            if (refVariables.includes(propertyName)) {
              dependents.push(propertyName)
              return tsModule.createPropertyAccess(
                tsModule.createIdentifier(propertyName),
                tsModule.createIdentifier('value')
              )
            } else if (domeRefVariables.includes(propertyName)) {
              dependents.push(propertyName)
              return tsModule.createNonNullExpression(
                tsModule.createPropertyAccess(
                  tsModule.createIdentifier(propertyName),
                  tsModule.createIdentifier('value')
                )
              )
            } else if (propVariables.includes(propertyName)) {
              dependents.push(propertyName)
              return tsModule.createPropertyAccess(
                tsModule.createIdentifier(options.setupPropsKey),
                tsModule.createIdentifier(propertyName)
              )
            } else if (variables.includes(propertyName)) {
              dependents.push(propertyName)
              return tsModule.createIdentifier(propertyName)
            } else if (composableMethods.includes(propertyName)) {
              const pluginConvertion = pluginConverter[propertyName]
              importsAdd(pluginConvertion.importsFrom, {
                named: new Set([pluginConvertion.composable])
              })
              if (pluginConvertion.isPureFunction)
                return copySyntheticComments(
                  tsModule,
                  tsModule.createIdentifier(pluginConvertion.composable),
                  node
                );
              if (pluginConvertion.mapToInternalFunction) {
                return copySyntheticComments(
                  tsModule,
                  tsModule.createPropertyAccess(
                    tsModule.createCall(
                      tsModule.createIdentifier(pluginConvertion.composable),
                      undefined,
                      []
                    ),
                    tsModule.createIdentifier(pluginConvertion.mapToInternalFunction)
                  ),
                  node
                )
              }
              
              return copySyntheticComments(
                tsModule,
                tsModule.createCall(
                  tsModule.createIdentifier(pluginConvertion.composable),
                  undefined,
                  []
                ),
                node
              )
            } else {
              const convertKey = convertContextKey(propertyName)
              if (convertKey) {
                return tsModule.createPropertyAccess(
                  tsModule.createIdentifier(options.setupContextKey),
                  tsModule.createIdentifier(convertKey)
                )
              }

              return addTodoComment(
                tsModule,
                tsModule.createPropertyAccess(
                  tsModule.createThis(),
                  tsModule.createIdentifier(propertyName)
                ),
                'Check convertion',
                true
              )
            }
          }
          return tsModule.visitEachChild(node, removeThisVisitor, context)
        }
        return tsModule.visitEachChild(node, removeThisVisitor, context)
      }

      return (node) => tsModule.visitNode(node, removeThisVisitor)
    }
  }

  const transformResults = astResults.map((astResult) => {
    if (astResult.kind === ASTResultKind.OBJECT) {
      return {
        ...astResult,
        nodeDependents: []
      }
    }
    dependents = []
    const nodes = tsModule.transform(
      astResult.nodes,
      [transformer()],
      { module: tsModule.ModuleKind.ESNext }
    ).transformed

    const nodeDependents = dependents.slice()

    return {
      ...astResult,
      nodes,
      nodeDependents
    }
  })

  const astResultNoDependents = transformResults.filter((el) => el.nodeDependents.length === 0)
  let otherASTResults = transformResults.filter((el) => el.nodeDependents.length !== 0)
  let result: ASTResult<ts.Node>[] = [...astResultNoDependents]
  const resultHaveDependents = astResultNoDependents.map((el) => el.attributes).reduce((array, el) => array.concat(el), [])
  do {
    let hasPush = false
    otherASTResults = otherASTResults.filter((el) => {
      if (el.nodeDependents.every((dependent) => resultHaveDependents.includes(dependent))) {
        result.push(el)
        hasPush = true
        return false
      } else {
        return true
      }
    })
    if (!hasPush) {
      result = result.concat(otherASTResults)
      break
    }
  } while (result.length < astResults.length)

  return result
}
