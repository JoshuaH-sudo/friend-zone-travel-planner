"use client";
import { useState } from "react";

export const Accommodation = ({
  accommodation,
  onUpdate,
  onDelete,
}: {
  accommodation: any;
  onUpdate: (field: string, value: string | number) => void;
  onDelete: () => void;
}) => {
  const { name, price, currency, checkIn, checkOut } = accommodation;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [isEditingCheckIn, setIsEditingCheckIn] = useState(false);
  const [isEditingCheckOut, setIsEditingCheckOut] = useState(false);

  return (
    <div className="relative rounded-lg border p-4">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
        aria-label="Delete accommodation"
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
        {isEditingCheckIn ? (
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onUpdate("checkIn", e.target.value)}
            onBlur={() => setIsEditingCheckIn(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <p
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingCheckIn(true)}
          >
            Check-in: {new Date(checkIn).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="mt-1">
        {isEditingCheckOut ? (
          <input
            type="date"
            value={checkOut}
            onChange={(e) => onUpdate("checkOut", e.target.value)}
            onBlur={() => setIsEditingCheckOut(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <p
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingCheckOut(true)}
          >
            Check-out: {new Date(checkOut).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};
