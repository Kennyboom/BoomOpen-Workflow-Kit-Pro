import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

const TRAIL_SLOTS = 16
const TRAIL_SAMPLE_MS = 65
const TRAIL_LIFETIME_MS = 1150

const VERTEX_SHADER_SOURCE = `
attribute vec4 aPoint;
uniform vec2 uSize;
uniform float uTime;
uniform float uScroll;
uniform float uDpr;
uniform float uCell;
uniform vec3 uPointer;
uniform vec3 uTrail[16];

varying float vAlpha;
varying float vHeat;
varying float vKind;

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float len2 = dot(ab, ab);
  float t = len2 > 0.0001 ? clamp(dot(p - a, ab) / len2, 0.0, 1.0) : 0.0;
  return length(p - (a + ab * t));
}

void main() {
  float visible = step(0.11, aPoint.z);
  float worldY = aPoint.y + uScroll * 0.24;

  vec2 p = aPoint.xy;
  p.x += sin(worldY * 0.012 - uTime * 0.56) * 2.6;
  p.y += sin(aPoint.x * 0.009 + worldY * 0.004 - uTime * 0.42) * 3.0;

  float waveA = sin(aPoint.x * 0.0068 + worldY * 0.0052 - uTime * 0.36);
  float waveB = cos(aPoint.x * 0.0046 - worldY * 0.0074 + uTime * 0.28);
  float current = 0.5 + 0.5 * (waveA * 0.58 + waveB * 0.42);

  vec2 delta = p - uPointer.xy;
  float dist = length(delta);
  float proximity = exp(-(dist * dist) / (162.0 * 162.0)) * uPointer.z;
  vec2 away = dist > 0.5 ? (delta / dist) : vec2(0.0, -1.0);
  p += away * proximity * 17.0;

  float trailHeat = 0.0;
  for (int i = 0; i < 15; i++) {
    float lifeA = uTrail[i].z;
    float lifeB = uTrail[i + 1].z;
    if (lifeA > 0.01 && lifeB > 0.01) {
      float dSeg = segDist(p, uTrail[i].xy, uTrail[i + 1].xy);
      float segLife = min(lifeA, lifeB);
      float w = exp(-(dSeg * dSeg) / (74.0 * 74.0)) * smoothstep(0.0, 0.85, segLife);
      trailHeat = max(trailHeat, w);
    }
  }

  float vDepth = clamp(p.y / max(uSize.y, 1.0), 0.0, 1.0);
  float baseAlpha = (0.042 + 0.135 * pow(current, 1.55)) * (0.72 + 0.45 * vDepth);

  vAlpha = baseAlpha * visible;
  vHeat = clamp(max(proximity * 0.88, trailHeat * 0.64), 0.0, 1.0) * visible;
  vKind = aPoint.w;

  vec2 clip = (p / max(uSize, vec2(1.0))) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = (min(uCell * 0.82, 5.2) + vHeat * 1.25) * uDpr;
}
`

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

varying float vAlpha;
varying float vHeat;
varying float vKind;

