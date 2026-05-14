import { prisma } from "@/lib/prisma"
import { HeaderNav } from "./HeaderNav"

export async function Header() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } }).catch(() => null)
  const showBanner = settings?.announcementActive && settings.announcementText

  return (
    <>
      {showBanner && (
        <div className="bg-primary text-on-primary text-center py-2 px-4 text-xs font-semibold tracking-wider">
          {settings.announcementText}
        </div>
      )}
      <HeaderNav />
    </>
  )
}
