import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import { CalculatorPage } from "../features/calculator/CalculatorPage";
import { CompoundInterestPage } from "../features/compound-interest/CompoundInterestPage";
import { EmiPage } from "../features/emi/EmiPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/utilities/calculator" element={<CalculatorPage />} />
          <Route
            path="/utilities/compound-interest"
            element={<CompoundInterestPage />}
          />
          <Route path="/utilities/emi" element={<EmiPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
