"use client"
import React from 'react';
import { Folder, Plus } from 'lucide-react';

const EmptyProjectsCard = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-lg shadow-md border border-border w-full max-w-md mx-auto">
      <div className="bg-secondary/10 dark:bg-secondary/20 p-4 rounded-full mb-4">
        <Folder className="w-12 h-12 text-secondary" />
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