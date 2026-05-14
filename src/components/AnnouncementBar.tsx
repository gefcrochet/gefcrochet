import { unstable_noStore as noStore } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function AnnouncementBar() {
  noStore()
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } }).catch(() => null)
  if (!settings?.announcementActive || !settings.announcementText) return null
  return (
    <div className="bg-primary text-on-primary text-center py-2 px-4 text-xs font-semibold tracking-wider">
      {settings.announcementText}
    </div>
  )
}
