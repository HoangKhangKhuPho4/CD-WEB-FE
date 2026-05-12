import React, { useState, useEffect, useRef } from "react";

export type SelectOption = { label: string; value: string };

type CustomSelectProps = {
  options: SelectOption[];
  /** Khi truyền: component controlled theo cha */
  value?: SelectOption;
  onChange?: (option: SelectOption) => void;
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

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: SelectOption) => {
    if (onChange) onChange(option);
    else setInternalSelected(option);
    setIsOpen(false);
  };

  return (
    <div className="custom-select custom-select-2 flex-shrink-0 relative" ref={selectRef}>
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
