import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OasisLogoSVG from './OasisLogoSVG';
import { isDarkColor } from '../utils/colorUtils';
import InstagramLayout from '../layouts/InstagramLayout';
import SquareLayout from '../layouts/SquareLayout';
import YouTubeLayout from '../layouts/YouTubeLayout';
import WhatsAppLayout from '../layouts/WhatsAppLayout';
import DecorationRenderer from './DecorationRenderer';
import { TemplateRegistry, TemplateLegacyWrapper } from '../layouts/templates';
// --- Interfaces de Datos ---
interface FormData {
	format: string;
	imageUrl?: string | null;
	bgImage?: string | null;
	bgPosX?: number;
	bgPosY?: number;
	bgOpacity?: number;
	gradientStart?: string;
	gradientEnd?: string;
	blendGradient?: boolean;
	blendOpacity?: number;
	bgMode?: string;
	// Visibilidad
	showLogoIasd?: boolean;
	showLogoOasis?: boolean;
	showRrss?: boolean;
	tagVisible?: boolean;
	titleVisible?: boolean;
	title2Visible?: boolean;
	speakerVisible?: boolean;
	contentVisible?: boolean;
	dateVisible?: boolean;
	locationVisible?: boolean;
	// Contenido
	tag?: string;
	title?: string;
	subtitle?: string;
	title2?: string;
	author?: string;
	speaker?: string; // Orador / Invitado
	description?: string;
	content?: string; // Texto Bíblico / Descripción
	bibleText?: string; // Versículo bíblico
	bibleRef?: string;  // Referencia (ej: Juan 3:16)
	date?: string;
	time?: string;
	location?: string;
	// Estilos
	titleColor?: string;
	titleSize?: number;
	tagColor?: string;
	logoShadow?: number;
	logoGlow?: number;
	logoBrightness?: number;
	logoColor?: string;
	logoGotaColor?: string;
	logoGotaColor2?: string;
	bgPosX2?: number;
	bgPosY2?: number;
}

interface AnnouncementPreviewProps {
	previewRef?: any;
	formData: FormData;
	FORMATS?: any;
	currentFmt: { aspect: string };
	isMobile: boolean;
	selectedElementId: string | null;
	setSelectedElementId: (id: string | null) => void;
	setEditingElement?: any;
	shapeMode?: any;
	onCanvasTouchEnd?: any;
	selectedFieldKey?: any;
	logoOasis?: any;
	logoAdventista?: any;
	onBgPosChange?: any;
	handleElementDoubleClick: (id: string) => void;
	editingElement: string | null;
	editingValue: string;
	setEditingValue: (v: string) => void;
	commitEdit: () => void;
	set: (key: string, value: any) => void;
	assets: { iasd?: string; oasis?: string; logoOasisLetras?: string; rrss?: string; };
	rrssImage: string;
	previewBgStyle: React.CSSProperties;
	onCanvasClick: (e: React.MouseEvent) => void;
	containerWidth?: number;
	children?: React.ReactNode;
}

const getScales = (format: string, width: number) => {
	const f = width / 100; // 1cqw = 1% of width
	if (format === 'whatsapp') {
		return {
			inset: 5 * f, padding: 5 * f, iasd: 10 * f, oasis: 16 * f, gap: 3 * f,
			tag: 3.5 * f, title: 9 * f, sub: 5 * f, speaker: 4.5 * f, content: 3.8 * f, meta: 3.8 * f,
			rrssText: 4 * f, rrssIcon: 12 * f
		};
	} else if (format === 'youtube') {
		return {
			inset: 2 * f, padding: 1.5 * f, iasd: 6 * f, oasis: 10 * f, gap: 1.2 * f,
			tag: 2 * f, title: 5.5 * f, sub: 3 * f, speaker: 2.8 * f, content: 2.5 * f, meta: 2.5 * f,
			rrssText: 2.5 * f, rrssIcon: 5.5 * f
		};
	}
	return {
		// Instagram (1:1)
		inset: 4 * f, padding: 3 * f, iasd: 11 * f, oasis: 16 * f, gap: 2.5 * f,
		tag: 2.8 * f, title: 7.5 * f, sub: 4.5 * f, speaker: 4 * f, content: 3.5 * f, meta: 3.2 * f,
		rrssText: 3.5 * f, rrssIcon: 10 * f
	};
};

