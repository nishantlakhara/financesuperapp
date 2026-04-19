import { useState } from "react";
import { evaluateExpression } from "../../api/utilityApi";
import { PageHeader } from "../../components/PageHeader";
import type {
  CalculationMode,
  CalculatorResponse,
} from "../../types/calculators";

const simpleButtons = [
  "7",
  "8",
  "9",
  "/",
  "4",
  "5",
  "6",
  "*",
  "1",
  "2",
  "3",
  "-",
  "0",
  ".",
  "(",
  ")",
  "C",
  "⌫",
  "+",
  "=",
];

const scientificButtons = [
  "sqrt(",
  "sin(",
  "cos(",
  "tan(",
  "log(",
  "ln(",
  "pi",
  "e",
  "^",
  "abs(",
];

export function CalculatorPage() {
  const [mode, setMode] = useState<CalculationMode>("SIMPLE");
  const [expression, setExpression] = useState("2 + 3 * 4");
  const [result, setResult] = useState<CalculatorResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function runCalculation(nextExpression = expression) {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await evaluateExpression({
        expression: nextExpression,
        mode,
      });
      setResult(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to evaluate that expression.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeypadPress(token: string) {
    if (token === "C") {
      setExpression("");
      setResult(null);
      setErrorMessage("");
      return;
    }

    if (token === "⌫") {
      setExpression((current) => current.slice(0, -1));
      return;
    }

    if (token === "=") {
      void runCalculation();
      return;
    }

    setExpression((current) => `${current}${token}`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Utility 2"
        title="Calculator"
        description="Switch between simple and scientific modes. The scientific mode supports brackets, power, square root, logarithms, constants, and trig functions using degree values."
      />

      <section className="panel calculator-layout">
        <aside className="keypad-panel">
          <h2>Keypad</h2>
          <div className="keypad-grid">
            {(mode === "SCIENTIFIC"
              ? [...scientificButtons, ...simpleButtons]
              : simpleButtons
            ).map((token) => {
              const isAction = ["=", "+", "-", "*", "/", "^"].includes(token);
              const isDanger = ["C", "⌫"].includes(token);

              return (
                <button
                  key={token}
                  className={[
                    "keypad-button",
                    isAction ? "keypad-button--action" : "",
                    isDanger ? "keypad-button--danger" : "",
                  ]
                    .join(" ")
                    .trim()}
                  onClick={() => handleKeypadPress(token)}
                  type="button"
                >
                  {token}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="calculator-panel">
          <h2>Expression Builder</h2>
          <p className="helper-copy">
            Type directly or use the keypad. Examples:{" "}
            <strong>15000 / 12</strong> or <strong>sqrt(81) + sin(30)</strong>.
          </p>

          <textarea
            className="calculator-expression"
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            placeholder="Enter a formula"
          />

          <div className="calculator-meta">
            <div className="mode-switch" role="tablist" aria-label="Mode switch">
              <button
                className={mode === "SIMPLE" ? "is-active" : ""}
                type="button"
                onClick={() => setMode("SIMPLE")}
              >
                Simple
              </button>
              <button
                className={mode === "SCIENTIFIC" ? "is-active" : ""}
                type="button"
                onClick={() => setMode("SCIENTIFIC")}
              >
                Scientific
              </button>
            </div>
            <div className="search-panel__count">
              {mode === "SIMPLE"
                ? "Simple mode keeps the operation set focused."
                : "Scientific mode unlocks functions and power."}
            </div>
          </div>

          <div className="calculator-actions">
            <button
              className="button button--primary"
              disabled={isSubmitting}
              onClick={() => void runCalculation()}
              type="button"
            >
              {isSubmitting ? "Calculating..." : "Evaluate"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setExpression(mode === "SIMPLE" ? "2 + 3 * 4" : "sqrt(81)+sin(30)");
                setResult(null);
                setErrorMessage("");
              }}
            >
              Load example
            </button>
          </div>

          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

          <div className="result-display">
            <p className="result-display__label">Result</p>
            <p className="result-display__value">
              {result ? result.result : "—"}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
