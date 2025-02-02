"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { CodeBlock } from './code-block';
import { apiEndpoints } from '@/config/api';

export function APIEndpoints() {
  return (
    <div className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">API Endpoints</h2>
          
          <div className="space-y-8">
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.path}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-mono">{endpoint.method} {endpoint.path}</CardTitle>
                      <p className="text-muted-foreground mt-1">{endpoint.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      endpoint.auth ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {endpoint.auth ? 'Requires Auth' : 'Public'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="request">
                    <TabsList>
                      <TabsTrigger value="request">Request</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                    </TabsList>
                    <TabsContent value="request">
                      <CodeBlock 
                        language="json" 
                        code={JSON.stringify(endpoint.request, null, 2)} 
                      />
                    </TabsContent>
                    <TabsContent value="response">
                      <CodeBlock 
                        language="json" 
                        code={JSON.stringify(endpoint.response, null, 2)} 
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
