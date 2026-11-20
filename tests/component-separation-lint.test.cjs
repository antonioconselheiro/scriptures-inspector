const assert = require('node:assert/strict');
const test = require('node:test');
const { ESLint } = require('eslint');

const eslint = new ESLint();

async function lint(code, filePath = 'src/app/example.ts') {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages;
}

test('rejects inline component templates and styles, including one-line and quoted declarations', async () => {
  const messages = await lint(`
    @Component({
      template: '<p>Hello</p>',
      'styles': ['p { color: red; }']
    })
    class Example {}
  `);
  assert.equal(messages.length, 2);
  assert.ok(messages.every(message => message.ruleId === 'no-restricted-syntax'));
});

test('accepts external component resources and unrelated object properties', async () => {
  const messages = await lint(`
    @Component({ templateUrl: './example.html', styleUrl: './example.scss' })
    class Example {}
    const data = { template: 'example', styles: [] };
  `);
  assert.deepEqual(messages, []);
});

test('allows inline templates in test fixtures', async () => {
  const messages = await lint(`
    @Component({ template: '<p>Fixture</p>' })
    class TestHost {}
  `, 'src/app/example.spec.ts');
  assert.deepEqual(messages, []);
});
