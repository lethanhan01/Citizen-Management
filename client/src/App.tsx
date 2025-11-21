import { useState } from 'react';
import './App.css';
import ElectricBorder from '@/components/ElectricBorder';
import ThemeToggle from '@/components/ThemeToggle';


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
        <ThemeToggle />
        <h1 className="text-4xl font-bold">Vite + React</h1>
        
        <ElectricBorder
          color="#7df9ff"
          speed={1}
          chaos={0.5}
          thickness={2}
          style={{ borderRadius: 16 }}
        >
          <div className="card bg-slate-900 p-8 rounded-xl">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              count is {count}
            </button>
            <p style={{ margin: '6px 0 0', opacity: 0.8 }} className="text-slate-400">
              Testing electric border component.
            </p>
          </div>
        </ElectricBorder>

        <ElectricBorder
          color="#7df9ff"
          speed={1}
          chaos={0.5}
          thickness={2}
          style={{ borderRadius: 16 }}
        >
          <div className="p-6 bg-slate-900 rounded-xl">
            <p style={{ margin: '6px 0 0', opacity: 0.8 }} className="text-white">
              https://reactbits.dev/animations/electric-border
            </p>
          </div>
        </ElectricBorder>
      </div>
    </>
  )
}



export default App
