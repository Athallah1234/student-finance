'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const requestPermission = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      toast.error('Browser Anda tidak mendukung notifikasi push.');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === 'granted') {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Placeholder VAPID Key (Public)
        const publicVapidKey = 'BEl62i_SJbx89YI2b-p3Nt9M3GuEAtSnu989DsAt6-3Z-xV12Z-xV12Z-xV12Z-xV12Z-xV12Z-xV12Z-xV12'; 
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: { 'Content-Type': 'application/json' }
        });

        toast.success('Pusat Notifikasi Aktif!');
        new Notification('Pusat Notifikasi Aktif', {
          body: 'Anda akan menerima update keuangan secara real-time.',
          icon: '/favicon.ico'
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengaktifkan push notifikasi.');
    }
  };

  if (permission === 'granted' && !showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-card border shadow-2xl rounded-3xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Bell size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">Aktifkan Notifikasi?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Dapatkan pengingat tagihan, batas budget, dan tips keuangan langsung di perangkat Anda.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={requestPermission}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                >
                  Ya, Aktifkan
                </button>
                <button 
                  onClick={() => setShowPrompt(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-all"
                >
                  Nanti
                </button>
              </div>
            </div>
            <button onClick={() => setShowPrompt(false)} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