void main() {
  if (vAlpha <= 0.001 && vHeat <= 0.001) {
    discard;
  }

  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float glyph = 0.0;

  if (vKind < 0.5) {
    glyph = 1.0 - smoothstep(0.16, 0.24, d);
  } else if (vKind < 1.5) {
    glyph = (1.0 - smoothstep(0.35, 0.43, d)) * smoothstep(0.12, 0.20, d);
  } else {
    float b1 = 1.0 - smoothstep(0.11, 0.16, max(abs(uv.x + 0.125), abs(uv.y + 0.125)));
    float b2 = 1.0 - smoothstep(0.11, 0.16, max(abs(uv.x - 0.125), abs(uv.y - 0.125)));
    glyph = max(b1, b2);
  }

  float alpha = glyph * mix(vAlpha, 0.72, vHeat);
  vec3 restCol = vec3(0.76, 0.85, 0.98);
  vec3 wakeCol = mix(vec3(0.54, 0.84, 1.0), vec3(1.0, 1.0, 1.0), smoothstep(0.25, 0.9, vHeat));
  vec3 col = mix(restCol, wakeCol, clamp(vHeat * 1.25, 0.0, 1.0));

  gl_FragColor = vec4(col * alpha, alpha);
}
`

interface TrailPoint {
  x: number
  y: number
  bornAt: number
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createGlyphProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs)
    if (fs) gl.deleteShader(fs)
    return null
  }
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

function detectSoftwareRenderer(gl: WebGLRenderingContext): boolean {
  const dbg = gl.getExtension('WEBGL_debug_renderer_info')
  if (!dbg) return false
  const renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) ?? '').toLowerCase()
  return /swiftshader|llvmpipe|softpipe|lavapipe|software|basic render/.test(renderer)
}

function buildGridBuffer(width: number, height: number, cell: number): { data: Float32Array; count: number } {
  const cols = Math.ceil(width / cell) + 1
  const rows = Math.ceil(height / cell) + 1
  const count = cols * rows
  const data = new Float32Array(count * 4)
  let offset = 0
  for (let row = 0; row < rows; row++) {
    const y = row * cell + cell * 0.5
    for (let col = 0; col < cols; col++) {
      const x = col * cell + cell * 0.5
      const hash = Math.abs(Math.sin((col * 127.1 + row * 311.7) * 0.017453) * 43758.5453) % 1
      const kind = (col * 7 + row * 13) % 3
      data[offset++] = x
      data[offset++] = y
      data[offset++] = hash
      data[offset++] = kind
    }
  }
  return { data, count }
}

/**
 * Single-draw-call WebGL 1 procedural micro-glyph field inspired by treg.to's closing canvas:
 * renders dots, hollow micro-rings, and 2-square checkers with radial cursor repulsion and a 16-point comet wake.
 */
export function CosmicGlyphCanvas() {
  const reduceMotion = Boolean(useReducedMotion())
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (reduceMotion || typeof window === 'undefined') return
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    })
    if (!gl) return

    const program = createGlyphProgram(gl)
    if (!program) return

    const isSoftware = detectSoftwareRenderer(gl)
    const buffer = gl.createBuffer()
    if (!buffer) {
      gl.deleteProgram(program)
      return
    }

    const aPoint = gl.getAttribLocation(program, 'aPoint')
    const uSize = gl.getUniformLocation(program, 'uSize')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uScroll = gl.getUniformLocation(program, 'uScroll')
    const uDpr = gl.getUniformLocation(program, 'uDpr')
    const uCell = gl.getUniformLocation(program, 'uCell')
    const uPointer = gl.getUniformLocation(program, 'uPointer')
    const uTrail = gl.getUniformLocation(program, 'uTrail[0]')

    let cssW = 1
    let cssH = 1
    let dpr = 1
    let cell = 7
    let pointCount = 0

    const syncSize = () => {
      cssW = Math.max(1, window.innerWidth)
      cssH = Math.max(1, window.innerHeight)
      dpr = isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 1.25)
      cell = isSoftware ? 9.5 : cssW < 768 ? 8.2 : 6.8
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      const grid = buildGridBuffer(cssW, cssH, cell)
      pointCount = grid.count
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, grid.data, gl.STATIC_DRAW)
    }

    syncSize()
    gl.useProgram(program)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(aPoint)
    gl.vertexAttribPointer(aPoint, 4, gl.FLOAT, false, 16, 0)

    let targetX = cssW * 0.5
    let targetY = cssH * 0.5
    let px = targetX
    let py = targetY
    let targetPower = 0
    let power = 0
    let lastTrailSample = 0
    const trail: TrailPoint[] = []
    const trailUniformData = new Float32Array(TRAIL_SLOTS * 3)

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      if (targetPower === 0) {
        px = targetX
        py = targetY
      }
      targetPower = 1
    }
    const onPointerLeave = () => {
      targetPower = 0
    }

    let rafId = 0
    let lastNow = performance.now()
    const startNow = lastNow

    const tick = (now: number) => {
      rafId = 0
      if (document.hidden) return
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) * 0.001))
      lastNow = now

      const follow = 1 - Math.exp(-dt * 9.5)
      px += (targetX - px) * follow
      py += (targetY - py) * follow
      power += (targetPower - power) * (1 - Math.exp(-dt * (targetPower > 0 ? 5.5 : 2.8)))

      if (power > 0.05 && now - lastTrailSample >= TRAIL_SAMPLE_MS) {
        lastTrailSample = now
        trail.unshift({ x: px, y: py, bornAt: now })
        if (trail.length > TRAIL_SLOTS) trail.length = TRAIL_SLOTS
      }

      while (trail.length > 0 && now - trail[trail.length - 1].bornAt > TRAIL_LIFETIME_MS) {
        trail.pop()
      }

      trailUniformData.fill(0)
      for (let i = 0; i < trail.length && i < TRAIL_SLOTS; i++) {
        const life = Math.max(0, 1 - (now - trail[i].bornAt) / TRAIL_LIFETIME_MS)
        trailUniformData[i * 3] = trail[i].x
        trailUniformData[i * 3 + 1] = trail[i].y
        trailUniformData[i * 3 + 2] = life
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uSize, cssW, cssH)
      gl.uniform1f(uTime, (now - startNow) * 0.001)
      gl.uniform1f(uScroll, window.scrollY || 0)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uCell, cell)
      gl.uniform3f(uPointer, px, py, power)
      gl.uniform3fv(uTrail, trailUniformData)
      gl.drawArrays(gl.POINTS, 0, pointCount)

      rafId = window.requestAnimationFrame(tick)
    }

    const onVisibilityChange = () => {
      if (!document.hidden && rafId === 0) {
        lastNow = performance.now()
        rafId = window.requestAnimationFrame(tick)
      }
    }

    window.addEventListener('resize', syncSize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    rafId = window.requestAnimationFrame(tick)

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', syncSize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [reduceMotion])

  if (reduceMotion) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-glyph-canvas="active"
      className="pointer-events-none absolute inset-0 size-full"
    />
  )
}
