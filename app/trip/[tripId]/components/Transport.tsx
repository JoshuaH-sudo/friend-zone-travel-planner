"use client";
import { useState } from "react";

export const Transport = ({
  transport,
  onUpdate,
  onDelete,
}: {
  transport: any;
  onUpdate: (field: string, value: string | number) => void;
  onDelete: () => void;
}) => {
  const { name, type, price, currency, date } = transport;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);

  return (
    <div className="relative rounded-lg border p-4">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
        aria-label="Delete transport"
      >
        ✕
      </button>
      {isEditingName ? (
        <input
          type="text"
          value={name}
          onChange={(e) => onUpdate("name", e.target.value)}
          onBlur={() => setIsEditingName(false)}
          autoFocus
          className="w-full rounded border px-2 py-1 text-lg font-semibold"
        />
      ) : (
        <h4
          className="cursor-pointer text-lg font-semibold hover:text-blue-600"
          onClick={() => setIsEditingName(true)}
        >
          {name}
        </h4>
      )}
      <div className="mt-2 flex items-center gap-2">
        {isEditingType ? (
          <select
            value={type}
            onChange={(e) => {
              onUpdate("type", e.target.value);
              setIsEditingType(false);
            }}
            onBlur={() => setIsEditingType(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          >
            <option value="flight">Flight</option>
            <option value="bus">Bus</option>
            <option value="car">Car</option>
          </select>
        ) : (
          <span
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingType(true)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        )}
        <span className="text-gray-400">•</span>
        {isEditingPrice ? (
          <input
            type="number"
            value={price}
            onChange={(e) => onUpdate("price", Number(e.target.value))}
            onBlur={() => setIsEditingPrice(false)}
            autoFocus
            className="w-24 rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <span
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingPrice(true)}
          >
            {price}
          </span>
        )}
        {isEditingCurrency ? (
          <select
            value={currency}
            onChange={(e) => {
              onUpdate("currency", e.target.value);
              setIsEditingCurrency(false);
            }}
            onBlur={() => setIsEditingCurrency(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
          </select>
        ) : (
          <span
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingCurrency(true)}
          >
            {currency}
          </span>
        )}
      </div>
      <div className="mt-2">
        {isEditingDate ? (
          <input
            type="date"
            value={date}
            onChange={(e) => onUpdate("date", e.target.value)}
            onBlur={() => setIsEditingDate(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <p
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingDate(true)}
          >
            Date: {new Date(date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};
