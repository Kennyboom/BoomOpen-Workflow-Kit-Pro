import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Edge, Node } from './types'
import { VIEW_BOX_HEIGHT, VIEW_BOX_WIDTH } from './constants'

// Animation timing
const NODE_ENTRANCE_DURATION = 0.5
const EDGE_DRAW_DURATION = 0.6
const PULSE_DURATION = 3
const PARTICLE_DURATION = 2.5

/**
 * Data flow particle animation along an edge
 */
export function DataParticle({ 
  sourceNode, 
  targetNode,
  delay = 0,
}: { 
  sourceNode: Node
  targetNode: Node
  delay?: number
}) {
  return (
    <motion.circle
      r={3}
      fill="var(--color-text-accent)"
      initial={{ 
        cx: sourceNode.x, 
        cy: sourceNode.y,
        opacity: 0,
        scale: 0,
      }}
      animate={{ 
        cx: [sourceNode.x, targetNode.x],
        cy: [sourceNode.y, targetNode.y],
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
      }}
      transition={{
        duration: PARTICLE_DURATION,
        delay,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: 'linear',
        times: [0, 0.1, 0.9, 1],
      }}
      style={{ filter: 'drop-shadow(0 0 4px var(--color-text-accent))' }}
    />
  )
}

/**
 * Edge line component with gradient and draw animation
 */
export function EdgeLine({
  edge,
  sourceNode,
  targetNode,
  isConnectedToHovered,
  prefersReducedMotion,
  delay = 0,
}: {
  edge: Edge
  sourceNode: Node
  targetNode: Node
  isConnectedToHovered: boolean
  prefersReducedMotion: boolean
  delay?: number
}) {
  const gradientId = `gradient-${edge.id}`
  
  return (
    <g>
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id={gradientId}
          x1={sourceNode.x}
          y1={sourceNode.y}
          x2={targetNode.x}
          y2={targetNode.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={sourceNode.color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={targetNode.color} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      
      {/* Edge line */}
      <motion.line
        x1={sourceNode.x}
        y1={sourceNode.y}
        x2={targetNode.x}
        y2={targetNode.y}
        stroke={`url(#${gradientId})`}
        strokeWidth={isConnectedToHovered ? 2.5 : 1.5}
        strokeLinecap="round"
        initial={prefersReducedMotion ? { opacity: 0.4 } : { pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: isConnectedToHovered ? 0.8 : 0.4,
        }}
        transition={{
          pathLength: { duration: EDGE_DRAW_DURATION, delay, ease: 'easeOut' },
          opacity: { duration: 0.3 },
        }}
        style={{ 
          filter: isConnectedToHovered 
            ? 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.3))' 
            : 'none',
        }}
      />
    </g>
  )
}

/**
 * Node circle component with hover and pulse animations
 */
