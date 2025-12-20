import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Briefcase, ExternalLink } from 'lucide-react'
import { useGameStore } from '@/core/model/game-store'
import { cn } from '@/shared/utils/utils'
import { Button } from '@/shared/ui/button'
import { useState, useRef, useEffect } from 'react'
import { OfferDetailsDialog } from '@/features/notifications/offer-details-dialog'
import type { GameOffer } from '@/core/types/game-offers.types'
import type { Notification as Notification } from '@/core/types'

type OfferReceivedNotificationData = {
  type: 'offer_received'
  offerId: string
}

type JobOfferNotificationData = {
  applicationId: string
}

export function NotificationsMenu() {
  const {
    notifications,
    dismissNotification,
    acceptJobOffer,
    markNotificationAsRead,
    offers,
    acceptOffer,
    rejectOffer,
  } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<GameOffer | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAcceptOffer = (notifId: string, applicationId: string) => {
    acceptJobOffer(applicationId)
  }

  const handleNotificationClick = (notif: Notification) => {
    const data = notif.data

    if (isOfferReceivedData(data)) {
      const offer = offers.find((o) => o.id === data.offerId)
      if (offer) {
        setSelectedOffer(offer)
        setIsOpen(false)
        markNotificationAsRead(notif.id)
      }
    }
  }

  function isOfferReceivedData(data: unknown): data is OfferReceivedNotificationData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      (data as any).type === 'offer_received' &&
      'offerId' in data
    )
  }

  function isJobOfferData(data: unknown): data is JobOfferNotificationData {
    return typeof data === 'object' && data !== null && 'applicationId' in data
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-black/20">
            {displayCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-[80vh] overflow-y-auto bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-black/95 backdrop-blur-xl z-10">
              <h3 className="font-bold text-white">Уведомления</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => notifications.forEach((n) => markNotificationAsRead(n.id))}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Прочитать все
                </button>
              )}
            </div>

            <div className="p-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Нет новых уведомлений</p>
                </div>
              ) : (
                notifications.map((notif: Notification) => {
                  const isOfferNotif = isOfferReceivedData(notif.data)

                  return (
                    <div
                      key={notif.id}
                      onClick={() => isOfferNotif && handleNotificationClick(notif)}
                      className={cn(
                        'relative p-3 rounded-xl border transition-all duration-200 group',
                        isOfferNotif ? 'cursor-pointer' : '',
                        notif.isRead
                          ? 'bg-white/5 border-white/5 hover:bg-white/10'
                          : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
                      )}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={cn(
                                'font-semibold text-sm',
                                notif.isRead ? 'text-white/90' : 'text-white',
                              )}
                            >
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed mb-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/30 uppercase tracking-wider">
                              {notif.date}
                            </span>
                            {isOfferNotif && (
                              <span className="text-[10px] text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Открыть <ExternalLink className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {notif.type === 'job_offer' &&
                            isJobOfferData(notif.data) &&
                            !isOfferNotif && (
                              <div className="mt-3 flex gap-2">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white border-none"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const data = notif.data
                                    if (isJobOfferData(data)) {
                                      handleAcceptOffer(notif.id, data.applicationId)
                                    }
                                  }}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Принять
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-white/20 text-white hover:bg-white/10"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    dismissNotification(notif.id)
                                  }}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Отклонить
                                </Button>
                              </div>
                            )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            dismissNotification(notif.id)
                          }}
                          className="text-white/20 hover:text-white/60 transition-colors p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedOffer && (
        <OfferDetailsDialog
          isOpen={!!selectedOffer}
          onClose={() => setSelectedOffer(null)}
          offer={selectedOffer}
          onAccept={() => {
            acceptOffer(selectedOffer.id)
            setSelectedOffer(null)
          }}
          onReject={() => {
            rejectOffer(selectedOffer.id)
            setSelectedOffer(null)
          }}
        />
      )}
    </div>
  )
}