const AnnouncementPreview: React.FC<AnnouncementPreviewProps> = ({
	formData, currentFmt, isMobile, selectedElementId, setSelectedElementId,
	handleElementDoubleClick, editingElement, editingValue, setEditingValue,
	commitEdit, set, assets, rrssImage, previewBgStyle, onCanvasClick, 
	previewRef, containerWidth, children
}) => {

	const previewRefLocal = useRef<HTMLDivElement>(null);
	const [bgPos, setBgPos] = useState({ x: 50, y: 50 });
	const [isDragging, setIsDragging] = useState(false);
	const [cWidth, setCWidth] = useState(800); 
	const dragState = useRef({ active: false, startX: 0, startY: 0, startPosX: 50, startPosY: 50 });

	if (!formData) return null;

	const stableBgUrl = React.useMemo(() => {
		const url = formData.bgImage || formData.imageUrl;
		if (!url || !url.startsWith('http')) return url;
		return `${url}${url.includes('?') ? '&' : '?'}cors=oasis_v3`;
	}, [formData.bgImage, formData.imageUrl]);

	React.useLayoutEffect(() => {
		const updateWidth = () => {
			if (previewRefLocal.current) {
				const w = previewRefLocal.current.offsetWidth;
				if (w && w > 50) setCWidth(w);
			}
		};
		updateWidth();
		const t = setTimeout(updateWidth, 150);
		window.addEventListener('resize', updateWidth);
		return () => {
			clearTimeout(t);
			window.removeEventListener('resize', updateWidth);
		};
	}, [currentFmt, formData.format]);

	useEffect(() => {
		setBgPos({ x: formData.bgPosX || 50, y: formData.bgPosY || 50 });
	}, [formData.bgPosX, formData.bgPosY]);

	const isBackgroundDark = React.useMemo(() => {
		if (formData.bgMode === 'image' || formData.imageUrl) return true;
		const startDark = isDarkColor(formData.gradientStart || '#5b2ea6');
		const endDark = isDarkColor(formData.gradientEnd || '#16213e');
		return startDark || endDark;
	}, [formData.bgMode, formData.imageUrl, formData.gradientStart, formData.gradientEnd]);

	const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
		if (!formData.imageUrl || editingElement) return;
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		dragState.current = { active: true, startX: clientX, startY: clientY, startPosX: bgPos.x, startPosY: bgPos.y };
		setIsDragging(true);
	};

	const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
		if (!dragState.current.active) return;
		const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
		const container = previewRefLocal.current;
		if (!container) return;
		const { width, height } = container.getBoundingClientRect();
		const dx = ((clientX - dragState.current.startX) / width) * 100;
		const dy = ((clientY - dragState.current.startY) / height) * 100;
		setBgPos({ x: Math.max(0, Math.min(100, dragState.current.startPosX + dx)), y: Math.max(0, Math.min(100, dragState.current.startPosY + dy)) });
	}, []);

	const onDragEnd = useCallback(() => {
		if (dragState.current.active) {
			set('bgPosX', bgPos.x); set('bgPosY', bgPos.y);
			dragState.current.active = false; setIsDragging(false);
		}
	}, [bgPos, set]);

	useEffect(() => {
		window.addEventListener('mousemove', onDragMove);
		window.addEventListener('mouseup', onDragEnd);
		return () => {
			window.removeEventListener('mousemove', onDragMove);
			window.removeEventListener('mouseup', onDragEnd);
		};
	}, [onDragMove, onDragEnd]);

	const fadeInProps = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.4 } };
	const scales = React.useMemo(() => getScales(formData.format, cWidth), [formData.format, cWidth]);

	const ts = (id: string, def: any): React.CSSProperties => {
		const baseSize = (typeof def.fontSize === 'number' && !isNaN(def.fontSize)) ? def.fontSize : parseFloat(def.fontSize || 16);
		const userScale = Number(formData[`${id}Size`] || 1);
		const finalSize = Math.max(8, baseSize * userScale);
		
		return {
			fontFamily: (formData[`${id}Font`] as string) || (def.fontFamily as string),
			fontSize: `${finalSize}px`,
			color: (formData[`${id}Color`] as string) || (def.color as string),
			fontWeight: formData[`${id}Bold`] !== undefined ? (formData[`${id}Bold`] ? 'bold' : 'normal') : def.fontWeight,
			fontStyle: formData[`${id}Italic`] ? 'italic' : (def.fontStyle ?? 'normal'),
			textDecoration: formData[`${id}Underline`] ? 'underline' : 'none',
			textAlign: (formData[`${id}Align`] as React.CSSProperties['textAlign']) || (def.textAlign ?? 'center'),
			letterSpacing: formData[`${id}LetterSpacing`] !== undefined ? `${formData[`${id}LetterSpacing`]}px` : def.letterSpacing,
			lineHeight: (formData[`${id}LineHeight`] as number) || def.lineHeight,
			textShadow: (formData[`${id}Shadow`] && formData[`${id}Shadow`] !== 'none') ? (formData[`${id}Shadow`] as string) : (def.textShadow ?? 'none'),
			opacity: (formData[`${id}Opacity`] as number) || 1,
		};
	};

	const [gotaColor1, gotaColor2] = React.useMemo(() => {
		if (formData.logoColor === 'white') return ['#ffffff', '#e2e8f0'];
		if (formData.logoColor === 'black') return ['#000000', '#1a1a1a'];
		if (formData.logoColor === 'mustard') return ['#fbbf24', '#b45309'];
		if (formData.logoColor === 'custom') return [formData.logoGotaColor || '#683cde', formData.logoGotaColor2 || '#4c1d95'];
		if (isBackgroundDark) return ['#a78bfa', '#7c3aed'];
		return ['#683cde', '#000000'];
	}, [isBackgroundDark, formData.logoColor, formData.logoGotaColor, formData.logoGotaColor2]);

	const layoutMode = (formData as any).layoutMode || 'centered';
	const layoutStyles = React.useMemo(() => {
		if (layoutMode === 'left') {
			return { justifyContent: 'center', alignItems: 'flex-start', textAlign: 'left' as const };
		}
		if (layoutMode === 'bottom') {
			return { justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center' as const };
		}
		return { justifyContent: 'center', alignItems: 'center', textAlign: 'center' as const };
	}, [layoutMode]);

	return (
		<div
			ref={(el) => { if (previewRef) previewRef.current = el; (previewRefLocal as any).current = el; }}
			className="oasis-canvas"
			onClick={(e) => {
				const target = e.target as HTMLElement;
				// Los clics dentro del editor de texto en línea no cambian la selección
				if (target.closest('input, textarea, [data-inline-editor]')) return;
				setSelectedElementId((target.closest('[data-el]') as HTMLElement | null)?.dataset.el ?? null);
			}}
			style={{  
				position: 'absolute', inset: 0, width: '100%', height: '100%', 
				display: 'flex', flexDirection: 'column', overflow: 'hidden',
				background: previewBgStyle.background 
			}}
		>
			{/* Marco de selección: solo en pantalla, nunca en la imagen exportada (.is-exporting) */}
			<style>{`
				.oasis-canvas [data-el] { cursor: pointer; }
				.is-exporting .oasis-placeholder { display: none !important; }
				.oasis-placeholder { transition: all 0.2s ease; cursor: pointer; }
				.oasis-placeholder:hover { opacity: 1 !important; transform: scale(1.05); }
				@media (hover: hover) { .oasis-canvas:not(.is-exporting) [data-el]:not([data-el="bgImage"]):hover { outline: 1px dashed rgba(245, 158, 11, 0.7); outline-offset: 3px; } }
				${selectedElementId && /^[a-zA-Z0-9]+$/.test(selectedElementId) && selectedElementId !== 'bgImage'
					? `.oasis-canvas:not(.is-exporting) [data-el="${selectedElementId}"] { outline: 2px solid #F59E0B !important; outline-offset: 3px; border-radius: 4px; }`
					: ''}
			`}</style>

			{/* FONDO: imagen */}
			<AnimatePresence>
				{stableBgUrl && (
					<motion.img
						key="bg-image"
						data-export-id="bg-image"
						data-el="bgImage"
						src={stableBgUrl}
						crossOrigin="anonymous"
						animate={{ objectPosition: `${bgPos.x}% ${bgPos.y}%` }}
						style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
						onMouseDown={onDragStart} onClick={onCanvasClick}
					/>
				)}
			</AnimatePresence>

			{/* CAPA DE MEZCLA */}
			<div 
				data-export-id="blend-layer"
				style={{
					position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
					background: (formData.blendGradient && (formData.bgImage || formData.imageUrl))
						? `linear-gradient(135deg, ${formData.gradientStart || '#5b2ea6'}, ${formData.gradientEnd || '#16213e'})`
						: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85))',
					opacity: (formData.blendGradient && (formData.bgImage || formData.imageUrl))
						? (formData.blendOpacity ?? 0.5)
						: (formData.bgOpacity ?? 1),
					mixBlendMode: (formData.blendGradient && (formData.bgImage || formData.imageUrl)) ? 'multiply' : 'normal',
				}} 
			/>

			{/* MARCO ESTÉTICO */}
			<div style={{ position: 'absolute', left: scales.inset, right: scales.inset, top: scales.inset, bottom: scales.inset, border: '0.5px solid rgba(255,255,255,0.25)', borderRadius: '8px', pointerEvents: 'none', zIndex: 3 }} />

			{/* CAPA DE DECORACIONES REUTILIZABLES */}
			<div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
				<DecorationRenderer decorations={formData.decorations} />
			</div>

			{/* CONTENIDO PRINCIPAL (Basado en Plantilla Personalizada) */}
			<div style={{ position: 'absolute', left: scales.inset, right: scales.inset, top: scales.inset, bottom: scales.inset, padding: scales.padding, display: 'flex', flexDirection: 'column', zIndex: 5, pointerEvents: 'none', boxSizing: 'border-box' }}>
				{(() => {
					const layoutProps = {
						formData, scales, assets, gotaColor1, gotaColor2, layoutStyles, layoutMode, ts, handleElementDoubleClick, fadeInProps
					};
					const ActiveTemplate = TemplateRegistry[formData.templateId || 'default'] || TemplateLegacyWrapper;
					return <ActiveTemplate {...layoutProps} />;
				})()}
			</div>

			{/* LOGOS Y RRSS FIJOS GLOBALES */}
			<div style={{ position: 'absolute', left: scales.inset, right: scales.inset, top: scales.inset, bottom: scales.inset, padding: scales.padding, zIndex: 6, pointerEvents: 'none', boxSizing: 'border-box' }}>
				{/* IASD Logo - Top Left */}
				<AnimatePresence>
					{formData.showLogoIasd !== false && assets.iasd && (
						<motion.img key="logo-iasd" data-el="showLogoIasd" {...fadeInProps} src={assets.iasd} crossOrigin="anonymous" style={{ position: 'absolute', top: scales.padding, left: scales.padding, height: `${scales.iasd}px`, pointerEvents: 'auto' }} />
					)}
				</AnimatePresence>

				{/* Oasis Logo - Top Right */}
				<AnimatePresence>
					{formData.showLogoOasis !== false && (
						<motion.div key="logo-oasis" data-el="showLogoOasis" {...fadeInProps} data-logo-container="oasis" style={{ position: 'absolute', top: scales.padding, right: scales.padding, height: `${scales.oasis}px`, pointerEvents: 'auto' }}>
							<OasisLogoSVG 
								size={scales.oasis} 
								gotaColor={gotaColor1} gotaColor2={gotaColor2}
								familyColor="#ffffff" flameColor="#ffffff"
								shadowIntensity={formData.logoShadow} glowIntensity={formData.logoGlow}
								style={{ filter: `brightness(${formData.logoBrightness || 1})` }}
							/>
						</motion.div>
					)}
				</AnimatePresence>

				{/* RRSS - Bottom Center */}
				<AnimatePresence>
					{formData.showRrss !== false && assets.rrss && (
						<motion.div key="footer-rrss" data-el="showRrss" {...fadeInProps} style={{ position: 'absolute', bottom: scales.padding, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
							<img src={assets.rrss} crossOrigin="anonymous" style={{ height: `${scales.rrssIcon}px`, display: 'block' }} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* SHAPES / CHILDREN */}
			<div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
				{children}
			</div>

			{/* EDITOR OVERLAY */}
			<AnimatePresence>
				{editingElement && (
					<motion.div data-inline-editor initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<input autoFocus style={{ width: '80%', padding: '15px', borderRadius: '12px', textAlign: 'center', fontSize: '20px' }} value={editingValue} onChange={(e) => setEditingValue(e.target.value)} onBlur={commitEdit} onKeyDown={(e) => e.key === 'Enter' && commitEdit()} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default AnnouncementPreview;