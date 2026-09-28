import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "963965787804";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="
        fixed bottom-5 right-5 z-50
        h-14 w-14 rounded-full
        shadow-lg
        flex items-center justify-center
        bg-green-500 hover:bg-green-600
        text-white
        transition-transform duration-200
        hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
      "
    >
      <FaWhatsapp className="h-8 w-8" />
    </a>
  );
}
