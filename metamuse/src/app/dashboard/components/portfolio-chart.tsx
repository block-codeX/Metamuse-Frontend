"use client";
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

// Animation variants
const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: 0.3
    }
  }
};

// Custom label renderer that positions labels better
// Modify your custom label renderer to use the slice color
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, fill }) => {
    const RADIAN = Math.PI / 180;
    // Position the label further from the center
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill={fill} // Use the pie slice's color for the text
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        className='font-medium'
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

export default function PortfolioChart({ portfolioData }) {
  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
          <CardDescription>Value distribution across your assets</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}> {/* Increased height for more space */}
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                labelLine={false} /* Enable label lines to connect to distant labels */
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={renderCustomizedLabel}
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} SUI`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}