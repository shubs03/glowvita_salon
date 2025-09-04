"use client";

import { useState } from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export default function TestSocialMediaTemplates() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/social-media-templates');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Test Social Media Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testTemplates} disabled={loading}>
            {loading ? 'Testing...' : 'Check & Create Sample Templates'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}