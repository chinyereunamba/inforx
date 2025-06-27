"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";

interface DataPoint {
  date: string;
  value: number;
  label: string;
}

interface InteractiveChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  type?: "line" | "bar";
}

export default function InteractiveChart({ 
  title, 
  data, 
  color = "sky", 
  type = "line" 
}: InteractiveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const periods = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "3M", value: "3m" },
    { label: "1Y", value: "1y" }
  ];

  const colorClasses = {
    sky: "stroke-sky-500 fill-sky-500",
    emerald: "stroke-emerald-500 fill-emerald-500",
    purple: "stroke-purple-500 fill-purple-500",
    orange: "stroke-orange-500 fill-orange-500",
    red: "stroke-red-500 fill-red-500"
  };

  useEffect(() => {
    if (!chartRef.current || !svgRef.current || data.length === 0) return;

    const svg = svgRef.current;
    const chartContainer = chartRef.current;
    
    // Clear previous content
    svg.innerHTML = '';

    const width = chartContainer.clientWidth;
    const height = 200;
    const padding = 40;

    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    const xScale = (width - 2 * padding) / (data.length - 1);
    const yScale = (height - 2 * padding) / valueRange;

    // Create gradient
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    linearGradient.setAttribute('id', `gradient-${color}`);
    linearGradient.setAttribute('x1', '0%');
    linearGradient.setAttribute('y1', '0%');
    linearGradient.setAttribute('x2', '0%');
    linearGradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', `var(--${color}-500)`);
    stop1.setAttribute('stop-opacity', '0.3');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', `var(--${color}-500)`);
    stop2.setAttribute('stop-opacity', '0');

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    gradient.appendChild(linearGradient);
    svg.appendChild(gradient);

    if (type === "line") {
      // Create path for line chart
      let pathData = '';
      let areaData = '';

      data.forEach((point, index) => {
        const x = padding + index * xScale;
        const y = height - padding - (point.value - minValue) * yScale;

        if (index === 0) {
          pathData += `M ${x} ${y}`;
          areaData += `M ${x} ${height - padding}`;
          areaData += ` L ${x} ${y}`;
        } else {
          pathData += ` L ${x} ${y}`;
          areaData += ` L ${x} ${y}`;
        }

        if (index === data.length - 1) {
          areaData += ` L ${x} ${height - padding} Z`;
        }
      });

      // Area fill
      const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', areaData);
      area.setAttribute('fill', `url(#gradient-${color})`);
      svg.appendChild(area);

      // Line
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('stroke', `var(--${color}-500)`);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);

      // Animate path
      gsap.fromTo(path, 
        { strokeDasharray: path.getTotalLength(), strokeDashoffset: path.getTotalLength() },
        { strokeDashoffset: 0, duration: 1.5, ease: "power2.out" }
      );

      // Data points
      data.forEach((point, index) => {
        const x = padding + index * xScale;
        const y = height - padding - (point.value - minValue) * yScale;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', `var(--${color}-500)`);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '2');
        circle.style.cursor = 'pointer';

        circle.addEventListener('mouseenter', () => {
          setHoveredPoint(point);
          gsap.to(circle, { attr: { r: 6 }, duration: 0.2 });
        });

        circle.addEventListener('mouseleave', () => {
          setHoveredPoint(null);
          gsap.to(circle, { attr: { r: 4 }, duration: 0.2 });
        });

        svg.appendChild(circle);

        // Animate circle
        gsap.fromTo(circle, 
          { scale: 0, transformOrigin: `${x}px ${y}px` },
          { scale: 1, duration: 0.3, delay: index * 0.1, ease: "back.out(1.7)" }
        );
      });
    } else {
      // Bar chart implementation
      const barWidth = (width - 2 * padding) / data.length * 0.6;
      
      data.forEach((point, index) => {
        const x = padding + index * xScale - barWidth / 2;
        const barHeight = (point.value - minValue) * yScale;
        const y = height - padding - barHeight;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x.toString());
        rect.setAttribute('y', y.toString());
        rect.setAttribute('width', barWidth.toString());
        rect.setAttribute('height', barHeight.toString());
        rect.setAttribute('fill', `var(--${color}-500)`);
        rect.setAttribute('rx', '4');
        rect.style.cursor = 'pointer';

        rect.addEventListener('mouseenter', () => {
          setHoveredPoint(point);
          gsap.to(rect, { attr: { fill: `var(--${color}-600)` }, duration: 0.2 });
        });

        rect.addEventListener('mouseleave', () => {
          setHoveredPoint(null);
          gsap.to(rect, { attr: { fill: `var(--${color}-500)` }, duration: 0.2 });
        });

        svg.appendChild(rect);

        // Animate bar
        gsap.fromTo(rect, 
          { attr: { height: 0, y: height - padding } },
          { attr: { height: barHeight, y: y }, duration: 0.6, delay: index * 0.1, ease: "power2.out" }
        );
      });
    }
  }, [data, color, type, selectedPeriod]);

  useEffect(() => {
    gsap.fromTo(
      chartRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className={`h-5 w-5 text-${color}-500`} />
          {title}
        </CardTitle>
        <div className="flex gap-1">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className="h-8 px-3 text-xs"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="relative">
          {hoveredPoint && (
            <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {hoveredPoint.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hoveredPoint.date}
              </p>
              <p className={`text-lg font-bold text-${color}-600`}>
                {hoveredPoint.value}
              </p>
            </div>
          )}
          <svg ref={svgRef} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}