import InputField from "./components/input.js";
import './App.css';
import { useEffect, useRef, useMemo } from "react";
// Context for sharing input-related methods across components
import { InputContext } from "./InputContext.js";

// Helper method for calculating Z-Score
function NORMSINV(p) {
    const a1 = -3.969683028665376e1, a2 = 2.209460984245205e2, a3 = -2.759285104469687e2,
          a4 = 1.38357751867269e2, a5 = -3.066479806614716e1, a6 = 2.506628277459239;
    const b1 = -5.447609879822406e1, b2 = 1.615858368580409e2, b3 = -1.556989798598866e2,
          b4 = 6.680131188771972e1, b5 = -1.328068155288572e1;
    const c1 = -7.784894002430293e-3, c2 = -3.223964580411365e-1, c3 = -2.400758277161838,
          c4 = -2.549732539343734, c5 = 4.374664141464968, c6 = 2.938163982698783;
    const d1 = 7.784695709041462e-3, d2 = 3.224671290700398e-1, d3 = 2.445134137142996, d4 = 3.754408661907416;

    const p_low = 0.02425;
    const p_high = 1 - p_low;
    let q, r;
    if (0 < p && p < p_low) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p_low <= p && p <= p_high) {
      q = p - 0.5;
      r = q * q;
      return ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
            (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else if (p_high < p && p < 1) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
              ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
    throw new Error("Invalid input argument: " + p);
  }

function App() {
  //ref object for all user input and for the output element
  let inputData = useRef({});
  let output = useRef(null);

  // Calculates and updates the results based on inputs
  function UpdateOutputs() {
    // Gathers all user input data
    let InputData = inputData.current
    const confidence = Number(InputData.confidence || 0);
    
    const power = Number(InputData.Power || 0);
    const mde = Number(InputData.MDE || 0);
    const tails = Number(InputData.Tails || 1);
    const testVariants = Number(InputData.TestVars || 1);
    const meanvalue = Number(InputData.MeanVal || 0);
    const stdev = Number(InputData.StDev || 0);
    const dailyTraffic = Number(InputData.DailyTraffic || 0);

    // Calculates needed information
    try {
      const zAlpha = NORMSINV(1 - ((1 - confidence) / tails));
      const zBeta = NORMSINV(power);
      const estimatedTestAverage = meanvalue * (1 + mde);
      const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * Math.pow(stdev, 2);
      const denominator = Math.pow(estimatedTestAverage - meanvalue, 2);
      const sampleSizeReqPerRecipe = numerator / denominator;
      const totalSampleSizeReq = sampleSizeReqPerRecipe * (testVariants + 1);

      //Outputs information to the output element
      let duration = "N/A";
      if (dailyTraffic > 0) {
        duration = Math.ceil(totalSampleSizeReq / dailyTraffic) + " Days";
      } else {
        duration = "Provide daily traffic for estimated duration";
      }

      output.current.innerHTML = `
        <b>Estimated Test Average:</b> ${estimatedTestAverage.toFixed(4)}<br/>
        <b>Sample Size per Recipe:</b> ${sampleSizeReqPerRecipe.toFixed(2)}<br/>
        <b>Total Sample Size:</b> ${totalSampleSizeReq.toFixed(2)}<br/>
        <b>Estimated Duration:</b> ${duration}
      `;
    } catch {
      output.current.innerHTML = `<b>Invalid Input Data</b>`
    }
    
  } 

  // Registers input fields in the InputData object
  function RegisterInput(field, DefaultValue) {
    inputData.current[field] = DefaultValue
  }


  function CallBack(field, value) {
    inputData.current[field] = value;
    UpdateOutputs()
  }
  
  // eslint-disable-next-line
  const inputHelpers = useMemo(() => ({ RegisterInput, CallBack }), []);
  useEffect(() => {
    UpdateOutputs();
  });

  return (
    <InputContext.Provider value={inputHelpers}>
      <div className="App">
        <div className="row">
          <div className="col-12 col-md-6">
            <InputField FieldLabel="Confidence ( 1 - α ):" DefaultValue={.95} FieldName="confidence" />
            <InputField FieldLabel="Power:" DefaultValue={.8} FieldName="Power" />
            <InputField FieldLabel="MDE:" DefaultValue={.05} FieldName="MDE" />
            <div className="input-field-container">  
              <label htmlFor={"Tails"}>{"Tails:"}</label>
              <select id={"Tails"} className="form-select" defaultValue={1} name={"Tails"} onInput={(ev) => { CallBack("Tails", ev.target.value); }}>
                <option>1</option>
                <option>2</option>
              </select>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <InputField FieldLabel="Number Of Test Variants:" DefaultValue={1} FieldName="TestVars" />
            <InputField FieldLabel="Mean Value:" DefaultValue={50} FieldName="MeanVal" />
            <InputField FieldLabel="Standard Deviation:" DefaultValue={180} FieldName="StDev" />
            <InputField FieldLabel="Daily Traffic (optional):" DefaultValue={0} FieldName="DailyTraffic" />
          </div>

          <div className="output" ref={output}></div>
        </div>
      </div>

    </InputContext.Provider>
  );
}

export default App;
