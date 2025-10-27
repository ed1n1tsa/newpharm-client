import {
    User,
    ClipboardList,
    ShoppingCart,
    MessageCircle,
    Boxes,
    Stethoscope,
    Droplets,
    Video,
    Home,
    MoreHorizontal,
  } from 'lucide-react'
  
  export const navItems = [
    { href: '/client/products', label: 'Аптека', icon: Boxes, mobile: true },
    { href: '/client/orders', label: 'Заказы', icon: ClipboardList, mobile: true },
    { href: '/client/consultations', label: 'Врачи', icon: Stethoscope, mobile: true },
    { href: '/client/iv-therapy', label: 'IV-терапия', icon: Droplets, mobile: true },
    { href: '/client/doctors', label: 'Консультации', icon: Video, mobile: false },
    { href: '/client/certificates', label: 'Справки', icon: MessageCircle, mobile: false },
    { href: '/client/profile', label: 'Профиль', icon: User, mobile: false },
    { href: '/client/cart', label: 'Корзина', icon: ShoppingCart, mobile: false },
    { href: '/client/more', label: 'Ещё', icon: MoreHorizontal, mobile: true, mobileOnly: true },
  ]
  