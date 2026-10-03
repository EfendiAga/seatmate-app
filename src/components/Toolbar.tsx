import React from 'react';
import { Circle, Square, GripHorizontal, Component, BoxSelect, AlignCenterHorizontal, AlignCenterVertical, ArrowLeftRight, ArrowUpDown, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Table } from "@/types/seatingChart";

interface ToolbarProps {
  onAddTable: (shape: Table['tableShape']) => void;
  editMode: boolean;
  selectedShapeCount: number;
  onAlignHorizontal?: () => void;
  onAlignVertical?: () => void;
  onDistributeHorizontal?: () => void;
  onDistributeVertical?: () => void;
  isAnyLocked?: boolean;
  onToggleLock?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddTable, 
  editMode, 
  selectedShapeCount,
  onAlignHorizontal,
  onAlignVertical,
  onDistributeHorizontal,
  onDistributeVertical,
  isAnyLocked,
  onToggleLock
}) => {
  if (!editMode) return null;

  const tools = [
    {
      id: 'round',
      title: 'Round table',
      subtitle: '8 seats - Add now',
      icon: <Circle className="w-5 h-5 text-red-500" />,
      action: () => onAddTable('round')
    },
    {
      id: 'rectangular',
      title: 'Rectangular table',
      subtitle: '8 seats - Add now',
      icon: <Square className="w-5 h-5 text-red-500" />,
      action: () => onAddTable('rectangular')
    },
    {
      id: 'chair_rows',
      title: 'Chair rows',
      subtitle: 'A single row or a block of chairs',
      icon: <GripHorizontal className="w-5 h-5 text-gray-500" />,
      action: () => onAddTable('chair_rows')
    },
    {
      id: 'more_shapes',
      title: 'More table shapes',
      subtitle: 'Oval, serpentine, and U-shaped',
      icon: <Component className="w-5 h-5 text-gray-500" />,
      action: () => onAddTable('serpentine')
    },
    {
      id: 'room_elements',
      title: 'Room elements',
      subtitle: 'Dance floor, stage, and notes',
      icon: <BoxSelect className="w-5 h-5 text-gray-500" />,
      action: () => {} // Placeholder
    },
  ];

  return (
    <div className="w-full bg-[#FAFAFA] border-b border-gray-200 overflow-x-auto hide-scrollbar flex justify-between">
      <div className="flex items-center gap-3 p-4 min-w-max">
        <button className="bg-red-500 text-white font-medium px-4 py-2 rounded-md shadow-sm flex items-center gap-2 hover:bg-red-600 transition-colors">
          <span className="text-xl leading-none">+</span> Add
        </button>
        
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={tool.action}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-red-300 hover:shadow-md transition-all text-left group w-[240px]"
          >
            <div className="mt-1 group-hover:scale-110 transition-transform">
              {tool.icon}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-900">{tool.title}</span>
              <span className="text-xs text-gray-500 line-clamp-2">{tool.subtitle}</span>
              <div className="mt-2 text-xs text-gray-400 font-medium group-hover:text-red-500 flex items-center gap-1 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg> Customize
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {selectedShapeCount > 0 && (
        <div className="flex items-center gap-2 p-4 pr-6 min-w-max border-l border-gray-200 ml-auto">
          <button onClick={onToggleLock} className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors tooltip-trigger" title={isAnyLocked ? "Unlock Elements" : "Lock Elements"}>
            {isAnyLocked ? <Unlock className="w-4 h-4 text-gray-700" /> : <Lock className="w-4 h-4 text-gray-700" />}
          </button>
        </div>
      )}

      {selectedShapeCount > 1 && (
        <div className="flex items-center gap-2 p-4 pr-6 min-w-max border-l border-gray-200 ml-4">
          <span className="text-xs font-semibold text-gray-500 uppercase mr-2 tracking-wider">Align</span>
          
          <button onClick={onAlignHorizontal} className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors tooltip-trigger" title="Align Horizontal">
            <AlignCenterHorizontal className="w-4 h-4 text-gray-700" />
          </button>
          
          <button onClick={onAlignVertical} className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors tooltip-trigger" title="Align Vertical">
            <AlignCenterVertical className="w-4 h-4 text-gray-700" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button onClick={onDistributeHorizontal} className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors tooltip-trigger" title="Distribute Horizontal" disabled={selectedShapeCount < 3}>
            <ArrowLeftRight className={cn("w-4 h-4", selectedShapeCount < 3 ? "text-gray-300" : "text-gray-700")} />
          </button>
          
          <button onClick={onDistributeVertical} className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors tooltip-trigger" title="Distribute Vertical" disabled={selectedShapeCount < 3}>
            <ArrowUpDown className={cn("w-4 h-4", selectedShapeCount < 3 ? "text-gray-300" : "text-gray-700")} />
          </button>
        </div>
      )}
    </div>
  );
};

