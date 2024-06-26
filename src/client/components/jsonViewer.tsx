import React from "react";

type JSONFieldProps = {
  obj: Record<string, any>;
  setObj: (newObj: Record<string, any>) => void;
  path?: string[];
};

const JSONField = ({ obj, setObj, path = [] }: JSONFieldProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const newValue = {
      ...obj,
      [key]: e.target.type === "number" ? +value : value,
    };
    setObj(newValue);
  };

  const renderInputField = (key: string, value: any) => {
    if (typeof value === "boolean") {
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => handleChange(e, key)}
        />
      );
    } else if (typeof value === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(e, key)}
        />
      );
    } else if (typeof value === "string") {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e, key)}
        />
      );
    } else {
      return <div>Type not supported</div>;
    }
  };

  return (
    <div>
      {Object.keys(obj).map((key, index) => {
        const value = obj[key];

        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return (
            <div key={index}>
              <h3 className="font-semibold text-lg">{key}</h3>
              <JSONField
                obj={value}
                setObj={(newSubObj) => {
                  const newObject = { ...obj };
                  newObject[key] = newSubObj;
                  setObj(newObject);
                }}
                path={[...path, key]}
              />
            </div>
          );
        } else {
          return (
            <div className="flex flex-col mb-2" key={index}>
              <label>
                {key}:{renderInputField(key, value)}
              </label>
            </div>
          );
        }
      })}
    </div>
  );
};

export default JSONField;
