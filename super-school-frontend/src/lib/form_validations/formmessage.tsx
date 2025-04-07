export function requireMessage(name: string, type?: string): string {
  if (type === 'select') {
    return `Please select the ${name}`;
  } else {
    return `Please enter the ${name}`;
  }
}
