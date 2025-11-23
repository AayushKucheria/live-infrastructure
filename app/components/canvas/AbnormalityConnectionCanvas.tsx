'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, useDroppable, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent } from '@dnd-kit/core';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AbnormalityBubble } from '../../lib/mockData';
import { StoredAbnormalityBubble } from '../../lib/storage';
import AbnormalityBubbleCard from '../AbnormalityBubbleCard';
import MagicNode from './MagicNode';
import DraggableAbnormalityCard from './DraggableAbnormalityCard';
import FloatingDock from './FloatingDock';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

interface AbnormalityConnectionCanvasProps {
  mainAbnormality: AbnormalityBubbleUnion;
  initialRelevantAbnormalities: AbnormalityBubbleUnion[];
  libraryAbnormalities: AbnormalityBubbleUnion[];
  onAnalyze: (source: AbnormalityBubbleUnion, target: AbnormalityBubbleUnion) => Promise<string>;
}

interface CanvasNode {
  id: string;
  type: 'main' | 'magic' | 'abnormality';
  x: number;
  y: number;
  data?: AbnormalityBubbleUnion;
}

// Helper to draw cubic bezier curves
const ConnectionLine = ({ start, end, color, label }: { start: { x: number, y: number }, end: { x: number, y: number }, color: string, label?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  const path = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  
  return (
    <g>
      <path d={path} stroke={color} strokeWidth="3" fill="none" className="transition-colors duration-500" />
      <circle cx={end.x} cy={end.y} r="4" fill={color} />
      {label && (
        <foreignObject 
          x={midX - (isExpanded ? 150 : 60)} 
          y={midY - (isExpanded ? 100 : 15)} 
          width={isExpanded ? 300 : 120} 
          height={isExpanded ? 200 : 30}
          className="overflow-visible"
        >
          <div className="flex justify-center items-center h-full pointer-events-auto">
             <div 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className={`
                    cursor-pointer transition-all duration-300
                    ${isExpanded 
                        ? 'bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl border border-indigo-200 dark:border-indigo-800 w-full' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full shadow-md hover:scale-105'
                    }
                `}
             >
               {isExpanded ? (
                 <div className="text-left">
                    <div className="flex justify-between items-center mb-2 border-b border-zinc-100 dark:border-zinc-700 pb-1">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Match Analysis</span>
                        <button className="text-zinc-400 hover:text-zinc-600">×</button>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-normal">
                        {label}
                    </p>
                 </div>
               ) : (
                 <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                    <span className="text-[10px] font-bold uppercase">Why Relevant?</span>
                 </div>
               )}
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

function CanvasArea({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: 'canvas-area',
  });

  return (
    <div
      ref={setNodeRef}
      className="min-w-[3000px] min-h-[3000px] relative"
      style={{
        backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      {children}
    </div>
  );
}

export default function AbnormalityConnectionCanvas({
  mainAbnormality,
  initialRelevantAbnormalities,
  libraryAbnormalities: initialLibraryAbnormalities,
  onAnalyze
}: AbnormalityConnectionCanvasProps) {
  const router = useRouter();
  // --- State ---
  const [libraryAbnormalities, setLibraryAbnormalities] = useState<AbnormalityBubbleUnion[]>(initialLibraryAbnormalities);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Canvas Nodes State
  const [nodes, setNodes] = useState<CanvasNode[]>([]);

  // Ref for TransformWrapper to access scale/position
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize Nodes
  useEffect(() => {
    const centerX = 1500; // Middle of 3000px canvas
    const centerY = 1500;

    const initialNodes: CanvasNode[] = [
      { id: 'main-abnormality', type: 'main', x: centerX - 600, y: centerY - 200, data: mainAbnormality },
      { id: 'magic-node', type: 'magic', x: centerX, y: centerY },
    ];

    // Position initial relevant abnormalities
    initialRelevantAbnormalities.forEach((abnormality, index) => {
      const angle = (index - (initialRelevantAbnormalities.length - 1) / 2) * 0.6; // Spread in radians
      const radius = 500;
      initialNodes.push({
        id: abnormality.id,
        type: 'abnormality',
        x: centerX + 500, // Base X offset
        y: centerY + (index - (initialRelevantAbnormalities.length - 1) / 2) * 350, // Vertical stack spread
        data: abnormality,
      });
    });

    setNodes(initialNodes);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);

    if (!over) return;

    const draggedId = active.id as string;

    // Case 1: Dragging an existing node on the canvas
    const existingNode = nodes.find(n => n.id === draggedId);
    if (existingNode) {
      const transformState = transformRef.current?.instance.transformState;
      const scale = transformState?.scale || 1;
      
      setNodes(prev => prev.map(n => {
        if (n.id === draggedId) {
          return {
            ...n,
            x: n.x + delta.x / scale,
            y: n.y + delta.y / scale
          };
        }
        return n;
      }));
      
      // If dragging a selected node, keep it selected.
      // If dragging unselected, don't necessarily select it (standard behavior)
      // But usually clicking selects, dragging doesn't necessarily clear selection.
      return;
    }

    // Case 2: Dropping from Library to Canvas
    if (over.id === 'canvas-area') {
      const libraryAbnormality = libraryAbnormalities.find(t => t.id === draggedId);
      if (libraryAbnormality) {
        const dropRect = active.rect.current.translated;
        if (!dropRect) return;

        const transformState = transformRef.current?.instance.transformState;
        const scale = transformState?.scale || 1;
        const panX = transformState?.positionX || 0;
        const panY = transformState?.positionY || 0;

        const dropX = dropRect.left + (dropRect.width / 2);
        const dropY = dropRect.top + (dropRect.height / 2);

        // Convert to canvas space
        const canvasX = (dropX - panX) / scale;
        const canvasY = (dropY - panY) / scale;

        // Add new node
        const newNode: CanvasNode = {
          id: libraryAbnormality.id,
          type: 'abnormality',
          x: canvasX - 200,
          y: canvasY - 100,
          data: libraryAbnormality
        };

        setNodes(prev => [...prev, newNode]);
        setLibraryAbnormalities(prev => prev.filter(t => t.id !== draggedId));
        setSelectedNodeId(libraryAbnormality.id); // Auto select newly dropped node

        // Analyze
        try {
          const explanation = await onAnalyze(mainAbnormality, libraryAbnormality);
          setExplanations(prev => ({ ...prev, [libraryAbnormality.id]: explanation }));
        } catch (error) {
          console.error("Analysis failed", error);
        }
      }
    }
  };

  const handleMagicClick = async () => {
    setIsAnalyzing(true);
    try {
      const relevantNodes = nodes.filter(n => n.type === 'abnormality');
      const missing = relevantNodes.filter(n => n.data && !explanations[n.id]);
      
      const results = await Promise.all(missing.map(async (node) => {
        if (!node.data) return null;
        try {
          const explanation = await onAnalyze(mainAbnormality, node.data);
          return { id: node.id, explanation };
        } catch (e) {
          return null;
        }
      }));

      const newExplanations = { ...explanations };
      results.forEach(res => {
        if (res) newExplanations[res.id] = res.explanation;
      });
      
      setExplanations(newExplanations);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNodeClick = (id: string) => {
      // If clicking the same node, deselect? Or keep selected? Usually keep selected.
      // If clicking main abnormality, maybe clear selection since it's special?
      if (id === 'main-abnormality') {
          setSelectedNodeId(null);
          return;
      }
      setSelectedNodeId(id === selectedNodeId ? null : id);
  };

  const handleCanvasClick = () => {
      // Deselect when clicking empty space
      setSelectedNodeId(null);
  };

  const activeLibraryAbnormality = libraryAbnormalities.find(t => t.id === activeId);
  const activeCanvasNode = nodes.find(n => n.id === activeId);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  
  // Node Helpers
  const getMainNode = () => nodes.find(n => n.type === 'main');
  const getMagicNode = () => nodes.find(n => n.type === 'magic');
  const getAbnormalityNodes = () => nodes.filter(n => n.type === 'abnormality');

  const mainNode = getMainNode();
  const magicNode = getMagicNode();
  const abnormalityNodes = getAbnormalityNodes();

  return (
    <div className="h-full w-full relative overflow-hidden bg-transparent">
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={0.9}
          minScale={0.2}
          maxScale={2}
          limitToBounds={false}
          centerOnInit={false}
          initialPositionX={-750}
          initialPositionY={-750}
          panning={{ excluded: ['draggable-node', 'magic-btn'] }}
          wheel={{ 
            step: 1,
            wheelDisabled: false,
            touchPadDisabled: false,
            activationKeys: []
          }}
          doubleClick={{ disabled: true }}
        >
          <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
            <div onClick={handleCanvasClick}>
                <CanvasArea>
                      {/* SVG Connections Layer */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
                        {mainNode && magicNode && (
                            <ConnectionLine 
                                start={{ x: mainNode.x + 400, y: mainNode.y + 200 }} 
                                end={{ x: magicNode.x, y: magicNode.y + 64 }}
                                color="#6366f1"
                            />
                        )}
                        
                        {magicNode && abnormalityNodes.map(node => (
                             <ConnectionLine
                                key={`conn-${node.id}`}
                                start={{ x: magicNode.x + 128, y: magicNode.y + 64 }}
                                end={{ x: node.x, y: node.y + 150 }}
                                color={explanations[node.id] ? "#22c55e" : "#64748b"}
                                label={explanations[node.id]}
                             />
                        ))}
                      </svg>

                      {/* Nodes Layer */}
                      {nodes.map((node) => (
                        <div
                          key={node.id}
                          id={node.id}
                          className="draggable-node"
                          style={{
                            position: 'absolute',
                            left: node.x,
                            top: node.y,
                            width: node.type === 'magic' ? 'auto' : '400px',
                            zIndex: 10,
                          }}
                          onClick={(e) => {
                              e.stopPropagation();
                              if (node.type === 'abnormality') handleNodeClick(node.id);
                          }}
                        >
                          {node.type === 'main' && node.data && (
                            <AbnormalityBubbleCard 
                              bubble={node.data} 
                              showFullDetails={true}
                              disableLink={true}
                            />
                          )}
                          
                          {node.type === 'magic' && (
                            <MagicNode 
                              id="magic-btn"
                              onClick={handleMagicClick}
                              isAnalyzing={isAnalyzing}
                            />
                          )}

                          {node.type === 'abnormality' && node.data && (
                             <DraggableAbnormalityCard
                               id={node.id}
                               bubble={node.data}
                               matchExplanation={explanations[node.id]}
                               disableLink={true}
                               isSelected={selectedNodeId === node.id}
                               onClick={() => handleNodeClick(node.id)}
                               onCommunicate={() => router.push(`/abnormality/${mainAbnormality.id}/communicate?target=${node.id}`)}
                             />
                          )}
                        </div>
                      ))}
                </CanvasArea>
            </div>
          </TransformComponent>
        </TransformWrapper>
        
        <FloatingDock abnormalities={libraryAbnormalities} mainAbnormality={mainAbnormality} />

        {/* Selection Action Bar - HIDDEN since we moved action to card */ }
        {/*
        {selectedNode && selectedNode.data && (
            <div className="absolute bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col gap-3 w-[300px]">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-700 pb-2">
                        Selected Abnormality
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {selectedNode.data.description}
                    </p>
                    <Link
                        href={`/abnormality/${mainAbnormality.id}/communicate?target=${selectedNode.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <span>💬</span>
                        Open Communication Channel
                    </Link>
                </div>
            </div>
        )}
        */}

        <DragOverlay>
          {activeLibraryAbnormality ? (
             <div className="w-[280px] rotate-3 cursor-grabbing opacity-90">
                <AbnormalityBubbleCard bubble={activeLibraryAbnormality} disableLink />
             </div>
          ) : activeCanvasNode && activeCanvasNode.data && activeCanvasNode.type === 'abnormality' ? (
             <div className="w-[400px] cursor-grabbing opacity-90">
                <AbnormalityBubbleCard 
                  bubble={activeCanvasNode.data} 
                  matchExplanation={explanations[activeCanvasNode.id]}
                  disableLink 
                  isSelected={true}
                />
             </div>
          ) : null}
        </DragOverlay>

      </DndContext>
    </div>
  );
}
