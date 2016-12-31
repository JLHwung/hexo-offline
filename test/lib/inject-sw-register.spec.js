import { test } from 'tap'
import fs from 'fs'
import path from 'path'
import injectSWRegister from '../../src/lib/inject-sw-register'

test('inject-sw-register should inject script when index.html presents', (t) => {
  const publicDir = path.resolve('./inject-sw-register.spec')
  fs.mkdirSync(publicDir)

  const html = [
    '<html>',
    '<body>',
    '</body>  ',
    '</html>'
  ].join('\n')
  const indexHTMLPath = path.join(publicDir, 'index.html')
  fs.writeFileSync(indexHTMLPath, html)

  injectSWRegister(publicDir)
  const content = fs.readFileSync(indexHTMLPath, 'utf-8')

  t.ok(content.includes('</script></body></html>'))

  fs.unlinkSync(indexHTMLPath)
  fs.rmdirSync(publicDir)
  t.end()
})

test('inject-sw-register should not throw when index.html is not found', (t) => {
  const publicDir = path.resolve('./inject-sw-register.spec')
  fs.mkdirSync(publicDir)

  t.doesNotThrow(() => injectSWRegister(publicDir))

  fs.rmdirSync(publicDir)
  t.end()
})
