import 'reflect-metadata';

export const RequiredSymbol = Symbol('required');
export const OptionalSymbol = Symbol('optional');
export const InputSymbol = Symbol('input');

export const Required = Reflect.metadata(RequiredSymbol, true);
export const Optional = Reflect.metadata(OptionalSymbol, true);

export function Input(inputName: string) {
  return Reflect.metadata(InputSymbol, inputName);
}

export function isRequired(target: any, propertyKey: string): boolean {
  return Reflect.getMetadata(RequiredSymbol, target, propertyKey) || false;
}

export function isOptional(target: any, propertyKey: string): boolean {
  return Reflect.getMetadata(OptionalSymbol, target, propertyKey) || false;
}

export function getInputName(target: any, propertyKey: string): string {
  return Reflect.getMetadata(InputSymbol, target, propertyKey) || '';
}