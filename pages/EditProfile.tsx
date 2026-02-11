import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, User as UserIcon, Check, Save } from 'lucide-react';
import { useAuth } from '../authContext';
import { IMAGES } from '../constants';
import { useToast } from '../components/Toast';

interface EditProfilePageProps {
    onBack: () => void;
}

const PRESET_AVATARS = [
    IMAGES.AVATAR_MALE,
    IMAGES.AVATAR_FEMALE,
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
];

export const EditProfilePage: React.FC<EditProfilePageProps> = ({ onBack }) => {
    const { currentUser, updateProfile } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || currentUser.email.split('@')[0]);
            setAvatar(currentUser.avatar || (currentUser.gender === 'female' ? IMAGES.AVATAR_FEMALE : IMAGES.AVATAR_MALE));
            setGender(currentUser.gender || 'male');
        }
    }, [currentUser]);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await updateProfile({
                name: name.trim(),
                avatar,
                gender
            });
            onBack();
        } catch (error: any) {
            showToast(error?.message || '保存失败，请稍后重试', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[var(--eye-bg-primary)] px-4 pt-safe-top animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4 py-4 mb-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-[var(--eye-bg-secondary)] transition-colors text-[var(--eye-text-primary)]"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-[var(--eye-text-primary)] flex-1 text-center pr-10">编辑资料</h1>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-6 group cursor-pointer">
                        <div
                            className="w-32 h-32 rounded-full border-4 border-[var(--eye-bg-secondary)] shadow-lg bg-gray-200 bg-cover bg-center"
                            style={{ backgroundImage: `url('${avatar || IMAGES.AVATAR_MALE}')` }}
                        ></div>
                        <label className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-[#7a8a4b] active:scale-95 transition-all">
                            <Camera className="w-5 h-5" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                    <div className="relative w-full">
                        <div className="flex gap-3 overflow-x-auto w-full px-2 py-2 hide-scrollbar">
                            {PRESET_AVATARS.map((src, index) => (
                                <button
                                    key={index}
                                    onClick={() => setAvatar(src)}
                                    className={`flex-shrink-0 w-12 h-12 rounded-full bg-cover bg-center border-2 transition-all ${avatar === src ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundImage: `url('${src}')` }}
                                ></button>
                            ))}
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[var(--eye-bg-primary)] to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6 px-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--eye-text-secondary)] ml-1">昵称</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-[var(--eye-text-secondary)]" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="您的昵称"
                                className="w-full h-12 rounded-xl bg-[var(--eye-bg-secondary)] border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-black/20 focus:ring-0 pl-10 text-[var(--eye-text-primary)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--eye-text-secondary)] ml-1">性别 (决定默认头像)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setGender('male')}
                                className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${gender === 'male' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-[var(--eye-border)] bg-[var(--eye-bg-secondary)] text-[var(--eye-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span>男生</span>
                                {gender === 'male' && <Check className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${gender === 'female' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-[var(--eye-border)] bg-[var(--eye-bg-secondary)] text-[var(--eye-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span>女生</span>
                                {gender === 'female' && <Check className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Action */}
            <div className="pb-8 pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 rounded-xl bg-primary text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all hover:bg-[#7a8a4b] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        '保存中...'
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            保存资料
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
