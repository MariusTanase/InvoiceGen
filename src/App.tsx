// add basic router and routes

import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";
import LinkNav from "./components/Misc/LinkNav";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceHistory from "./pages/InvoiceHistory";

function App() {
  return (
    <BrowserRouter>
      <nav className="flex justify-center space-x-4 bg-slate-800 p-6">
        <LinkNav to="/invoice" text="Create Invoice" />
        <LinkNav to="/history" text="Invoice History" />
        <LinkNav to="/clients" text="Clients" />
      </nav>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/invoice" element={<CreateInvoice />} />
        <Route path="/history" element={<InvoiceHistory />} />
        <Route path="/clients" element={<div>Clients</div>} />
        <Route path="/business" element={<div>Business</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
