import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import AutoTroubleshooter from '../utils/AutoTroubleshooter';

const TroubleshootingPanel: React.FC = () => {
  const [issues, setIssues] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [healthChecks, setHealthChecks] = useState<any[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  useEffect(() => {
    // Load initial health checks
    loadHealthChecks();
  }, []);

  const loadHealthChecks = async () => {
    const checks = await AutoTroubleshooter.getInstance().getLastHealthChecks();
    setHealthChecks(checks);
  };

  const [isFixing, setIsFixing] = useState(false);
  const [fixProgress, setFixProgress] = useState<string>('');
  const recoveryManager = RecoveryManager.getInstance();

  const handleAutoFix = async () => {
    setIsFixing(true);
    setFixProgress('Starting auto-fix process...');

    try {
      for (const issue of issues) {
        const componentId = issue.toLowerCase().includes('storage') ? 'fix-local-storage'
          : issue.toLowerCase().includes('network') ? 'fix-network'
          : issue.toLowerCase().includes('route') ? 'fix-routes'
          : issue.toLowerCase().includes('websocket') ? 'fix-websocket'
          : null;

        if (componentId) {
          setFixProgress(`Attempting to fix: ${issue}`);
          const success = await recoveryManager.attemptRecovery(componentId);
          
          if (success) {
            setFixProgress(`✅ Fixed: ${issue}`);
          } else {
            const manualSteps = recoveryManager.getManualRecoverySteps(componentId);
            setIssues(prev => [...prev, `Manual steps needed for ${issue}:`, ...manualSteps]);
          }
        }
      }
    } catch (error) {
      setIssues(prev => [...prev, 'Auto-fix process failed: ' + error.message]);
    } finally {
      setIsFixing(false);
      setFixProgress('');
      handleTroubleshoot(); // Re-run diagnostics
    }
  };

  const handleTroubleshoot = async () => {
    setIsRunning(true);
    setIssues([]);

    try {
      const foundIssues = await AutoTroubleshooter.getInstance().troubleshoot(
        (step, success) => {
          setCurrentStep(`${step} ${success ? '✓' : '×'}`);
        }
      );

      setIssues(foundIssues);
      await loadHealthChecks();
      setLastRun(new Date());
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white/5 rounded-xl p-6 shadow-lg border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">System Troubleshooter</h2>
          <div className="flex items-center space-x-4">
            {lastRun && (
              <span className="text-sm text-gray-400">
                Last run: {lastRun.toLocaleTimeString()}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTroubleshoot}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg flex items-center space-x-2 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Run Diagnostics</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Health Checks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {healthChecks.map((check) => (
            <div
              key={check.service}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">{check.service}</h3>
                <span className={getStatusColor(check.status)}>
                  {check.status === 'up' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Latency: {check.latency}ms
              </p>
              {check.error && (
                <p className="text-sm text-red-400 mt-2">{check.error}</p>
              )}
            </div>
          ))}
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="mb-4">
            <p className="text-blue-400">{currentStep}</p>
          </div>
        )}

        {/* Issues Found */}
        {issues.length > 0 && (
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
            <h3 className="text-red-400 font-medium mb-2">Issues Found:</h3>
            <ul className="space-y-2">
              {issues.map((issue, index) => (
                <li key={index} className="text-gray-300 text-sm">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No Issues */}
        {!isRunning && issues.length === 0 && lastRun && (
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="text-green-400">All systems operational</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TroubleshootingPanel;