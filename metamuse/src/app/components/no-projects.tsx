"use client"
import React from 'react';
import { Folder, Plus } from 'lucide-react';

const EmptyProjectsCard = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
        <Folder className="w-12 h-12 text-blue-500 dark:text-blue-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No Projects Yet.
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
        You haven't created any projects yet. Start by creating your first project.
      </p>
    </div>
  );
};

export default EmptyProjectsCard;