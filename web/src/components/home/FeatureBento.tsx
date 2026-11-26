import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'

/**
 * 2x2 Cosmic 3D Crystal Bento cards showcasing BoomOpen Workflow Kit's 4 core capabilities
 * with bespoke deep-space optical artwork and ultra-concise 1-line captions.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]'

interface BentoCardSpec {
  readonly id: string
  readonly badge: string
  readonly imageSrc: string
  readonly imageAlt: string
  readonly title: string
  readonly caption: string
  readonly to: string
}

const BENTO_CARDS: Record<Locale, readonly BentoCardSpec[]> = {
  vi: [
    {
      id: 'autopilot',
      badge: '/autopilot',
      imageSrc: '/assets/bento-autopilot.jpg',
      imageAlt: 'Khối kính mờ 3D nối tiếp trên tia sáng xanh biểu trưng lộ trình nhiều phase',
      title: 'Tự code trọn dự án nhiều Phase',
      caption: 'Đọc docs/, tự chia lộ trình và chạy xuyên suốt tới đích.',
      to: '/commands?q=autopilot',
    },
    {
      id: 'reconcile',
      badge: 'Wave 2.5',
      imageSrc: '/assets/bento-reconcile.jpg',
      imageAlt: 'Khối lập phương kính 3D khớp khít hai nửa đối soát đặc tả và mã nguồn',
      title: 'Đối soát đủ 100% tính năng',
      caption: 'Tự phát hiện và code bù mọi yêu cầu bị bỏ sót.',
      to: '/architecture',
    },
    {
      id: 'council',
      badge: '/conduct',
      imageSrc: '/assets/bento-council.jpg',
      imageAlt: 'Ba quả cầu kính 3D hội tụ ánh sáng vào lăng kính trung tâm',
      title: 'Hội đồng 3 AI chéo hãng',
      caption: 'Claude, Codex và Gemini cùng phản biện tìm lời giải.',
      to: '/commands?q=conduct',
    },
    {
      id: 'audit',
      badge: '/audit',
      imageSrc: '/assets/bento-audit.jpg',
      imageAlt: 'Khiên kính mờ 3D được bao quanh bởi vòng quỹ đạo bảo vệ',
      title: 'Kiểm toán & Bảo mật đa vòng',
      caption: 'Rà soát liên kết, chống lộ dữ liệu và rollback 1 chạm.',
      to: '/commands?q=audit',
    },
  ],
  en: [
    {
      id: 'autopilot',
      badge: '/autopilot',
      imageSrc: '/assets/bento-autopilot.jpg',
      imageAlt: 'Four frosted 3D glass milestone blocks aligned on a sapphire light beam',
      title: 'Autonomous Multi-Phase Build',
      caption: 'Reads docs/ and builds every phase across sessions.',
      to: '/commands?q=autopilot',
    },
    {
      id: 'reconcile',
      badge: 'Wave 2.5',
      imageSrc: '/assets/bento-reconcile.jpg',
      imageAlt: 'Precision interlocking two-half 3D optical glass cube',
      title: 'Zero-Omission Spec Reconcile',
      caption: 'Detects and auto-builds any skipped spec requirement.',
      to: '/architecture',
    },
    {
      id: 'council',
      badge: '/conduct',
      imageSrc: '/assets/bento-council.jpg',
      imageAlt: 'Three colored 3D glass spheres converging beams into a crystal prism',
      title: 'Cross-Model AI Council',
      caption: 'Claude, Codex, and Gemini debate the strongest solution.',
      to: '/commands?q=conduct',
    },
    {
      id: 'audit',
      badge: '/audit',
      imageSrc: '/assets/bento-audit.jpg',
      imageAlt: 'Sculptural frosted 3D glass shield encircled by an orbital ring',
      title: 'Multi-Round Security Audit',
      caption: 'Deep logic & leak scans with 1-click Git rollback.',
      to: '/commands?q=audit',
    },
  ],
}

export function FeatureBento() {
  const { locale } = useLanguage()
  const cards = BENTO_CARDS[locale]

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
      {cards.map((card) => (
        <article
          key={card.id}
          className="specular-surface group relative overflow-hidden rounded-[32px] border border-indigo-200/[0.14] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/35 hover:shadow-[0_28px_64px_-14px_rgba(14,165,233,0.20)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#050816] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-16 after:bg-gradient-to-t after:from-[#090F24] after:to-transparent">
            <img
              src={card.imageSrc}
              alt={card.imageAlt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
            <span className="absolute top-4 left-4 z-10 rounded-full border border-indigo-200/[0.22] bg-[#070C1F]/80 px-3.5 py-1 font-mono text-xs font-semibold text-sky-200 backdrop-blur-md">
              {card.badge}
            </span>
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-indigo-200/[0.08] bg-[#090F24]/95 p-7 sm:p-8">
            <div className="min-w-0 space-y-1.5">
              <h3 className="font-display text-xl leading-snug font-bold tracking-[-0.028em] text-white sm:text-2xl">
                {card.title}
              </h3>
              <p className="max-w-[46ch] text-sm leading-relaxed text-slate-300 sm:text-base">
                {card.caption}
              </p>
            </div>

            <Link
              to={card.to}
              aria-label={card.title}
              className={clsx(
                'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-indigo-200/[0.18] bg-white/[0.06] text-slate-200 transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-[#050816] motion-reduce:transition-none after:absolute after:inset-0 no-underline',
                FOCUS_RING,
              )}
            >
              <ArrowUpRight aria-hidden="true" className="size-5" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
