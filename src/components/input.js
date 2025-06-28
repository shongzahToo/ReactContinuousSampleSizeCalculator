// components/input.js
import { useEffect } from "react";
import { useInput } from "../InputContext";

const InputField = ({ FieldLabel, DefaultValue, FieldName }) => {
  const { RegisterInput, CallBack } = useInput();

  useEffect(() => {
    RegisterInput(FieldName, DefaultValue);
  }, [RegisterInput, FieldName, DefaultValue]);

  return (
    <div className="input-field-container">
      <label htmlFor={FieldName}>{FieldLabel}</label>
      <input
        id={FieldName}
        defaultValue={DefaultValue || ""}
        name={FieldName}
        onInput={(ev) => {
          CallBack(FieldName, ev.target.value);
        }}
      />
    </div>
  );
};

export default InputField;
