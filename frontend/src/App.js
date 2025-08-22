// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard"; // ঠিক path চেক করে নাও

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page সরাসরি AdminDashboard */}
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
