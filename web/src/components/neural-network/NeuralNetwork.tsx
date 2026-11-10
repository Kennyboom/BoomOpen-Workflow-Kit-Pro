import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion, useIsMobile } from '../../hooks'
import { generateNeuralNetworkData, getNodeById, getConnectedEdges } from '../../data/neuralNetwork'
import type { NeuralNetworkProps, NeuralNetworkData } from './types'
import {
  DataParticle,
  EdgeLine,
  NodeCircle,
  NodeLabel,
  NodeTooltip,
} from './NeuralNetworkParts'
import { VIEW_BOX_HEIGHT, VIEW_BOX_WIDTH } from './constants'

// Animation timing
const ANIMATION_STAGGER = 0.1

/**
 * Neural Network visualization component
 * Displays an animated graph of agents, orchestrator, and metrics
 */
export function NeuralNetwork({
  metrics = [],
  className = '',
  onNodeHover,
  animationDelay = 0,
  decorative = false,
}: NeuralNetworkProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)
  const [tappedNodeId, setTappedNodeId] = useState<string | null>(null)
  
  // Generate network data
  const networkData = useMemo<NeuralNetworkData>(
    () => generateNeuralNetworkData(metrics, isMobile),
    [metrics, isMobile]
  )
  
  // Get connected edges for highlighting
  const connectedEdgeIds = useMemo(() => {
    if (!hoveredNodeId && !focusedNodeId) return new Set<string>()
    const activeId = hoveredNodeId || focusedNodeId
    if (!activeId) return new Set<string>()
    return new Set(getConnectedEdges(networkData, activeId).map(e => e.id))
  }, [hoveredNodeId, focusedNodeId, networkData])
  
  // Handlers
  const handleHoverStart = useCallback((nodeId: string) => {
    setHoveredNodeId(nodeId)
    onNodeHover?.(nodeId)
  }, [onNodeHover])
  
  const handleHoverEnd = useCallback(() => {
    setHoveredNodeId(null)
    onNodeHover?.(null)
  }, [onNodeHover])
  
  const handleFocus = useCallback((nodeId: string) => {
    setFocusedNodeId(nodeId)
  }, [])
  
  const handleBlur = useCallback(() => {
    setFocusedNodeId(null)
  }, [])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent, nodeId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setHoveredNodeId(prev => prev === nodeId ? null : nodeId)
      setTappedNodeId(prev => prev === nodeId ? null : nodeId)
    } else if (e.key === 'Escape') {
      setHoveredNodeId(null)
      setFocusedNodeId(null)
      setTappedNodeId(null)
    }
  }, [])
  
  // Handle tap on mobile (tap to show, tap again or outside to dismiss)
  const handleNodeTap = useCallback((nodeId: string) => {
    if (isMobile) {
      setTappedNodeId(prev => prev === nodeId ? null : nodeId)
    }
  }, [isMobile])
  
  // Dismiss tooltip when tapping outside on mobile
  useEffect(() => {
    if (!isMobile || !tappedNodeId) return
    
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target
      if (containerRef.current && target instanceof Node && !containerRef.current.contains(target)) {
        setTappedNodeId(null)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMobile, tappedNodeId])
  
  // Get active node for tooltip (hover on desktop, tap on mobile)
  const activeNodeId = isMobile ? tappedNodeId : (hoveredNodeId || focusedNodeId)
  const activeNode = activeNodeId ? getNodeById(networkData, activeNodeId) : null
  
  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <motion.svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: animationDelay }}
        {...(decorative
          ? { 'aria-hidden': true, focusable: 'false' }
          : {
              role: 'img',
              'aria-label':
                'Neural network visualization showing AI agent orchestration with connected nodes representing specialist agents and performance metrics',
            })}
      >
        {/* Edges layer (rendered first, behind nodes) */}
        <g className="edges-layer">
          {networkData.edges.map((edge, index) => {
            const sourceNode = getNodeById(networkData, edge.source)
            const targetNode = getNodeById(networkData, edge.target)
            
            if (!sourceNode || !targetNode) return null
            
            return (
              <EdgeLine
                key={edge.id}
                edge={edge}
                sourceNode={sourceNode}
                targetNode={targetNode}
                isConnectedToHovered={connectedEdgeIds.has(edge.id)}
                prefersReducedMotion={prefersReducedMotion}
                delay={animationDelay + 0.3 + index * 0.05}
              />
            )
          })}
        </g>
        
        {/* Data flow particles (only on animated edges, skip on reduced motion) */}
        {!prefersReducedMotion && (
          <g className="particles-layer">
            {networkData.edges
              .filter(edge => edge.animated)
              .map((edge, index) => {
                const sourceNode = getNodeById(networkData, edge.source)
                const targetNode = getNodeById(networkData, edge.target)
                
                if (!sourceNode || !targetNode) return null
                
                return (
                  <DataParticle
                    key={`particle-${edge.id}`}
                    sourceNode={sourceNode}
                    targetNode={targetNode}
                    delay={animationDelay + 1.5 + index * 0.3}
                  />
                )
              })}
          </g>
        )}
        
        {/* Nodes layer */}
        <g className="nodes-layer">
          {networkData.nodes.map((node, index) => (
            <NodeCircle
              key={node.id}
              node={node}
              isHovered={hoveredNodeId === node.id}
              isDimmed={!!hoveredNodeId && hoveredNodeId !== node.id && !connectedEdgeIds.has(`edge-${node.id}`) && !connectedEdgeIds.has(`edge-orchestrator-${node.id}`)}
              isFocused={focusedNodeId === node.id}
              prefersReducedMotion={prefersReducedMotion}
              delay={animationDelay + index * ANIMATION_STAGGER}
              onHoverStart={() => handleHoverStart(node.id)}
              onHoverEnd={handleHoverEnd}
              onFocus={() => handleFocus(node.id)}
              onBlur={handleBlur}
              onKeyDown={(e) => handleKeyDown(e, node.id)}
              onTap={() => handleNodeTap(node.id)}
              decorative={decorative}
            />
          ))}
        </g>
        
        {/* Labels layer (desktop only) */}
        <g className="labels-layer">
          {networkData.nodes.map((node, index) => (
            <NodeLabel
              key={`label-${node.id}`}
              node={node}
              isHovered={hoveredNodeId === node.id || focusedNodeId === node.id}
              isDimmed={!!hoveredNodeId && hoveredNodeId !== node.id}
              prefersReducedMotion={prefersReducedMotion}
              delay={animationDelay + index * ANIMATION_STAGGER}
            />
          ))}
        </g>
      </motion.svg>
      
      {/* Tooltip overlay */}
      <AnimatePresence>
        {activeNode && (
          <NodeTooltip 
            node={activeNode} 
            containerRef={svgRef}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
