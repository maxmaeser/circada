"use client"

import { useState, useEffect } from 'react'
import { Menu, X, Copy, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { updateService, UpdateState } from '@/services/updateService'

// Test direct imports from services
import { HealthDataParser, RealDataCircadianEngine } from '../services/healthDataTypes'
import { MockDataProvider } from '@/lib/dataProvider'
import { CircadianAnalysisEngine } from '@/lib/analysisEngine'

interface BurgerMenuProps {
  showTestData: boolean
  onTestDataToggle: () => void
}

export default function BurgerMenu({ onTestDataToggle }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testStatus, setTestStatus] = useState('Not loaded')
  const [hasTestedData, setHasTestedData] = useState(false)

  // Mock Analysis State
  const [mockAnalysisResult, setMockAnalysisResult] = useState<any>(null)
  const [mockAnalysisLoading, setMockAnalysisLoading] = useState(false)
  const [hasMockAnalysis, setHasMockAnalysis] = useState(false)
  const [mockAnalysisCopied, setMockAnalysisCopied] = useState(false)

  // Update State
  const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle' })

  // Subscribe to update service
  useEffect(() => {
    const unsubscribe = updateService.subscribe(setUpdateState);
    return unsubscribe;
  }, []);

  const checkForUpdates = async () => {
    await updateService.checkForUpdates();
  };

  const testImports = () => {
    setTestStatus('Testing imports...')
    try {
      // Just test if the classes exist
      const parserExists = typeof HealthDataParser !== 'undefined'
      const engineExists = typeof RealDataCircadianEngine !== 'undefined'
      
      if (parserExists && engineExists) {
        setTestStatus('✅ Imports working!')
        setHasTestedData(true)
        onTestDataToggle()
      } else {
        setTestStatus('❌ Classes not found')
      }
    } catch (error) {
      setTestStatus(`❌ Error: ${error}`)
    }
  }

  const runMockAnalysis = async () => {
    setMockAnalysisLoading(true)
    setMockAnalysisCopied(false)
    try {
      const engine = new CircadianAnalysisEngine(new MockDataProvider())
      const result = await engine.run()
      setMockAnalysisResult(result)
      setHasMockAnalysis(true)
    } catch (error) {
      setMockAnalysisResult({ error: String(error) })
      setHasMockAnalysis(true)
    } finally {
      setMockAnalysisLoading(false)
    }
  }

  const copyMockAnalysis = () => {
    if (!mockAnalysisResult) return
    navigator.clipboard.writeText(JSON.stringify(mockAnalysisResult, null, 2))
    setMockAnalysisCopied(true)
    setTimeout(() => setMockAnalysisCopied(false), 2000)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const getUpdateStatusIcon = () => {
    switch (updateState.status) {
      case 'checking':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
      case 'downloading':
        return <Download className="w-4 h-4 text-yellow-400" />;
      case 'upToDate':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'available':
        return <Download className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getUpdateStatusText = () => {
    switch (updateState.status) {
      case 'checking':
        return 'Checking for updates...';
      case 'downloading':
        return `Downloading... ${updateState.downloadProgress || 0}%`;
      case 'ready':
        return 'Update ready! Restarting...';
      case 'upToDate':
        return 'You are up to date!';
      case 'available':
        return `Update available: v${updateState.info?.version}`;
      case 'error':
        return `Error: ${updateState.error || 'Unknown error'}`;
      default:
        return 'Version 1.0.0';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Burger Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMenu}
        className="w-10 h-10 bg-card/80 backdrop-blur border border-border hover:bg-card/90 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-card/95 backdrop-blur border border-border rounded-lg shadow-xl p-4 space-y-4">
          {/* Test Data Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Test Mock Data</label>
              <Button
                onClick={testImports}
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
              >
                Test Imports
              </Button>
            </div>
            
            {/* Test Status - Always visible when expanded */}
            <div className="p-3 bg-background/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                Status: <span className="font-medium">{testStatus}</span>
              </p>
            </div>
          </div>

          {/* Mock Analysis Controls */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mock Analysis</label>
              <div className="flex gap-2">
                <Button
                  onClick={runMockAnalysis}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  disabled={mockAnalysisLoading}
                >
                  {mockAnalysisLoading ? 'Running...' : 'Run Analysis'}
                </Button>
                {mockAnalysisResult && (
                  <Button
                    onClick={copyMockAnalysis}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    title="Copy JSON"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Mock Analysis Status/Results */}
            {mockAnalysisResult && (
              <div className="p-3 bg-background/50 rounded-md max-h-48 overflow-auto">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                  {JSON.stringify(mockAnalysisResult, (key, value) => 
                    key.startsWith('_') ? undefined : value, 2
                  )}
                </pre>
              </div>
            )}
            
            {mockAnalysisCopied && (
              <p className="text-xs text-green-400">Copied to clipboard!</p>
            )}
          </div>

          {/* App Updates */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">App Updates</label>
              <Button
                onClick={checkForUpdates}
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                disabled={updateState.status === 'checking' || updateState.status === 'downloading'}
              >
                Check for Updates
              </Button>
            </div>

            {/* Update Status */}
            <div className="p-3 bg-background/50 rounded-md">
              <div className="flex items-center gap-2">
                {getUpdateStatusIcon()}
                <p className="text-sm text-muted-foreground">
                  {getUpdateStatusText()}
                </p>
              </div>
              {updateState.status === 'downloading' && updateState.downloadProgress !== undefined && (
                <div className="mt-2 w-full bg-background rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${updateState.downloadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <Button
            onClick={closeMenu}
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            Close Menu
          </Button>
        </div>
      )}

      {/* Collapsed Status Row - Shows when menu is closed but data was activated */}
      {!isOpen && (hasTestedData || hasMockAnalysis) && (
        <div className="absolute top-12 right-0 w-80 bg-card/80 backdrop-blur border border-border rounded-lg shadow-md p-3 mt-2 space-y-2">
          {hasTestedData && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate">
                Mock Data: {testStatus}
              </span>
            </div>
          )}
          {hasMockAnalysis && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate">
                Analysis: {mockAnalysisResult?.error ? '❌ Error' : '✅ Complete'}
              </span>
              {mockAnalysisResult && !mockAnalysisResult.error && (
                <Button
                  onClick={copyMockAnalysis}
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  title="Copy JSON"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              onClick={toggleMenu}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-xs"
            >
              ↑
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}