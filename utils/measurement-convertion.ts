export type Measurement = {
    value: number;
    unit: string;
  };
  
  export function normalizeToBaseUnit(inputValue: number, inputUnit: string): Measurement {
    switch (inputUnit) {
      case 'kg':
        return { value: inputValue * 1000, unit: 'g' };
      
      case 'l':
        return { value: inputValue * 1000, unit: 'ml' };
      case 'dl':
        return { value: inputValue * 100, unit: 'ml' };
      case 'cl':
        return { value: inputValue * 10, unit: 'ml' };
      
      default:
        return { value: inputValue, unit: inputUnit };
    }
  }
  
  export function convertFromBaseUnit(inputValue: number, inputUnit: string): Measurement {
    switch (inputUnit) {
      case 'kg':
        return { value: inputValue / 1000, unit: 'kg' };
      
      case 'l':
        return { value: inputValue / 1000, unit: 'l' };
      case 'dl':
        return { value: inputValue / 100, unit: 'dl' };
      case 'cl':
        return { value: inputValue / 10, unit: 'cl' };
      
      default:
        return { value: inputValue, unit: inputUnit };
    }
  }
  
  export function shouldNormalize(inputUnit: string): boolean {
    const unitsToNormalize = ['kg', 'l', 'dl', 'cl'];
    return unitsToNormalize.includes(inputUnit);
  }
  
  export function getBaseUnit(inputUnit: string): string {
    switch (inputUnit) {
      case 'kg':
        return 'g';
      case 'l':
      case 'dl':
      case 'cl':
        return 'ml';
      default:
        return inputUnit;
    }
  }
  
  export function formatMeasurement(inputValue: number, inputUnit: string): string {
    if (inputUnit === 'g' && inputValue >= 1000) {
      return `${(inputValue / 1000).toFixed(1)} kg`;
    }
    if (inputUnit === 'ml' && inputValue >= 1000) {
      return `${(inputValue / 1000).toFixed(1)} l`;
    }
    
    const formattedValue = Number.isInteger(inputValue) ? inputValue.toString() : inputValue.toFixed(1);
    return `${formattedValue} ${inputUnit}`;
  }