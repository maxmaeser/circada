// Simple test component to verify health data imports work
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

// Test direct imports from services
import { HealthDataParser, RealDataCircadianEngine } from '../services/healthDataTypes';

export default function HealthDataTest() {
  const [status, setStatus] = useState('Not loaded');

  const testImports = () => {
    setStatus('Testing imports...');
    try {
      // Just test if the classes exist
      const parserExists = typeof HealthDataParser !== 'undefined';
      const engineExists = typeof RealDataCircadianEngine !== 'undefined';
      
      if (parserExists && engineExists) {
        setStatus('✅ Imports working!');
      } else {
        setStatus('❌ Classes not found');
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Data Import Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Status: {status}</p>
        <Button onClick={testImports} className="mt-2">
          Test Imports
        </Button>
      </CardContent>
    </Card>
  );
}