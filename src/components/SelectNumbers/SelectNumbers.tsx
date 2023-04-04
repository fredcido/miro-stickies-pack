import React from "react";

type SelectNumbersProps = {
  onChange: (item: number) => void;
  value: number;
  max: number;
  step?: number;
};

function SelectNumbers({ onChange, max, value, step = 1 }: SelectNumbersProps) {
  const items = [];
  for (let i = 1; i <= max; i = i + step) {
    items.push(i);
  }

  return (
    <select
      className="select select-small"
      value={value}
      onChange={(ev) => onChange(+ev.currentTarget.value)}
    >
      {items.map((value) => (
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  );
}

export default SelectNumbers;
