"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PerformanceCategorySales } from "../../../../types/host-dashboard.types";

interface Props {
  data: PerformanceCategorySales[];
}

const BRAND_COLORS = ["#7131C8", "#A87FE6", "#EC4899", "#F59E0B", "#3B82F6"];

export default function CategorySalesChart({ data = [] }: Props) {
  return (
    <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[360px] shadow-card select-none">
      <h3 className="font-heading font-bold text-base md:text-lg text-text-primary mb-6">
        Ticket Sales by Category
      </h3>
      
      {data.length === 0 ? (
        <div className="flex-1 w-full flex items-center justify-center">
          <p className="font-sans text-xs md:text-sm text-text-muted">No category sales data available yet.</p>
        </div>
      ) : (
        <div className="flex-1 w-full flex items-center justify-between">
          
          {/* Pie Chart */}
          <div className="relative w-1/2 h-[200px] flex items-center justify-center -ml-5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF", 
                    borderColor: "#CDAFEA", 
                    borderRadius: "12px",
                    fontFamily: "Inter",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                  }}
                  itemStyle={{ color: "#351365", fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-4 flex-1 pl-6">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm" 
                    style={{ backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }} 
                  />
                  <span className="font-sans font-medium text-xs md:text-sm text-text-secondary">
                    {item.name}
                  </span>
                </div>
                <span className="font-sans font-bold text-xs md:text-sm text-text-primary">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
