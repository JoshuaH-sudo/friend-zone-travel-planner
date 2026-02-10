"use client";
import { useState } from "react";

export const Stop = ({
  stop,
  onNameChange,
  onDateChange,
  onDelete,
}: {
  stop: any;
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDelete: () => void;
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);

  const toggleEditName = () => {
    setIsEditingName(!isEditingName);
  };

  const toggleEditDate = () => {
    setIsEditingDate(!isEditingDate);
  };

  return (
    <div className="relative rounded-lg border p-4">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
        aria-label="Delete stop"
      >
        ✕
      </button>
      <div className="flex items-center justify-between gap-2">
        {isEditingName ? (
          <input
            type="text"
            value={stop.name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={toggleEditName}
            autoFocus
            className="rounded border px-2 py-1 text-xl font-semibold"
          />
        ) : (
          <h3
            className="cursor-pointer text-xl font-semibold hover:text-blue-600"
            onClick={toggleEditName}
          >
            {stop.name}
          </h3>
        )}
      </div>
      {isEditingDate ? (
        <input
          type="date"
          value={stop.date}
          onChange={(e) => onDateChange(e.target.value)}
          onBlur={toggleEditDate}
          autoFocus
          className="mt-2 rounded border px-2 py-1 text-gray-600"
        />
      ) : (
        <div className="w-fit">
          <p
            className="mt-2 cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={toggleEditDate}
          >
            {new Date(stop.date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
