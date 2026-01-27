# React Vite Project

Questo progetto è un'applicazione React creata con Vite, sviluppata come progetto finale del corso. Include un gioco di BlackJack con persistenza dei dati (miglior streak) e un componente di background shader ispirato a "Balatro".

## Struttura del Progetto

Il progetto segue le best practices di organizzazione dei file:

- `src/components`: Contiene i componenti React (`BlackJack`, `Balatro`).
- `src/assets`: Contiene gli asset statici come immagini e loghi.
- `public`: Asset pubblici serviti direttamente.

## Installazione e Avvio

Per avviare il progetto, segui questi passaggi:

1.  **Installa le dipendenze:**
    ```bash
    npm install
    ```

2.  **Avvia il server JSON (Simulazione Backend):**
    Il gioco utilizza `json-server` per salvare lo streak migliore.
    ```bash
    npm run server
    ```
    Il server girerà sulla porta 3000.

3.  **Avvia l'applicazione React:**
    In un nuovo terminale, avvia il server di sviluppo Vite:
    ```bash
    npm run dev
    ```

## Funzionalità

-   **BlackJack Game**:
    -   Gioca contro il banco.
    -   Regole classiche (il banco si ferma a 17 hard, blackjack paga 3:2, etc. - semplificato).
    -   Gestione dello stato della partita.
-   **Sistema di Streak**:
    -   Salva la serie di vittorie corrente.
    -   Registra il record personale (Best Streak) su `db.json` tramite chiamate API REST (GET/PUT).
-   **Grafica e Shader**:
    -   Uso di `ogl` per renderizzare shader GLSL personalizzati (background in stile Balatro).
    -   Asset in pixel art per un look retrò.

## Dettagli Tecnici

Il progetto dimostra la conoscenza di diversi concetti chiave di React e dello sviluppo web moderno:

### 1. Gestione dello Stato e Hooks
L'applicazione fa ampio uso degli hook di React per gestire la logica di gioco e del rendering:
-   **`useState`**: Utilizzato per gestire lo stato del mazzo, le carte in mano al giocatore/banco, il punteggio, lo stato della partita (in corso, vittoria, sconfitta) e lo streak corrente.
-   **`useEffect`**: Fondamentale per:
    -   Eseguire il fetch iniziale del "Best Streak" dal server.
    -   Gestire il ciclo di vita del renderer WebGL (`ogl`) per lo sfondo animato.
    -   Gestire il turno del banco in modo asincrono (pausa tra una carta e l'altra).
-   **`useRef`**: Utilizzato nel componente `Balatro` per mantenere un riferimento al contenitore DOM su cui montare il canvas WebGL senza causare re-render non necessari.

### 2. Rendering Grafico Avanzato (WebGL/Shaders)
Lo sfondo non è un video o una GIF, ma un **shader GLSL** renderizzato in tempo reale tramite la libreria `ogl`.
-   Il componente `Balatro.jsx` inizializza un contesto WebGL.
-   Vengono passati `uniforms` allo shader per controllare colore, rotazione, distorsione e interazione con il mouse.
-   Questo dimostra la capacità di integrare librerie grafiche esterne all'interno del ciclo di vita di React.

### 3. Integrazione Backend (Simulato)
La persistenza dei dati è gestita tramite `json-server`, che simula una vera API REST:
-   **GET**: Al caricamento, l'app richiede il record migliore salvato.
-   **PUT**: Quando il giocatore supera il record attuale, l'app invia una richiesta per aggiornare il database `db.json`.
-   L'interazione è gestita con `fetch`, gestendo le Promise per assicurare che i dati siano sincronizzati.

### 4. Struttura dei Componenti
Il codice è modulare:
-   `BlackJack.jsx`: Contiene interamente la logica di gioco.
-   `Balatro.jsx`: Componente riutilizzabile per lo sfondo, configurabile tramite props.

## Tecnologie Utilizzate

-   **React 18** (Vite template)
-   **OGL** (Minimal WebGL library)
-   **JSON Server** (REST API mock)
-   **CSS Modules/Inline Styles** (per lo styling dinamico)
