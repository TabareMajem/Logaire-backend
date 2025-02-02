import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { CodeBlock } from './code-block';

const authExamples = {
  curl: `curl -X POST https://api.freightflow.com/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"apiKey": "your_api_key"}'`,
  node: `const response = await fetch('https://api.freightflow.com/v1/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ apiKey: 'your_api_key' })
});`,
  python: `import requests

response = requests.post(
    'https://api.freightflow.com/v1/auth/token',
    json={'apiKey': 'your_api_key'}
)`
};

export function APIAuthentication() {
  return (
    <div className="py-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Authentication</h2>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To use the FreightFlow API, you&apos;ll need an API key. You can get one by signing up
                  for a FreightFlow account and visiting your API settings page.
                </p>
                <p className="text-muted-foreground">
                  All API requests must include your API key in the Authorization header:
                </p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>Authorization: Bearer your_api_key</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="curl">
                  <TabsList>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  {Object.entries(authExamples).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang}>
                      <CodeBlock language={lang} code={code} />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