export function NodeCircle({
  node,
  isHovered,
  isDimmed,
  isFocused,
  prefersReducedMotion,
  delay = 0,
  onHoverStart,
  onHoverEnd,
  onFocus,
  onBlur,
  onKeyDown,
  onTap,
  decorative = false,
}: {
  node: Node
  isHovered: boolean
  isDimmed: boolean
  isFocused: boolean
  prefersReducedMotion: boolean
  delay?: number
  onHoverStart: () => void
  onHoverEnd: () => void
  onFocus: () => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onTap?: () => void
  /** Mouse-only decoration: not focusable and hidden from assistive technology. */
  decorative?: boolean
}) {
  const scale = isHovered ? 1.2 : 1
  const opacity = isDimmed ? 0.4 : 1
  
  // Pulse animation for metric nodes
  const pulseAnimation = !prefersReducedMotion && node.type === 'metric' 
    ? { scale: [1, 1.08, 1] }
    : !prefersReducedMotion && node.type === 'orchestrator'
    ? { scale: [1, 1.05, 1] }
    : {}
  
  return (
    <motion.g
      initial={prefersReducedMotion ? { opacity: 1 } : { scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: prefersReducedMotion ? 1 : scale, 
        opacity,
        ...pulseAnimation,
      }}
      transition={{
        scale: isHovered 
          ? { duration: 0.2 } 
          : pulseAnimation.scale 
          ? { duration: PULSE_DURATION, repeat: Infinity, ease: 'easeInOut' }
          : { duration: NODE_ENTRANCE_DURATION, delay },
        opacity: { duration: NODE_ENTRANCE_DURATION, delay },
      }}
      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
    >
      {/* Glow effect */}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.size + 6}
        fill="none"
        stroke={node.color}
        strokeWidth={2}
        opacity={isHovered || isFocused ? 0.4 : 0.1}
        style={{ 
          filter: `blur(${isHovered || isFocused ? 4 : 2}px)`,
          transition: 'opacity 0.2s, filter 0.2s',
        }}
      />
      
      {/* Main node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.size}
        fill={node.color}
        opacity={0.9}
        style={{ 
          filter: isHovered || isFocused 
            ? `drop-shadow(0 0 12px ${node.color})` 
            : `drop-shadow(0 0 6px ${node.color})`,
          transition: 'filter 0.2s',
        }}
      />
      
      {/* Inner highlight */}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.size * 0.6}
        fill={node.color}
        opacity={0.3}
        style={{ mixBlendMode: 'overlay' }}
      />
      
      {/* Interactive hit area (invisible, larger for touch) */}
      <circle
        cx={node.x}
        cy={node.y}
        r={Math.max(node.size + 12, 22)} // Min 44px touch target
        fill="transparent"
        style={{ cursor: 'pointer' }}
        data-hit-area=""
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onClick={onTap}
        {...(decorative
          ? {}
          : {
              onFocus,
              onBlur,
              onKeyDown,
              tabIndex: 0,
              role: 'button',
              'aria-label': `${node.type === 'orchestrator' ? 'Orchestrator' : node.type === 'metric' ? 'Metric' : 'Agent'}: ${node.label}${node.agentInfo ? ` - ${node.agentInfo.description}` : ''}`,
            })}
      />
    </motion.g>
  )
}

/**
 * Node label component
 */
export function NodeLabel({
  node,
  isHovered,
  isDimmed,
  prefersReducedMotion,
  delay = 0,
}: {
  node: Node
  isHovered: boolean
  isDimmed: boolean
  prefersReducedMotion: boolean
  delay?: number
}) {
  // Metric nodes show value, others show label
  const displayLabel = node.type === 'metric' 
    ? node.label.split(' ').slice(1).join(' ') // Remove emoji for cleaner label
    : node.label
  
  return (
    <motion.text
      x={node.x}
      y={node.y + node.size + 16}
      textAnchor="middle"
      fill="var(--color-text-secondary)"
      fontSize={node.type === 'metric' ? 11 : 10}
      fontWeight={node.type === 'orchestrator' ? 600 : 500}
      fontFamily="var(--font-sans)"
      initial={prefersReducedMotion ? { opacity: 0.8 } : { opacity: 0, y: node.y + node.size + 10 }}
      animate={{ 
        opacity: isDimmed ? 0.3 : isHovered ? 1 : 0.8,
        y: node.y + node.size + 16,
      }}
      transition={{ duration: 0.3, delay: delay + 0.2 }}
      className="pointer-events-none select-none hidden md:block"
      aria-hidden="true"
    >
      {displayLabel}
    </motion.text>
  )
}

/**
 * Tooltip component for hovered nodes
 */
export function NodeTooltip({ 
  node, 
  containerRef,
}: { 
  node: Node
  containerRef: React.RefObject<SVGSVGElement | null>
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    if (containerRef.current) {
      const svg = containerRef.current
      const rect = svg.getBoundingClientRect()
      const scaleX = rect.width / VIEW_BOX_WIDTH
      const scaleY = rect.height / VIEW_BOX_HEIGHT
      
      setPosition({
        x: node.x * scaleX,
        y: (node.y - node.size - 50) * scaleY,
      })
    }
  }, [node, containerRef])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.2 }}
      className="absolute z-20 pointer-events-none"
      style={{ 
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
      }}
      role="tooltip"
      aria-live="polite"
    >
      <div className="bg-bg-card border border-border-primary rounded-lg px-3 py-2 shadow-lg">
        <div className="text-sm font-semibold text-text-primary">
          {node.agentInfo?.role || node.label}
        </div>
        {node.agentInfo?.description && (
          <div className="text-xs text-text-secondary mt-0.5">
            {node.agentInfo.description}
          </div>
        )}
      </div>
    </motion.div>
  )
}

