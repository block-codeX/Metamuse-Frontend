// components/EarningsSummary.jsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const EarningsSummary = ({ 
  boughtAssetsEarnings, 
  resoldAssetsEarnings, 
  mintedProjectsEarnings, 
  grandTotal 
}) => {
  // Format the currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Data for pie chart
  const data = [
    { name: 'Bought Assets', value: boughtAssetsEarnings, color: '#4f46e5' },
    { name: 'Resold Assets', value: resoldAssetsEarnings, color: '#8b5cf6' },
    { name: 'Minted Projects', value: mintedProjectsEarnings, color: '#6366f1' },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.5,
      }
    })
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      {/* Grand Total */}
      <motion.div 
        custom={0} 
        variants={cardVariants} 
        className="col-span-1 md:col-span-1"
      >
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white h-full">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="font-medium text-sm opacity-80">Grand Total</div>
            <div className="text-3xl font-bold mt-2">{formatCurrency(grandTotal)}</div>
            <div className="text-xs mt-4 opacity-80">Total earnings since joining</div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Individual Category Cards */}
      {data.map((item, index) => (
        <motion.div 
          key={item.name} 
          custom={index + 1} 
          variants={cardVariants}
          className="col-span-1"
        >
          <Card className="h-full border-l-4" style={{ borderLeftColor: item.color }}>
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div className="font-medium text-sm text-gray-500">{item.name}</div>
              <div className="text-2xl font-bold mt-2">{formatCurrency(item.value)}</div>
              <div className="text-xs mt-4 text-gray-400">
                {Math.round((item.value / grandTotal) * 100)}% of total
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Visualization Card - Only visible on larger screens */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="col-span-1 md:col-span-4 mt-4 hidden md:block"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)} 
                      labelFormatter={(name) => `Category: ${name}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="ml-8 flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Portfolio Breakdown</h3>
                <div className="flex flex-col gap-2">
                  {data.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="text-sm">{item.name}: {formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EarningsSummary;