import { Cake, Plane, Heart, Gift, Star, Music, Coffee, Camera, Home, GraduationCap, Briefcase, Baby } from 'lucide-react';

// Event type configuration with icons and colors
export const EVENT_TYPE_Config: Record<string, {
    icon: any;
    bgColor: string;
    iconColor: string;
    label: string;
    defaultImage?: string;
}> = {
    '纪念日': {
        icon: Heart,
        bgColor: 'bg-pink-100 dark:bg-pink-900/30',
        iconColor: 'text-pink-500',
        label: '纪念日',
        defaultImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&h=200&fit=crop'
    },
    '生日': {
        icon: Cake,
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-500',
        label: '生日',
        defaultImage: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=200&h=200&fit=crop'
    },
    '结婚': {
        icon: Heart,
        bgColor: 'bg-rose-100 dark:bg-rose-900/30',
        iconColor: 'text-rose-500',
        label: '结婚',
        defaultImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop'
    },
    '礼物': {
        icon: Gift,
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-500',
        label: '礼物',
        defaultImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop'
    },
    '旅行': {
        icon: Plane,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-500',
        label: '旅行',
        defaultImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=200&fit=crop'
    },
    '约会': {
        icon: Coffee,
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-500',
        label: '约会',
        defaultImage: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200&h=200&fit=crop'
    },
    '纪念照': {
        icon: Camera,
        bgColor: 'bg-teal-100 dark:bg-teal-900/30',
        iconColor: 'text-teal-500',
        label: '纪念照',
        defaultImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop'
    },
    '音乐会': {
        icon: Music,
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        iconColor: 'text-indigo-500',
        label: '音乐会',
        defaultImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'
    },
    '新家': {
        icon: Home,
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-500',
        label: '新家',
        defaultImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop'
    },
    '毕业': {
        icon: GraduationCap,
        bgColor: 'bg-sky-100 dark:bg-sky-900/30',
        iconColor: 'text-sky-500',
        label: '毕业',
        defaultImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&fit=crop'
    },
    '工作': {
        icon: Briefcase,
        bgColor: 'bg-slate-100 dark:bg-slate-900/30',
        iconColor: 'text-slate-500',
        label: '工作',
        defaultImage: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=200&h=200&fit=crop'
    },
    '宝宝': {
        icon: Baby,
        bgColor: 'bg-pink-100 dark:bg-pink-900/30',
        iconColor: 'text-pink-400',
        label: '宝宝',
        defaultImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&h=200&fit=crop'
    },
    '特别日': {
        icon: Star,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-500',
        label: '特别日',
        defaultImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&h=200&fit=crop'
    },
    // Legacy English types for backward compatibility
    'anniversary': {
        icon: Heart,
        bgColor: 'bg-pink-100 dark:bg-pink-900/30',
        iconColor: 'text-pink-500',
        label: '纪念日',
        defaultImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&h=200&fit=crop'
    },
    'birthday': {
        icon: Cake,
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-500',
        label: '生日',
        defaultImage: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=200&h=200&fit=crop'
    },
    'trip': {
        icon: Plane,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-500',
        label: '旅行',
        defaultImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=200&fit=crop'
    },
};

// Default config for unknown types
export const DEFAULT_CONFIG = {
    icon: Star,
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500',
    label: '事件',
    defaultImage: undefined as string | undefined
};
