import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <span style={{ fontSize: '60px', marginRight: '10px' }}>🇮🇳</span>
          <h1 style={{ 
            fontSize: '48px', 
            color: 'white', 
            margin: '0',
            fontWeight: 'bold'
          }}>
            LAKSHYA
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#cccccc', 
            margin: '10px 0' 
          }}>
            Indian Trading Dashboard
          </p>
          <span style={{ fontSize: '60px', marginLeft: '10px' }}>🇮🇳</span>
        </div>

        {/* Test Content */}
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '20px' }}>
            ✅ Dashboard Working!
          </h2>
          
          {/* Sample Data */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid #22c55e',
              borderRadius: '10px',
              padding: '15px'
            }}>
              <div style={{ color: '#22c55e', fontSize: '18px', fontWeight: 'bold' }}>
                ₹36,45,280
              </div>
              <div style={{ color: '#86efac', fontSize: '14px' }}>Bitcoin</div>
              <div style={{ color: '#22c55e', fontSize: '12px' }}>+2.34% ↗️</div>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid #3b82f6',
              borderRadius: '10px',
              padding: '15px'
            }}>
              <div style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>
                ₹2,24,567
              </div>
              <div style={{ color: '#93c5fd', fontSize: '14px' }}>Ethereum</div>
              <div style={{ color: '#ef4444', fontSize: '12px' }}>-1.23% ↘️</div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <button style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              margin: '0 5px',
              cursor: 'pointer'
            }}>
              🔔 Notifications (3)
            </button>
            <button style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              margin: '0 5px',
              cursor: 'pointer'
            }}>
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '20px', marginRight: '5px' }}>🇮🇳</span>
            <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 'bold' }}>
              Concept and Designed by: 
            </span>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
              {' '}SHAILENDRA JAISWAL
            </span>
            <span style={{ fontSize: '20px', marginLeft: '5px' }}>🇮🇳</span>
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#9ca3af',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>🛡️ Secure</span>
            <span>•</span>
            <span>⚡ Real-time</span>
            <span>•</span>
            <span>🤖 AI Powered</span>
            <span>•</span>
            <span>🇮🇳 Made in India</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;