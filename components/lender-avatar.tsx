"use client"

import { getFaviconUrl, getLenderInitials } from "@/lib/lenders"

export function LenderAvatar({
  lender_name,
  lender_logo_domain,
}: {
  lender_name?: string | null
  lender_logo_domain?: string | null
}) {
  if (lender_logo_domain) {
    return (
      <div className="relative w-8 h-8 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getFaviconUrl(lender_logo_domain)}
          alt={lender_name ?? "Lender"}
          width={32}
          height={32}
          className="rounded-lg object-contain bg-white/10 p-0.5 w-8 h-8"
          onError={(e) => {
            // If favicon fails, replace with initials avatar
            const img = e.currentTarget
            const parent = img.parentElement
            if (parent) {
              img.style.display = "none"
              const fallback = parent.querySelector<HTMLElement>("[data-fallback]")
              if (fallback) fallback.style.display = "flex"
            }
          }}
        />
        {/* Hidden initials fallback, shown via onError */}
        <div
          data-fallback
          style={{ display: "none", background: "rgba(255,118,64,0.18)", color: "#ff7640" }}
          className="absolute inset-0 rounded-lg items-center justify-center text-xs font-bold"
        >
          {getLenderInitials(lender_name ?? "")}
        </div>
      </div>
    )
  }

  if (lender_name) {
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: "rgba(255, 118, 64, 0.18)", color: "#ff7640" }}
      >
        {getLenderInitials(lender_name)}
      </div>
    )
  }

  return null
}
