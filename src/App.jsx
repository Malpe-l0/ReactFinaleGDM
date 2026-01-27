import { useState } from 'react'
import Balatro from './components/Balatro/Balatro';
import BlackJack from './components/BlackJack/BlackJack';

function App() {
    const [count, setCount] = useState(0)
    const [isGameActive, setIsGameActive] = useState(false);

    return (
        <>
            <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
                <Balatro
                    isRotate={false}
                    mouseInteraction
                    pixelFilter={745}
                    color1="#DE443B"
                    color2="#006BB4"
                    color3="#162325"
                />
                <BlackJack onGameStart={() => setIsGameActive(true)} isGameActive={isGameActive} />
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: isGameActive ? '15vh' : '33vh',
                    transition: 'height 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    pointerEvents: 'none',
                }}>
                    <img
                        src="/img/balatroLogo.png"
                        alt="Balatro Logo"
                        style={{
                            maxHeight: '90%',
                            maxWidth: '90%',
                            objectFit: 'contain',
                            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                    />
                </div>
            </div>
        </>
    )
}

export default App
