import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import History from "./pages/History";
import EditPlan from "./pages/EditPlan";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 pt-14">
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/history" element={<History />} />
          <Route path="/edit-plan" element={<EditPlan />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
