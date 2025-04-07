import React from 'react';

type ForProps<T> = {
  each: T[];
  children: (item: T, index: number) => React.ReactNode;
};

export function For<T>({ each, children }: ForProps<T>): JSX.Element {
  return <>{each.map((item, index) => children(item, index))}</>;
}
