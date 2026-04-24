import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhatsAppButton() {
  const whatsappNumber = "971526027080"; 
  
  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors"
      title="تواصل معنا عبر واتساب"
    >
      <MessageCircle size={32} />
    </motion.a>
  );
}
