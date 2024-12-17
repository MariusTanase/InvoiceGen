// add basic router and routes

import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-800 text-white text-center p-4">
        <Link to="/invoice">Create Invoice</Link> |{" "}
        <Link to="/history">Invoice History</Link> |{" "}
        <Link to="/clients">Set Clients</Link>
      </nav>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
