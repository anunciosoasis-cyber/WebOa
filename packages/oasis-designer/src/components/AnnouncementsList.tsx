import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Announcement {
	id: number;
	title?: string;
	tag?: string;
	imageUrl?: string;
	[key: string]: any;
}

interface AnnouncementsListProps {
	showForm: boolean;
	setShowForm: (show: boolean) => void;
	announcements: Announcement[];
	handleEdit: (ann: Announcement) => void;
	handleDelete: (id: number) => void;
	logoOasis: string;
	isMobile: boolean;
	activeMode: string;
	theme: any;
}

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
	showForm,
	setShowForm,
	announcements,
	handleEdit,
	handleDelete,
	logoOasis,
	isMobile,
	activeMode,
	theme,
}) => {
	const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
	const apiBase = rawApiUrl.replace(/\/$/, '');
	const uploadsBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

	const resolveImageUrl = (input?: string) => {
		if (!input) return null;
		if (input.startsWith('http')) return input;
		if (input.startsWith('/uploads/')) return `${uploadsBase}${input}`;
		if (input.startsWith('uploads/')) return `${uploadsBase}/${input}`;
		return `${uploadsBase}/uploads/${input}`;
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ x: '100%' }}
				animate={{ x: 0 }}
				exit={{ x: '100%' }}
				transition={{ type: 'spring', damping: 25, stiffness: 200 }}
				className="announcements-list-drawer"
				style={{
					position: 'relative',
					top: 0,
					right: 0,
					bottom: 'auto',
					width: '100%',
					height: '100%',
					zIndex: 'auto',
					overflowY: 'auto',
					borderRadius: '0',
					background: theme.colors.surface,
					borderColor: theme.colors.border
				}}
			>
				<div className="p-2 px-3 border-bottom d-flex justify-content-between align-items-center sticky-top" style={{ background: theme.colors.surface, borderColor: theme.colors.border }}>
					<h6 className="fw-bold mb-0" style={{ fontSize: '0.8rem', fontFamily: theme.fonts.accent, color: theme.colors.text.primary, letterSpacing: '1px' }}>MIS ANUNCIOS</h6>
					<button className="btn-close" style={{ fontSize: '0.6rem' }} onClick={() => setShowForm(false)}></button>
				</div>
				<div className="p-0">
					{announcements.length === 0 ? (
						<div className="text-center text-muted py-4" style={{ fontSize: '0.75rem' }}>No hay anuncios guardados</div>
					) : (
						<div className="list-group list-group-flush">
							{announcements.map(ann => {
								const imgUrl = resolveImageUrl(ann.imageUrl || ann.image_url);
								return (
									<div key={ann.id} className="list-group-item d-flex align-items-center justify-content-between py-2 px-2 border-bottom" style={{ background: 'transparent', borderBottomColor: theme.colors.border }}>
										<div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
											<img
												src={imgUrl || logoOasis}
												className="rounded shadow-sm flex-shrink-0"
												style={{ width: '40px', height: '50px', objectFit: 'cover', border: `1px solid ${theme.colors.border}`, borderRadius: '4px' }}
												alt={ann.title}
											/>
											<div style={{ minWidth: 0, flex: 1 }}>
												<div className="fw-semibold text-truncate" style={{ fontSize: '0.7rem', color: theme.colors.text.primary }}>{ann.title ? ann.title.split('|||')[0] : 'Sin título'}</div>
												{ann.description && (
													<div className="text-truncate mt-1" style={{ fontSize: '0.6rem', color: theme.colors.text.secondary }}>{ann.description}</div>
												)}
												<span className="badge mt-1 d-inline-block" style={{ fontSize: '0.5rem', background: theme.colors.primary, color: 'white' }}>{ann.tag}</span>
											</div>
										</div>
										<div className="d-flex gap-1 flex-shrink-0">
											<button
												className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
												style={{ width: '26px', height: '26px', borderRadius: '4px', fontSize: '0.65rem' }}
												onClick={(e) => { e.stopPropagation(); handleEdit(ann); }}
												title="Editar anuncio"
											>
												<i className="bi bi-pencil"></i>
											</button>
											<button
												className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
												style={{ width: '26px', height: '26px', borderRadius: '4px', fontSize: '0.65rem' }}
												onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }}
												title="Eliminar anuncio"
											>
												<i className="bi bi-trash"></i>
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

export default AnnouncementsList;
