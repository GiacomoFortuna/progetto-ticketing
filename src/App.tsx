import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/ticket" element={<h1>Lista Ticket</h1>} />
      <Route path="/login" element={<h1>Login</h1>} />
    </Routes>
  );
}

export default App;
// In questo file, abbiamo definito il componente principale `App`.
// All'interno di `App`, abbiamo definito le rotte utilizzando il componente `Routes` e `Route` da `react-router-dom`.