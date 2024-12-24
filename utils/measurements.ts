export type Measurement = {
    value: string;
    label: string;
  };
  
  export const MEASUREMENTS: Measurement[] = [
    { value: "g", label: "Gram" },
    { value: "kg", label: "Kilogram" },
    { value: "ml", label: "Milliliter" },
    { value: "cl", label: "Centiliter" },
    { value: "dl", label: "Desiliter" },
    { value: "l", label: "Liter" },
    { value: "stk", label: "Stykk" },
    { value: "fd", label: "Fedd" },
    { value: "ss", label: "Spiseskje" },
    { value: "ts", label: "Teskje" },
    { value: "hf", label: "Håndfull" },
    { value: "kl", label: "Klype" },
    { value: "dsj", label: "Dæsj" },
    { value: "skv", label: "Skvett" },
    { value: "tsk", label: "Til smak" },
  ];
  
  export const getMeasurementLabel = (value: string): string => {
    const measurement = MEASUREMENTS.find(m => m.value === value);
    return measurement?.label || value;
  };

  export const measurementOptions = MEASUREMENTS.map((m) => ({
    value: m.value,
    label: m.label,
  }));