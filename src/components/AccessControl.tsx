import React, { useState } from 'react';import React, { useState } from 'react';



interface AccessControlProps {interface AccessControlProps {

  onUnlock: () => void;

}  onUnlock: () => void;



const AccessControl: React.FC<AccessControlProps> = ({ onUnlock }) => {}interface AccessControlProps {interface AccessControlP        {/* Footer */}

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  

  const MASTER_PASSWORD = 'LAKSHYA2025';const AccessControl: React.FC<AccessControlProps> = ({ onUnlock }) => {  onUnlock: () => void;        <div className="mt-8 text-center">

  

  const handleSubmit = (e: React.FormEvent) => {  const [password, setPassword] = useState('');

    e.preventDefault();

      const [error, setError] = useState('');}          <div className="flex justify-center items-center mb-4">

    if (password === MASTER_PASSWORD) {

      onUnlock();  

    } else {

      setError('Invalid access code. Please try again.');  const MASTER_PASSWORD = 'LAKSHYA2025';            <span className="text-2xl mr-2">🇮🇳</span>

      setPassword('');

    }  

  };

  const handleSubmit = (e: React.FormEvent) => {const AccessControl: React.FC<AccessControlProps> = ({ onUnlock }) => {            <p className="text-sm text-orange-400 font-semibold">

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">    e.preventDefault();

      <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-600 shadow-2xl w-full max-w-md">

              const [password, setPassword] = useState('');               

        {/* Header */}

        <div className="text-center mb-8">    if (password === MASTER_PASSWORD) {

          <div className="flex justify-center items-center mb-4">

            <span className="text-3xl mr-2">🇮🇳</span>      onUnlock();  const [error, setError] = useState('');            </p>

            <div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">    } else {

                <h1 className="text-4xl font-bold mb-2">LAKSHYA</h1>

              </div>      setError('Invalid access code. Please try again.');              <span className="text-2xl ml-2">🇮🇳</span>

              <p className="text-gray-300 text-lg">Indian Trading System</p>

            </div>      setPassword('');

            <span className="text-3xl ml-2">🇮🇳</span>

          </div>    }  // You can change this password or implement more sophisticated authentication          </div>

          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>

        </div>  };



        {/* Access Form */}  const MASTER_PASSWORD = 'LAKSHYA2025';          

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>  return (

            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">

              🔐 Enter Access Code    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">            <p className="text-sm text-green-400 font-medium mb-2">

            </label>

            <input      <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-600 shadow-2xl w-full max-w-md">

              id="password"

              type="password"          const handleSubmit = (e: React.FormEvent) => {            Concept and Designed by: <span className="font-bold text-white">SHAILENDRA JAISWAL</span>

              value={password}

              onChange={(e) => setPassword(e.target.value)}        {/* Header */}

              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

              placeholder="Enter your access code..."        <div className="text-center mb-8">    e.preventDefault();          </p>

              required

            />          <div className="flex justify-center items-center mb-4">

          </div>

            <span className="text-3xl mr-2">🇮🇳</span>              

          {error && (

            <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">            <div>

              ⚠️ {error}

            </div>              <div className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">    if (password === MASTER_PASSWORD) {          <p className="text-xs text-gray-400">

          )}

                <h1 className="text-4xl font-bold mb-2">LAKSHYA</h1>

          <button

            type="submit"              </div>      onUnlock();            © 2025 LAKSHYA Indian Trading System. All rights reserved.

            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"

          >              <p className="text-gray-300 text-lg">Indian Trading System</p>

            🚀 Access Trading Dashboard

          </button>            </div>    } else {          </p>

        </form>

            <span className="text-3xl ml-2">🇮🇳</span>

        {/* Footer */}

        <div className="mt-8 text-center">          </div>      setError('Invalid access code. Please try again.');          <div className="flex justify-center items-center mt-4 space-x-4 text-xs text-gray-500">

          <div className="flex justify-center items-center mb-4">

            <span className="text-2xl mr-2">🇮🇳</span>          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>

            <p className="text-sm text-green-400 font-medium">

              Concept and Designed by: <span className="font-bold text-white">SHAILENDRA JAISWAL</span>        </div>      setPassword('');            <span>🛡️ Secure Access</span>

            </p>

            <span className="text-2xl ml-2">🇮🇳</span>

          </div>

                  {/* Access Form */}    }            <span>•</span>

          <p className="text-xs text-gray-400">

            © 2025 LAKSHYA Indian Trading System. All rights reserved.        <form onSubmit={handleSubmit} className="space-y-6">

          </p>

          <div className="flex justify-center items-center mt-4 space-x-4 text-xs text-gray-500">          <div>  };            <span>⚡ Real-time Data</span>

            <span>🛡️ Secure Access</span>

            <span>•</span>            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">

            <span>⚡ Real-time Data</span>

            <span>•</span>              🔐 Enter Access Code            <span>•</span>

            <span>🤖 AI Powered</span>

            <span>•</span>            </label>

            <span>🇮🇳 Made in India</span>

          </div>            <input  return (            <span>🤖 AI Powered</span>

        </div>

              id="password"

        {/* Hint for demo */}

        <div className="mt-6 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">              type="password"    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">            <span>•</span>

          <p className="text-xs text-blue-200 text-center">

            💡 Demo Access Code: <span className="font-mono font-bold">LAKSHYA2025</span>              value={password}

          </p>

        </div>              onChange={(e) => setPassword(e.target.value)}      <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-600 shadow-2xl w-full max-w-md">            <span>🇮🇳 Made in India</span>

      </div>

    </div>              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

  );

};              placeholder="Enter your access code..."                  </div>



export default AccessControl;              required

            />        {/* Header */}        </div>

          </div>

        <div className="text-center mb-8">

          {error && (

            <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">          <div className="flex justify-center items-center mb-4">        {/* Footer Credit */}

              ⚠️ {error}

            </div>            <span className="text-3xl mr-2">🇮🇳</span>        <div className="mt-6 text-center">

          )}

            <div>          <p className="text-xs text-gray-400 flex items-center justify-center space-x-2">

          <button

            type="submit"              <div className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">            <span>🇮🇳</span>

            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"

          >                <h1 className="text-4xl font-bold mb-2">LAKSHYA</h1>            <span>Concept and Designed by: SHAILENDRA JAISWAL</span>

            🚀 Access Trading Dashboard

          </button>              </div>          </p>

        </form>

              <p className="text-gray-300 text-lg">Indian Trading System</p>        </div>

        {/* Footer */}

        <div className="mt-8 text-center">            </div>      </div>

          <div className="flex justify-center items-center mb-4">

            <span className="text-2xl mr-2">🇮🇳</span>            <span className="text-3xl ml-2">🇮🇳</span>    </div>

            <p className="text-sm text-green-400 font-medium">

              Concept and Designed by: <span className="font-bold text-white">SHAILENDRA JAISWAL</span>          </div>  );

