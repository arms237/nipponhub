import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-base-100 p-8 rounded-lg mx-auto my-8 w-full">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <FaExclamationTriangle className="text-4xl text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Erreur</h2>
        <p className="text-gray-600 max-w-md">{error}</p>
      </div>
    </div>
  );
} 