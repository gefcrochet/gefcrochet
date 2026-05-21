"use client"

export function WhatsAppButton() {
  const href =
    "https://api.whatsapp.com/send/?phone=390656559587&text&type=phone_number&app_absent=0"

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contattaci su WhatsApp"
      className={[
        // posizione fissa: sopra la bottom nav su mobile, angolo in basso a destra su desktop
        "fixed right-4 bottom-[88px] md:right-6 md:bottom-6 z-50",
        // forma e colore
        "flex items-center justify-center w-14 h-14 rounded-full",
        "bg-[#25D366] text-white shadow-lg",
        // interazioni
        "transition-transform duration-200 hover:scale-110 active:scale-95",
        // tooltip visibile su desktop al hover
        "group",
      ].join(" ")}
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.468-2.004A15.933 15.933 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0Zm0 29.333a13.27 13.27 0 0 1-6.773-1.854l-.486-.29-5.027 1.189 1.215-4.896-.318-.503A13.258 13.258 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333Zm7.27-9.874c-.398-.2-2.355-1.162-2.72-1.295-.366-.133-.632-.2-.899.2-.266.398-1.032 1.295-1.265 1.561-.233.266-.466.3-.864.1-.398-.2-1.68-.619-3.2-1.974-1.182-1.055-1.98-2.358-2.212-2.756-.233-.398-.025-.613.175-.812.18-.179.398-.466.597-.699.2-.233.266-.398.398-.664.133-.266.067-.499-.033-.699-.1-.2-.9-2.168-1.232-2.966-.325-.778-.655-.673-.899-.685l-.765-.013c-.266 0-.699.1-1.065.499-.366.398-1.398 1.367-1.398 3.333 0 1.966 1.432 3.865 1.632 4.131.2.266 2.818 4.3 6.827 6.031.954.412 1.699.658 2.28.843.958.305 1.83.262 2.52.159.768-.115 2.355-.963 2.688-1.893.333-.93.333-1.727.233-1.893-.1-.167-.366-.267-.765-.466Z" />
      </svg>

      {/* tooltip desktop */}
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-xs text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 md:block hidden">
        Scrivici su WhatsApp
      </span>
    </a>
  )
}