            </p>

            <span className="text-2xl ml-2">🇮🇳</span>          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>};

          </div>

                  </div>

          <p className="text-xs text-gray-400">

            © 2025 LAKSHYA Indian Trading System. All rights reserved.interface AccessControlProps {

          </p>

          <div className="flex justify-center items-center mt-4 space-x-4 text-xs text-gray-500">        {/* Access Form */}  onUnlock: () => void;

            <span>🛡️ Secure Access</span>

            <span>•</span>        <form onSubmit={handleSubmit} className="space-y-6">}

            <span>⚡ Real-time Data</span>

            <span>•</span>          <div>  const [password, setPassword] = useState('');

            <span>🤖 AI Powered</span>

            <span>•</span>            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">  const [error, setError] = useState('');

            <span>🇮🇳 Made in India</span>

          </div>              🔐 Enter Access Code  

        </div>

            </label>  // You can change this password or implement more sophisticated authentication

        {/* Hint for demo */}

        <div className="mt-6 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">            <input  const MASTER_PASSWORD = 'LAKSHYA2025';

          <p className="text-xs text-blue-200 text-center">

            💡 Demo Access Code: <span className="font-mono font-bold">LAKSHYA2025</span>              id="password"  

          </p>

        </div>              type="password"  const handleSubmit = (e: React.FormEvent) => {

      </div>

    </div>              value={password}    e.preventDefault();

  );

};              onChange={(e) => setPassword(e.target.value)}    



