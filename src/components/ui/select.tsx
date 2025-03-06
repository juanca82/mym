import React from "react";

export function Select({ children }: { children: React.ReactNode }) {
  return <select className="border p-2 rounded">{children}</select>;
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <div className="border p-2 rounded">{children}</div>;
}

export function SelectValue({ placeholder }: { placeholder: string }) {
  return <span className="text-gray-500">{placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border p-2">{children}</div>;
}

export function SelectItem({ children }: { children: React.ReactNode }) {
  return <option className="p-2">{children}</option>;
}