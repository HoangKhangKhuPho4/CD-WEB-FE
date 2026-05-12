import React, { useState, useEffect, useRef } from "react";

export type HeaderSelectOption = { label: string; value: string };

type CustomSelectProps = {
  options: HeaderSelectOption[];
  value?: HeaderSelectOption;
  onChange?: (option: HeaderSelectOption) => void;
};

const CustomSelect = ({ options, value: controlledValue, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(options[0]);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = controlledValue ?? internalSelected;

  useEffect(() => {
    if (controlledValue) return;
    if (options[0]) setInternalSelected(options[0]);
  }, [options, controlledValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const t = event.target;
      if (selectRef.current && t instanceof Node && !selectRef.current.contains(t)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen((v) => !v);

  const handleOptionClick = (option: HeaderSelectOption) => {
    if (onChange) onChange(option);
    else setInternalSelected(option);
    setIsOpen(false);
  };

  return (
    <div
      ref={selectRef}
      className="dropdown-content custom-select relative"
      style={{ width: "200px" }}
    >
      <div
        className={`select-selected whitespace-nowrap ${isOpen ? "select-arrow-active" : ""}`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => (
          <div
            key={`${option.value}-${index}`}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${selectedOption.value === option.value ? "same-as-selected" : ""}`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