export default AccessControl;              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"    if (password === MASTER_PASSWORD) {

              placeholder="Enter your access code..."      onUnlock();

              required    } else {

            />      setError('Invalid access code. Please try again.');

          </div>      setPassword('');

    }

          {error && (  };

            <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">

              ⚠️ {error}  return (

            </div>    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">

          )}      <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-600 shadow-2xl w-full max-w-md">

        

          <button        {/* Header */}

            type="submit"        <div className="text-center mb-8">

            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"          <div className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">

          >            <h1 className="text-4xl font-bold mb-2">LAKSHYA 🇮🇳</h1>

            🚀 Access Trading Dashboard          </div>

          </button>          <p className="text-gray-300 text-lg">Professional Indian Trading System</p>

        </form>          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>

        </div>

        {/* Footer */}

        <div className="mt-8 text-center">        {/* Access Form */}

          <div className="flex justify-center items-center mb-4">        <form onSubmit={handleSubmit} className="space-y-6">

            <span className="text-2xl mr-2">🇮🇳</span>          <div>

            <p className="text-sm text-green-400 font-medium">            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">

              Concept and Designed by: <span className="font-bold text-white">SHAILENDRA JAISWAL</span>              🔐 Enter Access Code

            </p>            </label>

            <span className="text-2xl ml-2">🇮🇳</span>            <input

          </div>              id="password"

                        type="password"

          <p className="text-xs text-gray-400">              value={password}

            © 2025 LAKSHYA Indian Trading System. All rights reserved.              onChange={(e) => setPassword(e.target.value)}

          </p>              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

          <div className="flex justify-center items-center mt-4 space-x-4 text-xs text-gray-500">              placeholder="Enter your access code..."

            <span>🛡️ Secure Access</span>              required

            <span>•</span>            />

            <span>⚡ Real-time Data</span>          </div>

            <span>•</span>

            <span>🤖 AI Powered</span>          {error && (

            <span>•</span>            <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">

            <span>🇮🇳 Made in India</span>              ⚠️ {error}

          </div>            </div>

        </div>          )}



        {/* Hint for demo */}          <button

        <div className="mt-6 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">            type="submit"

          <p className="text-xs text-blue-200 text-center">            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"

            💡 Demo Access Code: <span className="font-mono font-bold">LAKSHYA2025</span>          >

          </p>            🚀 Access Trading Dashboard

        </div>          </button>

      </div>        </form>

    </div>

  );        {/* Footer */}

};        <div className="mt-8 text-center">

          <div className="flex justify-center items-center space-x-2 mb-3">

export default AccessControl;            <span className="text-2xl">🇮🇳</span>
            <p className="text-sm font-semibold text-orange-400">
              Concept and Designed by: SHAILENDRA JAISWAL
            </p>
            <span className="text-2xl">🇮🇳</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2025 LAKSHYA Trading System. All rights reserved.
          </p>
          <div className="flex justify-center items-center mt-4 space-x-4 text-xs text-gray-500">
            <span>🛡️ Secure Access</span>
            <span>•</span>
            <span>⚡ Real-time Data</span>
            <span>•</span>
            <span>🤖 AI Powered</span>
          </div>
        </div>

        {/* Hint for demo */}
        <div className="mt-6 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
          <p className="text-xs text-blue-200 text-center">
            💡 Demo Access Code: <span className="font-mono font-bold">LAKSHYA2025</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;